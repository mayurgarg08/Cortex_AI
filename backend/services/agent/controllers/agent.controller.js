import axios from "axios"
import { unlink } from "node:fs/promises"
import { graph } from "../graph/graph.js"
import { addMessage } from "../config/memory.js"

const serviceRequest = (path, payload) => axios.post(
    `${process.env.CHAT_SERVICE}${path}`,
    payload,
    { timeout: 5000 }
)

const persistResult = async ({ conversationId, prompt, result, userSave }) => {
    const operations = [
        userSave,
        addMessage(conversationId, "user", prompt),
        addMessage(conversationId, "assistant", result.aiResponse),
        serviceRequest("/save-message", {
            conversationId,
            role: "assistant",
            content: result.aiResponse,
            images: result.images,
            artifacts: result.artifacts
        })
    ]

    const outcomes = await Promise.allSettled(operations)
    outcomes.forEach((outcome) => {
        if (outcome.status === "rejected") {
            console.error("Conversation persistence failed:", outcome.reason?.message || outcome.reason)
        }
    })
}


export const agent=async (req,res,next) => {
    let uploadPath
    try {
        const {prompt,conversationId,agent}=req.body
        const file=req.file
        uploadPath=file?.path
        const userId=req.headers["x-user-id"]
        if (!prompt || !conversationId || !userId) {
            return res.status(400).json({ message: "prompt, conversationId, and authenticated user are required." })
        }

        // Persistence must not keep an already-generated answer waiting behind
        // Redis or the chat service and turn it into a gateway timeout.
        const userSave = serviceRequest("/save-message", {
            conversationId,role:"user",content:prompt
        })
        const result=await graph.invoke({
            prompt,conversationId,agent,userId,file
        })

        res.status(200).json({
            answer:result?.aiResponse,
            images:result?.images,
            artifacts:result?.artifacts,
            debugError:result?.debugError
        })

        void persistResult({ conversationId, prompt, result, userSave })
       
    } catch (error) {
       next(error)
    } finally {
        if (uploadPath) {
            try {
                await unlink(uploadPath)
            } catch (error) {
                if (error.code !== "ENOENT") console.error("Upload cleanup failed:", error.message)
            }
        }
    }
}
