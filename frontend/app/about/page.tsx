"use client";
import { useLanguage } from "@/context/LanguageContext";

export default function AboutPage() {
    const { t } = useLanguage();
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
            <div className="max-w-5xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <div className="relative h-64 bg-[var(--color-gov-navy)] overflow-hidden">
                        <div className="absolute inset-0 bg-doodle opacity-10"></div>
                        {/* Watermark Image */}
                        <div
                            className="absolute inset-0 opacity-40 pointer-events-none"
                            style={{
                                backgroundImage: "url('/image.png')",
                                backgroundSize: "cover",
                                backgroundPosition: "center"
                            }}
                        ></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <h1 className="text-4xl font-bold text-white tracking-wider">{t('about.title')}</h1>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="mb-10">
                            <h2 className="text-2xl font-bold text-[var(--color-gov-navy)] dark:text-white mb-4 border-b-2 border-[var(--color-gov-saffron)] inline-block pb-1">
                                {t('about.mission')}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                                {t('about.mission.desc')}
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 mb-10">
                            <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-lg border-l-4 border-[var(--color-gov-blue)]">
                                <h3 className="text-xl font-bold text-[var(--color-gov-navy)] dark:text-white mb-2">{t('about.vision')}</h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    {t('about.vision.desc')}
                                </p>
                            </div>
                            <div className="bg-orange-50 dark:bg-orange-900/10 p-6 rounded-lg border-l-4 border-[var(--color-gov-saffron)]">
                                <h3 className="text-xl font-bold text-[var(--color-gov-navy)] dark:text-white mb-2">{t('about.values')}</h3>
                                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                                    <li>{t('about.value.1')}</li>
                                    <li>{t('about.value.2')}</li>
                                    <li>{t('about.value.3')}</li>
                                    <li>{t('about.value.4')}</li>
                                </ul>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-[var(--color-gov-navy)] dark:text-white mb-4 border-b-2 border-[var(--color-gov-green)] inline-block pb-1">
                                {t('about.who')}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                                {t('about.who.desc1')}
                            </p>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {t('about.who.desc2')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
