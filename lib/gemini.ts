/**
 * Gemini AI Module
 * Handles all Google Gemini AI interactions for evaluation and feedback
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const { GOOGLE_GENERATIVE_AI_API_KEY } = process.env;

if (!GOOGLE_GENERATIVE_AI_API_KEY) {
  throw new Error("Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(GOOGLE_GENERATIVE_AI_API_KEY);

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================
// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Configuration options for Gemini model generation
 */
export type GeminiConfig = {
  temperature?: number;      // Randomness (0.0-1.0, higher = more creative)
  topP?: number;             // Nucleus sampling (0.0-1.0)
  topK?: number;             // Top-k sampling (number of tokens to consider)
  maxOutputTokens?: number;  // Maximum length of response
};

// Default configuration for balanced responses
const defaultConfig: GeminiConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 2048,
};

// =============================================================================
// MODEL FUNCTIONS
// =============================================================================

// =============================================================================
// MODEL FUNCTIONS
// =============================================================================

/**
 * Get Gemini model instance with configuration
 * Uses gemini-1.5-flash model for better rate limits and stability
 * 
 * @param config - Optional configuration to override defaults
 * @returns Configured Gemini model instance
 */
export function getGeminiModel(config: GeminiConfig = {}) {
  return genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { ...defaultConfig, ...config },
  });
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

