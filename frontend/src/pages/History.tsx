import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Feedback } from "../context/QuizContext";

interface HistoryItem {
  quizNumber: number;
  question: string;
  videoURL: string;
  feedback: Feedback;
}

const History: React.FC = () => {
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null
  );

  const dummyHistory: HistoryItem[] = [
    {
      quizNumber: 1,
      question: "Tell me about yourself.",
      videoURL: "https://www.example.com/video1.mp4",
      feedback: {
        advanced_parameters: {
          articulation: "Clear and precise",
          enunciation: "Well-pronounced words",
          intelligibility: "Highly understandable",
          tone: "Professional and engaging",
        },
        filler_word_usage: {
          comment: "Minimal use of filler words",
          count: 3,
        },
        general_feedback: "Excellent presentation with strong delivery",
        pause_pattern: {
          comment: "Well-timed pauses",
          count: 5,
        },
        sentence_structuring_and_grammar:
          "Strong sentence structure with proper grammar",
        speaking_rate: {
          comment: "Balanced pace",
          rate: 4,
        },
        timestamped_feedback: [
          { feedback: "Strong opening", time: "00:00:15" },
          { feedback: "Good eye contact", time: "00:00:30" },
        ],
        transcript: "Sample transcript of the response",
      },
    },
    // Add more dummy items as needed
  ];

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
          {dummyHistory.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-cyan-500/10 transition-shadow"
            >
              <div className="aspect-video bg-slate-700" />
              <div className="p-4">
                <p className="text-sm font-semibold text-neutral-200 mb-2">
                  Quiz #{item.quizNumber}
                </p>
                <h2 className="text-lg font-semibold text-white mb-2">
                  <span className="text-neutral-300">Question: </span>
                  {item.question}
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
        </div>

        <AnimatePresence>
          {selectedFeedback && renderFeedbackModal(selectedFeedback)}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default History;
