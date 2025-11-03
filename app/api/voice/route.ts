/**
 * Voice API Route
 * Handles voice-based chat interactions
 * Receives text (from client-side STT) -> RAG processing -> Returns text + audio
 */

import { NextResponse } from "next/server";
import { generateRAGResponse } from "@/lib/rag";
import { textToSpeech } from "@/lib/textToSpeech";

export async function POST(req: Request) {
  try {
    const { text, previousMessages } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text input required" },
        { status: 400 }
      );
    }

    console.log("Voice query:", text);

    // Generate RAG response (streaming)
    const { stream, sources } = await generateRAGResponse(text, 5);

    // Collect full response text
    let fullResponse = "";
    for await (const chunk of stream) {
      const chunkText = chunk.text();
      fullResponse += chunkText;
    }

    console.log("Generated response:", fullResponse.substring(0, 100) + "...");

    // Convert response to speech
    const audioBase64 = await textToSpeech(fullResponse);

    return NextResponse.json({
      success: true,
      text: fullResponse,
      audio: audioBase64,
      sources,
      mimeType: "audio/mp3",
    });

  } catch (error) {
    console.error("Voice API error:", error);
    return NextResponse.json(
      { 
        error: "Failed to process voice request",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
