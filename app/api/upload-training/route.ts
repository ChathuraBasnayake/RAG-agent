/**
 * Training Data Upload API
 * 
 * Endpoint: POST /api/upload-training
 * Purpose: Upload and process CSV files containing training questions
 * 
 * Expected CSV Format:
 * question_id, question, correct_answer, keywords
 * 1,"How do you...","I would...","keyword1, keyword2"
 */

import { NextResponse } from "next/server";
import Papa from "papaparse";
import { generateEmbedding } from "@/lib/embeddings";
import { getDatabase } from "@/lib/vectorDb";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface TrainingRow {
  question_id: string;
  question: string;
  correct_answer: string;
  keywords: string;
}

// =============================================================================
// API HANDLER
// =============================================================================

export async function POST(req: Request) {
  try {
    // Extract file from form data
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Read and parse CSV file
    const text = await file.text();
    const parsed = Papa.parse<TrainingRow>(text, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsed.errors.length > 0) {
      return NextResponse.json(
        { error: "CSV parsing failed", details: parsed.errors },
        { status: 400 }
      );
    }

    const trainingData = parsed.data;

    // Validate CSV content
    if (trainingData.length === 0) {
      return NextResponse.json(
        { error: "CSV file is empty" },
        { status: 400 }
      );
    }

    const firstRow = trainingData[0];
    const requiredColumns = ["question_id", "question", "correct_answer", "keywords"];
    const missingColumns = requiredColumns.filter(col => !(col in firstRow));

    if (missingColumns.length > 0) {
      return NextResponse.json(
        { 
          error: "Missing required columns",
          missing: missingColumns,
          required: requiredColumns
        },
        { status: 400 }
      );
    }

    // Process and store in database
    const db = await getDatabase();
    
    // Ensure collection exists (create if needed)
    try {
      const collections = await db.listCollections();
      const collectionExists = collections.some(c => c.name === "training_questions");
      
      if (!collectionExists) {
        console.log("Creating training_questions collection...");
        await db.createCollection("training_questions", {
          vector: {
            dimension: 384,
            metric: "cosine"
          }
        });
        console.log("Collection created successfully!");
      }
    } catch (error) {
      console.error("Error checking/creating collection:", error);
    }
    
    const collection = db.collection("training_questions");

    let successCount = 0;
    let errorCount = 0;

    for (const row of trainingData) {
      try {
        // Generate embeddings for question and answer
        const questionEmbedding = await generateEmbedding(row.question);
        const answerEmbedding = await generateEmbedding(row.correct_answer);

        // Store question
        await collection.insertOne({
          question_id: row.question_id,
          question: row.question,
          $vector: questionEmbedding,
          correct_answer: row.correct_answer,
          answer_embedding: answerEmbedding,
          keywords: row.keywords.split(",").map(k => k.trim()),
          uploaded_at: new Date().toISOString()
        });

        successCount++;
      } catch (error) {
        console.error(`Error processing row ${row.question_id}:`, error);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Training data uploaded successfully",
      stats: {
        total: trainingData.length,
        success: successCount,
        errors: errorCount
      }
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { 
        error: "Failed to upload training data",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
