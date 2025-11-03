"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Plus, Menu, User, MessageSquare, Trash2, Mic, MicOff, Volume2, VolumeX } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type ChatInterfaceProps = {
  onSendMessage: (messages: Message[], input: string) => Promise<void>;
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

  // Voice-related state
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

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

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        setVoiceSupported(true);
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
          // Trigger voice send after getting transcript
          setTimeout(() => handleVoiceSend(transcript), 100);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      await onSendMessage(messages, input);
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

  const handleVoiceSend = async (transcript: string) => {
    if (!transcript.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: transcript };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Call voice API
      const response = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: transcript, previousMessages: messages }),
      });

      if (!response.ok) throw new Error("Voice API request failed");

      const data = await response.json();
      
      // Add assistant's text response
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.text },
      ]);

      // Play audio response
      if (data.audio) {
        playAudio(data.audio);
      }
    } catch (error) {
      console.error("Error in voice interaction:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I couldn't process that voice request.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const playAudio = (base64Audio: string) => {
    // Stop any currently playing audio
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    // Check if we should use browser TTS instead
    if (base64Audio.startsWith('USE_BROWSER_TTS:')) {
      const text = base64Audio.replace('USE_BROWSER_TTS:', '');
      playBrowserTTS(text);
      return;
    }

    const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
    currentAudioRef.current = audio;

    audio.onplay = () => setIsSpeaking(true);
    audio.onended = () => {
      setIsSpeaking(false);
      currentAudioRef.current = null;
    };
    audio.onerror = () => {
      setIsSpeaking(false);
      currentAudioRef.current = null;
      console.error("Error playing audio");
    };

    audio.play();
  };

  const playBrowserTTS = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    // Stop MP3 audio
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
      setIsSpeaking(false);
    }

    // Stop browser TTS
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
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
    stopSpeaking();
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
              <div
                onClick={startNewChat}
                className="hidden group-hover:block p-1 hover:bg-gray-700 rounded cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
              </div>
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
              <div className="text-center py-16">
                <div className={`w-20 h-20 mx-auto mb-8 rounded-3xl bg-gradient-to-br ${brandColor} flex items-center justify-center shadow-lg shadow-red-500/20`}>
                  <MessageSquare className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  {title}
                </h2>
                <p className="text-gray-500 text-lg mb-12">
                  Start a conversation by asking a question
                </p>
                {suggestedQuestions.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    {suggestedQuestions.map((question, i) => (
                      <button
                        key={i}
                        onClick={() => setInput(question)}
                        className="p-5 bg-white hover:bg-gray-50 rounded-2xl transition-all text-left border border-gray-200 hover:border-gray-300 hover:shadow-md group"
                      >
                        <p className="text-sm font-medium text-gray-800 group-hover:text-gray-900">{question}</p>
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
                  <div className="flex-shrink-0">
                    {message.role === "user" ? (
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${brandColor} flex items-center justify-center`}>
                        <User className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 mb-2">
                      {message.role === "user" ? "You" : title}
                    </div>
                    <div className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">
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
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
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
            {/* Voice Status Indicator */}
            {(isListening || isSpeaking) && (
              <div className="mb-3 flex items-center justify-center gap-2 text-sm">
                {isListening && (
                  <div className="flex items-center gap-2 text-red-600">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                    <span>Listening...</span>
                  </div>
                )}
                {isSpeaking && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <Volume2 className="w-4 h-4 animate-pulse" />
                    <span>Speaking...</span>
                    <button
                      onClick={stopSpeaking}
                      className="ml-2 p-1 hover:bg-gray-100 rounded transition"
                    >
                      <VolumeX className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="relative bg-white border border-gray-300 rounded-xl shadow-sm focus-within:border-gray-400 transition">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isListening ? "Listening..." : placeholder}
                disabled={isLoading || isListening}
                className="w-full px-4 py-3 pr-24 outline-none resize-none text-gray-900 placeholder-gray-400 bg-transparent disabled:opacity-50"
                rows={1}
                style={{ maxHeight: "200px" }}
              />
              
              {/* Voice Button */}
              {voiceSupported && (
                <button
                  onClick={toggleListening}
                  disabled={isLoading || isSpeaking}
                  className={`absolute right-14 bottom-2 p-2 rounded-lg transition ${
                    isListening
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50"
                  }`}
                  title={isListening ? "Stop listening" : "Start voice input"}
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </button>
              )}

              {/* Send Button */}
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 bottom-2 p-2 rounded-lg bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:cursor-not-allowed text-white transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center mt-3">
              {voiceSupported 
                ? "AI can make mistakes. Check important information. Click mic for voice input."
                : "AI can make mistakes. Check important information."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
