
import React from 'react';
import { Check } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function StepIndicator({ currentStep }: { currentStep: number }) {
    const { t } = useLanguage();

    const steps = [
        { n: 1, label: t('step.1') },
        { n: 2, label: t('step.2') },
        { n: 3, label: t('step.3') },
        { n: 4, label: t('step.4') },
    ];

    return (
        <div className="w-full bg-white dark:bg-[#1e293b] border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-20 z-40 transition-colors">
            <div className="max-w-[1200px] mx-auto">
                <div className="flex w-full overflow-x-auto no-scrollbar">
                    {steps.map((s, idx) => {
                        const isCompleted = currentStep > s.n;
                        const isActive = currentStep === s.n;

                        return (
                            <div
                                key={s.n}
                                className={`
                                    relative flex-1 min-w-[140px] py-4 px-4 flex items-center justify-center gap-3 text-sm font-medium border-b-4 transition-all whitespace-nowrap
                                    ${isActive
                                        ? 'border-[var(--color-gov-saffron)] bg-orange-50 dark:bg-orange-900/10 text-[#002147] dark:text-orange-200'
                                        : isCompleted
                                            ? 'border-[var(--color-gov-green)] text-[var(--color-gov-green)] dark:text-green-400'
                                            : 'border-transparent text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'}
                                `}
                            >
                                <div className={`
                                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all
                                    ${isActive
                                        ? 'bg-[var(--color-gov-saffron)] text-white'
                                        : isCompleted
                                            ? 'bg-[var(--color-gov-green)] text-white'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}
                                `}>
                                    {isCompleted ? <Check size={14} strokeWidth={3} /> : s.n}
                                </div>
                                <span>{s.label}</span>

                                {/* Chevron separator (visual only, simplified for clean Gov look) */}
                                {idx < steps.length - 1 && (
                                    <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 h-8 w-px bg-gray-200 dark:bg-gray-700"></div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
