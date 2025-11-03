/**
 * Training Session API
 * Manages training sessions - start, answer questions, evaluate
 */

import { NextResponse } from "next/server";
import { 
  getTrainingQuestions, 
  getQuestionById,
  storeTraineeResponse,
  getSessionResponses,
  updateResponseEvaluation
} from "@/lib/vectorDb";
import { generateEmbedding } from "@/lib/embeddings";
import { generateResponse } from "@/lib/gemini";

// Start a new training session
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const sessionId = searchParams.get("sessionId");

    if (action === "start") {
      // Get all available questions
      const questions = await getTrainingQuestions();

      if (questions.length === 0) {
        return NextResponse.json(
          { 
            error: "No training questions available", 
            message: "Please upload training data using the CSV upload feature first.",
            needsUpload: true
          },
          { status: 404 }
        );
      }

      // Create session
      const session = {
        sessionId: `session_${Date.now()}`,
        questions: questions.map(q => ({
          question_id: q.question_id,
          question: q.question
        })),
        currentIndex: 0,
        totalQuestions: questions.length,
        startedAt: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        session
      });
    }

    if (action === "get-question" && sessionId) {
      const questionId = searchParams.get("questionId");
      if (!questionId) {
        return NextResponse.json(
          { error: "Question ID required" },
          { status: 400 }
        );
      }

      const question = await getQuestionById(questionId);
      if (!question) {
        return NextResponse.json(
          { error: "Question not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        question: {
          question_id: question.question_id,
          question: question.question
        }
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Training session error:", error);
    return NextResponse.json(
      { error: "Failed to manage training session" },
      { status: 500 }
    );
  }
}

// Submit trainee answer
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, questionId, response, traineeId } = body;

    if (!sessionId || !questionId || !response) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate embedding for response
    const responseEmbedding = await generateEmbedding(response);

    console.log(`Generated embedding for response: ${responseEmbedding?.length || 0} dimensions`);

    // Store response (no evaluation yet)
    const responseData = {
      response_id: `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      session_id: sessionId,
      trainee_id: traineeId || "default_trainee",
      question_id: questionId,
      response_text: response,
      $vector: responseEmbedding,
      timestamp: new Date().toISOString()
    };

    console.log(`Storing response with vector: ${!!responseData.$vector}`);

    await storeTraineeResponse(responseData);

    return NextResponse.json({
      success: true,
      message: "Response recorded",
      responseId: responseData.response_id
    });

  } catch (error) {
    console.error("Submit answer error:", error);
    return NextResponse.json(
      { error: "Failed to submit answer" },
      { status: 500 }
    );
  }
}
