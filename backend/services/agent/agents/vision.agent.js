import { getModel } from "../config/llmModels.js"
import axios from "axios"
import { storeFile } from "../utils/storeFile.js"
import { imageResponse, toFileName } from "../utils/fileResponse.js"
import { deductCredits } from "../utils/deductCredits.js"
import { checkAgentLimit } from "../config/agentLimit.js"
export const visionAgent=async (state) => {

    try {
        await checkAgentLimit(state.userId,"image")
         const llm=await getModel("image")
    const fallbackPrompt=state.prompt.trim()
    const res=await Promise.race([
      llm.invoke(`
        You are an elite AI image prompt engineer.

Convert the user request into a highly detailed image generation prompt.

Requirements:

- Cinematic lighting
- Professional composition
- Ultra realistic
- High detail
- Beautiful color palette
- Sharp focus
- 8K quality
- Photorealistic
- Depth of field
- Professional photography
- Stunning visuals

Return only the image prompt.

User Request:
${state.prompt}

        `),
      new Promise((resolve) => setTimeout(() => resolve(null), 8000))
    ])

const prompt=typeof res?.content === "string" && res.content.trim() ? res.content.trim() : fallbackPrompt

const imageUrl=`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`

const imageRes=await axios.get(imageUrl,{responseType:"arraybuffer",timeout:60000})
const buffer=Buffer.from(imageRes.data)
if (!buffer.length) throw new Error("Image provider returned an empty file.")
const contentType=imageRes.headers["content-type"]?.split(";")[0] || "image/jpeg"
const filename=toFileName(fallbackPrompt.split(" ").slice(0,8).join(" "),contentType === "image/png" ? "png" : "jpg",`image-${Date.now()}`)

const downloadUrl=await storeFile(filename,buffer,contentType,24*60*60)
await deductCredits(state.userId,"vision")

return {
    ...state,
    aiResponse:imageResponse(state.prompt,filename,downloadUrl)
}
    } catch (error) {
       console.error("Image generation failed:", error?.message || error)
         return {
            ...state,
            aiResponse:error?.data?.message || error?.response?.data?.message || "Unable to generate the image. Please try again.",
            debugError:error?.message || "Unknown image generation error"
        }
    }
   


}
