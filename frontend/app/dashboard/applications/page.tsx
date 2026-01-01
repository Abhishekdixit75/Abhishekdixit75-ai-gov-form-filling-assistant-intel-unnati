"use client";

import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Trash2, Search, FileText } from "lucide-react";

export default function ApplicationsPage() {
    const { user, loading } = useAuth();
    const { t } = useLanguage();
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

    const handleDeleteApp = async (id: number) => {
        if (!window.confirm(t("dashboard.delete.confirm"))) return;

        const token = localStorage.getItem("auth_token");
        try {
            const res = await fetch(`http://127.0.0.1:8000/dashboard/application/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                fetchStats();
            } else {
                console.error("Delete failed", res.status);
                alert(t("dashboard.delete.fail"));
            }
        } catch (e) {
            console.error("Delete failed", e);
            alert(t("dashboard.delete.fail"));
        }
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8">
                <div className="w-8 h-8 border-4 border-[var(--color-gov-blue)] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-gov-navy)] dark:text-white flex items-center gap-2">
                        <FileText className="text-[var(--color-gov-saffron)]" /> Active Applications
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Track the status of your submitted forms.</p>
                </div>
                <div className="relative w-full md:w-64">
                    <input
                        type="text"
                        placeholder="Search Applications..."
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-[var(--color-gov-blue)] outline-none"
                    />
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                        <thead className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-semibold">
                            <tr>
                                <th className="px-6 py-3">Number</th>
                                <th className="px-6 py-3">Application Type</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {stats?.recent_activities?.length > 0 ? (
                                stats.recent_activities.map((act: any) => (
                                    <tr key={act.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 font-medium">APP-{act.id}</td>
                                        <td className="px-6 py-4 capitalize">{act.form_type.replace(/_/g, " ")}</td>
                                        <td className="px-6 py-4">{new Date(act.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${act.status === 'completed'
                                                ? 'bg-green-100 text-green-600'
                                                : 'bg-orange-100 text-orange-600'
                                                }`}>
                                                {act.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleDeleteApp(act.id)}
                                                    className="text-red-500 hover:bg-red-50 p-1 rounded"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No active applications found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
