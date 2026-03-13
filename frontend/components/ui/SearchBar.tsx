
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Search, Mic, Loader2, X, FileText, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

// Service Definitions with Keywords (English + Hindi)
const SERVICES = [
    { id: 'birth', title: 'Birth Certificate', path: '/services/birth', keywords: ['birth', 'born', 'janm', 'date of birth', 'जन्म'] },
    { id: 'caste', title: 'Caste Certificate', path: '/services/caste', keywords: ['caste', 'jati', 'community', 'sc', 'st', 'obc', 'जाति'] },
    { id: 'income', title: 'Income Certificate', path: '/services/income', keywords: ['income', 'salary', 'aay', 'financial', 'आय'] },
    { id: 'domicile', title: 'Domicile Certificate', path: '/services/domicile', keywords: ['domicile', 'residence', 'niwas', 'address', 'आवास'] },
    { id: 'pan', title: 'PAN Card', path: '/services/pan', keywords: ['pan', 'tax', 'id', 'pancard', 'पैन'] },
    { id: 'aadhaar', title: 'Aadhaar Update', path: '/services/aadhaar', keywords: ['aadhaar', 'uidai', 'address change', 'आधार'] },
];

export default function SearchBar() {
    const [query, setQuery] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [results, setResults] = useState<typeof SERVICES>([]);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { t } = useLanguage();

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Smart Search Logic
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const lowerQ = query.toLowerCase();

        // 1. Check for App ID Pattern (e.g., APP-12345)
        const isAppId = /^APP-\d+$/i.test(query.trim());
        if (isAppId) {
            setResults([{
                id: 'track',
                title: `Track Application: ${query.toUpperCase()}`,
                path: `/session/${query}`,
                keywords: []
            }]);
            setIsOpen(true);
            return;
        }

        // 2. Filter Services
        const filtered = SERVICES.filter(s =>
            s.title.toLowerCase().includes(lowerQ) ||
            s.keywords.some(k => k.includes(lowerQ))
        );
        setResults(filtered);
        setIsOpen(true);
    }, [query]);

    // Voice Search Handler
    const toggleVoiceSearch = () => {
        if (isListening) {
            setIsListening(false);
            return;
        }

        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.lang = 'en-IN'; // Default to Indian English, works well for mixed
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setQuery(transcript);
                setIsOpen(true);
            };

            recognition.start();
        } else {
            alert("Voice search is not supported in this browser.");
        }
    };

    const handleSelect = (path: string) => {
        router.push(path);
        setIsOpen(false);
        setQuery('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            if (results.length > 0) {
                handleSelect(results[0].path);
            } else if (/^APP-\d+$/i.test(query.trim())) {
                router.push(`/session/${query.trim().toUpperCase()}`);
                setIsOpen(false);
            }
        }
    };

    return (
        <div ref={wrapperRef} className="relative w-full max-w-md">
            <div className="relative flex items-center bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden focus-within:ring-2 ring-[var(--color-gov-blue)] ring-opacity-50 transition-all">
                <Search className="ml-3 text-gray-400" size={18} />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t('search.placeholder') || "Search services or track application..."}
                    className="w-full bg-transparent border-none outline-none px-3 py-2 text-sm text-gray-700 dark:text-gray-200 placeholder:text-gray-400"
                />

                {query && (
                    <button onClick={() => setQuery('')} className="p-2 text-gray-400 hover:text-gray-600">
                        <X size={16} />
                    </button>
                )}

                <button
                    onClick={toggleVoiceSearch}
                    className={`p-2 transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    title="Voice Search"
                >
                    {isListening ? <Loader2 size={18} className="animate-spin" /> : <Mic size={18} />}
                </button>
            </div>

            {/* Dropdown Results */}
            {isOpen && query && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    {results.length > 0 ? (
                        <ul>
                            {results.map((item) => (
                                <li key={item.id}>
                                    <button
                                        onClick={() => handleSelect(item.path)}
                                        className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-3 transition-colors group"
                                    >
                                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                            {item.id === 'track' ? <ArrowRight size={16} /> : <FileText size={16} />}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{item.title}</p>
                                            {item.id === 'track' && <p className="text-xs text-green-600 font-medium">Tracking ID Detected</p>}
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-4 text-center text-sm text-gray-500">
                            No services found matching "{query}"
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
