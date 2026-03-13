"use client";

import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Check, X, Edit2, User, Trash2 } from "lucide-react";

export default function ProfilePage() {
    const { user, loading } = useAuth();
    const { t } = useLanguage();
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [isClearing, setIsClearing] = useState(false);

    // Edit State
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");

    // Profile Name Edit State
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState(user?.full_name || "");

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

    const handleClearAll = async () => {
        if (!confirm("Are you sure you want to clear ALL your saved profile data? This action cannot be undone.")) {
            return;
        }

        setIsClearing(true);
        const token = localStorage.getItem("auth_token");
        try {
            const res = await fetch("http://127.0.0.1:8000/dashboard/profile/clear", {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                fetchStats();
                alert("All profile data has been cleared.");
            } else {
                alert("Failed to clear profile data.");
            }
        } catch (e) {
            console.error(e);
            alert("Error clearing profile data.");
        } finally {
            setIsClearing(false);
        }
    };

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        } else if (user) {
            fetchStats();
            setNewName(user.full_name || "");
        }
    }, [loading, user, router]);

    const handleUpdateName = async () => {
        if (!newName.trim()) return;

        const token = localStorage.getItem("auth_token");
        try {
            const res = await fetch("http://127.0.0.1:8000/users/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ full_name: newName })
            });

            if (res.ok) {
                setIsEditingName(false);
                // Here we ideally reload the window or refetch user context to show new name immediately
                // For now, simpler alert
                alert("Profile name updated. Please refresh to see changes.");
            } else {
                alert("Failed to update profile name");
            }
        } catch (e) {
            console.error(e);
            alert("Error updating profile");
        }
    }

    const startEdit = (key: string, currentValue: string) => {
        setEditingKey(key);
        setEditValue(currentValue);
    };

    const saveEdit = async () => {
        if (!editingKey) return;

        const token = localStorage.getItem("auth_token");
        try {
            const res = await fetch(`http://127.0.0.1:8000/dashboard/profile/${editingKey}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ value: editValue })
            });

            if (res.ok) {
                setEditingKey(null);
                fetchStats();
            } else {
                console.error("Update failed", res.status);
                alert(t("dashboard.update.fail"));
            }
        } catch (e) {
            console.error("Update failed", e);
            alert(t("dashboard.update.fail"));
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
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-gov-navy)] dark:text-white flex items-center gap-2">
                        <User className="text-[var(--color-gov-saffron)]" /> Profile Fields
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your verified data fields extracted from documents.</p>
                </div>
                <button
                    onClick={handleClearAll}
                    disabled={isClearing || !stats?.stored_data?.length}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Trash2 size={16} />
                    {isClearing ? "Clearing..." : "Clear All"}
                </button>
            </div>

            {/* Main Profile Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 mb-8 flex items-center gap-6">
                <div className="w-16 h-16 bg-[var(--color-gov-navy)] text-white rounded-full flex items-center justify-center text-2xl font-bold">
                    {user?.full_name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                    <h2 className="text-sm text-gray-500 uppercase font-semibold">Full Name</h2>
                    {isEditingName ? (
                        <div className="flex items-center gap-2 mt-1">
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="border rounded px-2 py-1 text-gray-800 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            />
                            <button onClick={handleUpdateName} className="p-1 text-green-600 bg-green-50 rounded hover:bg-green-100"><Check size={16} /></button>
                            <button onClick={() => setIsEditingName(false)} className="p-1 text-red-600 bg-red-50 rounded hover:bg-red-100"><X size={16} /></button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xl font-bold text-gray-800 dark:text-white">{user?.full_name}</span>
                            <button onClick={() => setIsEditingName(true)} className="text-[var(--color-gov-blue)] hover:bg-blue-50 p-1 rounded"><Edit2 size={16} /></button>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                        <thead className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-semibold">
                            <tr>
                                <th className="px-6 py-3">Field Name</th>
                                <th className="px-6 py-3">Value</th>
                                <th className="px-6 py-3">Source</th>
                                <th className="px-6 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {stats?.stored_data?.length > 0 ? (
                                stats.stored_data.map((item: any) => (
                                    <tr key={item.entity_key} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 font-medium capitalize">{item.entity_key.replace(/_/g, " ")}</td>
                                        <td className="px-6 py-4 max-w-xs truncate">
                                            {editingKey === item.entity_key ? (
                                                <input
                                                    type="text"
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    className="w-full px-2 py-1 border rounded bg-white dark:bg-gray-900 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                    autoFocus
                                                />
                                            ) : (
                                                <span title={item.value}>{item.value}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                {item.source}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {editingKey === item.entity_key ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={saveEdit} className="text-green-600 hover:bg-green-50 p-1 rounded">
                                                        <Check size={16} />
                                                    </button>
                                                    <button onClick={() => setEditingKey(null)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => startEdit(item.entity_key, item.value)}
                                                    className="text-blue-600 hover:bg-blue-50 p-1 rounded transition-colors"
                                                    title="Edit Value"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        No saved profile data found.
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
