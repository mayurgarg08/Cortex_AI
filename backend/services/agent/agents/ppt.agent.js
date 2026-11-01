import { getModel } from "../config/llmModels.js"
import { generatePpt } from "../utils/generatePpt.js"
import { storeFile } from "../utils/storeFile.js"
import { pptResponse, toFileName } from "../utils/fileResponse.js"
import { deductCredits } from "../utils/deductCredits.js"
import { checkAgentLimit } from "../config/agentLimit.js"

const parsePresentation = (content) => {
    const text = Array.isArray(content)
        ? content.map((part) => part?.text || "").join("")
        : String(content || "")

    // Models occasionally wrap otherwise-valid JSON in a Markdown code fence
    // or add a short explanation. Extract the JSON object before parsing it.
    const json = text
        .trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/, "")
    const start = json.indexOf("{")
    const end = json.lastIndexOf("}")

    if (start === -1 || end === -1 || end < start) {
        throw new Error("The presentation model did not return JSON.")
    }

    const data = JSON.parse(json.slice(start, end + 1))
    if (!data?.title || !Array.isArray(data.slides) || data.slides.length === 0) {
        throw new Error("The presentation model returned an invalid slide deck.")
    }

    const asText = (value) => typeof value === "string" ? value.trim() : ""

    data.subtitle = asText(data.subtitle)
    data.takeaways = Array.isArray(data.takeaways) ? data.takeaways.map(asText).filter(Boolean) : []
    data.slides = data.slides
        .filter((slide) => slide && typeof slide.title === "string")
        .map((slide) => ({
            title: slide.title,
            layout: asText(slide.layout).toLowerCase(),
            highlight: asText(slide.highlight),
            // Only keep a stat when both parts are present
            stat: asText(slide.stat?.value) && asText(slide.stat?.label)
                ? { value: asText(slide.stat.value), label: asText(slide.stat.label) }
                : null,
            points: Array.isArray(slide.points) ? slide.points.map(asText).filter(Boolean) : []
        }))

    if (data.slides.length === 0) {
        throw new Error("The presentation model returned no usable slides.")
    }

    return data
}

export const pptAgent=async (state) => {
    try {
        await checkAgentLimit(state.userId,"ppt")
        const llm=await getModel("ppt")
        const prompt=`You are a professional presentation designer.

Return ONLY valid JSON.

Format:

{
"title":"",
"subtitle":"",
"slides":[
{
"title":"",
"layout":"cards",
"highlight":"",
"stat":{"value":"","label":""},
"points":["","","",""]
}
],
"takeaways":["","",""]
}

Rules:

- Generate exactly 6 content slides with a clear story: introduction, core ideas, and future or impact.
- "title": short and engaging (max 8 words). "subtitle": one line that frames the deck.
- Slide "title": max 6 words.
- "points": 3-6 per slide, each a crisp phrase of max 14 words. No full stops at the end.
- "layout": choose the best fit for each slide and vary them across the deck:
  - "cards" for 4-6 parallel ideas, features or facts
  - "split" for an explanation with one strong message
  - "process" for 3-5 sequential steps or a timeline (points in order)
  - "stat" when one well-known, accurate number captures the slide
- "stat": only for the "stat" layout, e.g. {"value":"14M","label":"electric cars sold worldwide in 2023"}. Use real, widely reported figures only. Otherwise omit it.
- "highlight": one memorable key insight for the slide (max 18 words).
- "takeaways": exactly 3 short concluding messages (max 18 words each).
- Use at least 3 different layouts.
- No markdown.
- No explanation.
- No code block.
- Return ONLY JSON.

Topic:

${state.prompt}`

const res=await llm.invoke(prompt)
const data=parsePresentation(res.content)
const ppt=await generatePpt(data)
const buffer=await ppt.write({
    outputType:"nodebuffer"
})

const filename=toFileName(data.title,"pptx",`presentation-${Date.now()}`)

const downloadUrl=await storeFile(filename,buffer,"application/vnd.openxmlformats-officedocument.presentationml.presentation",24*60*60)
await deductCredits(state.userId,"ppt")

return {
    ...state,
    aiResponse:pptResponse(data,filename,downloadUrl)
}

    } catch (error) {
        console.error("PPT generation failed:", error?.message || error)
         return {
            ...state,
            aiResponse:error?.data?.message || error?.response?.data?.message || "Unable to generate the presentation. Please try again.",
            // This is intentionally a message only (not a stack trace), so it
            // can be logged by the browser while keeping server details safe.
            debugError: error?.message || "Unknown PPT generation error"
        }
       

       
    }
}
