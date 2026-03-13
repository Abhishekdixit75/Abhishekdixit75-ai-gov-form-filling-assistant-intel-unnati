"use client";

import { Briefcase, FileText, ArrowRight } from "lucide-react";

import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useState } from "react";

export default function ServicesPage() {
    const router = useRouter();
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const services = [
        { id: 'income_certificate', title: "Income Certificate", desc: "Apply for income verification certificate.", active: true },
        { id: 'caste_certificate', title: "Caste Certificate", desc: "Official caste verification document.", active: true },
        { id: 'domicile_certificate', title: "Domicile Certificate", desc: "Proof of residence and domicile status.", active: true },
        { id: 'birth_certificate', title: "Birth Certificate", desc: "Register a new birth record.", active: true },
        { id: 'pan_card', title: "PAN Card Service", desc: "Apply for new PAN or update details.", active: true },
        { id: 'aadhaar_update', title: "Aadhaar Update", desc: "Update address or details in Aadhaar.", active: true },
    ];

    const handleServiceClick = async (serviceId: string) => {
        try {
            setLoadingId(serviceId);
            const res = await api.initSession(serviceId);
            router.push(`/session/${res.session_id}/upload`);
        } catch (error) {
            console.error("Failed to init session:", error);
            setLoadingId(null);
            alert("Failed to start application. Please try again.");
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[var(--color-gov-navy)] dark:text-white flex items-center gap-2">
                    <Briefcase className="text-[var(--color-gov-saffron)]" /> Available Services
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Browse and apply for government services.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service, i) => (
                    <button
                        key={i}
                        onClick={() => service.active && !loadingId && handleServiceClick(service.id)}
                        disabled={!service.active || !!loadingId}
                        className={`
                            text-left bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col relative overflow-hidden group hover:border-[var(--color-gov-blue)] transition-colors
                            ${!service.active ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                            ${loadingId === service.id ? 'opacity-80' : ''}
                        `}
                    >
                        {loadingId === service.id && (
                            <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-10">
                                <div className="w-6 h-6 border-2 border-[var(--color-gov-blue)] border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                        <div className="bg-blue-50 dark:bg-blue-900/20 w-12 h-12 rounded-lg flex items-center justify-center text-[var(--color-gov-blue)] mb-4">
                            <FileText size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{service.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex-1">{service.desc}</p>

                        <div className="flex items-center justify-between mt-auto w-full">
                            <span className={`text-xs font-bold px-2 py-1 rounded ${service.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {service.active ? 'Available' : 'Coming Soon'}
                            </span>
                            {service.active && (
                                <div className="text-[var(--color-gov-blue)] hover:bg-blue-50 p-2 rounded-full transition-colors">
                                    <ArrowRight size={20} />
                                </div>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
