import { useState } from "react";
import { useQuiz } from "../context/QuizContext";
import { format } from "date-fns";
import { useAuth } from "../context/AuthContext";

interface ActionableRecommendation {
  reason: string;
  recommendation: string;
}

interface PersonalizedExample {
  feedback: string;
  line: string;
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

interface AdvancedParameters {
  articulation: string;
  enunciation: string;
  filler_word_usage: FillerWordUsage;
  intelligibility: string;
  pause_pattern: PausePattern;
  personalized_examples: PersonalizedExample[];
  speaking_rate: SpeakingRate;
  tone: string;
  sentence_structuring_and_grammar: string;
  actionable_recommendations: ActionableRecommendation[];
}

interface OverallFeedback {
  summary: string;
  key_strengths: string;
  areas_of_improvement: string;
}

export interface FinalFeedback {
  advanced: AdvancedParameters;
  overall_feedback: OverallFeedback;
}

const Results = () => {
  const { questions, finalFeedback, feedbacks } = useQuiz();
  const { user } = useAuth();
  const currentDate = format(new Date(), "dd-MMM-yyyy");
  const [downloading, setDownloading] = useState(false);

  const downloadReport = async (feedbackData: FinalFeedback | null) => {
    if (!feedbackData) return;

    setDownloading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_URL}/download_report`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            feedbackData,
            feedbacks: [...Object.values(feedbacks)],
            questions,
          }),
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "assessment_report.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error downloading report:", error);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownload = async () => {
    await downloadReport(finalFeedback);
  };

  const renderFeedback = (feedback: FinalFeedback | null, index: number) => {
    if (!feedback) {
      return <p>No feedback available for this question.</p>;
    }

    const { advanced, overall_feedback } = feedback;

    return (
      <div key={index} className="mb-8">
        <h3 className="text-xl font-medium mb-2">
          Question {index + 1}: {questions[index]}
        </h3>

        <div className="mb-4">
          <p className="font-semibold">Overall Feedback:</p>
          <p>{overall_feedback.summary}</p>
          <p>Key Strengths: {overall_feedback.key_strengths}</p>
          <p>Areas of Improvement: {overall_feedback.areas_of_improvement}</p>
        </div>

        <div className="mb-4">
          <p className="font-semibold">Verbal Analysis:</p>
          <p>Articulation: {advanced.articulation}</p>
          <p>Enunciation: {advanced.enunciation}</p>
          <p>Tone: {advanced.tone}</p>
          <p>
            Grammar & Structure: {advanced.sentence_structuring_and_grammar}
          </p>
          <p>Speaking Rate: {advanced.speaking_rate.comment}</p>
          <p>Filler Words: {advanced.filler_word_usage.comment}</p>
          <p>Pause Patterns: {advanced.pause_pattern.comment}</p>
          <p>Intelligibility: {advanced.intelligibility}</p>

          <p className="font-semibold">Actionable Recommendations:</p>
          <ul>
            {advanced.actionable_recommendations.map((rec, i) => (
              <li key={i}>
                <strong>Recommendation:</strong> {rec.recommendation}
                <br />
                <strong>Reason:</strong> {rec.reason}
              </li>
            ))}
          </ul>

          <p className="font-semibold">Personalized Examples:</p>
          <ul>
            {advanced.personalized_examples.map((ex, i) => (
              <li key={i}>
                <strong>Line:</strong> {ex.line}
                <br />
                <strong>Feedback:</strong> {ex.feedback}
              </li>
            ))}
          </ul>
        </div>

        {/* Non-verbal analysis (using dummy data for now) */}
        <div>
          <p className="font-semibold">Non-Verbal Analysis:</p>
          <p>Posture: Work on maintaining a more consistent posture.</p>
          <p>Gestures: Use more expressive hand gestures.</p>
          <p>Eye Contact: Improve eye contact to enhance engagement.</p>
          <p>Speech Clarity: Focus on clarity and articulation.</p>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen bg-slate-900 text-white p-8 w-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Communication Assessment Report
      </h1>
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 block mx-auto"
      >
        {downloading ? "Downloading..." : "Download Report"}
      </button>

      <div className="max-w-3xl mx-auto bg-slate-800 p-8 rounded-xl shadow-lg">
        <p className="mb-4">Candidate: {user?.full_name}</p>
        <p className="mb-8">Date: {currentDate}</p>

        {/* {renderFeedback(finalFeedback, 0)} */}
      </div>
    </div>
  );
};

export default Results;
