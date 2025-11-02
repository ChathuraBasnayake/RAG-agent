import { pipeline } from "@xenova/transformers";

let embedder: any = null;

/**
 * Get or initialize the embedding model
 * Uses sentence-transformers/all-MiniLM-L6-v2 which generates 384-dimensional embeddings
 * The model is loaded once and cached for subsequent calls
 * 
 * @returns The initialized embedding pipeline
 */
export async function getEmbedder() {
  if (!embedder) {
    console.log("Loading embedding model...");
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log("Embedding model loaded!");
  }
  return embedder;
}

/**
 * Generate an embedding vector for a given text
 * Converts text into a 384-dimensional vector for semantic search
 * 
 * @param text - The text to embed (questions or content)
 * @returns Array of 384 numbers representing the semantic meaning
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const model = await getEmbedder();
  const output = await model(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data) as number[];
}
