
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StepIndicator from "@/components/ui/StepIndicator";
import FloatingVoiceButton from "@/components/ui/FloatingVoiceButton";
import { api } from "@/lib/api";
import { ArrowRight, ArrowLeft, Printer, Download, Save, CheckCircle, AlertTriangle, Mic, Sparkles, Edit2 } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import GovtEmblem from "@/components/ui/GovtEmblem";

export default function ReviewPage() {
    const params = useParams();
    const router = useRouter();
    const sessionId = params.id as string;
    const [entities, setEntities] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [formType, setFormType] = useState("");
    const { showToast } = useToast();

    useEffect(() => {
        const storedForm = localStorage.getItem(`session_${sessionId}_form`);
        if (storedForm) setFormType(storedForm);
        loadData();
    }, [sessionId]);

    const loadData = async () => {
        try {
            const data = await api.getSession(sessionId);
            setEntities(data);
            setLoading(false);
        } catch (e) {
            console.error(e);
            showToast('error', 'Failed to load session data');
        }
    };

    const handleEntityUpdate = (key: string, val: string) => {
        setEntities((prev: any) => ({
            ...prev,
            [key]: { value: val, source: 'user_edit', confidence: 1.0 }
        }));
    };

    const handleFinalize = () => {
        sessionStorage.setItem(`session_${sessionId}_entities`, JSON.stringify(entities));
        router.push(`/session/${sessionId}/final`);
    };

    // Official Government Groups
    const GROUPS = {
        "Personal Information \n(व्यक्तिगत जानकारी)": ['full_name', 'fathers_name', 'mothers_name', 'gender', 'date_of_birth', 'aadhaar_number', 'pan_number'],
        "Address Details \n(पते का विवरण)": ['address', 'district', 'tehsil', 'state', 'pincode', 'village'],
        "Occupation & Income \n(व्यवसाय और आय)": ['annual_income', 'income_source', 'occupation', 'religion', 'caste_category']
    };

    const renderField = (key: string) => {
        const ent = entities[key];
        const val = ent?.value || "";
        const isFilled = Boolean(val);
        const source = ent?.source;

        let SourceIcon = null;
        let sourceLabel = "";
        let sourceColor = "";

        if (source === 'user_edit') {
            SourceIcon = <div className="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 p-0.5 rounded" title="Edited by User"><Edit2 size={10} /></div>;
            sourceLabel = "Edited";
            sourceColor = "text-blue-600 bg-blue-50 dark:text-blue-300 dark:bg-blue-900/20";
        } else if (source === 'voice') {
            SourceIcon = <div className="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300 p-0.5 rounded" title="Voice Input"><Mic size={10} /></div>;
            sourceLabel = "Voice";
            sourceColor = "text-purple-600 bg-purple-50 dark:text-purple-300 dark:bg-purple-900/20";
        } else if (isFilled) {
            // Default to AI if filled but not user/voice
            SourceIcon = <div className="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300 p-0.5 rounded" title="AI Auto-filled"><Sparkles size={10} /></div>;
            sourceLabel = "AI Auto-filled";
            sourceColor = "text-amber-600 bg-amber-50 dark:text-amber-300 dark:bg-amber-900/20";
        }

        return (
            <div key={key} className={`
                grid grid-cols-12 gap-4 border-b border-gray-200 dark:border-gray-700 last:border-0 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors
                ${source === 'user_edit' ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}
            `}>
                <div className="col-span-4 font-semibold text-sm text-gray-700 dark:text-gray-300 capitalize flex flex-col justify-center">
                    <span>{key.replace(/_/g, " ")}</span>
                    {isFilled && (
                        <div className={`flex items-center gap-1 mt-0.5 text-[10px] font-medium w-fit px-1.5 py-0.5 rounded-full ${sourceColor}`}>
                            {SourceIcon} {sourceLabel}
                        </div>
                    )}
                </div>
                <div className="col-span-8 flex items-center">
                    <input
                        type="text"
                        value={val}
                        onChange={(e) => handleEntityUpdate(key, e.target.value)}
                        className={`w-full bg-transparent border-0 border-b border-transparent focus:border-[var(--color-gov-blue)] focus:ring-0 text-gray-900 dark:text-gray-100 font-medium px-2 py-1 outline-none transition-all placeholder:text-gray-400
                            ${!isFilled ? 'bg-yellow-50 dark:bg-yellow-900/20 border-dashed border-yellow-300' : ''}
                            ${source === 'user_edit' ? 'text-blue-700 dark:text-blue-400 font-bold' : ''}
                        `}
                        placeholder="[ Missing Data ]"
                    />
                </div>
            </div>
        );
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-gov-blue)]"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pb-20">
            <StepIndicator currentStep={3} />

            <div className="max-w-[1000px] mx-auto px-4 mt-8">

                {/* Official Paper Document Container */}
                <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-sm border border-gray-200 dark:border-gray-700 min-h-[800px] relative overflow-hidden mb-20">

                    {/* Watermark */}
                    <div className="absolute inset-0 bg-[url('/emblem.png')] bg-center bg-no-repeat opacity-[0.03] bg-[length:400px_400px] pointer-events-none" />

                    {/* Official Header */}
                    <div className="border-b-2 border-gray-800 dark:border-gray-600 p-8 flex items-start justify-between bg-gray-50 dark:bg-gray-900/50">
                        <div className="flex items-center gap-6">
                            <GovtEmblem className="h-20 w-auto shrink-0" />
                            <div>
                                <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                                    Application Review Form
                                </h1>
                                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mt-1 uppercase">
                                    {formType.replace(/_/g, " ") || "Government Service Application"}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Form No: {sessionId.slice(0, 8).toUpperCase()}</p>
                            </div>
                        </div>
                        <div className="text-right hidden sm:block">
                            <div className="border border-gray-300 dark:border-gray-600 p-2 w-32 h-40 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-xs text-gray-400 uppercase text-center font-bold tracking-widest">
                                Applicant Photo
                            </div>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="p-8 space-y-8 relative z-10">

                        <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 text-yellow-800 dark:text-yellow-200 text-sm">
                            <div className="flex items-center gap-3">
                                <AlertTriangle size={18} />
                                <span>Please verify all details carefully. Click any field to edit.</span>
                            </div>
                            <span className="font-bold bg-white/50 px-2 py-0.5 rounded text-xs uppercase border border-yellow-200">Draft Copy</span>
                        </div>

                        {Object.entries(GROUPS).map(([groupTitle, fields]) => (
                            <div key={groupTitle} className="mb-6">
                                <h2 className="text-lg font-bold text-[var(--color-gov-navy)] dark:text-blue-300 mb-4 pb-2 border-b-2 border-gray-300 dark:border-gray-600 uppercase flex justify-between items-end whitespace-pre-line">
                                    {groupTitle}
                                </h2>
                                <div className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
                                    {fields.map(key => renderField(key))}
                                </div>
                            </div>
                        ))}

                    </div>

                    {/* Footer Declaration */}
                    <div className="p-8 bg-gray-100 dark:bg-gray-900/50 border-t-2 border-gray-800 dark:border-gray-600 mt-auto">
                        <p className="text-xs text-justify text-gray-600 dark:text-gray-400 italic">
                            I hereby declare that the information given above and in the enclosed documents is true to the best of my knowledge and belief and nothing has been concealed therein. I am well aware of the fact that if the information given by me is proved false/not true, I will have to face the punishment as per the law. Also, all the benefits availed by me shall be summarily withdrawn.
                        </p>
                    </div>

                </div>

                {/* Final Action Buttons (Inline) */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 mb-20 px-2">
                    <button
                        onClick={() => router.push(`/session/${sessionId}/upload`)}
                        className="flex items-center gap-2 px-6 py-2 text-gray-600 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                    >
                        <ArrowLeft size={18} />
                        Back
                    </button>

                    <div className="flex gap-4">
                        <button
                            onClick={() => window.print()}
                            className="hidden sm:flex items-center gap-2 px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            <Printer size={18} />
                            Print
                        </button>

                        <button
                            onClick={handleFinalize}
                            className={`
                                flex items-center gap-3 px-8 py-2 rounded-lg font-bold text-white shadow-lg bg-gradient-to-r hover:scale-[1.02] active:scale-[0.98] transition-all
                                ${loading ? 'from-gray-400 to-gray-500 cursor-not-allowed' : 'from-green-600 to-emerald-600 hover:shadow-green-500/20'}
                            `}
                        >
                            Confirm & Submit <CheckCircle size={20} />
                        </button>
                    </div>
                </div>

                {/* Floating AI Voice Button */}
                <FloatingVoiceButton sessionId={sessionId} onUpdate={setEntities} />
            </div>
        </div>
    );
}
