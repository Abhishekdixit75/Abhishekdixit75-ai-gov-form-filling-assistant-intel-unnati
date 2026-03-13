
import React, { useState } from 'react';
import { Shield, AlertCircle, Check, Printer, FileText } from 'lucide-react';

interface RealFormPreviewProps {
    data: any;
    onChange: (key: string, val: string) => void;
    formType: string;
}

export default function RealFormPreview({ data, onChange, formType }: RealFormPreviewProps) {
    const [editing, setEditing] = useState(true);

    // Helper to get value recursively or flat
    const getVal = (key: string) => {
        // Data might be mapped structure (nested) or flat entities
        // Backend 'finalize' returns mapped structure (nested) usually, but for now we are using entities logic if not finalized?
        // Wait, Page 4 calls 'finalize' which returns mapped JSON.
        // So structure depends on Schema.
        // We will Flatten it visually for the "Form" look if strict structure isn't known.
        // Or we try to access by key.

        // If data is { "personal_details": { "name": "..." } }
        // We need to traverse.
        // For MVP "Official Look", let's flatten the display into sections.
        return JSON.stringify(data[key]); // simplistic
    };

    // Improved Flattener for display
    const flattenData = (obj: any, prefix = ''): { key: string, value: string }[] => {
        let acc: any[] = [];
        for (const [k, v] of Object.entries(obj)) {
            if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
                acc = [...acc, ...flattenData(v, `${prefix}${k}.`)];
            } else {
                acc.push({ key: k, value: String(v) });
            }
        }
        return acc;
    };

    // We expect 'data' to be the Final Mapped JSON (clean key-values)
    // Let's assume it's roughly 1-level or 2-level deep.

    const formTitle = formType.replace(/_/g, ' ').toUpperCase() + " APPLICATION";

    return (
        <div className="bg-white p-8 md:p-12 shadow-2xl max-w-4xl mx-auto border border-gray-300 print:shadow-none print:border-none print:w-full print:max-w-none text-gray-900 font-serif">

            {/* HEADER */}
            <div className="border-b-4 border-double border-gray-800 pb-6 mb-8 text-center relative">
                <div className="absolute top-0 left-0">
                    <Shield size={48} className="text-gray-400 opacity-50" />
                </div>
                <div className="absolute top-0 right-0">
                    <div className="w-24 h-32 border border-gray-300 flex items-center justify-center text-xs text-gray-400 bg-gray-50">
                        Passport<br />Size Photo
                    </div>
                </div>

                <h5 className="text-sm uppercase tracking-[0.2em] mb-2 font-bold text-gray-600">Government of State</h5>
                <h1 className="text-3xl font-bold uppercase underline decoration-gray-400 underline-offset-4 mb-2">{formTitle}</h1>
                <p className="text-xs italic text-red-600 font-sans font-medium">
                    Note: Fields marked with * are mandatory. Please verify details before submission.
                </p>
            </div>

            {/* FORM BODY */}
            <div className="space-y-8">
                {/* We will iterate over keys and make them look like form fields */}
                {data && Object.keys(data).map((sectionKey) => {
                    const sectionData = data[sectionKey];
                    if (typeof sectionData !== 'object') return null;

                    return (
                        <div key={sectionKey} className="break-inside-avoid">
                            <h3 className="bg-gray-200 px-4 py-1 font-bold uppercase text-sm border border-gray-400 mb-4 flex justify-between">
                                <span>{sectionKey.replace(/_/g, ' ')}</span>
                                <span className="text-[10px] font-normal text-gray-500 self-center">SECTION A</span>
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 px-2">
                                {Object.entries(sectionData).map(([fieldKey, val]: [string, any]) => (
                                    <div key={fieldKey} className="flex flex-col relative group">
                                        <label className="text-xs font-bold uppercase text-gray-500 mb-1 flex items-center gap-1">
                                            {fieldKey.replace(/_/g, ' ')}
                                        </label>

                                        {editing ? (
                                            <input
                                                className={`font-mono text-base border-b border-gray-400 focus:border-black outline-none py-1 bg-yellow-50/20 hover:bg-yellow-50 transition-colors
                                              ${!val ? 'border-red-300 bg-red-50' : ''}`}
                                                value={val || ''}
                                                onChange={(e) => {
                                                    // Ideally we call onChange to update parent state.
                                                    // Since structure is nested, this is complex for MVP.
                                                    // We'll trust user is "Reviewing" mainly.
                                                    // For demo, we just allow typing (local visual update would require deep clone).
                                                }}
                                                readOnly // For now read-only in this view as parent state is complex
                                            />
                                        ) : (
                                            <div className="font-mono text-base border-b border-gray-800 py-1 min-h-[2rem]">
                                                {val}
                                            </div>
                                        )}

                                        {/* Fake Confidence Highlight logic (if we had metadata here) */}
                                        {/* Since 'finalize' returns clean JSON, we lost confidence metadata. 
                                         Page 3 is where confidence is reviewed. Page 4 is Final Output. 
                                         So Page 4 should look clean. */}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* FOOTER */}
            <div className="mt-16 pt-8 border-t border-gray-800 flex justify-between items-end">
                <div className="text-center">
                    <div className="h-0.5 w-48 bg-gray-800 mb-2"></div>
                    <p className="text-xs uppercase font-bold">Signature of Applicant</p>
                </div>
                <div className="text-right text-xs text-gray-500">
                    Generated by AI Assistant on {new Date().toLocaleDateString()}
                </div>
            </div>
        </div>
    );
}
