import { motion } from "framer-motion";
import { useQuiz } from "../context/QuizContext";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { User } from "../context/AuthContext";
import toast from "react-hot-toast";

const Dashboard = ({ userData }: { userData: User }) => {
  const navigate = useNavigate();
  const { setQuestions, setFeedbacks, setQuizId, currentQuizId } = useQuiz();
  const [loadingQues, setLoadingQues] = useState(false);

  const handleStartAssessment = async () => {
    setLoadingQues(true);

    // first clear all the questions and feedbacks
    setQuestions([]);
    setFeedbacks({});
    // setCurrentQuizId("");

    try {
      toast("Generating questions...");

      // get all the questions here
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_URL}/generate-questions`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      setQuizId(data.quiz_id);
      setQuestions([...data.questions.questions]);
      navigate("/quiz");
      toast.success("Questions generated successfully!");
    } catch (error) {
      toast.error("Failed to generate questions! Please try again.");
      console.error("Failed to fetch questions:", error);
    } finally {
      setLoadingQues(false);
    }
  };

  return (
    <>
      <div className="mb-12">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome to Your Eloquence, {userData.full_name}
          </h1>
          <p className="text-xl text-slate-300">
            Enhance your communication skills with AI-powered assessments and
            personalized feedback. Let's begin your journey to becoming a more
            confident communicator.
          </p>
        </motion.div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
          className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-700 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-teal-500/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <span className="text-cyan-400 mr-2">📊</span>
            Start a new Quiz
          </h2>
          <p className="text-slate-400 mb-4">
            Start your communication analysis journey with our AI-powered
            assessment tool which provides insights into your communication by
            analyzing your speech, grammar, and confidence through a series of
            questions.
          </p>
          <ul className="text-slate-400 mb-4 list-disc list-inside">
            <li>Speech clarity and pace</li>
            <li>Grammar and vocabulary</li>
            <li>Confidence metrics</li>
            <li>Feedback and suggestions</li>
          </ul>
          <button
            className="bg-cyan-500 px-6 py-3 rounded-lg w-full hover:bg-cyan-600 transition transform hover:scale-105 flex items-center justify-center group"
            onClick={handleStartAssessment}
          >
            <span>{loadingQues ? "Loading..." : "Start Now"}</span>
            <span className="ml-2 group-hover:translate-x-1 transition-transform">
              →
            </span>
          </button>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
          className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-700 relative overflow-hidden group flex flex-col justify-between"
        >
          <div>
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-amber-500/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <span className="text-teal-400 mr-2">📈</span>
              View Analysis History
            </h2>
            <p className="text-slate-400 mb-4">
              Explore your past communication assessments and gain insights into
              your progress and areas for improvement.
            </p>
            <ul className="text-slate-400 mb-4 list-disc list-inside">
              <li>Replay your video submission</li>
              <li>Detailed feedback history</li>
              <li>Improvement analytics</li>
              <li>Progress tracking</li>
            </ul>
          </div>
          <Link to="/history">
            <button className="text-white bg-teal-500 px-6 py-3 rounded-lg w-full hover:bg-teal-600 transition transform hover:scale-105 flex items-center justify-center group">
              <span>View History</span>
              <span className="ml-2 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
          className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-700 relative overflow-hidden group flex flex-col justify-between"
        >
          <div>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <span className="text-amber-400 mr-2">🎯</span>
              Create Learning Plan
            </h2>
            <p className="text-slate-400 mb-4">
              Create a roadmap by selecting the areas you want to focus on. This
              AI tool will provide you with a personalized learning plan to help
              you improve your communication skills.
            </p>
            <ul className="text-slate-400 mb-4 list-disc list-inside">
              <li>Personalized areas to focus</li>
              <li>Speech Exercises</li>
              <li>Improving Body Language</li>
            </ul>
          </div>
          <Link to="/create-plan">
            <button className="bg-amber-500 text-black px-6 py-3 rounded-lg w-full hover:bg-amber-600 transition transform hover:scale-105 flex items-center justify-center group">
              <span>Create Plan</span>
              <span className="ml-2 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </button>
          </Link>
        </motion.div>
      </div>{" "}
    </>
  );
};

export default Dashboard;
