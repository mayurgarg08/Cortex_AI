
import api from '../../utils/axios'

async function sendMessage(payload) {
 try {
    const {data}=await api.post("/api/agent/chat",payload)
    return data
 } catch (error) {
    const status = error?.response?.status
    console.error("Message request failed:", {
      status,
      message: error?.response?.data?.message || error?.message,
      data: error?.response?.data
    })
    if (status === 504) {
      throw new Error("The coding service timed out. Please try again.")
    }
    throw new Error(error?.response?.data?.message || "Unable to send your message. Please try again.")
 }
}

export default sendMessage
