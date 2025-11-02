/**
 * F1 GPT Home Page
 * 
 * Main entry point for the Formula 1 AI chatbot
 * Uses ChatInterface component with F1-specific branding and suggested questions
 */

"use client";

import ChatInterface from "../components/ChatInterface";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const suggestedQuestions = [
    "What is Formula One?",
    "Explain the DRS system in F1",
    "Who won the first F1championship?",
    "What are the main F1 regulations?",
  ];

  return (
    <ChatInterface
      title="F1 GPT"
      placeholder="Ask about Formula 1..."
      suggestedQuestions={suggestedQuestions}
      brandColor="from-red-500 to-orange-500"
    />
  );
}
