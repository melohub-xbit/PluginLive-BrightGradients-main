import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUp from "./components/SignUp.tsx";
import SignIn from "./components/SignIn.tsx";
import Home from "./components/Home";
import { QuizProvider } from "./context/QuizContext.tsx";
import Quiz from "./pages/Quiz.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import Navbar from "./components/Navbar.tsx";
import Results from "./pages/Results.tsx";
import History from "./pages/History.tsx";
import CreatePlan from "./pages/CreatePlan.tsx";
import About from "./pages/About.tsx";

function App() {
  return (
    <AuthProvider>
      <QuizProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/" element={<Home />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/results" element={<Results />} />
            <Route path="/history" element={<History />} />
            <Route path="/create-plan" element={<CreatePlan />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Router>
      </QuizProvider>
    </AuthProvider>
  );
}

export default App;
