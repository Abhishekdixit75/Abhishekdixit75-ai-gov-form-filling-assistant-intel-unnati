"use client";

import { FileText, Award, Truck, Briefcase, GraduationCap, Heart, Home, Zap } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';


export default function ServicesPage() {
    const { t } = useLanguage();

    const services = [
        { icon: <FileText size={32} />, title: t("service.cert.title"), desc: t("service.cert.desc") },
        { icon: <Briefcase size={32} />, title: t("service.empl.title"), desc: t("service.empl.desc") },
        { icon: <Heart size={32} />, title: t("service.health.title"), desc: t("service.health.desc") },
        { icon: <GraduationCap size={32} />, title: t("service.edu.title"), desc: t("service.edu.desc") },
        { icon: <Home size={32} />, title: t("service.land.title"), desc: t("service.land.desc") },
        { icon: <Zap size={32} />, title: t("service.util.title"), desc: t("service.util.desc") },
        { icon: <Award size={32} />, title: t("service.award.title"), desc: t("service.award.desc") },
        { icon: <Truck size={32} />, title: t("service.trans.title"), desc: t("service.trans.desc") },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-[var(--color-gov-navy)] dark:text-white mb-2">{t('services.title')}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{t('services.subtitle')}</p>
                    <div className="w-24 h-1 bg-[var(--color-gov-saffron)] mx-auto mt-4 rounded-full"></div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {services.map((service, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-lg transition-all border-t-4 border-transparent hover:border-[var(--color-gov-blue)] group">
                            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 text-[var(--color-gov-blue)] rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                {service.icon}
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{service.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{service.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
