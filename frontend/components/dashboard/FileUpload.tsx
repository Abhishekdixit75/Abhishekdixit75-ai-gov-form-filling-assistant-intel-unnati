import React, { useState, useRef } from 'react';
import { Upload, CheckCircle, AlertCircle, FileText, Loader2, CreditCard, IdCard, X, Image as ImageIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/providers/ToastProvider';

interface FileUploadProps {
    docType: string;
    sessionId: string;
    onComplete: () => void;
}

export default function FileUpload({ docType, sessionId, onComplete }: FileUploadProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [filePreviews, setFilePreviews] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { showToast } = useToast();

    // Theming Logic based on docType
    const isAadhaar = docType === 'aadhaar';
    const isPan = docType === 'pan';

    const themeClass = isAadhaar
        ? 'border-orange-500 hover:shadow-orange-100 dark:hover:shadow-orange-900/20'
        : isPan
            ? 'border-green-600 hover:shadow-green-100 dark:hover:shadow-green-900/20'
            : 'border-blue-500 hover:shadow-blue-100 dark:hover:shadow-blue-900/20';

    const headerBorderClass = isAadhaar
        ? 'border-orange-500'
        : isPan
            ? 'border-green-600'
            : 'border-blue-500';

    const iconBgClass = isAadhaar
        ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-300'
        : isPan
            ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-300'
            : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300';

    const uploadBtnClass = isAadhaar
        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-800 dark:text-orange-100 dark:hover:bg-orange-700'
        : isPan
            ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-800 dark:text-green-100 dark:hover:bg-green-700'
            : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-800 dark:text-blue-100 dark:hover:bg-blue-700';

    const getDocTitle = (type: string) => {
        const titles: { [key: string]: string } = {
            'aadhaar': 'Aadhaar Card',
            'pan': 'PAN Card',
            'voter_id': 'Voter ID',
            'caste_certificate': 'Caste Certificate',
        };
        return titles[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const getDocIcon = (type: string) => {
        if (type === 'aadhaar') return <img src="https://upload.wikimedia.org/wikipedia/en/c/cf/Aadhaar_Logo.svg" className="w-10 h-10 object-contain" alt="Aadhaar" />;
        // Placeholder handling for missing images, using Lucide as fallback if image fails loading (not implemented here, assuming icons work or fallback text)
        // Or simply specialized lucide icons if no image
        if (type === 'pan') return <CreditCard size={32} />;
        return <FileText size={32} />;
    };

    const getDocInstructions = (type: string) => {
        if (type === 'aadhaar') return 'Unless conecvoloome/osal intorxr a refiall refihour optional and farnt toad to more to come cryctatezaur at ortinero-indicals.'; // Dummy text from mockup, keeping it realistic though: "Upload front and back images clearly."
        if (type === 'pan') return 'Dlosee as exor none carfdnone of the sossu mensit as PAN card.'; // "Upload clear PAN card image."
        return 'Upload the document clearly.';
    };

    const isMultiFileDoc = (type: string) => {
        return type === 'aadhaar' || type === 'voter_id';
    };

    const validateFileSelection = (newFiles: File[]): { valid: boolean; error?: string } => {
        const existingFiles = files;
        const totalFiles = existingFiles.concat(newFiles);

        // Check file types
        const hasImages = totalFiles.some(f => f.type.startsWith('image/'));
        const hasPdf = totalFiles.some(f => f.type === 'application/pdf');

        // Can't mix PDFs and images
        if (hasImages && hasPdf) {
            return {
                valid: false,
                error: 'Cannot mix PDF and image files. Please upload either a PDF OR images.'
            };
        }

        // Check file count limits
        if (isMultiFileDoc(docType)) {
            if (hasPdf && totalFiles.length > 1) {
                return {
                    valid: false,
                    error: 'Upload only 1 PDF file.'
                };
            }
            if (hasImages && totalFiles.length > 2) {
                return {
                    valid: false,
                    error: 'Upload maximum 2 photos (front and back).'
                };
            }
        } else {
            // Single file documents like PAN
            if (totalFiles.length > 1) {
                return {
                    valid: false,
                    error: `Upload only 1 file.`
                };
            }
        }

        return { valid: true };
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        if (selectedFiles.length === 0) return;
        await processFiles(selectedFiles);
    };

    const createFilePreview = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            } else if (file.type === 'application/pdf') {
                resolve('PDF');
            } else {
                reject(new Error('Unsupported file type'));
            }
        });
    };

    const processFiles = async (newFiles: File[]) => {
        const validation = validateFileSelection(newFiles);
        if (!validation.valid) {
            setError(validation.error!);
            showToast('error', validation.error!);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        const allFiles = [...files, ...newFiles];

        try {
            const newPreviews = await Promise.all(newFiles.map(f => createFilePreview(f)));
            setFilePreviews([...filePreviews, ...newPreviews]);
            setFiles(allFiles);
            setError(null);
        } catch (err) {
            setError('Failed to preview file');
        }
    };

    const handleUpload = async () => {
        if (files.length === 0) {
            fileInputRef.current?.click();
            return;
        }

        setUploading(true);
        setError(null);

        try {
            await api.uploadDocument(sessionId, docType, files);
            setSuccess(true);
            showToast('success', `${getDocTitle(docType)} uploaded successfully!`);
            onComplete();
        } catch (err: any) {
            const errorMsg = err?.message || 'Upload failed.';
            setError(errorMsg);
            showToast('error', errorMsg);
        } finally {
            setUploading(false);
        }
    };

    const removeFile = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index);
        const newPreviews = filePreviews.filter((_, i) => i !== index);
        setFiles(newFiles);
        setFilePreviews(newPreviews);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className={`bg-white dark:bg-[#1e293b] rounded-lg shadow-sm hover:shadow-md transition-all flex flex-col h-full border-t-4 ${themeClass}`}>
            <div className="p-6 flex-1">
                <div className="flex items-start gap-4 mb-4">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${iconBgClass} ${headerBorderClass.replace('border-', 'border-opacity-20 ')}`}>
                        {getDocIcon(docType)}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{getDocTitle(docType)}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                            {/* Use mock description or real instruction */}
                            {docType === 'aadhaar'
                                ? 'Upload clear copies of the front and back of your Aadhaar card.'
                                : docType === 'pan'
                                    ? 'Upload a clear copy of your Permanent Account Number (PAN) card.'
                                    : 'Please ensure all details are clearly visible.'}
                        </p>
                    </div>
                </div>

                {/* Previews */}
                {files.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                        {files.map((file, index) => (
                            <div key={index} className="relative group rounded overflow-hidden border border-gray-200">
                                {filePreviews[index] === 'PDF' ? (
                                    <div className="h-16 bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold">PDF</div>
                                ) : (
                                    <img src={filePreviews[index]} alt="Preview" className="h-16 w-full object-cover" />
                                )}
                                <button
                                    onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                                    className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Upload Area / Button */}
            <div className={`p-6 pt-0 mt-auto`}>
                <div
                    onClick={handleUpload}
                    className={`
                        border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
                        ${success
                            ? 'bg-green-50 border-green-500 cursor-default'
                            : `${uploadBtnClass} border-transparent hover:border-gray-400`}
                    `}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        multiple={isMultiFileDoc(docType)}
                    />

                    {success ? (
                        <div className="flex flex-col items-center gap-2 text-green-700">
                            <CheckCircle size={32} />
                            <span className="font-bold">Uploaded Successfully</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            {uploading ? <Loader2 className="animate-spin" size={24} /> : <Upload size={24} />}
                            <span className="font-bold text-lg">
                                {files.length > 0 ? 'Click to Upload' : 'Upload Document'}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

