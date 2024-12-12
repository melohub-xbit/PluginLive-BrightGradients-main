import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Feedback } from "../context/QuizContext";

interface HistoryItem {
  quizID: string;
  question: string;
  videoURL: string;
  feedback: Feedback;
}

interface HistoryStructure {
  [quiz_id: string]: {
    [question: string]: [string, Feedback];
  };
}

interface ActionableRecommendation {
  reason: string;
  recommendation: string;
}

interface PersonalizedExample {
  feedback: string;
  line: string;
}

interface SpeakingMetric {
  comment: string;
  count?: number;
  rate?: number;
}

interface OverallFeedback {
  areas_of_improvement: string;
  key_strengths: string;
  summary: string;
}

interface AdvancedFeedback {
  actionable_recommendations: ActionableRecommendation[];
  articulation: string;
  enunciation: string;
  filler_word_usage: SpeakingMetric;
  intelligibility: string;
  pause_pattern: SpeakingMetric;
  personalized_examples: PersonalizedExample[];
  speaking_rate: SpeakingMetric;
  tone: string;
  sentence_structuring_and_grammar: string;
}

interface FinalFeedbackStructure {
  [feedback_id: string]: {
    advanced: AdvancedFeedback;
    overall_feedback: OverallFeedback;
  }
}



