"use client";

import React, { useState, useRef } from 'react';
import { Loader2, Check, Square, Mic, X } from 'lucide-react';
import { api } from '@/lib/api';

interface FloatingVoiceButtonProps {
    sessionId: string;
    onUpdate: (newState: any) => void;
}

export default function FloatingVoiceButton({ sessionId, onUpdate }: FloatingVoiceButtonProps) {
    const [recording, setRecording] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showTooltip, setShowTooltip] = useState(true);
    const [transcript, setTranscript] = useState<string>('');
    const [showTranscript, setShowTranscript] = useState(false);
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const chunks = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder.current = new MediaRecorder(stream);
            chunks.current = [];
            setShowTooltip(false);
            setTranscript('');
            setShowTranscript(false);

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
            alert("Microphone access denied.");
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

            // Show transcript
            if (res.transcription) {
                setTranscript(res.transcription);
                setShowTranscript(true);
                // Auto-hide transcript after 8 seconds
                setTimeout(() => setShowTranscript(false), 8000);
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
                setTimeout(() => setShowSuccess(false), 2000);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setProcessing(false);
        }
    };

    const dismissTranscript = () => {
        setShowTranscript(false);
    };

    return (
        <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-3">

            {/* Status Bubble - Recording */}
            {recording && (
                <div className="bg-red-500 text-white px-4 py-3 rounded-2xl shadow-2xl animate-pulse max-w-[280px]">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
                        <div>
                            <p className="font-bold text-sm">Listening...</p>
                            <p className="text-xs opacity-80">Tap button to stop</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Bubble - Processing */}
            {processing && (
                <div className="bg-indigo-600 text-white px-4 py-3 rounded-2xl shadow-2xl max-w-[280px] animate-in slide-in-from-right duration-300">
                    <div className="flex items-center gap-3">
                        <Loader2 className="animate-spin" size={20} />
                        <div>
                            <p className="font-bold text-sm">Processing audio...</p>
                            <p className="text-xs opacity-80">Extracting information</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Transcript Bubble */}
            {showTranscript && transcript && !recording && !processing && (
                <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-[320px] animate-in slide-in-from-right duration-300 relative">
                    <button
                        onClick={dismissTranscript}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                        <X size={14} />
                    </button>
                    <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Check size={12} /> You said:
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-200 font-medium leading-relaxed">
                        "{transcript}"
                    </p>
                    {showSuccess && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-semibold">
                            ✓ Fields updated!
                        </p>
                    )}
                </div>
            )}

            {/* Idle Tooltip */}
            {showTooltip && !recording && !processing && !showTranscript && (
                <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 text-sm animate-in fade-in slide-in-from-right-2 duration-300 relative">
                    <p className="font-bold text-[var(--color-gov-navy)] dark:text-blue-400">AI Assistant</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">Tap to speak</p>
                </div>
            )}

            {/* Main Button */}
            <button
                onClick={recording ? stopRecording : startRecording}
                disabled={processing}
                className={`
                    w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl border-4 relative overflow-hidden
                    ${recording
                        ? 'bg-red-500 border-red-300 scale-110'
                        : processing
                            ? 'bg-indigo-500 border-indigo-300 cursor-wait'
                            : showSuccess
                                ? 'bg-green-500 border-green-300'
                                : 'bg-white border-[var(--color-gov-navy)] hover:scale-110 hover:shadow-3xl'
                    }
                `}
            >
                {processing ? (
                    <Loader2 className="animate-spin text-white" size={28} />
                ) : recording ? (
                    <Square fill="white" className="text-white" size={20} />
                ) : showSuccess ? (
                    <Check className="text-white" size={28} strokeWidth={3} />
                ) : (
                    <img
                        src="/ai-wave.png"
                        alt="AI"
                        className="w-10 h-10 object-contain"
                    />
                )}
            </button>
        </div>
    );
}
