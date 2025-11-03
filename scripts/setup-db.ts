/**
 * Database Setup Script
 * Creates the required Astra DB collections for the training system
 */

import { config } from "dotenv";
import { DataAPIClient } from "@datastax/astra-db-ts";

config();

const ASTRA_DB_API_ENDPOINT = process.env.ASTRA_DB_API_ENDPOINT;
const ASTRA_DB_APPLICATION_TOKEN = process.env.ASTRA_DB_APPLICATION_TOKEN;
const ASTRA_DB_NAMESPACE = process.env.ASTRA_DB_NAMESPACE || "default_keyspace";

if (!ASTRA_DB_API_ENDPOINT || !ASTRA_DB_APPLICATION_TOKEN) {
  throw new Error("Missing required environment variables: ASTRA_DB_API_ENDPOINT and ASTRA_DB_APPLICATION_TOKEN");
}

async function setupDatabase() {
  console.log("🚀 Setting up Call Center Training Database...\n");

  const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
  const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

  const collections = [
    {
      name: "training_questions",
      description: "Stores training scenarios with embeddings",
      dimension: 384
    },
    {
      name: "trainee_responses",
      description: "Stores trainee answers during sessions",
      dimension: 384
    },
    {
      name: "session_evaluations",
      description: "Stores evaluation results and feedback",
      dimension: 384
    }
  ];

  for (const collectionConfig of collections) {
    try {
      console.log(`📦 Creating collection: ${collectionConfig.name}`);
      console.log(`   Description: ${collectionConfig.description}`);
      
      // Check if collection exists
      const existingCollections = await db.listCollections();
      const exists = existingCollections.some(c => c.name === collectionConfig.name);

      if (exists) {
        console.log(`   ⚠️  Collection already exists, skipping...\n`);
        continue;
      }

      // Create collection with vector support
      await db.createCollection(collectionConfig.name, {
        vector: {
          dimension: collectionConfig.dimension,
          metric: "cosine"
        }
      });

      console.log(`   ✅ Collection created successfully!\n`);
    } catch (error) {
      console.error(`   ❌ Error creating collection ${collectionConfig.name}:`, error);
      throw error;
    }
  }

  console.log("✨ Database setup complete!\n");
  console.log("Next steps:");
  console.log("1. Upload training data via CSV");
  console.log("2. Start training sessions");
  console.log("3. View evaluation results\n");
}

setupDatabase()
  .then(() => {
    console.log("👍 Success!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Setup failed:", error);
    process.exit(1);
  });
