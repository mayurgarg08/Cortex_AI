import { getModel } from "../config/llmModels.js"
import axios from "axios"
import { uploadToS3 } from "../utils/uploadToS3.js"
import { getFromS3 } from "../utils/getFromS3.js"
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

const imageRes=await axios.get(imageUrl,{responseType:"arraybuffer",timeout:20000})
const buffer=Buffer.from(imageRes.data)
if (!buffer.length) throw new Error("Image provider returned an empty file.")
const filename=`image-${Date.now()}.png`

await uploadToS3(filename,buffer,"image/png")
const downloadUrl=await getFromS3(filename,24*60)
await deductCredits(state.userId,"vision")

return {
    ...state,
    aiResponse:`
![Generated Image](${downloadUrl})

📥 [Download Image](${downloadUrl})

⏳ Link expires in 10 minutes.`
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
