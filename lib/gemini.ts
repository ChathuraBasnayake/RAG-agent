import { GoogleGenerativeAI } from "@google/generative-ai";

const { GOOGLE_API_KEY } = process.env;

if (!GOOGLE_API_KEY) {
  throw new Error("Missing GOOGLE_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

export type GeminiConfig = {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxOutputTokens?: number;
};

const defaultConfig: GeminiConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 2048,
};

/**
 * Get Gemini model instance with optional configuration
 * @param config - Optional configuration for the model
 */
export function getGeminiModel(config: GeminiConfig = {}) {
  return genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
    generationConfig: { ...defaultConfig, ...config },
  });
}

/**
 * Generate a response using Gemini with streaming
 * @param prompt - The prompt to send to Gemini
 * @param config - Optional model configuration
 */
export async function generateStreamingResponse(
  prompt: string,
  config?: GeminiConfig
) {
  const model = getGeminiModel(config);
  return await model.generateContentStream(prompt);
}

/**
 * Generate a response using Gemini without streaming
 * @param prompt - The prompt to send to Gemini
 * @param config - Optional model configuration
 */
export async function generateResponse(
  prompt: string,
  config?: GeminiConfig
): Promise<string> {
  const model = getGeminiModel(config);
  const result = await model.generateContent(prompt);
  return result.response.text();
}
