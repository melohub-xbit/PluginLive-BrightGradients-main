import { Feedback, useQuiz } from "../context/QuizContext";
import { motion } from "framer-motion";
import Recorder from "../components/Recorder";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { CircularProgress, Typography } from '@mui/material';

const Quiz = () => {
  const navigate = useNavigate();
  const {
    questions,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    feedbacks,
    answeredQuestions,
    updateFinalFeedback,
    currentQuizId,
  } = useQuiz();
  const [showRecorder, setShowRecorder] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const [loadingFinalResults, setLoadingFinalResults] = useState(false);

  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  if (questions.length === 0) {
    return <Navigate to="/" replace />;
  }

  const handleQuestionChange = (index: number) => {
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

  const handleFinish = async () => {
    setLoadingFinalResults(true);

    // get the final results from the backend
    // and navigate to the results page
    try {
      const token = localStorage.getItem("token");

      const feedbackWithQuestions = Object.entries(feedbacks).map(
        ([index, feedback]) => ({
          question: questions[parseInt(index)], // Access question by index
          feedback: feedback,
        })
      );

      const requestBody = JSON.stringify({
        feedbackWithQuestions,
        currentQuizId,
      });

      const response = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_URL}/final-feedback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // Important: Set Content-Type
            Authorization: `Bearer ${token}`,
          },
          body: requestBody,
        }
      );

      if (response.ok) {
        const data = await response.json();

        updateFinalFeedback(data);
      }
    } catch (error) {
      console.error("Failed to fetch final results:", error);
    } finally {
      setLoadingFinalResults(false);
    }

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

  if (loadingFinalResults) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography variant="body1" style={{ marginTop: '1rem' }}>Loading final results...</Typography>
      </div>
    );
  }

  const renderFeedback = (feedback: Feedback | undefined) => {
    if (!feedback) {
      return <p>No feedback available for this question.</p>;
    }

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-5xl mx-auto space-y-4"
      >
        {feedback.transcript && (
          <motion.div
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 hover:border-cyan-500/30 transition-colors"
          >
            <h3 className="text-sm text-cyan-400 mb-1">Transcript</h3>
            <p className="text-slate-300 text-sm">{feedback.transcript}</p>
          </motion.div>
        )}

        <motion.div
          initial={{ x: -20 }}
          animate={{ x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 hover:border-cyan-500/30 transition-colors"
        >
          <h3 className="text-sm text-cyan-400 mb-1">General Feedback</h3>
          <p className="text-slate-300 text-sm">{feedback.general_feedback}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 hover:border-cyan-500/30 transition-all hover:shadow-lg hover:shadow-cyan-500/10">
            <h3 className="text-sm text-cyan-400 mb-4">Verbal Analysis</h3>
            <div className="grid gap-3">
              {/* Voice Quality Metrics */}
              <div className="space-y-2">
                <h4 className="text-xs uppercase tracking-wider text-slate-400">
                  Voice Quality
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-slate-400 text-xs">Articulation</span>
                    <span className="text-slate-200 text-sm font-medium">
                      {feedback.advanced_parameters.articulation}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-400 text-xs">Enunciation</span>
                    <span className="text-slate-200 text-sm font-medium">
                      {feedback.advanced_parameters.enunciation}
                    </span>
                  </div>
                </div>
              </div>

              {/* Speech Pattern Metrics */}
              <div className="space-y-2">
                <h4 className="text-xs uppercase tracking-wider text-slate-400">
                  Speech Pattern
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-slate-400 text-xs">Tone</span>
                    <span className="text-slate-200 text-sm font-medium">
                      {feedback.advanced_parameters.tone}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-400 text-xs">Grammar</span>
                    <span className="text-slate-200 text-sm font-medium">
                      {feedback.sentence_structuring_and_grammar}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Metrics */}
              <div className="space-y-2">
                <h4 className="text-xs uppercase tracking-wider text-slate-400">
                  Delivery
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-slate-400 text-xs">
                      Speaking Rate
                    </span>
                    <span className="text-slate-200 text-sm font-medium">
                      {feedback.speaking_rate.comment}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-400 text-xs">Filler Words</span>
                    <span className="text-slate-200 text-sm font-medium">
                      {feedback.filler_word_usage.comment}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 hover:border-cyan-500/30 transition-all hover:shadow-lg hover:shadow-cyan-500/10">
            <h3 className="text-sm text-cyan-400 mb-2">Non-Verbal Analysis</h3>
            <ul className="space-y-1 text-sm">
              <li className="flex justify-between">
                <span className="text-slate-400">Posture</span>
                <span className="text-slate-200">Needs improvement</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-400">Gestures</span>
                <span className="text-slate-200">More expression needed</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-400">Eye Contact</span>
                <span className="text-slate-200">Enhance engagement</span>
              </li>
            </ul>
          </div>
        </div>

        {feedback.timestamped_feedback.length > 0 && (
          <motion.div
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 hover:border-cyan-500/30 transition-colors"
          >
            <h3 className="text-sm text-cyan-400 mb-2">Timeline</h3>
            <div className="space-y-1 text-sm">
              {feedback.timestamped_feedback.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-cyan-500">{item.time}</span>
                  <span className="text-slate-300">{item.feedback}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 w-full">
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

      <motion.div
        key={currentQuestionIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto"
      >
        <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl shadow-lg mb-6">
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
            <p className="text-slate-300">
              {feedbacks[currentQuestionIndex] && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-800/50 p-6 rounded-xl mb-6 border border-green-500/30"
                >
                  <h3 className="text-lg font-medium mb-2 text-green-400">
                    Feedback
                  </h3>

                  {/* Render the structured feedback */}
                  {renderFeedback(feedbacks[currentQuestionIndex])}

                  <div className="flex justify-end mt-4">
                    {/* ... (Next Question/Finish Quiz buttons) */}
                  </div>
                </motion.div>
              )}
            </p>

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
                  {loadingFinalResults ? "Finishing wait.." : "Finish Quiz"}
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

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
