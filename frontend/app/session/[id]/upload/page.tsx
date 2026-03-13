
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StepIndicator from "@/components/ui/StepIndicator";
import FileUpload from "@/components/dashboard/FileUpload";
import { ArrowRight, ArrowLeft, Shield, AlertCircle, Info } from "lucide-react";
import { useLanguage } from '@/context/LanguageContext';

export default function UploadPage() {
    const { t } = useLanguage();
    const params = useParams();
    const router = useRouter();
    const sessionId = params.id as string;

    const [reqs, setReqs] = useState<string[]>([]);
    const [completed, setCompleted] = useState<Set<string>>(new Set());

    useEffect(() => {
        // Basic restore from local storage (set in Page 1)
        if (sessionId) {
            const stored = localStorage.getItem(`session_${sessionId}_reqs`);
            if (stored) {
                setReqs(JSON.parse(stored));
            } else {
                setReqs(['aadhaar', 'pan']);
            }
        }
    }, [sessionId]);

    const handleComplete = (doc: string) => {
        setCompleted(prev => {
            const next = new Set(prev);
            next.add(doc);
            return next;
        });
    };

    const allDone = reqs.length > 0 && reqs.every(r => completed.has(r));
    const someDone = completed.size > 0;

    return (
        <div className="min-h-screen pb-20 bg-gray-50 dark:bg-gray-900">
            <StepIndicator currentStep={2} />

            <div className="max-w-5xl mx-auto px-4 mt-8">

                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-[var(--color-gov-navy)] dark:text-gray-100 mb-2">
                        {t('upload.title')}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        {t('upload.desc')}
                    </p>
                </div>

                <div className="flex flex-col gap-4 mb-8">
                    {/* Secure Upload Notice */}
                    <div className="bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-500 rounded-lg p-4 flex gap-4 shadow-sm">
                        <div className="bg-blue-200 dark:bg-blue-800 rounded-full p-2 h-fit text-blue-700 dark:text-blue-200">
                            <Info size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg">{t('upload.secure.title')}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                {t('upload.secure.desc')} <a href="#" className="underline text-blue-600 dark:text-blue-400">Learn more.</a>
                            </p>
                        </div>
                    </div>

                    {/* Optional Upload Notice */}
                    <div className="bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-500 rounded-lg p-4 flex gap-4 shadow-sm">
                        <div className="bg-amber-200 dark:bg-amber-800 rounded-full p-2 h-fit text-amber-700 dark:text-amber-200">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg">{t('upload.optional.title')}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                {t('upload.optional.desc')} <a href="#" className="underline text-amber-600 dark:text-amber-400">Learn more.</a>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Grid Layout for Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {reqs.map(doc => (
                        <FileUpload
                            key={doc}
                            docType={doc}
                            sessionId={sessionId}
                            onComplete={() => handleComplete(doc)}
                        />
                    ))}
                </div>

                <div className="mt-12 flex justify-between items-center">
                    <button
                        onClick={() => router.push('/')}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-semibold flex items-center gap-2 transition-colors px-6 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <ArrowLeft size={20} />
                        Back to Home
                    </button>

                    <button
                        onClick={() => router.push(`/session/${sessionId}/review`)}
                        className={`py-3 px-8 rounded-lg font-bold text-lg flex items-center gap-2 transition-all shadow-md active:scale-95 ${allDone
                            ? 'bg-[var(--color-gov-green)] hover:bg-green-700 text-white'
                            : someDone
                                ? 'bg-[var(--color-gov-navy)] hover:bg-blue-900 text-white'
                                : 'bg-gray-600 hover:bg-gray-700 text-white'
                            }`}
                    >
                        {allDone ? 'Proceed to Review' : someDone ? 'Continue with Uploaded' : t('upload.btn.skip')}
                        <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
