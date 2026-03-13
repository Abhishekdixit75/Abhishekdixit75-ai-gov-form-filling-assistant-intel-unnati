"use client";

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function MediaPage() {
    const { t } = useLanguage();
    const [currentSlide, setCurrentSlide] = useState(0);
    const slides = [
        "/slide1.png",
        "/slide2.png",
        "/slide3.png",
        "/slide4.png"
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

    const pressReleases = [
        {
            date: t('media.pr.1.date'),
            title: t('media.pr.1.title'),
            desc: t('media.pr.1.desc'),
            link: "https://pib.gov.in/PressReleasePage.aspx?PRID=2070001"
        },
        {
            date: t('media.pr.2.date'),
            title: t('media.pr.2.title'),
            desc: t('media.pr.2.desc'),
            link: "https://pib.gov.in/PressReleasePage.aspx?PRID=2012000"
        },
        {
            date: t('media.pr.3.date'),
            title: t('media.pr.3.title'),
            desc: t('media.pr.3.desc'),
            link: "https://www.meity.gov.in/writereaddata/files/IndiaAI-Governance-Framework.pdf"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-[var(--color-gov-navy)] dark:text-white mb-8">{t('media.title')}</h1>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Press Releases Section */}
                    <div className="md:col-span-2 space-y-6">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 border-l-4 border-[var(--color-gov-saffron)] pl-3">{t('media.latest')}</h2>
                        {pressReleases.map((pr, i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group">
                                <span className="text-xs font-bold text-[var(--color-gov-blue)] mb-2 block">{pr.date}</span>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-snug group-hover:text-[var(--color-gov-saffron)] transition-colors">
                                    {pr.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                                    {pr.desc}
                                </p>
                                <a
                                    href={pr.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-sm font-semibold text-[var(--color-gov-saffron)] hover:underline gap-1"
                                >
                                    Read Full Release <ExternalLink size={14} />
                                </a>
                            </div>
                        ))}
                    </div>

                    {/* Gallery/Social Section */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 border-l-4 border-[var(--color-gov-green)] pl-3 mb-4">{t('media.gallery')}</h2>

                            {/* Carousel */}
                            <div className="relative aspect-[4/3] bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md group">
                                <div
                                    className="absolute inset-0 flex transition-transform duration-500 ease-out"
                                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                                >
                                    {slides.map((slide, i) => (
                                        <div key={i} className="min-w-full h-full relative">
                                            <img
                                                src={slide}
                                                alt={`Gallery Slide ${i + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Controls */}
                                <button
                                    onClick={prevSlide}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={nextSlide}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                                >
                                    <ChevronRight size={20} />
                                </button>

                                {/* Dots */}
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                                    {slides.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentSlide(i)}
                                            className={`w-2 h-2 rounded-full transition-all ${currentSlide === i ? 'bg-white w-4' : 'bg-white/50'}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <button className="w-full mt-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">{t('media.view_all')}</button>
                        </div>

                        <div className="bg-[var(--color-gov-navy)] text-white p-6 rounded-lg">
                            <h3 className="font-bold text-lg mb-2">{t('media.subscribe')}</h3>
                            <p className="text-sm text-blue-100 mb-4">{t('media.sub_desc')}</p>
                            <input type="email" placeholder={t('media.email_ph')} className="w-full px-3 py-2 rounded text-gray-900 text-sm mb-2 focus:ring-2 ring-[var(--color-gov-saffron)] outline-none" />
                            <button className="w-full bg-[var(--color-gov-saffron)] hover:bg-orange-600 py-2 rounded text-sm font-bold transition-colors">{t('media.btn_sub')}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
