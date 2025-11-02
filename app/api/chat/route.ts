import { generateRAGResponse } from "@/lib/rag";

/**
 * POST /api/chat
 * Handles chat requests with RAG (Retrieval-Augmented Generation)
 * Streams responses back to the client in real-time
 */
export async function POST(req: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const { messages } = await req.json();
        const latestMessage = messages[messages.length - 1]?.content;

        if (!latestMessage) {
          controller.enqueue(
            encoder.encode(
              "data: " + JSON.stringify({ error: "No message provided" }) + "\n\n"
            )
          );
          controller.close();
          return;
        }

        // Generate RAG response with streaming
        const { stream: geminiStream, sources } = await generateRAGResponse(
          latestMessage,
          5 // Retrieve top 5 relevant documents
        );

        // Stream the response chunks to the client
        for await (const chunk of geminiStream) {
          const chunkText = chunk.text();
          controller.enqueue(
            encoder.encode(
              "data: " + JSON.stringify({ content: chunkText }) + "\n\n"
            )
          );
        }

        // Send completion signal with source count
        controller.enqueue(
          encoder.encode(
            "data: " + JSON.stringify({ done: true, sources }) + "\n\n"
          )
        );
        controller.close();
      } catch (error: any) {
        console.error("Error in chat route:", error);
        controller.enqueue(
          encoder.encode(
            "data: " +
              JSON.stringify({
                error: "Failed to process request",
                details: error.message,
              }) +
              "\n\n"
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
