import { motion } from "framer-motion";

const About = () => {
  const developers = [
    {
      name: "Chaitya Shah",
      role: "Full Stack Developer",
      github: "https://github.com/CShah44",
      avatar: "https://avatars.githubusercontent.com/u/CShah44",
    },
    {
      name: "Krishna Sai",
      role: "AI/ML Engineer",
      github: "https://github.com/melohub-xbit",
      avatar: "https://avatars.githubusercontent.com/u/melohub-xbit",
    },
  ];

  const features = [
    {
      title: "AI-Powered Analysis",
      description:
        "Advanced algorithms analyze communication patterns and provide personalized insights",
      icon: "🤖",
    },
    {
      title: "Real-time Feedback",
      description: "Instant feedback on speaking patterns, tone, and delivery",
      icon: "⚡",
    },
    {
      title: "Progress Tracking",
      description: "Detailed analytics and progress monitoring over time",
      icon: "📈",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            borderRadius: ["40%", "60%", "40%"],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
            borderRadius: ["60%", "40%", "60%"],
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-3xl"
        />

        <div className="max-w-7xl mx-auto px-4 py-20 relative">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl font-bold text-center mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
          >
            About Eloquence
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-center text-slate-300 max-w-3xl mx-auto"
          >
            An innovative platform revolutionizing communication skills through
            AI-powered analysis and personalized feedback.
          </motion.p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700"
            >
              <span className="text-4xl mb-4 block">{feature.icon}</span>
              <h3 className="text-xl font-semibold mb-2 text-white">
                {feature.title}
              </h3>
              <p className="text-slate-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Team Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent"
        >
          Meet Our Team
        </motion.h2>
        <div className="grid md:grid-cols-4 gap-8">
          {developers.map((dev, index) => (
            <motion.div
              key={dev.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700 text-center"
            >
              <img
                src={dev.avatar}
                alt={dev.name}
                className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-cyan-500"
              />
              <h3 className="text-xl font-semibold mb-1 text-white">
                {dev.name}
              </h3>
              <p className="text-cyan-400 mb-3">{dev.role}</p>
              <a
                href={dev.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-cyan-400 transition"
              >
                GitHub Profile →
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
