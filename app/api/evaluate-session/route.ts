/**
 * Evaluation API
 * Evaluates all responses in a session and provides feedback
 */

import { NextResponse } from "next/server";
import { 
  getSessionResponses, 
  getQuestionById,
  updateResponseEvaluation
} from "@/lib/vectorDb";
import { generateResponse } from "@/lib/gemini";

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vec1: number[], vec2: number[]): number {
  // Safety check for undefined or empty vectors
  if (!vec1 || !vec2 || vec1.length === 0 || vec2.length === 0) {
    console.error("Invalid vectors for cosine similarity:", { vec1: vec1?.length, vec2: vec2?.length });
    return 0;
  }
  
  const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
  const mag1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
  const mag2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
  
  if (mag1 === 0 || mag2 === 0) {
    return 0;
  }
  
  return dotProduct / (mag1 * mag2);
}

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID required" },
        { status: 400 }
      );
    }

    // Get all responses for this session
    const responses = await getSessionResponses(sessionId);

    if (responses.length === 0) {
      return NextResponse.json(
        { error: "No responses found for this session" },
        { status: 404 }
      );
    }

    const evaluations = [];
    let totalScore = 0;

    // Evaluate each response
    for (const response of responses) {
      const question = await getQuestionById(response.question_id);
      
      if (!question) {
        console.error(`Question not found: ${response.question_id}`);
        continue;
      }

      // Debug logging
      console.log(`Evaluating response for question ${response.question_id}`);
      console.log(`Response vector exists: ${!!response.$vector}`);
      console.log(`Answer embedding exists: ${!!question.answer_embedding}`);

      // Calculate semantic similarity with safety check
      let semanticSimilarity = 0;
      if (response.$vector && question.answer_embedding) {
        semanticSimilarity = cosineSimilarity(
          response.$vector,
          question.answer_embedding
        );
      } else {
        console.warn(`Missing vectors for question ${response.question_id}, using keyword-only scoring`);
      }

      // Check keyword matching
      const responseText = response.response_text.toLowerCase();
      const keywordsFound = question.keywords.filter(keyword =>
        responseText.includes(keyword.toLowerCase())
      );
      const keywordsMissing = question.keywords.filter(keyword =>
        !responseText.includes(keyword.toLowerCase())
      );

      const keywordScore = keywordsFound.length / question.keywords.length;

      // Calculate final score (semantic 60% + keywords 40%)
      const finalScore = Math.round(
        (semanticSimilarity * 0.6 + keywordScore * 0.4) * 100
      );

      // Generate AI feedback
      const feedbackPrompt = `
You are evaluating a call center agent trainee's response.

Question: ${question.question}
Expected Answer: ${question.correct_answer}
Trainee's Answer: ${response.response_text}

Score: ${finalScore}/100
Keywords found: ${keywordsFound.join(", ") || "none"}
Keywords missing: ${keywordsMissing.join(", ") || "none"}

Provide brief, constructive feedback (2-3 sentences) on what they did well and what to improve.
`;

      const feedback = await generateResponse(feedbackPrompt, {
        temperature: 0.7,
        maxOutputTokens: 150
      });

      const evaluation = {
        semantic_similarity: semanticSimilarity,
        keyword_score: keywordScore,
        final_score: finalScore,
        feedback,
        keywords_found: keywordsFound,
        keywords_missing: keywordsMissing
      };

      // Update response with evaluation
      await updateResponseEvaluation(response.response_id, evaluation);

      evaluations.push({
        question_id: response.question_id,
        question: question.question,
        trainee_answer: response.response_text,
        correct_answer: question.correct_answer,
        score: finalScore,
        feedback,
        keywords_found: keywordsFound,
        keywords_missing: keywordsMissing
      });

      totalScore += finalScore;
    }

    const averageScore = Math.round(totalScore / responses.length);

    // Generate overall summary
    const summaryPrompt = `
Analyze this call center training session:

Average Score: ${averageScore}/100
Questions Answered: ${responses.length}

Provide a brief summary (3-4 sentences) highlighting:
1. Overall performance
2. Main strengths
3. Key areas to improve

${evaluations.map((e, i) => `
Question ${i + 1}: ${e.score}/100
Missing keywords: ${e.keywords_missing.join(", ") || "none"}
`).join("\n")}
`;

    const overallSummary = await generateResponse(summaryPrompt, {
      temperature: 0.7,
      maxOutputTokens: 200
    });

    return NextResponse.json({
      success: true,
      evaluation: {
        sessionId,
        totalQuestions: responses.length,
        averageScore,
        passThreshold: 70,
        passed: averageScore >= 70,
        overallSummary,
        questionEvaluations: evaluations,
        completedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Evaluation error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate session" },
      { status: 500 }
    );
  }
}
