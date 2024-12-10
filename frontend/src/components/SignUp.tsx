import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: ''
  });

  const particlesInit = async (main: any) => {
    await loadFull(main);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        navigate('/signin');
      }
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <div className="w-screen h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
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

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 p-8 bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-700 relative z-10"
      >
        <div>
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center text-3xl font-bold bg-gradient-to-r from-cyan-400 to-amber-500 bg-clip-text text-transparent"
          >
            Create Account
          </motion.h2>
          <p className="mt-2 text-center text-slate-400">Join CommSense today</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-cyan-400">🎓</span>
            </div>
            <p className="text-xs text-slate-400">Smart Learning</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-teal-400">💡</span>
            </div>
            <p className="text-xs text-slate-400">Expert Insights</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-amber-400">📈</span>
            </div>
            <p className="text-xs text-slate-400">Track Progress</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div>
              <input
                type="text"
                placeholder="Full Name"
                className="w-full p-3 bg-slate-700/50 backdrop-blur-sm border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition text-white"
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Username"
                className="w-full p-3 bg-slate-700/50 backdrop-blur-sm border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition text-white"
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="Email"
                className="w-full p-3 bg-slate-700/50 backdrop-blur-sm border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition text-white"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                className="w-full p-3 bg-slate-700/50 backdrop-blur-sm border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition text-white"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <button 
              type="submit"
              className="w-full p-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-medium relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-300"/>
              <span className="relative">Create Account</span>
            </button>
          </motion.div>
        </form>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <p className="text-slate-400">
            Already have an account?{' '}
            <button 
              onClick={() => navigate('/signin')}
              className="text-cyan-400 hover:text-cyan-300 transition"
            >
              Sign In
            </button>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignUp;
