import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import SignUp from "./components/SignUp.tsx";
import SignIn from "./components/SignIn.tsx";
import Home from "./components/Home";
import { QuizProvider } from "./context/QuizContext.tsx";
import Quiz from "./pages/Quiz.tsx";
import { AuthProvider, useAuth } from "./context/AuthContext.tsx";
import Navbar from "./components/Navbar.tsx";
import Results from "./pages/Results.tsx";
import History from "./pages/History.tsx";
import CreatePlan from "./pages/CreatePlan.tsx";
import About from "./pages/About.tsx";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <AuthProvider>
      <Toaster />
      <QuizProvider>
        <Protector>
          <Router>
            <Navbar />
            <Routes>
              <Route path="/signup" element={<SignUp />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/" element={<Home />} />
              <Route
                path="/quiz"
                element={
                  <ProtectedRoute>
                    <Quiz />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/results"
                element={
                  <ProtectedRoute>
                    <Results />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <History />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-plan"
                element={
                  <ProtectedRoute>
                    <CreatePlan />
                  </ProtectedRoute>
                }
              />
              <Route path="/about" element={<About />} />
            </Routes>
          </Router>
        </Protector>
      </QuizProvider>
    </AuthProvider>
  );
}

export default App;

function Protector({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth();

  if (loading || !user) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
}
