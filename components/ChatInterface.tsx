"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Plus, Menu, User, MessageSquare, Trash2 } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type ChatInterfaceProps = {
  onSendMessage?: (messages: Message[], input: string) => Promise<void>;
  title?: string;
  placeholder?: string;
  suggestedQuestions?: string[];
  brandColor?: string;
};

export default function ChatInterface({
  onSendMessage,
  title = "AI Chat",
  placeholder = "Type your message...",
  suggestedQuestions = [],
  brandColor = "from-blue-500 to-blue-600",
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      if (onSendMessage) {
        // Use custom handler if provided
        await onSendMessage(messages, input);
      } else {
        // Default: Call API directly and handle streaming
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: [...messages, userMessage] }),
        });

        if (!response.ok) throw new Error("Failed to fetch");

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = "";

        // Add empty assistant message
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "" },
        ]);

        while (reader) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = JSON.parse(line.slice(6));

              if (data.error) {
                console.error("Error:", data.error);
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1].content =
                    "Sorry, I encountered an error. Please try again.";
                  return newMessages;
                });
                break;
              }

              if (data.content) {
                assistantMessage += data.content;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1].content = assistantMessage;
                  return newMessages;
                });
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startNewChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } bg-gray-900 text-white transition-all duration-300 overflow-hidden flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-3 border-b border-gray-700">
          <button
            onClick={startNewChat}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition text-left border border-gray-700"
          >
            <Plus className="w-5 h-5" />
            <span className="text-sm font-medium">New chat</span>
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="text-xs text-gray-400 px-3 py-2 font-semibold">
            Recent
          </div>
          {messages.length > 0 && (
            <div className="w-full flex items-center gap-3 px-3 py-3 rounded-lg bg-gray-800 text-left group">
              <MessageSquare className="w-4 h-4 text-gray-400" />
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate">Current Conversation</div>
              </div>
              <button
                onClick={startNewChat}
                className="hidden group-hover:block p-1 hover:bg-gray-700 rounded"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-gray-700">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition text-sm">
            <User className="w-4 h-4" />
            <span>Account</span>
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6">
            {/* Empty State */}
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-linear-to-br ${brandColor} flex items-center justify-center`}>
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {title}
                </h2>
                <p className="text-gray-600 mb-8">
                  Start a conversation by asking a question
                </p>
                {suggestedQuestions.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                    {suggestedQuestions.map((question, i) => (
                      <button
                        key={i}
                        onClick={() => setInput(question)}
                        className="p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition text-left border border-gray-200"
                      >
                        <p className="text-sm text-gray-700">{question}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Messages */}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-8 ${
                  message.role === "assistant" ? "bg-gray-50 -mx-4 px-4 py-6" : ""
                }`}
              >
                <div className="max-w-3xl mx-auto flex gap-6">
                  {/* Avatar */}
                  <div className="shrink-0">
                    {message.role === "user" ? (
                      <div className={`w-8 h-8 rounded-full bg-linear-to-br ${brandColor} flex items-center justify-center`}>
                        <User className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 mb-2 text-sm">
                      {message.role === "user" ? "You" : title}
                    </div>
                    <div className="text-gray-800 text-[15px] leading-7 whitespace-pre-wrap">
                      {message.content}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="mb-8 bg-gray-50 -mx-4 px-4 py-6">
                <div className="max-w-3xl mx-auto flex gap-6">
                  <div className="shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-2 text-sm">
                      {title}
                    </div>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="relative bg-white border border-gray-300 rounded-xl shadow-sm focus-within:border-gray-400 transition">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                disabled={isLoading}
                className="w-full px-4 py-3 pr-12 outline-none resize-none text-gray-900 placeholder-gray-400 bg-transparent disabled:opacity-50"
                rows={1}
                style={{ maxHeight: "200px" }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 bottom-2 p-2 rounded-lg bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:cursor-not-allowed text-white transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center mt-3">
              AI can make mistakes. Check important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
