from assessment.gesture import AIInterviewerAnalyzer

def get_gesture_feedback(videoURL: str):
    # Get gesture analysis
    analyzer = AIInterviewerAnalyzer()
    gesture_feedback = analyzer.run_interview_analysis(videoURL)
    return gesture_feedback
