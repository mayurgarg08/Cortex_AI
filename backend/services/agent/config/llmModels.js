import dotenv from "dotenv"
dotenv.config()
import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
const groq=new ChatGroq({
    model:"openai/gpt-oss-120b"
})

const coding=new ChatGroq({
    model:"openai/gpt-oss-120b",
    temperature:0.2,
    maxTokens:1200
})

const gemini=new ChatGoogleGenerativeAI({
    model:"gemini-3.5-flash",
    apiKey: process.env.GEMINI_API_KEY,
})

export const getModel=async (agent)=>{
    switch (agent) {
        case "chat":
            return groq;
        case "search" :    
           return groq;
        case "coding":
           // Code requests are served through the same low-latency provider as
           // chat. The previous OpenRouter route regularly exceeded the
           // gateway timeout and produced 504 responses in the browser.
           return coding;
        case "imageAnalyzer": 
           return gemini;   
    
        default:
            return groq;
    }
}

