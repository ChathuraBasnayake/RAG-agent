import { GoogleGenerativeAI } from "@google/generative-ai";

const { GOOGLE_API_KEY } = process.env;

if (!GOOGLE_API_KEY) {
  throw new Error("Missing GOOGLE_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

/**
 * Configuration options for Gemini model generation
 */
export type GeminiConfig = {
  temperature?: number;      // Randomness (0.0-1.0, higher = more creative)
  topP?: number;             // Nucleus sampling (0.0-1.0)
  topK?: number;             // Top-k sampling (number of tokens to consider)
  maxOutputTokens?: number;  // Maximum length of response
};

const defaultConfig: GeminiConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 2048,
};

/**
 * Get Gemini model instance with optional configuration
 * Uses gemini-2.0-flash-exp model optimized for speed and quality
 * 
 * @param config - Optional configuration to override defaults
 * @returns Configured Gemini model instance
 */
export function getGeminiModel(config: GeminiConfig = {}) {
  return genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
    generationConfig: { ...defaultConfig, ...config },
  });
}

/**
 * Generate a response using Gemini with streaming
 * Returns chunks of text as they're generated for real-time display
 * 
 * @param prompt - The prompt to send to Gemini
 * @param config - Optional model configuration
 * @returns Stream of content chunks
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
 * Waits for the complete response before returning
 * 
 * @param prompt - The prompt to send to Gemini
 * @param config - Optional model configuration
 * @returns The generated text response
 */
export async function generateResponse(
  prompt: string,
  config?: GeminiConfig
): Promise<string> {
  const model = getGeminiModel(config);
  const result = await model.generateContent(prompt);
  return result.response.text();
}