const History: React.FC = () => {
  const [history, setHistory] = useState<HistoryStructure>();
  const [finalFeedbacks, setFinalFeedbacks] = useState<FinalFeedbackStructure>({});
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<'history' | 'feedbacks'>('history');
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [isFeedbacksLoading, setIsFeedbacksLoading] = useState(true);
  const [selectedFinalFeedback, setSelectedFinalFeedback] = useState<{id: string, feedback: any} | null>(null);

  useEffect(() => {
    fetchHistory();
    fetchAllFeedbacks();
  }, []);

  const fetchAllFeedbacks = async () => {
    setIsFeedbacksLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/final-feedbacks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch feedbacks");
      }
      const data = await response.json();
      setFinalFeedbacks(data);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
    } finally {
      setIsFeedbacksLoading(false);
    }
  };
  
  const fetchHistory = async () => {
    setIsHistoryLoading(true);
    try {
      const token = localStorage.getItem("token");
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
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const renderBriefFeedbackCard = (feedbackId: string, feedback: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-cyan-500/10 transition-shadow"
    >
      <div className="p-4">
        <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg px-3 py-1 mb-3">
          <p className="text-lg font-bold text-white">
            Quiz #{feedbackId.split('-')[0]}
          </p>
        </div>
        <p className="text-white mb-4">{feedback.overall_feedback.summary}</p>
        <button
          onClick={() => setSelectedFinalFeedback({id: feedbackId, feedback})}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          View Feedback
        </button>
      </div>
    </motion.div>
  );
  
  
  
  

  const LoadingScreen = () => (
    <div className="col-span-full flex items-center justify-center py-12">
      <div className="space-y-4 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cyan-400 border-t-transparent"></div>
        <p className="text-cyan-400 font-medium">Loading...</p>
      </div>
    </div>
  );

  const transformHistoryData = (historyData: HistoryStructure): HistoryItem[] => {
    if (!historyData) return [];
    
    return Object.entries(historyData).flatMap(([quizId, questions]) =>
      Object.entries(questions).map(([question, [videoURL, feedback]]) => ({
        quizID: quizId.split('-')[0],
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

  const TabButton: React.FC<{ 
    label: string; 
    isActive: boolean; 
    onClick: () => void 
  }> = ({ label, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`px-6 py-3 rounded-lg font-semibold transition-all ${
        isActive 
          ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white" 
          : "text-gray-400 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
  

  const renderFinalFeedbackCard = (feedbackId: string, feedback: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-cyan-500/10 transition-shadow"
    >
      <h3 className="text-xl font-bold mb-4 text-cyan-400">Feedback Summary</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-cyan-400">Overall Feedback</h4>
          <p className="text-white mt-2">{feedback.overall_feedback.summary}</p>
        </div>

        <div>
          <h4 className="font-semibold text-cyan-400">Key Strengths</h4>
          <p className="text-white mt-2">{feedback.overall_feedback.key_strengths}</p>
        </div>

        <div>
          <h4 className="font-semibold text-cyan-400">Areas of Improvement</h4>
          <p className="text-white mt-2">{feedback.overall_feedback.areas_of_improvement}</p>
        </div>

        <div>
          <h4 className="font-semibold text-cyan-400">Speaking Metrics</h4>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="bg-slate-700 p-3 rounded">
              <p className="text-cyan-300">Speaking Rate</p>
              <p className="text-sm text-white">{feedback.advanced.speaking_rate.comment}</p>
            </div>
            <div className="bg-slate-700 p-3 rounded">
              <p className="text-cyan-300">Filler Words</p>
              <p className="text-sm text-white">{feedback.advanced.filler_word_usage.comment}</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-cyan-400">Recommendations</h4>
          <div className="space-y-2 mt-2">
            {feedback.advanced.actionable_recommendations.map((rec: ActionableRecommendation, index: number) => (
              <div key={index} className="bg-slate-700 p-3 rounded">
                <p className="text-white">{rec.recommendation}</p>
                <p className="text-sm text-gray-400 mt-1">{rec.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );

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

  const renderDetailedFeedbackModal = (feedbackId: string, feedback: any) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={() => setSelectedFinalFeedback(null)}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-slate-800 p-8 rounded-xl max-w-2xl max-h-[80vh] overflow-y-auto m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold mb-4 text-cyan-400">Detailed Feedback</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-cyan-400">Overall Feedback</h4>
            <p className="text-white mt-2">{feedback.overall_feedback.summary}</p>
          </div>
  
          <div>
            <h4 className="font-semibold text-cyan-400">Key Strengths</h4>
            <p className="text-white mt-2">{feedback.overall_feedback.key_strengths}</p>
          </div>
  
          <div>
            <h4 className="font-semibold text-cyan-400">Areas of Improvement</h4>
            <p className="text-white mt-2">{feedback.overall_feedback.areas_of_improvement}</p>
          </div>
  
          <div>
            <h4 className="font-semibold text-cyan-400">Speaking Metrics</h4>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="bg-slate-700 p-3 rounded">
                <p className="text-cyan-300">Speaking Rate</p>
                <p className="text-sm text-white">{feedback.advanced.speaking_rate.comment}</p>
              </div>
              <div className="bg-slate-700 p-3 rounded">
                <p className="text-cyan-300">Filler Words</p>
                <p className="text-sm text-white">{feedback.advanced.filler_word_usage.comment}</p>
              </div>
            </div>
          </div>
  
          <div>
            <h4 className="font-semibold text-cyan-400">Recommendations</h4>
            <div className="space-y-2 mt-2">
              {feedback.advanced.actionable_recommendations.map((rec: ActionableRecommendation, index: number) => (
                <div key={index} className="bg-slate-700 p-3 rounded">
                  <p className="text-white">{rec.recommendation}</p>
                  <p className="text-sm text-gray-400 mt-1">{rec.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
  
        <button
          className="mt-6 bg-cyan-500 px-4 py-2 rounded-lg hover:bg-cyan-600 transition-colors"
          onClick={() => setSelectedFinalFeedback(null)}
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

        <div className="flex space-x-4 mb-8">
          <TabButton 
            label="Question History" 
            isActive={activeTab === 'history'} 
            onClick={() => setActiveTab('history')} 
          />
          <TabButton 
            label="Detailed Feedbacks" 
            isActive={activeTab === 'feedbacks'} 
            onClick={() => setActiveTab('feedbacks')} 
          />
        </div>

        {activeTab === 'history' && (
          
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             {isHistoryLoading ? (
                <LoadingScreen />
              ) : (
                <>
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
            </>
            )}
          </div>
        )}
         {activeTab === 'feedbacks' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isFeedbacksLoading ? (
              <LoadingScreen />
            ) : (
              <>
                {Object.entries(finalFeedbacks).map(([feedbackId, feedback]) => (
                  <React.Fragment key={feedbackId}>
                    {renderBriefFeedbackCard(feedbackId, feedback)}
                  </React.Fragment>
                ))}
                {Object.keys(finalFeedbacks).length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-full text-center py-12"
                  >
                    <h2 className="text-2xl font-semibold text-cyan-400 mb-4">No Feedbacks Available</h2>
                    <p className="text-neutral-300">Complete more practice sessions to receive detailed feedback</p>
                  </motion.div>
                )}
              </>
            )}
          </div>
        )}

        <AnimatePresence>
          {selectedFeedback && renderFeedbackModal(selectedFeedback)}
        </AnimatePresence>

      </div>
      <AnimatePresence>
        {selectedFinalFeedback && renderDetailedFeedbackModal(selectedFinalFeedback.id, selectedFinalFeedback.feedback)}
      </AnimatePresence>
    </div>
  );
};

export default History;
