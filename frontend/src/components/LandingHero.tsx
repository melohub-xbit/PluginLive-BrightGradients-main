import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const LandingHero = () => {
  const navigate = useNavigate();

  const features = [
    "AI-Powered Analysis",
    "Real-time Feedback",
    "Personalized Learning",
    "Progress Tracking",
  ];

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center relative">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-100 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-40 left-40 w-80 h-80 bg-amber-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto text-center px-4 relative z-10"
      >
        <motion.h1
          className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          Master Your Communication
        </motion.h1>

        <motion.p
          className="text-xl md:text-2xl text-slate-300 mb-12 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Enhance your communication skills with AI-powered analysis and
          personalized feedback
        </motion.p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700"
            >
              <span className="text-cyan-400 font-medium">{feature}</span>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="space-x-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/signin")}
            className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 px-8 py-4 rounded-xl text-lg font-bold shadow-lg hover:shadow-cyan-500/25 transition-shadow"
          >
            Get Started
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/about")}
            className="bg-slate-800/50 backdrop-blur-sm px-8 py-4 rounded-xl text-lg font-bold border border-slate-700 hover:bg-slate-800 transition-colors"
          >
            Learn More
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LandingHero;
