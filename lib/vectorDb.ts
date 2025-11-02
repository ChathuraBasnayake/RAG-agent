import { DataAPIClient } from "@datastax/astra-db-ts";

const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
} = process.env;

// Validate required environment variables
if (!ASTRA_DB_API_ENDPOINT || !ASTRA_DB_APPLICATION_TOKEN) {
  throw new Error("Missing required Astra DB environment variables");
}

// Initialize Astra DB client and database connection
const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

/**
 * Document structure for vector database
 */
export type Document = {
  _id?: string;
  $vector: number[];
  text: string;
};

/**
 * Search for similar documents using vector similarity
 * Uses Astra DB's vector search to find semantically similar content
 * 
 * @param queryVector - The embedding vector to search with (384 dimensions)
 * @param limit - Maximum number of results to return (default: 5)
 * @returns Array of similar documents ordered by similarity
 */
export async function searchSimilarDocuments(
  queryVector: number[],
  limit: number = 5
): Promise<Document[]> {
  const collection = await db.collection(ASTRA_DB_COLLECTION);
  
  const results = await collection.find({}, {
    sort: { $vector: queryVector },
    limit,
  }).toArray();

  return results as Document[];
}

/**
 * Insert a document with its embedding into the database
 * 
 * @param text - The text content to store
 * @param vector - The embedding vector (384 dimensions)
 * @returns Insert operation result
 */
export async function insertDocument(text: string, vector: number[]) {
  const collection = await db.collection(ASTRA_DB_COLLECTION);
  
  return await collection.insertOne({
    $vector: vector,
    text,
  });
}

/**
 * Get the database instance for advanced operations
 * Use this for operations not covered by helper functions
 * 
 * @returns Astra DB database instance
 */
export function getDatabase() {
  return db;
}
