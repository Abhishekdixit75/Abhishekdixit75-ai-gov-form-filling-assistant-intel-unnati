import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2, Check } from 'lucide-react';
import { api } from '@/lib/api';

interface VoiceRecorderProps {
    sessionId: string;
    onUpdate: (newState: any) => void;
}

export default function VoiceRecorder({ sessionId, onUpdate }: VoiceRecorderProps) {
    const [recording, setRecording] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [transcript, setTranscript] = useState<string>('');
    const [showSuccess, setShowSuccess] = useState(false);
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const chunks = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder.current = new MediaRecorder(stream);
            chunks.current = [];
            setTranscript('');
            setShowSuccess(false);

            mediaRecorder.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.current.push(e.data);
            };

            mediaRecorder.current.onstop = async () => {
                const blob = new Blob(chunks.current, { type: 'audio/wav' });
                await handleUpload(blob);
            };

            mediaRecorder.current.start();
            setRecording(true);
        } catch (e) {
            alert("Microphone access denied. Please allow microphone permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.current && recording) {
            mediaRecorder.current.stop();
            setRecording(false);
            mediaRecorder.current.stream.getTracks().forEach(t => t.stop());
        }
    };

    const handleUpload = async (blob: Blob) => {
        setProcessing(true);
        try {
            const res = await api.uploadVoice(sessionId, blob);
            if (res.transcription) {
                setTranscript(res.transcription);
            }
            if (res.current_state) {
                onUpdate((prevState: any) => {
                    const merged = { ...prevState };
                    Object.entries(res.current_state).forEach(([key, value]) => {
                        merged[key] = value;
                    });
                    return merged;
                });
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
            }
        } catch (e) {
            // console.error(e);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full">
            {/* Mic Interaction Area */}
            <div className="relative mb-6 group">
                {/* Ripple Rffect when recording */}
                {recording && (
                    <>
                        <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20"></div>
                        <div className="absolute inset-[-12px] bg-white rounded-full animate-pulse opacity-10"></div>
                    </>
                )}

                <button
                    onClick={recording ? stopRecording : startRecording}
                    disabled={processing}
                    className={`
                        relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg border-4
                        ${recording
                            ? 'bg-white border-[var(--color-gov-blue)] text-[var(--color-gov-blue)] scale-110 shadow-[var(--color-gov-blue)]/50'
                            : processing
                                ? 'bg-indigo-400 border-indigo-300 text-indigo-100 cursor-wait'
                                : showSuccess
                                    ? 'bg-green-500 border-green-200 text-white shadow-green-500/50'
                                    : 'bg-white border-[var(--color-gov-navy)] text-[var(--color-gov-navy)] hover:shadow-xl shadow-blue-900/20'
                        }
                    `}
                >
                    {processing ? <Loader2 className="animate-spin" size={32} /> :
                        recording ? <Square fill="currentColor" size={24} /> :
                            showSuccess ? <Check size={36} strokeWidth={3} /> :
                                <img src="/ai-wave.png" alt="AI" className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform" />}
                </button>
            </div>

            {/* Status Text */}
            <p className="font-semibold text-lg text-white mb-2 tracking-wide text-shadow-sm">
                {recording ? "Listening..." :
                    processing ? "Processing voice..." :
                        showSuccess ? "Entities Extracted!" :
                            "Tap Mic to Start"}
            </p>

            {/* Transcript Bubble */}
            {transcript ? (
                <div className="mt-4 w-full bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/20 animate-in fade-in slide-in-from-bottom-2">
                    <p className="text-xs font-bold text-blue-100 uppercase tracking-wider mb-1 opacity-80">You Said:</p>
                    <p className="text-sm text-white font-medium leading-relaxed">"{transcript}"</p>
                </div>
            ) : (
                <p className="text-xs text-blue-200 opacity-60 mt-1 font-medium">Auto-detects English & Hindi</p>
            )}
        </div>
    );
}
