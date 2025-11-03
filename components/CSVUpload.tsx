"use client";

import { useState } from "react";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";

export default function CSVUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload-training", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        setFile(null);
      }
    } catch (error) {
      setResult({
        success: false,
        error: "Upload failed. Please try again.",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Upload Training Data
        </h2>
        <p className="text-gray-600 mb-6">
          Upload a CSV file with training questions and answers
        </p>

        {/* CSV Format Guide */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Required CSV Format:</h3>
          <code className="text-sm text-blue-800 block bg-white p-3 rounded">
            question_id,question,correct_answer,keywords<br />
            Q001,"Customer bill is wrong","I apologize...",&#34;apologize,check&#34;
          </code>
        </div>

        {/* File Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <span className="text-blue-600 hover:text-blue-700 font-medium">
              Choose CSV file
            </span>
          </label>
          {file && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {file.name}
            </p>
          )}
        </div>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium py-3 px-6 rounded-lg transition"
        >
          {uploading ? "Uploading..." : "Upload Training Data"}
        </button>

        {/* Result Messages */}
        {result && (
          <div
            className={`mt-6 p-4 rounded-lg ${
              result.success
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <div className="flex items-start gap-3">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <p
                  className={`font-medium ${
                    result.success ? "text-green-900" : "text-red-900"
                  }`}
                >
                  {result.success ? "Success!" : "Error"}
                </p>
                <p
                  className={`text-sm mt-1 ${
                    result.success ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {result.message || result.error}
                </p>
                {result.stats && (
                  <div className="mt-2 text-sm text-green-700">
                    <p>Total: {result.stats.total}</p>
                    <p>Success: {result.stats.success}</p>
                    {result.stats.errors > 0 && (
                      <p className="text-red-700">Errors: {result.stats.errors}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
