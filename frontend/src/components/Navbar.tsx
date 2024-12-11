import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { user: userData, logout: handleLogout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-slate-800/80 backdrop-blur-sm p-4 relative z-10">
      <div className="w-full mx-auto flex justify-between items-center">
        <motion.h1
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          onClick={() => navigate("/")}
          className="cursor-pointer text-4xl font-bold bg-gradient-to-r from-cyan-400 to-amber-500 bg-clip-text text-transparent"
        >
          CommSense
          <span className="text-base bg-gradient-to-r from-cyan-400 to-amber-500 bg-clip-text text-transparent">
            | Master Your Voice
          </span>
        </motion.h1>

        {userData && (
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center space-x-4"
          >
            <span>{userData.username}</span>
            <img
              src={
                userData.avatar || "https://api.dicebear.com/7.x/avataaars/svg"
              }
              alt="avatar"
              className="w-10 h-10 rounded-full border-2 border-cyan-500"
            />
            <button
              onClick={handleLogout}
              className="bg-rose-500 px-4 py-2 rounded-lg hover:bg-rose-600 transition transform hover:scale-105"
            >
              Logout
            </button>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
