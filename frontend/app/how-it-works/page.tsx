"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Cpu, FileCheck, Download } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function HowItWorksPage() {
    const router = useRouter();
    const { t } = useLanguage();

    const steps = [
        {
            icon: Upload,
            color: "text-blue-600",
            bg: "bg-blue-100",
            titleKey: "how.step1.title",
            descKey: "how.step1.desc"
        },
        {
            icon: Cpu,
            color: "text-[var(--color-gov-saffron)]",
            bg: "bg-orange-100",
            titleKey: "how.step2.title",
            descKey: "how.step2.desc"
        },
        {
            icon: FileCheck,
            color: "text-[var(--color-gov-navy)]",
            bg: "bg-blue-200",
            titleKey: "how.step3.title",
            descKey: "how.step3.desc"
        },
        {
            icon: Download,
            color: "text-[var(--color-gov-green)]",
            bg: "bg-green-100",
            titleKey: "how.step4.title",
            descKey: "how.step4.desc"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => router.push('/')}
                    className="mb-8 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[var(--color-gov-navy)] transition-colors font-medium"
                >
                    <ArrowLeft size={20} />
                    {t('how.btn.home')}
                </button>

                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-[var(--color-gov-navy)] dark:text-gray-100 mb-4">
                        {t('how.title')}
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        {t('how.subtitle')}
                    </p>
                </div>

                <div className="relative">
                    {/* Vertical Connector Line */}
                    <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 -translate-x-1/2 hidden md:block"></div>
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 -translate-x-1/2 md:hidden"></div>

                    <div className="space-y-12">
                        {steps.map((step, index) => (
                            <div key={index} className={`relative flex items-center gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} flex-col md:text-left text-left`}>

                                {/* Icon Bubble */}
                                <div className={`relative z-10 flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg ${step.bg}`}>
                                    <step.icon size={32} className={step.color} />
                                </div>

                                {/* Content Card */}
                                <div className={`flex-1 bg-white dark:bg-[#1e293b] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow md:max-w-md w-full ml-12 md:ml-0`}>
                                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
                                        Step 0{index + 1}
                                    </span>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                        {t(step.titleKey)}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                        {t(step.descKey)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-20 text-center">
                    <button
                        onClick={() => router.push('/')}
                        className="bg-[var(--color-gov-navy)] hover:bg-blue-900 text-white py-4 px-10 rounded-lg font-bold text-lg shadow-xl hover:shadow-2xl transition-all active:scale-95"
                    >
                        {t('home.btn.start')}
                    </button>
                </div>
            </div>
        </div>
    );
}
