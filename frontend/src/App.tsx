import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUp from "./components/SignUp.tsx";
import SignIn from "./components/SignIn.tsx";
import Home from "./components/Home";
import Recorder from "./components/Recorder.tsx";
import { QuizProvider } from "./context/QuizContext.tsx";
import Quiz from "./pages/Quiz.tsx";

function App() {
  return (
    <QuizProvider>
      <Router>
        <Routes>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/" element={<Home />} />
          <Route path="/record" element={<Recorder />} />
          <Route path="/quiz" element={<Quiz />} />
        </Routes>
      </Router>
    </QuizProvider>
  );
}

export default App;
