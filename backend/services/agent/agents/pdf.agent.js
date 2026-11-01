import { getModel } from "../config/llmModels.js"
import { generatePdf } from "../utils/generatePdf.js"
import { storeFile } from "../utils/storeFile.js"
import { pdfResponse, toFileName } from "../utils/fileResponse.js"
import { deductCredits } from "../utils/deductCredits.js"
import { checkAgentLimit } from "../config/agentLimit.js"
import { parseStructuredResponse } from "../utils/parseStructuredResponse.js"
export const pdfAgent=async (state) => {
    try {
        await checkAgentLimit(state.userId,"pdf")
        
        
        const llm=await getModel("pdf")
        const prompt=`
        You are an expert document writer.

Return ONLY valid JSON.

Do NOT return markdown.

Do NOT return explanations.

Structure:

{
"title":"",
"subtitle":"",
"summary":"",
"sections":[
{
"heading":"",
"intro":"",
"points":[],
"highlight":""
}
],
"conclusion":""
}

Rules:

- "title": clear and engaging (max 10 words). "subtitle": one line describing the document.
- "summary": an executive summary of 2-3 sentences.
- Generate 4-7 sections that flow logically from background to details to impact or outlook.
- "intro": 1-2 sentences that open the section.
- "points": 3-6 informative bullet points, each one complete sentence with a concrete fact or detail.
- "highlight": one key insight or notable fact for the section (max 25 words). Omit it if nothing stands out.
- "conclusion": 2-3 sentences that wrap up the document.
- Use only accurate, widely known facts. Use plain text without emoji.

Topic:

${state.prompt}
        `

        const res=await llm.invoke(prompt)
        const data=parseStructuredResponse(res.content,"sections")
        
        const pdfBuffer=await generatePdf(data)

        const filename=toFileName(data.title,"pdf",`document-${Date.now()}`)
        const downloadUrl=await storeFile(filename,pdfBuffer,"application/pdf",24*60*60)
        await deductCredits(state.userId,"pdf")

        return {
          ...state,
          aiResponse:pdfResponse(data,filename,downloadUrl)
        }

    } catch (error) {
       console.error("PDF generation failed:", error?.message || error)
         return {
            ...state,
            aiResponse:error?.data?.message || error?.response?.data?.message || "Unable to generate the PDF. Please try again.",
            debugError:error?.message || "Unknown PDF generation error"
        }
    }
}
