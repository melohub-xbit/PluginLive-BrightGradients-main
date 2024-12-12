import { createContext, useContext, useState, ReactNode } from "react";

interface AdvancedParameters {
  articulation: string;
  enunciation: string;
  intelligibility: string;
  tone: string;
}

interface FillerWordUsage {
  comment: string;
  count: number;
}

interface PausePattern {
  comment: string;
  count: number;
}

interface SpeakingRate {
  comment: string;
  rate: number;
}

interface TimestampedFeedback {
  feedback: string;
  time: string;
}

export interface Feedback {
  advanced_parameters: AdvancedParameters;
  filler_word_usage: FillerWordUsage;
  general_feedback: string;
  pause_pattern: PausePattern;
  sentence_structuring_and_grammar: string;
  speaking_rate: SpeakingRate;
  timestamped_feedback: TimestampedFeedback[];
  transcript: string;
}

interface QuizContextType {
  questions: string[];
  currentQuestionIndex: number;
  feedbacks: Record<number, Feedback>;
  answeredQuestions: number;
  currentQuizId: string;
  incrementAnsweredQuestions: () => void;
  setQuestions: (questions: string[]) => void;
  setCurrentQuestionIndex: (index: number) => void;
  setFeedback: (questionIndex: number, feedback: Feedback) => void;
  setFeedbacks: (feedbacks: Record<number, Feedback>) => void;
  setCurrentQuizId: (quizId: string) => void;
  setQuizId: (quizId: string) => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider = ({ children }: { children: ReactNode }) => {
  const [currentQuizId, setCurrentQuizId] = useState<string>("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [feedbacks, setFeedbacks] = useState<Record<number, Feedback>>({});
  const [answeredQuestions, setAnsweredQuestions] = useState(-1);

  const incrementAnsweredQuestions = () => {
    setAnsweredQuestions((prev) => Math.max(prev, currentQuestionIndex));
  };

  const setFeedback = (questionIndex: number, feedback: Feedback) => {
    setFeedbacks((prev) => ({ ...prev, [questionIndex]: feedback }));
  };

  const setQuizId = (quizId: string) => {
    setCurrentQuizId(quizId);
  };

  return (
    <QuizContext.Provider
      value={{
        currentQuizId,
        setCurrentQuizId,
        setQuizId,
        questions,
        currentQuestionIndex,
        feedbacks,
        answeredQuestions,
        setQuestions,
        setCurrentQuestionIndex,
        setFeedback,
        setFeedbacks,
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
