import React, { useState } from "react";
import { Feedback } from "../context/QuizContext";


interface Feedbacks{
  feedback: Feedback;
}

const CreatePlan: React.FC = () => {
  const [pastFeedbacks, setPastFeedbacks] = useState<Feedbacks[]>([]);
  const [prompt, setPrompt] = useState("");
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);

  const dummyMarkdown = `# Communication Improvement Plan

## Goals
- Enhance public speaking confidence
- Improve non-verbal communication
- Develop better storytelling abilities

## Weekly Focus Areas
### Week 1: Foundation
- Practice basic presentation skills
- Record 3 mock interviews
- Review and analyze body language

### Week 2: Advanced Techniques
- Work on voice modulation
- Implement feedback from previous sessions
- Focus on eye contact and gestures

## Action Items
1. Daily speaking exercises
2. Weekly video recordings
3. Monthly progress assessment

## Resources
- Recommended reading materials
- Practice scenarios
- Video tutorials`;

  const handleGenerateFromHistory = () => {
    // setGeneratedPlan(dummyMarkdown);

  };

  const handlePromptSubmit = () => {
    setGeneratedPlan(dummyMarkdown);
  };

  const fetchHistory = async () => {
    console.log("fetching history");
    try {
      const token  = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch history");
      }
      const data = await response.json();
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const downloadPlan = () => {
    const blob = new Blob([generatedPlan || ""], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "communication-plan.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-900 to-slate-800 text-white p-8">
      <div className="w-full max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Create Your Learning Plan
        </h1>

        <div className="space-y-6 mb-12">
          <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
            <textarea
              className="w-full bg-slate-700 rounded-lg p-4 text-white resize-none focus:ring-2 focus:ring-blue-500 outline-none"
              rows={4}
              placeholder="Enter your goals and requirements for the communication plan..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <div className="flex justify-end mt-4">
              <button
                className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
                onClick={handlePromptSubmit}
              >
                Generate Plan
              </button>
            </div>
          </div>

          <div className="text-center">
            <span className="px-4 text-gray-400">or</span>
          </div>

          <button
            className="w-full bg-gradient-to-r from-green-500 to-teal-500 p-4 rounded-xl hover:opacity-90 transition-opacity font-semibold"
            onClick={handleGenerateFromHistory}
          >
            Generate Plan Based on Past Quizzes
          </button>
        </div>

        {generatedPlan && (
          <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Generated Plan</h2>
              <button
                className="bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                onClick={downloadPlan}
              >
                Download Plan
              </button>
            </div>
            <pre className="whitespace-pre-wrap font-mono bg-slate-700 p-4 rounded-lg">
              {generatedPlan}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePlan;
