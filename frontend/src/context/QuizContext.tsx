import { createContext, useContext, useState, ReactNode } from "react";

interface QuizContextType {
  questions: string[];
  currentQuestionIndex: number;
  feedbacks: Record<number, string>;
  answeredQuestions: number;
  incrementAnsweredQuestions: () => void;
  setQuestions: (questions: string[]) => void;
  setCurrentQuestionIndex: (index: number) => void;
  setFeedback: (questionIndex: number, feedback: string) => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider = ({ children }: { children: ReactNode }) => {
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [feedbacks, setFeedbacks] = useState<Record<number, string>>({});
  const [answeredQuestions, setAnsweredQuestions] = useState(-1);

  const incrementAnsweredQuestions = () => {
    setAnsweredQuestions((prev) => Math.max(prev, currentQuestionIndex));
  };

  const setFeedback = (questionIndex: number, feedback: string) => {
    setFeedbacks((prev) => ({ ...prev, [questionIndex]: feedback }));
  };

  return (
    <QuizContext.Provider
      value={{
        questions,
        currentQuestionIndex,
        feedbacks,
        answeredQuestions,
        setQuestions,
        setCurrentQuestionIndex,
        setFeedback,
        incrementAnsweredQuestions,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) throw new Error("useQuiz must be used within QuizProvider");
  return context;
};
