import { checkAgentLimit } from "../config/agentLimit.js"
import { getModel } from "../config/llmModels.js"
import { deductCredits } from "../utils/deductCredits.js"

const SIMPLE_CODE_REQUEST = /\b(code|program|function|method|algorithm|debug|fix|explain|java|javascript|python|c\+\+|c#|typescript|sql)\b/i

const withTimeout = (promise, milliseconds) => Promise.race([
   promise,
   new Promise((_, reject) => setTimeout(
      () => reject(new Error("The code model took too long to respond.")),
      milliseconds
   ))
])

export const codingAgent=async (state) => {
try {
   await checkAgentLimit(state.userId,"coding")
   const llm=await getModel("coding")
   // Do not spend a second model call classifying ordinary coding questions.
   // Two sequential calls were exceeding the gateway timeout intermittently.
   if (SIMPLE_CODE_REQUEST.test(state.prompt)) {
      const response = await withTimeout(llm.invoke(`
You are CortexAI's programming assistant. Answer the request directly.
Use concise Markdown and include complete runnable code in a fenced code block
when code is requested. Do not generate a multi-file project unless requested.

User request: ${state.prompt}`), 25000)

      await deductCredits(state.userId,"coding")
      return {
         ...state,
         aiResponse: String(response.content || "Unable to generate code."),
         artifacts:[]
      }
   }

   const intentLlm=await getModel("intent")
   const intentRes=await intentLlm.invoke(`
    You are an intent classifier.

Return ONLY one of these values.

CODE_GENERATION
CODE_REVIEW
CODE_EXPLANATION
DEBUGGING
OPTIMIZATION
CONVERSION
DOCUMENTATION

User Request:
${state.prompt}
    `)
    const intent=intentRes.content
    if(intent=="CODE_GENERATION"){
        const prompt=`
        You are CortexAI Coding Agent.

Generate the requested project.

Default stack:
- HTML
- CSS
- JavaScript

Use React / Next.js / Vue ONLY if explicitly requested.

Rules:

- Responsive
- Modern UI
- CSS Variables
- Flexbox/Grid
- Smooth Scroll
- Hover Effects
- Beautiful spacing
- Single page unless user asks otherwise.

IMAGES
=========================

Always use real Unsplash images.

Never use placeholders.

Return ONLY valid JSON.

Schema:

{
  "files":[
    {
      "name":"index.html",
      "content":"..."
    },
    {
      "name":"style.css",
      "content":"..."
    },
    {
      "name":"script.js",
      "content":"..."
    }
  ]
}

Rules:

- Output must start with {
- Output must end with }
- No markdown
- No explanation
- No extra text
- No \`\`\`
- Never mention intent

User Request:
${state.prompt}
        ` 
        const res=await llm.invoke(prompt)
        const data=JSON.parse(res.content)
        await deductCredits(state.userId,"coding")
        
        return {
            ...state,
            aiResponse:"Code Generated Successfully.",
            artifacts:[
                {
                    id:Date.now(),
                    type:"Project",
                    files:data.files || [],
                    title:state.prompt
                }
            ]
        }
    }

    const res=await llm.invoke(`
        The user's request is:

${intent}

Return Markdown only.

Never generate project files.

Use headings like:

# Overview

## Explanation

## Problems

## Improvements

## Best Practices

## Optimized Code (if needed)

User Request:

${state.prompt}
        `)

   const data=res.content   
   await deductCredits(state.userId,"coding")
   
   return {
    ...state,
    aiResponse:data,
    artifacts:[]
   }  
} catch (error) {
   console.log(error)
         return {
            ...state,
            aiResponse:error?.data?.message || "failed to generate code",
            artifacts:[]
        }
}
  
}
