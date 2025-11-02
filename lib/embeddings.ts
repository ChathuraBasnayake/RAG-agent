import { pipeline } from "@xenova/transformers";

let embedder: any = null;

/**
 * Get or initialize the embedding model
 * Uses sentence-transformers/all-MiniLM-L6-v2 (384 dimensions)
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
 * Generate embedding vector for a given text
 * @param text - The text to embed
 * @returns Array of 384 numbers representing the embedding
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const model = await getEmbedder();
  const output = await model(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data) as number[];
}
