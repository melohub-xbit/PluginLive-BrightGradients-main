import { useState, useRef, useEffect } from "react";
import { motion } from 'framer-motion';

const Recorder = () => {
    // Existing states
    const [permission, setPermission] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [recording, setRecording] = useState(false);
    const [videoURL, setVideoURL] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

    // New states
    const [questions, setQuestions] = useState<Record<string, string>>({});
    const [currentQuestion, setCurrentQuestion] = useState<string>("");
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [isAnswering, setIsAnswering] = useState(false);

    // Fetch questions on component mount
    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/generate-questions');
            const data = await response.json();
            setQuestions(data);
            setCurrentQuestion(data.question1); // Set first question as default
        } catch (error) {
            console.error('Failed to fetch questions:', error);
        }
    };

    const getCameraPermission = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: "user"
                },
                audio: true
            });
            
            // Ensure video element exists and is ready
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                // Wait for the video to be ready to play
                await videoRef.current.play();
            }
            
            setPermission(true);
            setStream(mediaStream);
        } catch (error) {
            console.error('Error accessing camera:', error);
            // Add user feedback here if needed
            setPermission(false);
            setStream(null);
        }
    };
    
    

    // Text-to-speech function
    const narrateQuestion = () => {
        const speech = new SpeechSynthesisUtterance(currentQuestion);
        window.speechSynthesis.speak(speech);
    };

    // Modified recording stop handler
    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setRecording(false);
            // Close camera after stopping recording
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                setStream(null);
                setPermission(false);
            }
        }
    };
    

    // Modified startRecording function
    const startRecording = () => {
        if (stream) {
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            const chunks: Blob[] = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                setRecordedBlob(blob);
                const url = URL.createObjectURL(blob);
                setVideoURL(url);
            };

            mediaRecorder.start();
            setRecording(true);
        }
    };

    // New submit function
    const handleSubmit = async () => {
        if (recordedBlob) {
            setUploading(true);
            try {
                const formData = new FormData();
                formData.append('video_file', recordedBlob, 'recording.webm');
                
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
                    setVideoURL(data.url);
                    if (stream) {
                        stream.getTracks().forEach(track => track.stop());
                    }
                    setStream(null);
                    setPermission(false);
                    setIsAnswering(false);
                }
            } catch (error) {
                console.error('Upload failed:', error);
            } finally {
                setUploading(false);
            }
        }
    };
    return (
        <div className="w-screen h-screen bg-slate-900 p-4 flex flex-col gap-8">
            {/* Question Panel - Always visible at top */}
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
                        {permission && stream && (
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="relative rounded-xl overflow-hidden aspect-video bg-slate-900"
                            >
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover"
                                />
                            </motion.div>
                        )}
    
                        {videoURL && !stream && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="rounded-xl overflow-hidden aspect-video bg-slate-900"
                            >
                                <video
                                    src={videoURL}
                                    controls
                                    className="w-full h-full object-cover"
                                />
                            </motion.div>
                        )}
    
                        <div className="flex justify-center gap-4">
                            {(!permission || !stream) && !recording && !videoURL && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={getCameraPermission}
                                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg"
                                >
                                    Get Camera Access
                                </motion.button>
                            )}
                            
                            {permission && stream && (
                                <>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={recording ? stopRecording : startRecording}
                                        className={`px-6 py-3 bg-gradient-to-r ${
                                            recording ? 'from-rose-500 to-amber-500' : 'from-cyan-500 to-teal-500'
                                        } text-white rounded-lg`}
                                    >
                                        {recording ? 'Stop Recording' : 'Start Recording'}
                                    </motion.button>
                                    
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            if (stream) {
                                                stream.getTracks().forEach(track => track.stop());
                                            }
                                            setStream(null);
                                            setPermission(false);
                                        }}
                                        className="px-6 py-3 bg-gradient-to-r from-rose-500 to-amber-500 text-white rounded-lg"
                                    >
                                        Close Camera
                                    </motion.button>
                                </>
                            )}
    
                            {recordedBlob && !uploading && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleSubmit}
                                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg"
                                >
                                    Submit Recording
                                </motion.button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
    
};

export default Recorder;
