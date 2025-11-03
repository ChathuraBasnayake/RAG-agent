"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Send, CheckCircle } from "lucide-react";

interface Question {
  question_id: string;
  question: string;
}

export default function TrainingSession() {
  const [session, setSession] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  
  const recognitionRef = useRef<any>(null);

  // Initialize Voice API
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
          setAnswer(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = () => setIsListening(false);
        recognitionRef.current.onend = () => setIsListening(false);
      }
    }
  }, []);

  const startSession = async () => {
    try {
      const response = await fetch("/api/training-session?action=start");
      const data = await response.json();
      
      if (data.success) {
        setSession(data.session);
        setCurrentIndex(0);
      } else if (data.needsUpload) {
        alert("📤 No training data found!\n\nPlease go to the 'Upload Training Data' tab and upload a CSV file with your training scenarios first.");
      } else {
        alert("Failed to start session: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      alert("Failed to start session. Please upload training data first.");
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim() || !session) return;

    setSubmitting(true);

    try {
      const currentQuestion = session.questions[currentIndex];
      
      await fetch("/api/training-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.sessionId,
          questionId: currentQuestion.question_id,
          response: answer,
          traineeId: "trainee_001"
        })
      });

      // Move to next question or finish
      if (currentIndex < session.questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setAnswer("");
      } else {
        setCompleted(true);
      }
    } catch (error) {
      alert("Failed to submit answer");
    } finally {
      setSubmitting(false);
    }
  };

  const viewResults = () => {
    window.location.href = `/evaluation?sessionId=${session.sessionId}`;
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Call Center Training
          </h1>
          <p className="text-gray-600 mb-8">
            Test your skills by answering customer scenarios
          </p>
          <button
            onClick={startSession}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition"
          >
            Start Training Session
          </button>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center bg-white p-12 rounded-2xl shadow-lg">
          <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Session Complete!
          </h2>
          <p className="text-gray-600 mb-8">
            You've answered all {session.questions.length} questions.<br />
            Let's see how you did!
          </p>
          <button
            onClick={viewResults}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition"
          >
            View Results & Feedback
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = session.questions[currentIndex];
  const progress = ((currentIndex + 1) / session.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentIndex + 1} of {session.questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Scenario
          </h2>
          <p className="text-lg text-gray-800 leading-relaxed bg-blue-50 p-6 rounded-lg border-l-4 border-blue-600">
            {currentQuestion.question}
          </p>
        </div>

        {/* Answer Input */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Your Response
          </h3>
          
          {isListening && (
            <div className="mb-4 text-sm text-red-600 flex items-center gap-2">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
              Listening...
            </div>
          )}

          <div className="relative">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type or speak your response..."
              disabled={submitting}
              className="w-full h-32 px-4 py-3 pr-14 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            
            {voiceSupported && (
              <button
                onClick={toggleListening}
                disabled={submitting}
                className={`absolute right-3 top-3 p-2 rounded-lg transition ${
                  isListening
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
                title={isListening ? "Stop listening" : "Start voice input"}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            )}
          </div>

          <button
            onClick={submitAnswer}
            disabled={!answer.trim() || submitting}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
          >
            {submitting ? (
              "Submitting..."
            ) : currentIndex < session.questions.length - 1 ? (
              <>
                <Send className="w-5 h-5" />
                Next Question
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Finish Session
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
