import cv2
import mediapipe as mp
from deepface import DeepFace
import numpy as np
import logging
from datetime import datetime
import json

class AIInterviewerAnalyzer:
    def __init__(self, config_path='config.json'):
        """
        Initialize the AI Interviewer Analyzer with configurable parameters
        """
        # Logging setup
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s: %(message)s',
            filename='interview_analysis.log'
        )
        self.logger = logging.getLogger(__name__)

        # Configuration
        self.load_config(config_path)

        # Mediapipe initialization
        self.mp_pose = mp.solutions.pose
        self.mp_face_mesh = mp.solutions.face_mesh
        self.mp_holistic = mp.solutions.holistic
        self.mp_drawing = mp.solutions.drawing_utils

        # Analysis queues and flags
        self.analysis_results = {
            'posture_details': [],
            'emotion_history': [],
            'eye_contact_history': [],
            'total_scores': []
        }
        self.running = False

    def load_config(self, config_path):
        """
        Load configuration from JSON file
        """
        try:
            with open(config_path, 'r') as f:
                self.config = json.load(f)
        except FileNotFoundError:
            self.logger.warning(f"Config file {config_path} not found. Using default settings.")
            self.config = {
                'min_detection_confidence': 0.5,
                'min_tracking_confidence': 0.5,
                'emotion_weights': {
                    'happy': 5,
                    'neutral': 3,
                    'sad': -5,
                    'angry': -5
                },
                'posture_thresholds': {
                    'shoulder_diff_excellent': 0.05,
                    'shoulder_diff_good': 0.1,
                    'hip_diff_excellent': 0.05,
                    'hip_diff_good': 0.1,
                    'head_tilt_threshold': 0.1
                }
            }

    def analyze_eye_contact(self, face_landmarks):
        """
        Analyze eye contact and gaze direction
        """
        if not face_landmarks:
            return 0, "No eye tracking"

        # Key eye landmarks from MediaPipe Face Mesh
        left_eye_center = np.mean([
            [lm.x, lm.y] for i, lm in enumerate(face_landmarks.landmark) 
            if i in [33, 133, 157, 158, 173, 263, 362, 380, 381, 382, 463]
        ], axis=0)

        # Calculate eye openness and direction
        left_eye_openness = self._calculate_eye_openness(face_landmarks, is_right=False)
        right_eye_openness = self._calculate_eye_openness(face_landmarks, is_right=True)

        # Eye contact scoring
        eye_contact_score = 0
        eye_contact_status = "Neutral"

        if left_eye_openness > 0.8 and right_eye_openness > 0.8:
            eye_contact_score = 3
            eye_contact_status = "Engaged"
        elif left_eye_openness < 0.5 or right_eye_openness < 0.5:
            eye_contact_score = -3
            eye_contact_status = "Disengaged"

        return eye_contact_score, eye_contact_status

    def _calculate_eye_openness(self, landmarks, is_right=False):
        """
        Calculate eye openness ratio
        """
        if is_right:
            # Right eye landmarks
            eye_indices = {
                'top': 386, 'bottom': 374, 
                'left': 263, 'right': 362
            }
        else:
            # Left eye landmarks
            eye_indices = {
                'top': 159, 'bottom': 145, 
                'left': 33, 'right': 133
            }

        # Calculate vertical and horizontal eye distances
        vertical_dist = abs(landmarks.landmark[eye_indices['top']].y - 
                            landmarks.landmark[eye_indices['bottom']].y)
        horizontal_dist = abs(landmarks.landmark[eye_indices['left']].x - 
                              landmarks.landmark[eye_indices['right']].x)

        # Eye openness ratio
        return 1 - min(vertical_dist / horizontal_dist, 1)

    def analyze_posture(self, pose_landmarks):
        """
        Advanced posture analysis with multiple factors
        """
        if not pose_landmarks:
            return 0, "No landmarks", {}

        # Extract key body points
        shoulders = [
            pose_landmarks.landmark[self.mp_pose.PoseLandmark.LEFT_SHOULDER],
            pose_landmarks.landmark[self.mp_pose.PoseLandmark.RIGHT_SHOULDER]
        ]
        hips = [
            pose_landmarks.landmark[self.mp_pose.PoseLandmark.LEFT_HIP],
            pose_landmarks.landmark[self.mp_pose.PoseLandmark.RIGHT_HIP]
        ]
        head = pose_landmarks.landmark[self.mp_pose.PoseLandmark.NOSE]

        # Calculate differences
        shoulder_diff = abs(shoulders[0].y - shoulders[1].y)
        hip_diff = abs(hips[0].y - hips[1].y)

        # Head tilt detection
        head_tilt = abs(shoulders[0].x - shoulders[1].x)

        # More complex posture scoring
        posture_details = {
            'shoulder_alignment': shoulder_diff,
            'hip_alignment': hip_diff,
            'head_tilt': head_tilt
        }

        # Scoring logic
        posture_score = 0
        posture_status = "Neutral"
        deduction_reasons = []

        # Shoulder alignment check
        if shoulder_diff < self.config['posture_thresholds']['shoulder_diff_excellent']:
            posture_score += 5
        elif shoulder_diff < self.config['posture_thresholds']['shoulder_diff_good']:
            posture_score += 3
        else:
            posture_score -= 3
            deduction_reasons.append("Uneven shoulder alignment")

        # Hip alignment check
        if hip_diff < self.config['posture_thresholds']['hip_diff_excellent']:
            posture_score += 5
        elif hip_diff < self.config['posture_thresholds']['hip_diff_good']:
            posture_score += 3
        else:
            posture_score -= 3
            deduction_reasons.append("Uneven hip alignment")

        # Head tilt check
        if head_tilt > self.config['posture_thresholds']['head_tilt_threshold']:
            posture_score -= 3
            deduction_reasons.append("Excessive head tilt")

        # Determine posture status
        if posture_score >= 8:
            posture_status = "Excellent"
        elif posture_score >= 5:
            posture_status = "Good"
        elif posture_score >= 0:
            posture_status = "Average"
        else:
            posture_status = "Poor"

        return posture_score, posture_status, {
            'score': posture_score,
            'status': posture_status,
            'details': posture_details,
            'deduction_reasons': deduction_reasons
        }

    def process_frame(self, frame):
        """
        Process a single frame with comprehensive analysis
        """
        # Convert image to RGB
        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image.flags.writeable = False

        # Process image using Mediapipe
        with self.mp_pose.Pose(
            min_detection_confidence=self.config['min_detection_confidence'], 
            min_tracking_confidence=self.config['min_tracking_confidence']
        ) as pose:
            with self.mp_face_mesh.FaceMesh(
                min_detection_confidence=self.config['min_detection_confidence'], 
                min_tracking_confidence=self.config['min_tracking_confidence']
            ) as face_mesh:
                with self.mp_holistic.Holistic(
                    min_detection_confidence=self.config['min_detection_confidence'], 
                    min_tracking_confidence=self.config['min_tracking_confidence']
                ) as holistic:
                
                    results_pose = pose.process(image)
                    results_face_mesh = face_mesh.process(image)
                    results_holistic = holistic.process(image)
                    
                    image.flags.writeable = True
                    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

                    # Comprehensive analysis
                    posture_score, posture_status, posture_details = self.analyze_posture(results_pose.pose_landmarks)
                    
                    # Emotion analysis
                    try:
                        emotion_analysis = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False, silent=True)
                        emotion = emotion_analysis[0]['dominant_emotion']
                        emotion_confidence = max(emotion_analysis[0]['emotion'].values()) / sum(emotion_analysis[0]['emotion'].values())
                        emotion_score = self.config['emotion_weights'].get(emotion, 0)
                    except Exception as e:
                        emotion = "unknown"
                        emotion_score = 0
                        emotion_confidence = 0
                        self.logger.error(f"Emotion analysis failed: {str(e)}")

                    # Eye contact analysis
                    eye_contact_score = 0
                    eye_contact_status = "No tracking"
                    if results_face_mesh.multi_face_landmarks:
                        eye_contact_score, eye_contact_status = self.analyze_eye_contact(results_face_mesh.multi_face_landmarks[0])

                    # Total score calculation
                    total_score = posture_score + emotion_score + eye_contact_score

                    # Update analysis history
                    self.analysis_results['posture_details'].append(posture_details)
                    self.analysis_results['emotion_history'].append(emotion_score)
                    self.analysis_results['eye_contact_history'].append(eye_contact_score)
                    self.analysis_results['total_scores'].append(total_score)

                    # Annotate frame
                    cv2.putText(image, f"Posture: {posture_status}", (10, 50), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                    cv2.putText(image, f"Emotion: {emotion} ({emotion_confidence:.2f})", (10, 100), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2)
                    cv2.putText(image, f"Eye Contact: {eye_contact_status}", (10, 150), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
                    cv2.putText(image, f"Total Score: {total_score}", (10, 200), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

                    return image, total_score, posture_details

    def generate_interview_report(self):
        """
        Generate a comprehensive JSON report of the interview analysis
        """
        # Safety check for empty analysis results
        if not self.analysis_results['posture_details']:
            return {
                'timestamp': datetime.now().isoformat(),
                'error': 'No analysis data available',
                'summary': {},
                'detailed_analysis': {},
                'final_assessment': {}
            }

        # Robust extraction of posture scores
        posture_scores = []
        for details in self.analysis_results['posture_details']:
            # Try different ways of extracting the score
            if isinstance(details, dict):
                posture_score = (
                    details.get('score') or  # First try 'score'
                    details.get('posture_score') or  # Then try 'posture_score'
                    (details['details']['score'] if 'details' in details else 0)  # Then try nested score
                )
                posture_scores.append(posture_score)
            elif isinstance(details, (int, float)):
                posture_scores.append(details)
            else:
                posture_scores.append(0)  # Fallback to 0 if can't extract score

        # Similar robust handling for other scores
        emotion_scores = [
            score if isinstance(score, (int, float)) else 0 
            for score in self.analysis_results['emotion_history']
        ]
        eye_contact_scores = [
            score if isinstance(score, (int, float)) else 0 
            for score in self.analysis_results['eye_contact_history']
        ]
        total_scores = [
            score if isinstance(score, (int, float)) else 0 
            for score in self.analysis_results['total_scores']
        ]

        # Ensure we have at least some data to work with
        posture_scores = posture_scores or [0]
        emotion_scores = emotion_scores or [0]
        eye_contact_scores = eye_contact_scores or [0]
        total_scores = total_scores or [0]

        # Detailed analysis
        report = {
            'timestamp': datetime.now().isoformat(),
            'summary': {
                'avg_posture_score': np.mean(posture_scores),
                'avg_emotion_score': np.mean(emotion_scores),
                'avg_eye_contact_score': np.mean(eye_contact_scores),
                'overall_score': np.mean(total_scores)
            },
            'detailed_analysis': {
                'posture_details': self.analysis_results['posture_details'],
                'emotion_details': self.analysis_results['emotion_history'],
                'eye_contact_details': self.analysis_results['eye_contact_history']
            },
            'final_assessment': self._generate_final_assessment(
                posture_scores, emotion_scores, eye_contact_scores
            )
        }

        # Save report
        report_filename = f".\interview_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_filename, 'w') as f:
            json.dump(report, f, indent=4)

        self.logger.info(f"Interview report generated: {report_filename}")
        return report

    def _generate_final_assessment(self, posture_scores, emotion_scores, eye_contact_scores):
        """
        Generate a comprehensive final assessment out of 100 marks
        """
        # Calculate individual component scores (max 33.33 points each)
        posture_max = 33.33
        emotion_max = 33.33
        eye_contact_max = 33.34

        # Normalize and score posture (looking for values around 5-8 as good)
        avg_posture = np.mean(posture_scores)
        posture_points = self._normalize_score(avg_posture, min_good=3, max_good=8) * posture_max

        # Normalize emotion scores (positive scores are good)
        avg_emotion = np.mean(emotion_scores)
        emotion_points = self._normalize_emotion_score(avg_emotion) * emotion_max

        # Normalize eye contact scores
        avg_eye_contact = np.mean(eye_contact_scores)
        eye_contact_points = self._normalize_score(avg_eye_contact, min_good=-1, max_good=3) * eye_contact_max

        # Calculate total score
        total_score = posture_points + emotion_points + eye_contact_points

        # Prepare detailed assessment
        assessment = {
            'total_score': round(total_score, 2),
            'component_scores': {
                'posture': {
                    'points': round(posture_points, 2),
                    'max_points': posture_max,
                    'raw_avg': round(avg_posture, 2)
                },
                'emotional_engagement': {
                    'points': round(emotion_points, 2),
                    'max_points': emotion_max,
                    'raw_avg': round(avg_emotion, 2)
                },
                'eye_contact': {
                    'points': round(eye_contact_points, 2),
                    'max_points': eye_contact_max,
                    'raw_avg': round(avg_eye_contact, 2)
                }
            },
            'strengths': [],
            'areas_for_improvement': []
        }

        # Determine strengths and areas for improvement
        if posture_points > posture_max * 0.7:
            assessment['strengths'].append("Body Language & Posture")
        else:
            assessment['areas_for_improvement'].append("Body Language & Posture")

        if emotion_points > emotion_max * 0.7:
            assessment['strengths'].append("Emotional Expression")
        else:
            assessment['areas_for_improvement'].append("Emotional Expression")

        if eye_contact_points > eye_contact_max * 0.7:
            assessment['strengths'].append("Eye Contact & Attentiveness")
        else:
            assessment['areas_for_improvement'].append("Eye Contact & Attentiveness")

        return assessment

    def _normalize_score(self, score, min_good=-3, max_good=8):
        """
        Normalize a score to a 0-1 range based on a good performance range
        """
        # Clamp the score within a reasonable range
        score = max(min_good, min(score, max_good))
        
        # Linear normalization
        normalized = (score - min_good) / (max_good - min_good)
        return max(0, min(normalized, 1))

    def _normalize_emotion_score(self, score):
        """
        Normalize emotion score with positive bias
        """
        # Emotions have a range from negative to positive
        # Good emotions are positive, bad are negative
        normalized = (score + 5) / 10  # Assuming score range is -5 to 5
        return max(0, min(normalized, 1))

    def run_interview_analysis(self, video_path):
        """
        Method to run AI interviewer analysis on a video file
        
        Args:
            video_path (str): Path to the input video file
        """
        # Open video file
        cap = cv2.VideoCapture(video_path)
        
        if not cap.isOpened():
            self.logger.error(f"Could not open video file: {video_path}")
            return None

        # Video properties
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)

        self.running = True
        frame_count = 0

        try:
            while self.running:
                ret, frame = cap.read()
                
                # Break if no more frames
                if not ret:
                    break

                # Process every 5th frame to reduce computational load
                if frame_count % 5 == 0:
                    annotated_frame, score, posture_details = self.process_frame(frame)
                    
                    # Optional: show progress
                    print(f"Processing frame {frame_count}/{total_frames}")

                    # Optional: display frame (comment out if not needed)
                    cv2.imshow('Advanced AI Interviewer', annotated_frame)

                    # Quit with 'q'
                    if cv2.waitKey(1) & 0xFF == ord('q'):
                        break

                frame_count += 1

        except Exception as e:
            self.logger.error(f"Unexpected error during video analysis: {str(e)}")
        finally:
            cap.release()
            cv2.destroyAllWindows()
            
            # Generate and print final report
            report = self.generate_interview_report()
            print(report)
            return report

def main():
    
    video_path = "path.mkv"
    
    interviewer = AIInterviewerAnalyzer()
    interviewer.run_interview_analysis(video_path)

if __name__ == "__main__":
    main()
