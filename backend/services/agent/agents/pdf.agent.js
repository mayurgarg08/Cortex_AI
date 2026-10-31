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
"sections":[
{
"heading":"",
"points":[]
}
]
}

Generate 4-8 sections.

Each section should have 3-6 concise bullet points.

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
