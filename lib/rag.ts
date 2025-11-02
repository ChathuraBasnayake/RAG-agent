import { generateEmbedding } from "./embeddings";
import { searchSimilarDocuments, Document } from "./vectorDb";
import { generateStreamingResponse } from "./gemini";

/**
 * Build a prompt for the RAG system
 * @param question - User's question
 * @param context - Retrieved context from vector database
 */
export function buildRAGPrompt(question: string, context: string): string {
  return `You are a Formula 1 expert assistant. Answer questions based on the provided context. If the context doesn't contain the answer, say so politely and provide general knowledge if appropriate.

Context from F1 knowledge base:
${context}

Question: ${question}

Answer:`;
}

/**
 * Retrieve relevant context from vector database
 * @param question - User's question
 * @param limit - Maximum number of documents to retrieve
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
 * Generate a RAG response with streaming
 * @param question - User's question
 * @param limit - Maximum number of context documents to retrieve
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
