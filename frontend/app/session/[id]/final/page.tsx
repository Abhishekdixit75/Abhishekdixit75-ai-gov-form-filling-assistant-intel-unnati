
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StepIndicator from "@/components/ui/StepIndicator";
import { api } from "@/lib/api";
import { Download, FileJson, CheckCircle, Printer, ArrowLeft, Save, Edit2 } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import GovtEmblem from "@/components/ui/GovtEmblem";

export default function FinalPage() {
    const params = useParams();
    const router = useRouter();
    const sessionId = params.id as string;
    const [data, setData] = useState<any>(null);
    const [formType, setFormType] = useState("application_form");
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState<any>({});
    const { showToast } = useToast();

    useEffect(() => {
        if (sessionId) {
            const storedForm = localStorage.getItem(`session_${sessionId}_form`);
            if (storedForm) setFormType(storedForm);

            api.finalize(sessionId)
                .then(finalData => {
                    // Load any edits from Page 3 (Review page)
                    const savedEntities = sessionStorage.getItem(`session_${sessionId}_entities`);
                    if (savedEntities) {
                        try {
                            const parsedEntities = JSON.parse(savedEntities);
                            // Merge: prioritize Page 3 edits over backend data
                            const mergedData = { ...finalData };
                            Object.entries(parsedEntities).forEach(([key, entity]: [string, any]) => {
                                if (entity && typeof entity === 'object' && entity.value) {
                                    mergedData[key] = entity.value;
                                }
                            });
                            setData(mergedData);
                            setEditedData(mergedData);
                        } catch (e) {
                            console.error('Failed to parse saved entities', e);
                            setData(finalData);
                            setEditedData(finalData);
                        }
                    } else {
                        setData(finalData);
                        setEditedData(finalData);
                    }
                })
                .catch(err => {
                    console.error(err);
                    showToast('error', 'Failed to load application data');
                });
        }
    }, [sessionId]);

    const handleEdit = (key: string, value: string) => {
        setEditedData((prev: any) => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSave = () => {
        setData(editedData);
        setIsEditing(false);
        showToast('success', 'Changes saved successfully!');
    };

    const handleDownload = () => {
        if (!editedData) return;
        const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
            JSON.stringify(editedData, null, 2)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `${formType}_${sessionId}.json`;
        link.click();
        showToast('success', 'Application data downloaded!');
    };

    const handlePrint = () => {
        window.print();
        showToast('info', 'Opening print dialog...');
    };

    const getFormTitle = (type: string) => {
        const titles: { [key: string]: string } = {
            'income_certificate': 'Income Certificate',
            'domicile_certificate': 'Domicile Certificate',
            'birth_certificate': 'Birth Certificate',
            'caste_certificate': 'Caste Certificate',
            'voter_id_application': 'Voter ID Application'
        };
        return titles[type] || 'Government Certificate';
    };

    const getFieldLabel = (key: string) => {
        const labels: { [key: string]: string } = {
            'full_name': 'Full Name',
            'fathers_name': "Father's Name",
            'mothers_name': "Mother's Name",
            'date_of_birth': 'Date of Birth',
            'gender': 'Gender',
            'aadhaar_number': 'Aadhaar Number',
            'pan_number': 'PAN Number',
            'mobile_number': 'Mobile Number',
            'email': 'Email Address',
            'address': 'Residential Address',
            'district': 'District',
            'tehsil': 'Tehsil/Block',
            'state': 'State',
            'pincode': 'PIN Code',
            'village': 'Village/Town',
            'annual_income': 'Annual Income (₹)',
            'income_source': 'Source of Income',
            'religion': 'Religion',
            'caste_category': 'Caste Category',
            'occupation': 'Occupation',
            'purpose': 'Purpose of Certificate'
        };
        return labels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const renderFormField = (key: string, value: any, readOnly: boolean = false) => {
        const isLongText = ['address', 'purpose', 'income_source'].includes(key);

        // Fix: Always use editedData[key] to prevent text disappearing bug
        const currentValue = editedData[key] || '';

        if (isLongText) {
            return (
                <textarea
                    value={currentValue}
                    onChange={(e) => handleEdit(key, e.target.value)}
                    readOnly={readOnly}
                    rows={3}
                    className={`w-full px-3 py-2 border-2 rounded-lg resize-none ${readOnly
                        ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100'
                        : 'bg-white dark:bg-gray-800 border-blue-300 dark:border-blue-500 focus:border-blue-600 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none text-gray-900 dark:text-gray-100'
                        }`}
                />
            );
        }

        return (
            <input
                type="text"
                value={currentValue}
                onChange={(e) => handleEdit(key, e.target.value)}
                readOnly={readOnly}
                className={`w-full px-3 py-2 border-2 rounded-lg ${readOnly
                    ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100'
                    : 'bg-white dark:bg-gray-800 border-blue-300 dark:border-blue-500 focus:border-blue-600 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none text-gray-900 dark:text-gray-100'
                    }`}
            />
        );
    };

    if (!data) {
        return (
            <div className="min-h-screen pb-20 bg-gray-50 dark:bg-gray-900 print:bg-white print:pb-0">
                <div className="print:hidden">
                    <StepIndicator currentStep={4} />
                </div>
                <div className="p-20 text-center text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl max-w-5xl mx-auto mt-8">
                    <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
                    Generating official document...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20 bg-gray-50 dark:bg-gray-900 print:bg-white print:pb-0">
            <div className="print:hidden">
                <StepIndicator currentStep={4} />
            </div>

            <div className="max-w-5xl mx-auto px-4 mt-8 pb-10 print:mt-0 print:px-0 print:max-w-none">

                {/* Success Header - Print Hidden */}
                <div className="text-center mb-8 print:hidden">
                    <div className="w-16 h-16 bg-[var(--color-gov-green)] text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200 dark:shadow-none animate-bounce">
                        <CheckCircle size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-[var(--color-gov-navy)] dark:text-gray-100">Application Ready!</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Review your official form below. You can still edit fields if needed.</p>
                </div>

                {/* Government Form */}
                <div className="bg-white dark:bg-gray-800 border-4 border-gray-800 dark:border-gray-600 rounded-lg overflow-hidden print:border-2">
                    {/* Form Header */}
                    {/* Form Header */}
                    <div className="bg-[var(--color-gov-navy)] text-white p-8 print:p-6 text-center border-b-4 border-[var(--color-gov-saffron)] relative overflow-hidden">
                        {/* Background Watermark Effect */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                            <GovtEmblem className="w-64 h-64" />
                        </div>

                        <div className="flex justify-center items-center gap-4 mb-4 relative z-10">
                            <GovtEmblem className="w-16 h-20 drop-shadow-md" />
                        </div>
                        <h1 className="text-3xl font-bold mb-1 relative z-10">GOVERNMENT OF INDIA</h1>
                        <h2 className="text-xl font-semibold opacity-90 relative z-10">Department of Revenue</h2>
                        <div className="mt-4 pt-4 border-t border-white/30 relative z-10">
                            <h3 className="text-2xl font-bold tracking-wide">{getFormTitle(formType).toUpperCase()}</h3>
                            <p className="text-sm opacity-80 mt-1 uppercase tracking-widest font-medium">Official Application Form</p>
                        </div>
                    </div>

                    {/* Form Body */}
                    <div className="p-8 print:p-6 space-y-6">

                        {/* Application Number */}
                        <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-700 rounded-lg p-4 flex justify-between items-center print:break-inside-avoid">
                            <div>
                                <p className="text-xs text-amber-800 dark:text-amber-300 font-semibold uppercase tracking-wide">Application Number</p>
                                <p className="text-lg font-bold text-amber-900 dark:text-amber-100">{sessionId.substring(0, 12).toUpperCase()}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-amber-800 dark:text-amber-300 font-semibold uppercase tracking-wide">Date</p>
                                <p className="text-lg font-bold text-amber-900 dark:text-amber-100">{new Date().toLocaleDateString('en-IN')}</p>
                            </div>
                        </div>

                        {/* Personal Details Section */}
                        <div className="print:break-inside-avoid">
                            <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-t-lg border-b-2 border-blue-600 dark:border-blue-400">
                                SECTION A: PERSONAL DETAILS
                            </h4>
                            <div className="border-2 border-gray-200 dark:border-gray-700 rounded-b-lg p-4 space-y-4">
                                {['full_name', 'fathers_name', 'mothers_name', 'date_of_birth', 'gender'].map(key => (
                                    <div key={key} className="grid grid-cols-3 gap-4 items-center">
                                        <label className="font-semibold text-gray-700 dark:text-gray-300 text-sm">{getFieldLabel(key)}:</label>
                                        <div className="col-span-2">
                                            {renderFormField(key, editedData[key], !isEditing)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Identity Details Section */}
                        <div className="print:break-inside-avoid">
                            <h4 className="text-lg font-bold text-gray-900 bg-gray-100 px-4 py-2 rounded-t-lg border-b-2 border-blue-600">
                                SECTION B: IDENTITY PROOF
                            </h4>
                            <div className="border-2 border-gray-200 rounded-b-lg p-4 space-y-4">
                                {['aadhaar_number', 'pan_number'].map(key => (
                                    <div key={key} className="grid grid-cols-3 gap-4 items-center">
                                        <label className="font-semibold text-gray-700 text-sm">{getFieldLabel(key)}:</label>
                                        <div className="col-span-2">
                                            {renderFormField(key, editedData[key], !isEditing)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Contact Details Section */}
                        <div className="print:break-inside-avoid">
                            <h4 className="text-lg font-bold text-gray-900 bg-gray-100 px-4 py-2 rounded-t-lg border-b-2 border-blue-600">
                                SECTION C: CONTACT INFORMATION
                            </h4>
                            <div className="border-2 border-gray-200 rounded-b-lg p-4 space-y-4">
                                {['mobile_number', 'email'].map(key => (
                                    <div key={key} className="grid grid-cols-3 gap-4 items-center">
                                        <label className="font-semibold text-gray-700 text-sm">{getFieldLabel(key)}:</label>
                                        <div className="col-span-2">
                                            {renderFormField(key, editedData[key], !isEditing)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Address Details Section */}
                        <div className="print:break-inside-avoid">
                            <h4 className="text-lg font-bold text-gray-900 bg-gray-100 px-4 py-2 rounded-t-lg border-b-2 border-blue-600">
                                SECTION D: ADDRESS DETAILS
                            </h4>
                            <div className="border-2 border-gray-200 rounded-b-lg p-4 space-y-4">
                                {['address', 'village', 'tehsil', 'district', 'state', 'pincode'].map(key => (
                                    <div key={key} className="grid grid-cols-3 gap-4 items-start">
                                        <label className="font-semibold text-gray-700 text-sm pt-2">{getFieldLabel(key)}:</label>
                                        <div className="col-span-2">
                                            {renderFormField(key, editedData[key], !isEditing)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Additional Details Section */}
                        <div className="print:break-inside-avoid">
                            <h4 className="text-lg font-bold text-gray-900 bg-gray-100 px-4 py-2 rounded-t-lg border-b-2 border-blue-600">
                                SECTION E: ADDITIONAL INFORMATION
                            </h4>
                            <div className="border-2 border-gray-200 rounded-b-lg p-4 space-y-4">
                                {Object.keys(editedData).filter(k =>
                                    !['full_name', 'fathers_name', 'mothers_name', 'date_of_birth', 'gender',
                                        'aadhaar_number', 'pan_number', 'mobile_number', 'email',
                                        'address', 'village', 'tehsil', 'district', 'state', 'pincode'].includes(k)
                                ).map(key => (
                                    <div key={key} className="grid grid-cols-3 gap-4 items-start">
                                        <label className="font-semibold text-gray-700 text-sm pt-2">{getFieldLabel(key)}:</label>
                                        <div className="col-span-2">
                                            {renderFormField(key, editedData[key], !isEditing)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Declaration */}
                        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 print:break-inside-avoid">
                            <h5 className="font-bold text-blue-900 mb-2">DECLARATION</h5>
                            <p className="text-sm text-blue-800 leading-relaxed">
                                I hereby declare that the information provided above is true and correct to the best of my knowledge and belief.
                                I understand that any false information may result in the rejection of this application and/or legal action.
                            </p>
                            <div className="mt-4 pt-4 border-t border-blue-300 grid grid-cols-2 gap-8">
                                <div>
                                    <p className="text-xs text-blue-700 mb-2">Applicant's Signature</p>
                                    <div className="border-b-2 border-blue-400 h-12"></div>
                                </div>
                                <div>
                                    <p className="text-xs text-blue-700 mb-2">Date</p>
                                    <div className="border-b-2 border-blue-400 h-12"></div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-200">
                            <p>This is a computer-generated application form. For official use only.</p>
                            <p className="mt-1">Application ID: {sessionId}</p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons - Print Hidden */}
                <div className="mt-8 space-y-4 print:hidden">

                    {/* Edit Mode Toggle */}
                    <div className="flex justify-center">
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-amber-500 hover:bg-amber-600 text-white py-3 px-8 rounded-lg font-bold text-lg flex items-center gap-2 shadow-lg transition-all active:scale-95"
                            >
                                <Edit2 size={20} />
                                Edit Application
                            </button>
                        ) : (
                            <div className="flex gap-3">
                                <button
                                    onClick={handleSave}
                                    className="bg-green-600 hover:bg-green-700 text-white py-3 px-8 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95"
                                >
                                    <Save size={20} />
                                    Save Changes
                                </button>
                                <button
                                    onClick={() => {
                                        setEditedData(data);
                                        setIsEditing(false);
                                    }}
                                    className="bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Download & Print Buttons */}
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={handlePrint}
                            disabled={isEditing}
                            className="bg-[var(--color-gov-navy)] hover:bg-blue-900 text-white py-3 px-8 rounded-lg font-bold text-lg flex items-center gap-2 shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Printer size={20} />
                            Print / Save as PDF
                        </button>

                        <button
                            onClick={handleDownload}
                            disabled={isEditing}
                            className="bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-6 rounded-lg font-medium flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FileJson size={20} />
                            Download Data
                        </button>
                    </div>

                    {/* Back Button */}
                    <div className="flex justify-center">
                        <button
                            onClick={() => router.push(`/session/${sessionId}/review`)}
                            className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2 transition-colors"
                        >
                            <ArrowLeft size={18} />
                            Back to Review
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
