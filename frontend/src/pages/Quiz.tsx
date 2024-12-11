import { useNavigate } from "react-router-dom";
import { Feedback, useQuiz } from "../context/QuizContext";
import { motion } from "framer-motion";
import Recorder from "../components/Recorder";
import { useState } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import Lottie from "react-lottie";
import landingBg from "../assets/animations/landing-bg.json";

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

  const landingOptions = {
    loop: true,
    autoplay: true,
    animationData: landingBg,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
      progressiveLoad: true
    },
    isClickToPauseDisabled: true
  };

  const particlesInit = async (main: any) => {
    await loadFull(main);
  };

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

  const renderFeedback = (feedback: Feedback | undefined) => {
    if (!feedback) {
      return <p>No feedback available for this question.</p>;
    }

    return (
      <div>
        <p className="font-semibold">General Feedback:</p>
        <p>{feedback.general_feedback}</p>
        {feedback.transcript && (
          <p>
            <strong>Transcript:</strong> {feedback.transcript}
          </p>
        )}

        <p className="font-semibold">Verbal Analysis:</p>
        <ul>
          <li>Articulation: {feedback.advanced_parameters.articulation}</li>
          <li>Enunciation: {feedback.advanced_parameters.enunciation}</li>
          <li>Tone: {feedback.advanced_parameters.tone}</li>
          <li>
            Grammar & Structure: {feedback.sentence_structuring_and_grammar}
          </li>
          <li>Speaking Rate: {feedback.speaking_rate.comment}</li>
          <li>Filler Words: {feedback.filler_word_usage.comment}</li>
        </ul>

        {feedback.timestamped_feedback.length > 0 && (
          <>
            <p className="font-semibold">Timestamped Feedback:</p>
            <ul>
              {feedback.timestamped_feedback.map(
                (item: { time: string; feedback: string }, i: number) => (
                  <li key={i}>
                    {item.time}: {item.feedback}
                  </li>
                )
              )}
            </ul>
          </>
        )}

        <p className="font-semibold">Non-Verbal Analysis:</p>
        <ul>
          <li>Posture: Work on maintaining a more consistent posture.</li>
          <li>Gestures: Use more expressive hand gestures.</li>
          <li>Eye Contact: Improve eye contact to enhance engagement.</li>
          <li>Speech Clarity: Focus on clarity and articulation.</li>
        </ul>

        <p className="font-semibold">Summary:</p>
        <ul>
          <li>Strengths: Correct grammar and sentence structure.</li>
          <li>
            Improvements Needed: Build confidence in tone and use gestures
            effectively.
          </li>
        </ul>
      </div>
    );
  };

  return (
    <div className="w-screen min-h-screen bg-slate-900 text-white relative overflow-hidden">
      <div className="absolute inset-0">
        <Lottie 
          options={landingOptions}
          style={{ width: '100%', height: '100%' }}
          isClickToPauseDisabled={true}
        />
      </div>

      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: {
            color: {
              value: "transparent",
            },
          },
          particles: {
            number: {
              value: 80,
              density: {
                enable: true,
                value_area: 800,
              },
            },
            color: {
              value: "#0EA5E9",
            },
            links: {
              enable: true,
              color: "#0EA5E9",
              opacity: 0.2,
            },
            move: {
              enable: true,
              speed: 1,
            },
            opacity: {
              value: 0.3,
            },
          },
        }}
        className="absolute inset-0"
      />

      <div 
        className="absolute inset-0 bg-gradient-to-br from-cyan-900/30 to-amber-900/30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 p-8">
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
          className="max-w-3xl mx-auto"
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

          {feedbacks[currentQuestionIndex] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl mb-6 border border-green-500/30"
            >
              <h3 className="text-lg font-medium mb-2 text-green-400">
                Feedback
              </h3>
              {renderFeedback(feedbacks[currentQuestionIndex])}
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
    </div>
  );
};

export default Quiz;
