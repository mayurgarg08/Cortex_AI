import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getModel } from "../config/llmModels.js";
import fs from "fs/promises";
import { deductCredits } from "../utils/deductCredits.js";
import { checkAgentLimit } from "../config/agentLimit.js";

export const imageAnalyzer = async (state) => {
  await checkAgentLimit(state.userId, "image");

  try {
    console.log("========== IMAGE ANALYZER START ==========");
    console.log("User ID:", state.userId);
    console.log("Prompt:", state.prompt);
    console.log("File:", state.file);

    if (!state?.file?.path) {
      throw new Error("No image file provided");
    }

    console.log("Reading image from:", state.file.path);

    const imageBuffer = await fs.readFile(state.file.path);
    console.log("Image read successfully");

    const base64Image = imageBuffer.toString("base64");
    console.log("Base64 conversion completed");

    const llm = await getModel("imageAnalyzer");
    console.log("LLM loaded:", llm?.constructor?.name);

    const messages = [
      new SystemMessage(`
You are CortexAI Image Analyzer Agent.

Rules:

- Analyze only the uploaded image.
- Answer the user's question accurately.
- If text exists in the image, extract it.
- If charts or tables exist, explain them.
- If something is unclear, say so.
- Use Markdown when helpful.
- Do not hallucinate.
      `),

      new HumanMessage({
        content: [
          {
            type: "text",
            text: state.prompt || "Analyze this image",
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${state.file.mimetype};base64,${base64Image}`,
            },
          },
        ],
      }),
    ];

    console.log("Invoking model...");

    const response = await llm.invoke(messages);

    console.log("Model response received:");
    console.log(response);

    // Deduct credits only after successful analysis
    try {
      await deductCredits(state.userId, "vision");
      console.log("Credits deducted successfully");
    } catch (creditError) {
      console.error("Credit deduction failed:", creditError);
    }

    console.log("========== IMAGE ANALYZER SUCCESS ==========");

    return {
      ...state,
      aiResponse:
        typeof response.content === "string"
          ? response.content
          : JSON.stringify(response.content, null, 2),
    };
  } catch (error) {
    console.error("========== IMAGE ANALYZER ERROR ==========");
    console.error("Full Error:", error);
    console.error("Message:", error?.message);
    console.error("Stack:", error?.stack);

    return {
      ...state,
      aiResponse:
        error?.message ||
        "Failed to analyze image. Check server logs for details.",
    };
  } finally {
    try {
      if (state?.file?.path) {
        await fs.unlink(state.file.path);
        console.log("Temporary file deleted:", state.file.path);
      }
    } catch (deleteError) {
      console.error("Failed to delete temp file:", deleteError);
    }
  }
};