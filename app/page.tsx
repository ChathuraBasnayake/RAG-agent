/**
 * Home Page - Call Center Agent Training
 * 
 * Main entry point for the training system
 */

"use client";

import { useState } from "react";
import CSVUpload from "@/components/CSVUpload";
import TrainingSession from "@/components/TrainingSession";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"upload" | "train">("upload");

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Call Center Agent Training
          </h1>
          <p className="text-gray-600">
            Upload training scenarios and practice your customer service skills
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-md p-1 inline-flex">
            <button
              onClick={() => setActiveTab("upload")}
              className={`px-6 py-3 rounded-md font-medium transition ${
                activeTab === "upload"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Upload Training Data
            </button>
            <button
              onClick={() => setActiveTab("train")}
              className={`px-6 py-3 rounded-md font-medium transition ${
                activeTab === "train"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Start Training
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {activeTab === "upload" ? (
            <div>
              <CSVUpload />
              
              {/* Sample CSV Format Guide */}
              <div className="mt-8 p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  CSV Format Guide
                </h3>
                <p className="text-gray-700 mb-4">
                  Your CSV file should have the following columns:
                </p>
                <div className="bg-white p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <div className="text-gray-600 mb-2">
                    question_id,question,correct_answer,keywords
                  </div>
                  <div className="text-gray-500 text-xs">
                    1,"What is the process for handling...","First, I apologize...","apologize, empathize, verify"
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  <strong>Columns:</strong>
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                  <li><strong>question_id:</strong> Unique identifier for each question</li>
                  <li><strong>question:</strong> The question to ask the trainee</li>
                  <li><strong>correct_answer:</strong> The expected/ideal answer</li>
                  <li><strong>keywords:</strong> Important keywords to look for (comma-separated)</li>
                </ul>
                <a 
                  href="/sample_training_data.csv" 
                  download
                  className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  ↓ Download sample CSV template
                </a>
              </div>
            </div>
          ) : (
            <TrainingSession />
          )}
        </div>
      </div>
    </div>
  );
}
