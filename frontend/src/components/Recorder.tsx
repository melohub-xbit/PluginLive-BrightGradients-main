import { useState, useRef, useEffect } from "react";
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Recorder = () => {
    const navigate = useNavigate();
    const [permission, setPermission] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [recording, setRecording] = useState(false);
    const [videoURL, setVideoURL] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

    useEffect(() => {
        if (stream && videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    const closeRecorder = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        setPermission(false);
        setStream(null);
        setVideoURL(null);
        navigate('/record');
    };

    const uploadToCloudinary = async (blob: Blob) => {
        setUploading(true);
        try {
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
                setVideoURL(data.url);
            }
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setUploading(false);
        }
    };
    

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
                await uploadToCloudinary(blob);
            };

            mediaRecorder.start();
            setRecording(true);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setRecording(false);
        }
    };

    const getCameraPermission = async () => {
        if ("MediaRecorder" in window) {
            try {
                const streamData = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: true,
                });
                setPermission(true);
                setStream(streamData);
                if (videoRef.current) {
                    videoRef.current.srcObject = streamData;
                }
            } catch (err: any) {
                alert(err.message);
            }
        } else {
            alert("The MediaRecorder API is not supported in your browser.");
        }
    };
    

    return (
        <div className="w-screen h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/30 to-amber-900/30" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl w-full space-y-8 p-8 bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-700 relative z-10"
            >
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-amber-500 bg-clip-text text-transparent">
                        Video Recorder
                    </h2>
                    <button
                        onClick={closeRecorder}
                        className="text-slate-400 hover:text-slate-300 transition"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="space-y-6">
                    {permission && (
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

                    {videoURL && (
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
                        {!permission ? (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={getCameraPermission}
                                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-teal-600 transition"
                            >
                                Get Camera Access
                            </motion.button>
                        ) : (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={recording ? stopRecording : startRecording}
                                disabled={uploading}
                                className={`px-6 py-3 bg-gradient-to-r ${
                                    recording 
                                    ? 'from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600' 
                                    : 'from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600'
                                } text-white rounded-lg font-medium transition flex items-center gap-2 ${
                                    uploading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {recording && <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"/>}
                                {uploading ? 'Uploading...' : recording ? 'Stop Recording' : 'Start Recording'}
                            </motion.button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Recorder;
