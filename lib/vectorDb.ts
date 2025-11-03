/**
 * Vector Database Module
 * Handles all Astra DB operations for the Call Center Training System
 */

import { DataAPIClient } from "@datastax/astra-db-ts";

// Environment Variables
const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
} = process.env;

// Validate required environment variables
if (!ASTRA_DB_API_ENDPOINT || !ASTRA_DB_APPLICATION_TOKEN) {
  throw new Error("Missing required Astra DB environment variables: ASTRA_DB_API_ENDPOINT and ASTRA_DB_APPLICATION_TOKEN");
}

// Initialize Astra DB client and database connection
const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Training question structure
 */
export type TrainingQuestion = {
  _id?: string;
  question_id: string;
  question: string;
  $vector: number[];
  correct_answer: string;
  answer_embedding: number[];
  keywords: string[];
  uploaded_at: string;
};

/**
 * Trainee response structure
 */
export type TraineeResponse = {
  _id?: string;
  response_id: string;
  session_id: string;
  trainee_id: string;
  question_id: string;
  response_text: string;
  $vector: number[];
  timestamp: string;
  evaluation?: {
    semantic_similarity: number;
    keyword_score: number;
    final_score: number;
    feedback: string;
    keywords_found: string[];
    keywords_missing: string[];
  };
};

// =============================================================================
// DATABASE HELPERS
// =============================================================================

/**
 * Get the database instance
 * @returns Astra DB database instance
 */
export function getDatabase() {
  return db;
}

/**
 * Ensure a collection exists, create if needed
 * @param collectionName - Name of the collection
 * @param dimension - Vector dimension (default: 384)
 */
async function ensureCollectionExists(collectionName: string, dimension: number = 384): Promise<void> {
  try {
    const collections = await db.listCollections();
    const exists = collections.some(c => c.name === collectionName);
    
    if (!exists) {
      console.log(`Creating collection: ${collectionName}...`);
      await db.createCollection(collectionName, {
        vector: {
          dimension,
          metric: "cosine"
        }
      });
      console.log(`Collection '${collectionName}' created successfully!`);
    }
  } catch (error) {
    console.error(`Error creating collection ${collectionName}:`, error);
    throw error;
  }
}

// =============================================================================
// TRAINING QUESTIONS
// =============================================================================

// =============================================================================
// TRAINING QUESTIONS
// =============================================================================

/**
 * Get all training questions from database
 * @returns Array of training questions
 */
export async function getTrainingQuestions(): Promise<TrainingQuestion[]> {
  try {
    const collection = db.collection("training_questions");
    const results = await collection.find({}).toArray();
    return results as TrainingQuestion[];
  } catch (error: any) {
    if (error.message?.includes("not found")) {
      return [];
    }
    throw error;
  }
}

/**
 * Get a specific training question by ID
 * @param questionId - The question ID to retrieve
 * @returns Training question or null if not found
 */
export async function getQuestionById(questionId: string): Promise<TrainingQuestion | null> {
  try {
    const collection = db.collection("training_questions");
    const result = await collection.findOne({ question_id: questionId });
    return result as TrainingQuestion | null;
  } catch (error: any) {
    if (error.message?.includes("not found")) {
      return null;
    }
    throw error;
  }
}

// =============================================================================
// TRAINEE RESPONSES
// =============================================================================

// =============================================================================
// TRAINEE RESPONSES
// =============================================================================

/**
 * Store trainee response
 * @param response - The response data to store
 * @returns Insert operation result
 */
export async function storeTraineeResponse(response: Omit<TraineeResponse, '_id'>) {
  await ensureCollectionExists("trainee_responses", 384);
  const collection = db.collection("trainee_responses");
  return await collection.insertOne(response);
}

/**
 * Get all responses for a training session
 * @param sessionId - The session ID
 * @returns Array of trainee responses
 */
export async function getSessionResponses(sessionId: string): Promise<TraineeResponse[]> {
  try {
    const collection = db.collection("trainee_responses");
    const results = await collection.find({ session_id: sessionId }).toArray();
    return results as TraineeResponse[];
  } catch (error: any) {
    if (error.message?.includes("not found")) {
      return [];
    }
    throw error;
  }
}

/**
 * Update evaluation for a response
 * @param responseId - The response ID
 * @param evaluation - The evaluation data
 * @returns Update operation result
 */
export async function updateResponseEvaluation(
  responseId: string,
  evaluation: TraineeResponse['evaluation']
) {
  const collection = db.collection("trainee_responses");
  return await collection.updateOne(
    { response_id: responseId },
    { $set: { evaluation } }
  );
}

