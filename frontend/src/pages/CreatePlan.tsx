import React, { useState } from "react";
// import { Feedback } from "../context/QuizContext";

// interface Feedbacks {
//   feedback: Feedback;
// }
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface WeeklyFocus {
  "Week number": string[];
  "Targets": string[];
}

interface LearningPlan {
  "Goals": string[];
  "Weekly Focus Areas": WeeklyFocus[];
  "Actionable Items": string[];
  "Resources": string[];
  "Progress Tracking Metrics": string[];
  "Exercises and practice activities": string[];
  "Tips to stay consistent": string[];
}


const CreatePlan: React.FC = () => {
  // const [pastFeedbacks, setPastFeedbacks] = useState<Feedbacks[]>([]);
  const [prompt, setPrompt] = useState("");
  const [generatedPlan, setGeneratedPlan] = useState<LearningPlan | null>(null);
  
  const handleGenerateFromHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/learn-history`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to generate plan');
      }
  
      const data = await response.json();
      setGeneratedPlan(data);
      console.log("Generated Plan:", generatedPlan);
    } catch (error) {
      console.error('Error generating plan:', error);
    }
  };

  const handlePromptSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log(JSON.stringify(prompt));
      const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/learn-prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({"input":prompt}),
      });
  
      if (!response.ok) {
        throw new Error('Failed to generate plan');
      }
  
      const data = await response.json();
      setGeneratedPlan(data);
      console.log("Generated Plan:", generatedPlan);
    } catch (error) {
      console.error('Error generating plan:', error);
    }
  };
  

  

  const downloadPDF = () => {
    const planElement = document.getElementById('plan-content');
    if (planElement) {
      html2canvas(planElement).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 30;
  
        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
        pdf.save('learning-plan.pdf');
      });
    }
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
          <>
            <button
              className="bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              onClick={downloadPDF}
            >
              Download Plan
            </button>
          <div id="plan-content" className="bg-slate-800 p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                Your Learning Plan
              </h2>
              
            </div>

            <div className="space-y-8">
              {/* Goals Section */}
              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">Goals</h3>
                <ul className="space-y-2">
                  {generatedPlan.Goals.map((goal, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-purple-400 mr-2">•</span>
                      <span className="text-gray-200">{goal}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Weekly Focus Areas */}
              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">Weekly Focus Areas</h3>
                <div className="space-y-4">
                  {generatedPlan["Weekly Focus Areas"].map((week, index) => (
                    <div key={index} className="bg-slate-700 p-4 rounded-lg">
                      <h4 className="text-purple-400 font-medium mb-2">Week {week["Week number"]}</h4>
                      <ul className="space-y-1 ml-4">
                        {week.Targets.map((target, idx) => (
                          <li key={idx} className="text-gray-200">• {target}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>

              {/* Actionable Items */}
              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">Actionable Items</h3>
                <ul className="space-y-2">
                  {generatedPlan["Actionable Items"].map((item, index) => (
                    <li key={index} className="flex items-start bg-slate-700 p-3 rounded-lg">
                      <span className="text-purple-400 mr-2">{index + 1}.</span>
                      <span className="text-gray-200">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Resources */}
              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {generatedPlan.Resources.map((resource, index) => (
                    <div key={index} className="bg-slate-700 p-3 rounded-lg text-gray-200">
                      {resource}
                    </div>
                  ))}
                </div>
              </section>

              {/* Progress Tracking Metrics */}
              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">Progress Tracking Metrics</h3>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <ul className="space-y-2">
                    {generatedPlan["Progress Tracking Metrics"].map((metric, index) => (
                      <li key={index} className="flex items-center text-gray-200">
                        <span className="text-purple-400 mr-2">📊</span>
                        {metric}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* Exercises and Practice Activities */}
              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">Exercises and Practice Activities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {generatedPlan["Exercises and practice activities"].map((exercise, index) => (
                    <div key={index} className="bg-slate-700 p-4 rounded-lg">
                      <span className="text-purple-400 mr-2">✏️</span>
                      <span className="text-gray-200">{exercise}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Tips to Stay Consistent */}
              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">Tips to Stay Consistent</h3>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <ul className="space-y-2">
                    {generatedPlan["Tips to stay consistent"].map((tip, index) => (
                      <li key={index} className="flex items-start text-gray-200">
                        <span className="text-purple-400 mr-2">💡</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            </div>
          </div>
        </>
        )}


        {/* {generatedPlan && (
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
              {JSON.stringify(generatedPlan, null, 2)}
            </pre>
          </div>
        )} */}
      </div>
    </div>
  );
};
export default CreatePlan;
