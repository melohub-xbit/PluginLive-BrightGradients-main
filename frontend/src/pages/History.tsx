import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Feedback } from "../context/QuizContext";

interface HistoryItem {
  quizID: number;
  question: string;
  videoURL: string;
  feedback: Feedback;
}

interface HistoryStructure {
  [quiz_id: string]: {
    [question: string]: [string, Feedback];
  };
}



const History: React.FC = () => {
  const [history, setHistory] = useState<HistoryStructure>();
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null
  );

  useEffect(() => {
    console.log("fetching history 1");
    fetchHistory();
  }, []);

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
      setHistory(data);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const transformHistoryData = (historyData: HistoryStructure): HistoryItem[] => {
    if (!historyData) return [];
    
    return Object.entries(historyData).flatMap(([quizId, questions]) =>
      Object.entries(questions).map(([question, [videoURL, feedback]]) => ({
        quizID: parseInt(quizId),
        question,
        videoURL,
        feedback
      }))
    );
  };
  
  const formatQuestion = (question: string) => {
    return question
      .replace(/_/g, ' ')
      .replace(/\?$/, '?')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };
  
  const renderFeedbackModal = (feedback: Feedback) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={() => setSelectedFeedback(null)}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-slate-800 p-8 rounded-xl max-w-2xl max-h-[80vh] overflow-y-auto m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold mb-4">Detailed Feedback</h3>

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-cyan-400">General Feedback</h4>
            <p>{feedback.general_feedback}</p>
          </div>

          <div>
            <h4 className="font-semibold text-cyan-400">Advanced Parameters</h4>
            <ul className="list-disc pl-5">
              <li>Articulation: {feedback.advanced_parameters.articulation}</li>
              <li>Enunciation: {feedback.advanced_parameters.enunciation}</li>
              <li>Tone: {feedback.advanced_parameters.tone}</li>
              <li>
                Intelligibility: {feedback.advanced_parameters.intelligibility}
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-cyan-400">Speaking Analysis</h4>
            <ul className="list-disc pl-5">
              <li>Speaking Rate: {feedback.speaking_rate.comment}</li>
              <li>Filler Words: {feedback.filler_word_usage.comment}</li>
              <li>Pause Pattern: {feedback.pause_pattern.comment}</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-cyan-400">
              Timestamped Feedback
            </h4>
            <ul className="space-y-2">
              {feedback.timestamped_feedback.map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-cyan-500">{item.time}</span>
                  <span>{item.feedback}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <button
          className="mt-6 bg-cyan-500 px-4 py-2 rounded-lg hover:bg-cyan-600 transition-colors"
          onClick={() => setSelectedFeedback(null)}
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-5xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          Practice History
        </h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {history && transformHistoryData(history).map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-cyan-500/10 transition-shadow"
            >
              <div className="aspect-video bg-slate-700">
                <video
                src={item.videoURL}
                controls={true}
                className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <p className="text-sm font-semibold text-neutral-200 mb-2">
                  Quiz #{item.quizID}
                </p>
                <h2 className="text-lg font-semibold text-white mb-2 break-words whitespace-normal">
                  <span className="text-neutral-300">Question: </span>
                  {formatQuestion(item.question)}
                </h2>
                <button
                  onClick={() => setSelectedFeedback(item.feedback)}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 py-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                  View Feedback
                </button>
              </div>
            </motion.div>
          ))}
          {history && transformHistoryData(history).length === 0 && (
            (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full text-center py-12"
              >
                <h2 className="text-2xl font-semibold text-cyan-400 mb-4">No History Yet</h2>
                <p className="text-neutral-300">Participate in talk sessions to view your practice history</p>
              </motion.div>
            )
          )}
        </div>

        <AnimatePresence>
          {selectedFeedback && renderFeedbackModal(selectedFeedback)}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default History;
