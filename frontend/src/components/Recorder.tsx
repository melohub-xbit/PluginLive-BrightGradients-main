import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';

const Recorder: React.FC = () => {
    const webcamRef = useRef<Webcam>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const [capturing, setCapturing] = useState(false);
    const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
    const [videoURL, setVideoURL] = useState<string>('');
    const [questions, setQuestions] = useState<string[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState<string>('');
    const [isAnswering, setIsAnswering] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showSubmit, setShowSubmit] = useState(false);
    const [audioStream, setAudioStream] = useState<MediaStream | null>(null);

    // Fetch questions on component mount
    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/generate-questions');
            const data = await response.json();
            const questionList = Object.values(data);
            setQuestions(questionList);
            setCurrentQuestion(questionList[0]); // Set first question as default
        } catch (error) {
            console.error('Failed to fetch questions:', error);
        }
    };

    // Text-to-speech function
    const narrateQuestion = () => {
        const speech = new SpeechSynthesisUtterance(currentQuestion);
        window.speechSynthesis.speak(speech);
    };

    const handleStartCamera = async () => {
        setCameraActive(true);
        // Stop any existing audio stream
        if (audioStream) {
            audioStream.getTracks().forEach(track => track.stop());
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
                const blob = new Blob(chunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                setVideoURL(url);
                setShowSubmit(true);
                setRecordedChunks(chunks);
            };
            
            mediaRecorder.start();
        }
    };
    

    

    const handleStopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
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
                    type: 'video/webm'
                });
                const formData = new FormData();
                formData.append('video_file', blob, 'recording.webm');
                
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:8000/save-video', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });
                
                if (response.ok) {
                    const data = await response.json();
                    alert('Video uploaded successfully!');
                    // Reset states
                    setVideoURL(null);
                    setRecordedChunks([]);
                    setShowSubmit(false);
                    setCameraActive(false);
                }
            } catch (error) {
                console.error('Upload failed:', error);
                alert('Video upload failed. Please try again.');
            } finally {
                setUploading(false);
            }
        }
    };

    const handleCloseCamera = () => {
        setCameraActive(false);
        setVideoURL(null);
        setRecordedChunks([]);
        setShowSubmit(false);
        
        // Clean up audio stream
        if (audioStream) {
            audioStream.getTracks().forEach(track => track.stop());
        }
        // Clean up video stream
        if (webcamRef.current?.stream) {
            webcamRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };
    const videoConstraints = {
        width: 400,
        height: 300,
        facingMode: "user"
    };

    return (
        <div className="w-screen h-screen bg-slate-900 p-4 flex flex-col gap-8">
            {/* Question Panel */}
            <div className="w-full bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
                <div className="space-y-4">
                    <h3 className="text-xl text-white font-medium">{currentQuestion}</h3>
                    <div className="flex gap-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={narrateQuestion}
                            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg"
                        >
                            Narrate Question
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsAnswering(true)}
                            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg"
                        >
                            Answer
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Recording Interface */}
            {isAnswering && (
                <div className="flex-1 w-full bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
                    <div className="space-y-6">
                        {/* Start Camera Button */}
                        {!videoURL && !cameraActive && (
                            <div className="flex justify-center">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleStartCamera}
                                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg"
                                >
                                    Start Camera
                                </motion.button>
                            </div>
                        )}

                        {/* Camera Active State */}
                        {cameraActive && !videoURL && (
                            <>
                                <div className="flex justify-center">
                                    <Webcam
                                        audio={true}
                                        ref={webcamRef}
                                        videoConstraints={videoConstraints}
                                        className="rounded-xl"
                                        muted={true}
                                    />
                                </div>
                                <div className="flex justify-center gap-4">
                                    {!capturing ? (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleStartRecording}
                                            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg"
                                        >
                                            Start Recording
                                        </motion.button>
                                    ) : (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleStopRecording}
                                            className="px-6 py-3 bg-gradient-to-r from-rose-500 to-amber-500 text-white rounded-lg"
                                        >
                                            Stop Recording
                                        </motion.button>
                                    )}
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleCloseCamera}
                                        className="px-6 py-3 bg-gradient-to-r from-gray-500 to-slate-500 text-white rounded-lg"
                                    >
                                        Close Camera
                                    </motion.button>
                                </div>
                            </>
                        )}

                        {/* Video Playback State */}
                        {videoURL && (
                            <div className="space-y-6">
                                <div className="flex justify-center">
                                    <video
                                        src={videoURL}
                                        controls
                                        className="rounded-xl max-w-full"
                                    />
                                </div>
                                {showSubmit && (
                                    <div className="flex justify-center">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleSubmit}
                                            disabled={uploading}
                                            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg disabled:opacity-50"
                                        >
                                            {uploading ? 'Uploading...' : 'Submit Video'}
                                        </motion.button>
                                        
                                    </div>
                                )}
                            </div>
                            
                        )}
                        
                    </div>
                </div>
            )}
        </div>
    );
};

export default Recorder;