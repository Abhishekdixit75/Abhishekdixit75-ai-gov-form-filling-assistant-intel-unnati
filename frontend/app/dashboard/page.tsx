"use client";

import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User, Shield, FileText } from "lucide-react";
import { StatCard } from "@/components/dashboard/DashboardWidgets";
import Link from "next/link";

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);

    const fetchStats = () => {
        if (!user) return;
        const token = localStorage.getItem("auth_token");
        fetch("http://127.0.0.1:8000/dashboard/stats", {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        } else if (user) {
            fetchStats();
        }
    }, [loading, user, router]);

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8 bg-transparent">
                <div className="w-8 h-8 border-4 border-[var(--color-gov-blue)] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[var(--color-gov-navy)] dark:text-white">Welcome, {user.full_name || "Citizen"}!</h1>
            </div>

            {/* Widgets Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    title="Active Applications"
                    subtext={`${stats?.active_applications_count ?? 0} active applications.`}
                    icon={FileText}
                    colorClass="bg-orange-100 text-orange-600"
                />
                <StatCard
                    title="Saved Profile Fields"
                    subtext={`${stats?.saved_fields_count ?? 0} saved fields in profile.`}
                    icon={User}
                    colorClass="bg-orange-100 text-orange-600"
                />
                <Link href="/digilocker-info" className="block transform transition-transform hover:scale-105">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-l-4 border-green-500 h-full flex flex-col justify-between">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wide">DigiLocker Status</h3>
                                <p className="text-2xl font-bold text-[var(--color-gov-navy)] dark:text-white mt-1">Why Unavailable?</p>
                            </div>
                            <div className="bg-green-100 text-green-600 p-3 rounded-full">
                                <Shield size={24} />
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Click to understand integration limits.</p>
                    </div>
                </Link>
            </div>

            {/* Quick Actions / Recent (Optional, can be added back if needed or kept clean) */}
            <div className="bg-gradient-to-r from-[var(--color-gov-navy)] to-blue-900 rounded-lg p-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-xl font-bold mb-2">New Service Available</h2>
                    <p className="text-blue-100 mb-6 max-w-lg">Apply for the new Unified Digital Identity Card today. Simplifies access to all government schemes.</p>
                    <button onClick={() => router.push('/dashboard/services')} className="bg-[var(--color-gov-saffron)] hover:bg-orange-600 text-white font-bold py-2 px-6 rounded shadow transition-transform active:scale-95">
                        Apply Now
                    </button>
                </div>
                {/* Decorative circle */}
                <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            </div>
        </div>
    );
}


