import { generateEmbedding } from "./embeddings";
import { searchSimilarDocuments, Document } from "./vectorDb";
import { generateStreamingResponse } from "./gemini";

/**
 * Build a RAG (Retrieval-Augmented Generation) prompt
 * Combines retrieved context with the user's question for better AI responses
 * 
 * @param question - User's question about Formula 1
 * @param context - Retrieved context from the vector database
 * @returns Formatted prompt ready for the AI model
 */
export function buildRAGPrompt(question: string, context: string): string {
  return `You are a Formula 1 expert assistant. Answer questions based on the provided context. If the context doesn't contain the answer, say so politely and provide general knowledge if appropriate.

Context from F1 knowledge base:
${context}

Question: ${question}

Answer:`;
}

/**
 * Retrieve relevant context from the vector database
 * Uses semantic search to find the most relevant information
 * 
 * @param question - User's question
 * @param limit - Maximum number of documents to retrieve (default: 5)
 * @returns Object containing formatted context string and source documents
 */
export async function retrieveContext(
  question: string,
  limit: number = 5
): Promise<{ context: string; documents: Document[] }> {
  // Generate embedding for the question
  const queryVector = await generateEmbedding(question);

  // Search for similar documents
  const documents = await searchSimilarDocuments(queryVector, limit);

  // Combine document texts into context
  const context = documents.map((doc) => doc.text).join("\n\n");

  return { context, documents };
}

/**
 * Generate a complete RAG response with streaming
 * This is the main entry point for the RAG pipeline:
 * 1. Retrieves relevant context from the vector database
 * 2. Builds a prompt with the context
 * 3. Generates a streaming response from Gemini
 * 
 * @param question - User's question about Formula 1
 * @param limit - Maximum number of context documents to retrieve (default: 5)
 * @returns Object containing the streaming response and metadata
 */
export async function generateRAGResponse(question: string, limit: number = 5) {
  // Retrieve relevant context
  const { context, documents } = await retrieveContext(question, limit);

  // Build prompt with context
  const prompt = buildRAGPrompt(question, context);

  // Generate streaming response
  const result = await generateStreamingResponse(prompt);

  return {
    stream: result.stream,
    sources: documents.length,
  };
}
