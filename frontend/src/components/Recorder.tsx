import React, { useState, useRef } from "react";
import Webcam from "react-webcam";
import { motion } from "framer-motion";
import { Feedback, useQuiz } from "../context/QuizContext";

interface RecorderProps {
  questionIndex: number;
  onComplete: () => void;
}

const Recorder: React.FC<RecorderProps> = ({ questionIndex, onComplete }) => {
  const webcamRef = useRef<Webcam>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [videoURL, setVideoURL] = useState<string>("");
  const [cameraActive, setCameraActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const { setFeedback, incrementAnsweredQuestions, questions, currentQuizId } =
    useQuiz();

  const handleStartCamera = async () => {
    setCameraActive(true);
    // Stop any existing audio stream
    if (audioStream) {
      audioStream.getTracks().forEach((track) => track.stop());
    }
  };

  const handleStartRecording = () => {
    setCapturing(true);
    setRecordedChunks([]);
    setShowSubmit(false);

    const stream = webcamRef.current?.stream;
    if (stream) {
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setVideoURL(url);
        setShowSubmit(true);
        setRecordedChunks(chunks);
      };

      mediaRecorder.start();
    }
  };

  const handleStopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      setCameraActive(false);
      setCapturing(false);
      setShowSubmit(true);
    }
  };

  const handleSubmit = async () => {
    if (recordedChunks.length) {
      setUploading(true);
      try {
        const blob = new Blob(recordedChunks, {
          type: "video/webm",
        });

        // Extract audio using MediaRecorder's mimeType
        const audioBlob = new Blob(recordedChunks, {
          type: "audio/webm",
        });

        const formData = new FormData();
        formData.append("video_file", blob, "recording.webm");
        formData.append("audio_file", audioBlob, "audio.webm");
        formData.append("question", questions[questionIndex]);
        formData.append("quiz_id", currentQuizId);

        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8000/save-video", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (response.ok) {
          alert("Video uploaded successfully!");
          // Reset states
          setVideoURL("");
          setRecordedChunks([]);
          setShowSubmit(false);
          setCameraActive(false);

          const data: { url: string; feedback: Feedback } =
            await response.json();

          setFeedback(questionIndex, data.feedback);
          incrementAnsweredQuestions();
          onComplete();
        }
      } catch (error) {
        console.error("Upload failed:", error);
        alert("Video upload failed. Please try again.");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleCloseCamera = () => {
    setCameraActive(false);
    setVideoURL("");
    setRecordedChunks([]);
    setShowSubmit(false);

    // Clean up audio stream
    if (audioStream) {
      audioStream.getTracks().forEach((track) => track.stop());
    }
    // Clean up video stream
    if (webcamRef.current?.stream) {
      webcamRef.current.stream.getTracks().forEach((track) => track.stop());
    }
  };
  const videoConstraints = {
    width: 400,
    height: 300,
    facingMode: "user",
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3">
        {!cameraActive && !videoURL && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStartCamera}
            className="w-full px-4 py-2 bg-cyan-500 rounded-md hover:bg-cyan-600 transition"
          >
            Start Camera
          </motion.button>
        )}

        {cameraActive && !videoURL && (
          <div className="flex gap-2 w-full">
            {!capturing ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartRecording}
                className="flex-1 px-4 py-2 bg-cyan-500 rounded-md hover:bg-cyan-600 transition"
              >
                Start Recording
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStopRecording}
                className="flex-1 px-4 py-2 bg-rose-500 rounded-md hover:bg-rose-600 transition"
              >
                Stop Recording
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCloseCamera}
              className="px-4 py-2 bg-slate-600 rounded-md hover:bg-slate-700 transition"
            >
              Close
            </motion.button>
          </div>
        )}
      </div>

      {cameraActive && (
        <div className="rounded-lg overflow-hidden">
          <Webcam
            audio={true}
            ref={webcamRef}
            videoConstraints={videoConstraints}
            className="w-full"
            muted={true}
          />
        </div>
      )}

      {videoURL && (
        <div className="space-y-4">
          <video src={videoURL} controls className="w-full rounded-lg" />
          {showSubmit && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={uploading}
              className="w-full px-4 py-2 bg-green-500 rounded-md hover:bg-green-600 transition disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Submit Recording"}
            </motion.button>
          )}
        </div>
      )}
    </div>
  );
};

export default Recorder;
