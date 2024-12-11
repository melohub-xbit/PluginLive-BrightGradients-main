import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { useQuiz } from "../context/QuizContext";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { user: userData } = useAuth();
  const navigate = useNavigate();
  const { setQuestions } = useQuiz();

  const particlesInit = async (main: any) => {
    await loadFull(main);
  };

  const handleStartAssessment = async () => {
    try {
      // get all the questions here
      // const response = await fetch("http://127.0.0.1:8000/generate-questions");
      // const data = await response.json();
      // const questionList = Object.values(data);
      const dummyQuestions = [
        "Describe a challenging workplace situation where your communication skills made a positive difference. What was the outcome?",
        "Tell me about a time when you had to explain a complex concept to someone who had no background in that area. How did you approach it?",
        "Share an experience where you had to give constructive feedback to a colleague or friend. How did you handle the conversation?",
        "What's the most memorable presentation or public speaking experience you've had? What made it stand out?",
        "If you could teach others one key communication principle that has served you well, what would it be and why?",
      ];
      setQuestions(dummyQuestions);
      navigate("/quiz");
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    }
  };

  return (
    <div className="w-full h-screen bg-slate-900 text-white overflow-hidden relative">
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
        className="absolute w-screen inset-0 bg-gradient-to-br from-cyan-900/30 to-amber-900/30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <main className="w-full mx-auto px-4 py-12 relative z-10">
        {userData ? (
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
                Begin Assessment
              </h2>
              <p className="text-slate-400 mb-4">
                Start your communication analysis journey with our AI-powered
                assessment tool. Get instant feedback on:
              </p>
              <ul className="text-slate-400 mb-4 list-disc list-inside">
                <li>Speech clarity and pace</li>
                <li>Grammar and vocabulary</li>
                <li>Confidence metrics</li>
              </ul>
              <button
                className="bg-cyan-500 px-6 py-3 rounded-lg w-full hover:bg-cyan-600 transition transform hover:scale-105 flex items-center justify-center group"
                onClick={handleStartAssessment}
              >
                <span>Start Now</span>
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
              className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-700 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-amber-500/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className="text-teal-400 mr-2">📈</span>
                View Analysis
              </h2>
              <p className="text-slate-400 mb-4">
                Track your progress and review detailed communication metrics:
              </p>
              <ul className="text-slate-400 mb-4 list-disc list-inside">
                <li>Performance trends</li>
                <li>Detailed feedback history</li>
                <li>Improvement analytics</li>
              </ul>
              <button className="bg-teal-500 px-6 py-3 rounded-lg w-full hover:bg-teal-600 transition transform hover:scale-105 flex items-center justify-center group">
                <span>View Reports</span>
                <span className="ml-2 group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </button>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-700 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className="text-amber-400 mr-2">🎯</span>
                Learning Plan
              </h2>
              <p className="text-slate-400 mb-4">
                Your personalized improvement roadmap includes:
              </p>
              <ul className="text-slate-400 mb-4 list-disc list-inside">
                <li>Custom exercises</li>
                <li>Progress milestones</li>
                <li>Achievement tracking</li>
              </ul>
              <button className="bg-amber-500 px-6 py-3 rounded-lg w-full hover:bg-amber-600 transition transform hover:scale-105 flex items-center justify-center group">
                <span>View Plan</span>
                <span className="ml-2 group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </button>
            </motion.div>
          </div>
        ) : (
          <div className="text-center relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto"
            >
              <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-amber-500 bg-clip-text text-transparent">
                Master Your Communication
              </h1>
              <p className="text-xl text-slate-400 mb-8">
                Enhance your communication skills with AI-powered analysis and
                personalized feedback
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/signin")}
                className="bg-gradient-to-r from-cyan-500 to-teal-500 px-8 py-4 rounded-lg text-lg font-bold hover:from-cyan-600 hover:to-teal-600 transition"
              >
                Get Started
              </motion.button>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
