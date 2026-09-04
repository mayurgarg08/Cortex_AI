import api from "../../utils/axios"

export const getConversations=async () => {
    try {
        const {data}=await api.get("/api/chat/get-conversations")
        // A failed/unauthorized request can return an object such as
        // `{ message: "..." }`. The UI expects a conversation list.
        return Array.isArray(data) ? data : []
    } catch (error) {
        console.log(error)
        return []
    }
}
