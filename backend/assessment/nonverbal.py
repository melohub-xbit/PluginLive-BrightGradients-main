import io
import numpy as np
import cv2
import mediapipe as mp

class CommunicationAnalyzer:
    def __init__(self):
        self.mp_pose = mp.solutions.pose
        self.mp_holistic = mp.solutions.holistic
    
    def analyze_communication(self, video_file, speech_analysis):
        """
        Main method to process video file and combine analysis
        
        Args:
            video_file: Uploaded video file object
            speech_analysis: Dictionary containing speech analysis results
        
        Returns:
            Comprehensive communication assessment
        """
        # Convert file to numpy array
        video_bytes = video_file.file.read()
        video_np_array = np.frombuffer(video_bytes, np.uint8)
        
        # Decode video directly from bytes
        video = cv2.VideoCapture(video_np_array)
        
        # Non-verbal metrics extraction
        non_verbal_metrics = self._extract_non_verbal_metrics(video)
        
        # Combine verbal and non-verbal analysis
        communication_assessment = self._generate_comprehensive_feedback(
            speech_analysis, 
            non_verbal_metrics
        )
        
        return communication_assessment
    
    def _extract_non_verbal_metrics(self, video):
        """
        Extract non-verbal metrics from video
        
        Args:
            video: OpenCV video capture object
        
        Returns:
            Dictionary of non-verbal metrics
        """
        metrics = {
            'posture_stability': 0,
            'gesture_dynamism': 0,
            'body_openness': 0,
            'eye_contact_quality': 0
        }
        
        # Frame processing with MediaPipe Holistic
        with self.mp_holistic.Holistic(
            min_detection_confidence=0.5, 
            min_tracking_confidence=0.5
        ) as holistic:
            frames_data = []
            
            while video.isOpened():
                success, frame = video.read()
                if not success:
                    break
                
                # Convert to RGB
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                
                # Process frame
                results = holistic.process(rgb_frame)
                frames_data.append(results)
            
            # Calculate metrics
            metrics['posture_stability'] = self._analyze_posture_stability(frames_data)
            metrics['gesture_dynamism'] = self._analyze_gesture_complexity(frames_data)
            metrics['body_openness'] = self._calculate_body_openness(frames_data)
            metrics['eye_contact_quality'] = self._estimate_eye_contact(frames_data)
        
        return metrics
    
    def _analyze_posture_stability(self, frames_data):
        """
        Analyze posture stability across video frames
        
        Args:
            frames_data: List of MediaPipe holistic processing results
        
        Returns:
            Posture stability score (0-1)
        """
        posture_variations = []
        
        for frame in frames_data:
            if frame.pose_landmarks:
                # Calculate shoulder and hip alignment
                shoulders = [
                    frame.pose_landmarks.landmark[self.mp_pose.PoseLandmarks.LEFT_SHOULDER],
                    frame.pose_landmarks.landmark[self.mp_pose.PoseLandmarks.RIGHT_SHOULDER]
                ]
                hips = [
                    frame.pose_landmarks.landmark[self.mp_pose.PoseLandmarks.LEFT_HIP],
                    frame.pose_landmarks.landmark[self.mp_pose.PoseLandmarks.RIGHT_HIP]
                ]
                
                # Simple posture variation metric
                shoulder_width = abs(shoulders[0].x - shoulders[1].x)
                hip_width = abs(hips[0].x - hips[1].x)
                posture_variations.append(abs(shoulder_width - hip_width))
        
        # Lower variation means more stable posture
        return 1 - (np.std(posture_variations) if posture_variations else 0)
    
    def _analyze_gesture_complexity(self, frames_data):
        """
        Analyze hand gesture complexity
        
        Args:
            frames_data: List of MediaPipe holistic processing results
        
        Returns:
            Gesture dynamism score (0-1)
        """
        hand_movements = []
        
        for frame in frames_data:
            if frame.left_hand_landmarks and frame.right_hand_landmarks:
                # Calculate hand movement complexity
                left_palm = frame.left_hand_landmarks.landmark[0]
                right_palm = frame.right_hand_landmarks.landmark[0]
                
                # Movement magnitude
                movement = np.sqrt(
                    (left_palm.x - right_palm.x)**2 + 
                    (left_palm.y - right_palm.y)**2
                )
                hand_movements.append(movement)
        
        return np.mean(hand_movements) if hand_movements else 0
    
    def _calculate_body_openness(self, frames_data):
        """
        Calculate body language openness
        
        Args:
            frames_data: List of MediaPipe holistic processing results
        
        Returns:
            Body openness score (0-1)
        """
        openness_scores = []
        
        for frame in frames_data:
            if frame.pose_landmarks:
                # Arm spread calculation
                left_shoulder = frame.pose_landmarks.landmark[self.mp_pose.PoseLandmarks.LEFT_SHOULDER]
                right_shoulder = frame.pose_landmarks.landmark[self.mp_pose.PoseLandmarks.RIGHT_SHOULDER]
                
                arm_spread = abs(right_shoulder.x - left_shoulder.x)
                openness_scores.append(arm_spread)
        
        return np.mean(openness_scores)
    
    def _estimate_eye_contact(self, frames_data):
        """
        Estimate eye contact quality
        
        Args:
            frames_data: List of MediaPipe holistic processing results
        
        Returns:
            Eye contact quality score (0-1)
        """
        # Placeholder for more sophisticated eye contact tracking
        # This is a simplified estimation
        if frames_data and frames_data[0].face_landmarks:
            return 0.7  # Moderate eye contact
        return 0.3  # Low eye contact
    
    def _generate_comprehensive_feedback(self, speech_analysis, non_verbal_metrics):
        """
        Generate comprehensive communication feedback
        
        Args:
            speech_analysis: Dictionary of speech analysis results
            non_verbal_metrics: Dictionary of non-verbal metrics
        
        Returns:
            Comprehensive communication assessment
        """
        # Weighted combination of verbal and non-verbal scores
        overall_score = (
            0.5 * speech_analysis.get('speech_score', 0.5) + 
            0.2 * non_verbal_metrics['posture_stability'] +
            0.1 * non_verbal_metrics['gesture_dynamism'] +
            0.1 * non_verbal_metrics['body_openness'] +
            0.1 * non_verbal_metrics['eye_contact_quality']
        )
        
        return {
            'overall_communication_score': overall_score,
            'detailed_breakdown': {
                'verbal_analysis': speech_analysis,
                'non_verbal_metrics': non_verbal_metrics
            },
            'communication_insights': self._generate_insights(
                speech_analysis, 
                non_verbal_metrics
            )
        }
    
    def _generate_insights(self, speech_analysis, non_verbal_metrics):
        """
        Generate actionable insights based on analysis
        
        Args:
            speech_analysis: Dictionary of speech analysis results
            non_verbal_metrics: Dictionary of non-verbal metrics
        
        Returns:
            List of communication insights
        """
        insights = []
        
        # Posture insights
        if non_verbal_metrics['posture_stability'] < 0.5:
            insights.append("Work on maintaining a more consistent posture")
        
        # Gesture insights
        if non_verbal_metrics['gesture_dynamism'] < 0.4:
            insights.append("Consider using more expressive hand gestures")
        
        # Eye contact insights
        if non_verbal_metrics['eye_contact_quality'] < 0.5:
            insights.append("Improve eye contact to enhance engagement")
        
        # Speech-related insights
        if speech_analysis.get('speech_clarity', 0) < 0.6:
            insights.append("Focus on improving speech clarity and articulation")
        
        return insights

# FastAPI route implementation example
# from fastapi import UploadFile, File

# @app.post("/analyze-communication")
# async def analyze_communication(
#     video: UploadFile = File(...),
#     speech_analysis: dict = None  # Assuming this comes from your speech processing workflow
# ):
#     analyzer = CommunicationAnalyzer()
    
#     # Directly process the uploaded file
#     communication_assessment = analyzer.analyze_communication(
#         video, 
#         speech_analysis
#     )
    
#     return communication_assessment