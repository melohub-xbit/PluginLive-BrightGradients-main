import { useQuiz } from "../context/QuizContext";
import { Feedback } from "../context/QuizContext"; // Import the Feedback interface
import { format } from "date-fns";

const Results = () => {
  const { questions, feedbacks } = useQuiz();
  const currentDate = format(new Date(), "dd-MMM-yyyy");

  // Dummy data for demonstration (replace with actual user data)
  const userName = "Sunhit Goswami";

  const renderFeedback = (feedback: Feedback | undefined, index: number) => {
    if (!feedback) {
      return <p>No feedback available for this question.</p>;
    }

    return (
      <div key={index} className="mb-8">
        <h3 className="text-xl font-medium mb-2">
          Question {index + 1}: {questions[index]}
        </h3>
        <p className="mb-4 font-mono whitespace-pre-wrap">
          {feedback.transcript}
        </p>

        <div className="mb-4">
          <p className="font-semibold">Verbal Analysis:</p>
          <p>Articulation: {feedback.advanced_parameters.articulation}</p>
          <p>Enunciation: {feedback.advanced_parameters.enunciation}</p>
          <p>Tone: {feedback.advanced_parameters.tone}</p>
          <p>
            Grammar & Structure: {feedback.sentence_structuring_and_grammar}
          </p>
          <p>Speaking Rate: {feedback.speaking_rate.comment}</p>
          <p>Filler Words: {feedback.filler_word_usage.comment}</p>
          <p>General Feedback: {feedback.general_feedback}</p>
        </div>

        {feedback.timestamped_feedback.length > 0 && (
          <div className="mb-4">
            <p className="font-semibold">Timestamped Feedback:</p>
            <ul>
              {feedback.timestamped_feedback.map((item, i) => (
                <li key={i}>
                  {item.time}: {item.feedback}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Non-verbal analysis (using dummy data for now) */}
        <div>
          <p className="font-semibold">Non-Verbal Analysis:</p>
          <p>Posture: Work on maintaining a more consistent posture.</p>
          <p>Gestures: Use more expressive hand gestures.</p>
          <p>Eye Contact: Improve eye contact to enhance engagement.</p>
          <p>Speech Clarity: Focus on clarity and articulation.</p>
        </div>

        <div>
          <p className="font-semibold">Summary:</p>
          <p>Strengths: Correct grammar and sentence structure.</p>
          <p>
            Improvements Needed: Build confidence in tone and use gestures
            effectively.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen bg-slate-900 text-white p-8 w-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Communication Assessment Report
      </h1>
      <div className="max-w-3xl mx-auto bg-slate-800 p-8 rounded-xl shadow-lg">
        <p className="mb-4">Candidate: {userName}</p>
        <p className="mb-8">Date: {currentDate}</p>

        {questions.map((_, index) => renderFeedback(feedbacks[index], index))}
      </div>
    </div>
  );
};

export default Results;
