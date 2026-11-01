import axios from "axios"

const KEYED_URL="https://gen.pollinations.ai/image"
const ANONYMOUS_URL="https://image.pollinations.ai/prompt"
const MAX_RETRY_WAIT=30*1000

const sleep=(ms)=>new Promise(resolve=>setTimeout(resolve,ms))

const errorBody=(error)=>{
    try {
        return JSON.parse(Buffer.from(error?.response?.data || "").toString())
    } catch {
        return null
    }
}

// Rate-limit responses say e.g. "Retry after 23s"; wait that long once if it is short enough
const retryDelay=(error)=>{
    const status=error?.response?.status
    if(![402,429,503].includes(status)) return null
    const seconds=Number(errorBody(error)?.error?.message?.match(/retry after (\d+)\s*s/i)?.[1] ?? 10)
    const delay=seconds*1000+500
    return delay<=MAX_RETRY_WAIT ? delay : null
}

// The vision agent shows error.data.message to the user
const friendlyError=(error)=>{
    const status=error?.response?.status
    console.error("Image provider error:",status,errorBody(error)?.error?.message || error?.message)
    const message=status===401
        ? "Image generation is not configured correctly. Please check the image API key."
        : [402,429,503].includes(status)
            ? "The image service is busy right now. Please try again in a minute."
            : "Unable to generate the image. Please try again."
    return Object.assign(new Error(message),{data:{message}})
}

// Generates an image with Pollinations. With POLLINATIONS_API_KEY the keyed API is used;
// without it the anonymous API is used, which is heavily rate limited.
export const generateImage=async (prompt)=>{
    const apiKey=process.env.POLLINATIONS_API_KEY?.trim()
    const params={width:1024,height:1024,nologo:true}

    const request=()=>apiKey
        ? axios.get(`${KEYED_URL}/${encodeURIComponent(prompt)}`,{
            params:{...params,model:process.env.POLLINATIONS_IMAGE_MODEL?.trim() || "flux"},
            headers:{Authorization:`Bearer ${apiKey}`},
            responseType:"arraybuffer",
            timeout:90000
        })
        : axios.get(`${ANONYMOUS_URL}/${encodeURIComponent(prompt)}`,{
            params,
            responseType:"arraybuffer",
            timeout:90000
        })

    try {
        return await request()
    } catch (error) {
        const delay=retryDelay(error)
        if(delay===null) throw friendlyError(error)
        await sleep(delay)
        try {
            return await request()
        } catch (retryError) {
            throw friendlyError(retryError)
        }
    }
}
