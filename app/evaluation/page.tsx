"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, TrendingUp, AlertTriangle } from "lucide-react";

export default function EvaluationPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  
  const [evaluation, setEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      evaluateSession();
    }
  }, [sessionId]);

  const evaluateSession = async () => {
    setLoading(true);
    
    try {
      const response = await fetch("/api/evaluate-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId })
      });

      const data = await response.json();
      
      if (data.success) {
        setEvaluation(data.evaluation);
      }
    } catch (error) {
      console.error("Evaluation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Evaluating your responses...</p>
        </div>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">No evaluation data found</p>
      </div>
    );
  }

  const scoreColor = evaluation.averageScore >= 80 ? "green" : evaluation.averageScore >= 70 ? "blue" : evaluation.averageScore >= 60 ? "yellow" : "red";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Overall Score Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-center">
          <div className={`w-32 h-32 mx-auto mb-6 rounded-full bg-${scoreColor}-100 flex items-center justify-center`}>
            <span className={`text-5xl font-bold text-${scoreColor}-600`}>
              {evaluation.averageScore}
            </span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {evaluation.passed ? "Great Job!" : "Keep Practicing!"}
          </h1>
          
          <p className="text-gray-600 mb-6">
            You scored {evaluation.averageScore}% on {evaluation.totalQuestions} questions
            {evaluation.passed && " - You passed!"}
          </p>

          <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full ${
            evaluation.passed 
              ? "bg-green-100 text-green-800" 
              : "bg-yellow-100 text-yellow-800"
          }`}>
            {evaluation.passed ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Passed (70% required)
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5" />
                Below passing threshold
              </>
            )}
          </div>
        </div>

        {/* Overall Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            Overall Assessment
          </h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {evaluation.overallSummary}
          </p>
        </div>

        {/* Question-by-Question Breakdown */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Detailed Feedback
          </h2>

          {evaluation.questionEvaluations.map((q: any, index: number) => (
            <div key={q.question_id} className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-gray-500">
                      Question {index + 1}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      q.score >= 80 ? "bg-green-100 text-green-800" :
                      q.score >= 70 ? "bg-blue-100 text-blue-800" :
                      q.score >= 60 ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {q.score}/100
                    </span>
                  </div>
                  <p className="text-gray-800 font-medium">{q.question}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Your Answer:</p>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {q.trainee_answer}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Expected Answer:</p>
                  <p className="text-gray-600 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-600">
                    {q.correct_answer}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Feedback:</p>
                  <p className="text-gray-700 leading-relaxed">
                    {q.feedback}
                  </p>
                </div>

                {(q.keywords_found.length > 0 || q.keywords_missing.length > 0) && (
                  <div className="flex gap-4 text-sm">
                    {q.keywords_found.length > 0 && (
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="w-4 h-4" />
                        <span>Found: {q.keywords_found.join(", ")}</span>
                      </div>
                    )}
                    {q.keywords_missing.length > 0 && (
                      <div className="flex items-center gap-2 text-red-700">
                        <XCircle className="w-4 h-4" />
                        <span>Missing: {q.keywords_missing.join(", ")}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-4 justify-center">
          <button
            onClick={() => window.location.href = "/training"}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition"
          >
            Practice Again
          </button>
          <button
            onClick={() => window.location.href = "/"}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-8 rounded-lg transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
