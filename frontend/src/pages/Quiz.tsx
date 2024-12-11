import { useNavigate } from "react-router-dom";
import { useQuiz } from "../context/QuizContext";
import { motion } from "framer-motion";
import Recorder from "../components/Recorder";
import { useState } from "react";

const Quiz = () => {
  const navigate = useNavigate();
  const {
    questions,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    feedbacks,
    answeredQuestions,
  } = useQuiz();
  const [showRecorder, setShowRecorder] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);

  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleQuestionChange = (index: number) => {
    // Only allow navigation to answered questions or next unanswered question
    if (index <= answeredQuestions) {
      setCurrentQuestionIndex(index);
      setShowRecorder(false);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowRecorder(false);
    }
  };

  const handleFinish = () => {
    navigate("/results");
  };

  const handleNarration = () => {
    if (isNarrating) {
      window.speechSynthesis.cancel();
      setIsNarrating(false);
    } else {
      const speech = new SpeechSynthesisUtterance(
        questions[currentQuestionIndex]
      );
      speech.onend = () => setIsNarrating(false);
      window.speechSynthesis.speak(speech);
      setIsNarrating(true);
    }
  };

  return (
    <div className="h-screen bg-slate-900 text-white p-8 w-screen">
      {/* Question Navigation Bar */}
      <div className="flex justify-center gap-4 mb-8">
        {questions.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => handleQuestionChange(index)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all
                ${
                  currentQuestionIndex === index
                    ? "bg-cyan-500"
                    : "bg-slate-700"
                }
                ${
                  index > answeredQuestions
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-cyan-600"
                }
                ${feedbacks[index] ? "ring-2 ring-green-400" : ""}`}
          >
            {index + 1}
          </motion.button>
        ))}
      </div>

      {/* Question Display */}
      <motion.div
        key={currentQuestionIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <div className="bg-slate-800 p-8 rounded-xl shadow-lg mb-6">
          <h2 className="text-2xl mb-6 text-center">
            {questions[currentQuestionIndex]}
          </h2>

          <div className="flex justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNarration}
              className={`px-4 py-2 rounded-lg transition-all ${
                isNarrating
                  ? "bg-gradient-to-r from-rose-500 to-amber-500"
                  : "bg-gradient-to-r from-purple-500 to-indigo-500"
              }`}
            >
              {isNarrating ? "Stop Narration" : "Narrate Question"}
            </motion.button>

            {!showRecorder && !feedbacks[currentQuestionIndex] && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowRecorder(true)}
                className="bg-cyan-500 px-6 py-3 rounded-lg hover:bg-cyan-600 transition"
              >
                Record Answer
              </motion.button>
            )}
          </div>
        </div>
        {/* Feedback Display */}
        {feedbacks[currentQuestionIndex] && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 p-6 rounded-xl mb-6 border border-green-500/30"
          >
            <h3 className="text-lg font-medium mb-2 text-green-400">
              Feedback
            </h3>
            <p className="text-slate-300">{feedbacks[currentQuestionIndex]}</p>

            <div className="flex justify-end mt-4">
              {!isLastQuestion ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNext}
                  className="bg-cyan-500 px-6 py-2 rounded-lg hover:bg-cyan-600 transition"
                >
                  Next Question
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFinish}
                  className="bg-green-500 px-6 py-2 rounded-lg hover:bg-green-600 transition"
                >
                  Finish Quiz
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {/* Recorder Component */}
        {showRecorder && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden"
          >
            <Recorder
              questionIndex={currentQuestionIndex}
              onComplete={() => setShowRecorder(false)}
            />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Quiz;
