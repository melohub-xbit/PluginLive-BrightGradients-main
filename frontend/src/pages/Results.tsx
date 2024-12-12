import { useState } from "react";
import { useQuiz } from "../context/QuizContext";
import { format } from "date-fns";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";


interface ActionableRecommendation {
  reason: string;
  recommendation: string;
}

interface PersonalizedExample {
  feedback: string;
  line: string;
}

interface FillerWordUsage {
  comment: string;
  count: number;
}

interface PausePattern {
  comment: string;
  count: number;
}

interface SpeakingRate {
  comment: string;
  rate: number;
}

interface AdvancedParameters {
  articulation: string;
  enunciation: string;
  filler_word_usage: FillerWordUsage;
  intelligibility: string;
  pause_pattern: PausePattern;
  personalized_examples: PersonalizedExample[];
  speaking_rate: SpeakingRate;
  tone: string;
  sentence_structuring_and_grammar: string;
  actionable_recommendations: ActionableRecommendation[];
}

interface OverallFeedback {
  summary: string;
  key_strengths: string;
  areas_of_improvement: string;
}

export interface FinalFeedback {
  advanced: AdvancedParameters;
  overall_feedback: OverallFeedback;
}

const Results = () => {
  const { questions, finalFeedback, feedbacks } = useQuiz();
  const { user } = useAuth();
  const currentDate = format(new Date(), "dd-MMM-yyyy");
  const [downloading, setDownloading] = useState(false);
  const [showFullFeedback, setShowFullFeedback] = useState(false);

  const downloadReport = async (feedbackData: FinalFeedback | null) => {
    if (!feedbackData) return;

    setDownloading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_URL}/download_report`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            feedbackData,
            feedbacks: [...Object.values(feedbacks)],
            questions,
          }),
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "assessment_report.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error downloading report:", error);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownload = async () => {
    await downloadReport(finalFeedback);
  };

  const renderFullFeedback = (feedback: FinalFeedback) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={() => setShowFullFeedback(false)}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-slate-800 p-8 rounded-xl max-w-2xl max-h-[80vh] overflow-y-auto m-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-white hover:text-gray-400"
          onClick={() => setShowFullFeedback(false)}
        >
          &times;
        </button>
  
        <h3 className="text-xl font-bold mb-4 text-cyan-400">Detailed Feedback</h3>
  
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-cyan-400">Overall Feedback</h4>
            <p className="text-white mt-2">
              {feedback.overall_feedback.summary}
            </p>
          </div>
  
          <div>
            <h4 className="font-semibold text-cyan-400">Key Strengths</h4>
            <p className="text-white mt-2">
              {feedback.overall_feedback.key_strengths}
            </p>
          </div>
  
          <div>
            <h4 className="font-semibold text-cyan-400">Areas of Improvement</h4>
            <p className="text-white mt-2">
              {feedback.overall_feedback.areas_of_improvement}
            </p>
          </div>
  
          <div>
            <h4 className="font-semibold text-cyan-400">Speaking Metrics</h4>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="bg-slate-700 p-3 rounded">
                <p className="text-cyan-300">Speaking Rate</p>
                <p className="text-sm text-white">
                  {feedback.advanced.speaking_rate.comment}
                </p>
              </div>
              <div className="bg-slate-700 p-3 rounded">
                <p className="text-cyan-300">Filler Words</p>
                <p className="text-sm text-white">
                  {feedback.advanced.filler_word_usage.comment}
                </p>
              </div>
            </div>
          </div>
  
          <div>
            <h4 className="font-semibold text-cyan-400">Recommendations</h4>
            <div className="space-y-2 mt-2">
              {feedback.advanced.actionable_recommendations.map(
                (rec, index) => (
                  <div key={index} className="bg-slate-700 p-3 rounded">
                    <p className="text-white">{rec.recommendation}</p>
                    <p className="text-sm text-gray-400 mt-1">{rec.reason}</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
  
        <button
          className="mt-6 bg-cyan-500 px-4 py-2 rounded-lg hover:bg-cyan-600 transition-colors"
          onClick={() => setShowFullFeedback(false)}
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
  

  return (
    <div className="h-screen bg-slate-900 text-white p-8 w-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Communication Assessment Report
      </h1>
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 block mx-auto"
      >
        {downloading ? "Downloading..." : "Download Report"}
      </button>

      <div className="max-w-3xl mx-auto bg-slate-800 p-8 rounded-xl shadow-lg">
        <p className="mb-4">Candidate: {user?.full_name}</p>
        <p className="mb-8">Date: {currentDate}</p>

        {finalFeedback && (
          <div className="bg-slate-700 p-4 rounded-lg mb-4">
            <p className="text-lg font-medium text-white">
              {finalFeedback.overall_feedback.summary}
            </p>
            <button
              onClick={() => setShowFullFeedback(true)}
              className="mt-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-1 px-2 rounded-md text-sm"
            >
              View Full Feedback
            </button>
          </div>
        )}
        <AnimatePresence>
          {showFullFeedback && finalFeedback && renderFullFeedback(finalFeedback)}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Results;
