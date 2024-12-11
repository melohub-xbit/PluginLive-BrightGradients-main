import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Lottie from "react-lottie";
import { useQuiz } from "../context/QuizContext";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import landingBg from "../assets/animations/landing-bg.json";
import landingOptBg from "../assets/animations/landing-opt-bg.json";
import dashboardBg from "../assets/animations/dashboard-bg.json";

const Home = () => {
  const { user: userData } = useAuth();
  const navigate = useNavigate();
  const { setQuestions } = useQuiz();
  const [loadingQues, setLoadingQues] = useState(false);

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
  const featureOptions = {
    ...landingOptions,
    animationData: landingOptBg,
  };

  const dashboardOptions = {
    ...landingOptions,
    animationData: dashboardBg,
  };

  const handleStartAssessment = async () => {
    setLoadingQues(true);
    try {
      const response = await fetch("http://localhost:8000/generate-questions");
      const data = await response.json();
      setQuestions(data.questions);
      navigate("/quiz");
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    } finally {
      setLoadingQues(false);
    }
  };
  return (
    <div className="w-screen min-h-screen bg-slate-900 text-white overflow-x-hidden">
     
      {userData ? (
        <div className="relative w-full min-h-screen flex items-center">
          <div className="absolute inset-0 w-full h-full">
            <Lottie 
              options={dashboardOptions}
              height="100%"
              width="100%"
              isClickToPauseDisabled={true}
            />
          </div>
  
          <main className="relative z-10 w-full py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
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
                  <span>{loadingQues ? "Loading..." : "Start Now"}</span>
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
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
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
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
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </motion.div>
            </div>
          </main>
        </div>
      ) : (
        <div className="relative flex flex-col min-h-screen">
          
  
          <section className="relative flex-1 flex items-center min-h-screen pt-16">
            <div className="absolute inset-0 w-full h-full">
              <Lottie 
                options={landingOptions}
                height="100%"
                width="100%"
                isClickToPauseDisabled={true}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 to-slate-900/30" />
            
            <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto text-center"
              >
                <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-amber-500 bg-clip-text text-transparent">
                  Level Up Your Communication Skills
                </h2>
                <p className="text-xl text-slate-300 mb-8">
                  AI-powered communication assessment platform that helps you analyze, improve,
                  and master your speaking abilities through real-time feedback.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/signup")}
                  className="bg-gradient-to-r from-cyan-500 to-teal-500 px-8 py-4 rounded-lg text-lg font-bold hover:from-cyan-600 hover:to-teal-600 transition"
                >
                  Get Started
                </motion.button>
              </motion.div>
            </div>
          </section>
  
          <section className="relative py-16 sm:py-24 lg:py-32 bg-slate-800/50">
            <div className="absolute inset-0 w-full h-full">
              <Lottie 
                options={featureOptions}
                height="100%"
                width="100%"
                isClickToPauseDisabled={true}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 to-slate-900/60" />
            
            <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
              <h3 className="text-3xl font-bold text-center mb-16 bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Transform Your Communication Journey
              </h3>
  
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="grid md:grid-cols-2 gap-12 items-center mb-20"
              >
                <div className="h-64 relative">
                  <Lottie options={featureOptions} />
                </div>
                <div>
                  <h4 className="text-2xl font-bold mb-4 text-cyan-400">Live Video Assessments</h4>
                  <p className="text-slate-300">
                    Engage in real-time video assessments that analyze your speech patterns,
                    confidence levels, and communication clarity. Get instant feedback to
                    improve your speaking skills.
                  </p>
                </div>
              </motion.div>
  
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="grid md:grid-cols-2 gap-12 items-center mb-20"
              >
                <div className="md:order-2 h-64 relative">
                  <Lottie options={featureOptions} />
                </div>
                <div className="md:order-1">
                  <h4 className="text-2xl font-bold mb-4 text-teal-400">Detailed Performance Reports</h4>
                  <p className="text-slate-300">
                    Receive comprehensive analysis of your speaking performance, including
                    metrics on pace, clarity, vocabulary usage, and confidence indicators.
                    Track your progress over time.
                  </p>
                </div>
              </motion.div>
  
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="grid md:grid-cols-2 gap-12 items-center"
              >
                <div className="h-64 relative">
                  <Lottie options={featureOptions} />
                </div>
                <div>
                  <h4 className="text-2xl font-bold mb-4 text-amber-400">Assessment History</h4>
                  <p className="text-slate-300">
                    Access your complete assessment history to review past performances,
                    track improvement patterns, and identify areas for continued growth
                    in your communication journey.
                  </p>
                </div>
              </motion.div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
  
};

export default Home;
