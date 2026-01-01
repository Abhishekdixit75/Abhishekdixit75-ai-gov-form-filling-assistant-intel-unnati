"use client";

import { Settings, Bell, Lock, User } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; // Import useAuth to get user info for feedback

export default function SettingsPage() {
    const router = useRouter();
    const { user } = useAuth(); // Assuming useAuth provides current user, though strictly not needed for the API call if token is in localstorage
    const [emailAlerts, setEmailAlerts] = useState(true);

    // Password Change State
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const handleChangePassword = () => {
        setOldPassword("");
        setNewPassword("");
        setShowPasswordModal(true);
    };

    const submitPasswordChange = async () => {
        if (!oldPassword || !newPassword) {
            alert("Please fill in both fields");
            return;
        }

        setIsChangingPassword(true);
        const token = localStorage.getItem("auth_token");
        try {
            const res = await fetch("http://127.0.0.1:8000/users/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ old_password: oldPassword, new_password: newPassword })
            });

            if (res.ok) {
                alert("Password updated successfully");
                setShowPasswordModal(false);
            } else {
                const data = await res.json();
                alert(data.detail || "Failed to update password");
            }
        } catch (e) {
            console.error(e);
            alert("An error occurred");
        } finally {
            setIsChangingPassword(false);
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[var(--color-gov-navy)] dark:text-white flex items-center gap-2">
                    <Settings className="text-[var(--color-gov-saffron)]" /> Account Settings
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your preferences and security settings.</p>
            </div>

            <div className="space-y-6 max-w-2xl">
                {/* Profile Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                        <User className="text-gray-400" size={20} />
                        <h3 className="font-bold text-gray-800 dark:text-white">Profile Information</h3>
                    </div>
                    <div className="p-6">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Update your personal details and contact info.</p>
                        <button
                            onClick={() => router.push('/dashboard/profile')}
                            className="text-sm font-semibold text-[var(--color-gov-blue)] border border-[var(--color-gov-blue)] px-4 py-2 rounded hover:bg-blue-50 transition-colors"
                        >
                            Edit Profile
                        </button>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                        <Bell className="text-gray-400" size={20} />
                        <h3 className="font-bold text-gray-800 dark:text-white">Notifications</h3>
                    </div>
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Email Alerts</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Receive updates about your application status.</p>
                            </div>
                            <button
                                onClick={() => setEmailAlerts(!emailAlerts)}
                                className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${emailAlerts ? 'bg-[var(--color-gov-navy)]' : 'bg-gray-300'}`}
                            >
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${emailAlerts ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Security Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                        <Lock className="text-gray-400" size={20} />
                        <h3 className="font-bold text-gray-800 dark:text-white">Security</h3>
                    </div>
                    <div className="p-6">
                        <button
                            onClick={handleChangePassword}
                            disabled={isChangingPassword}
                            className="text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                        >
                            {isChangingPassword ? "Updating..." : "Change Password"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
                        <h3 className="text-xl font-bold text-[var(--color-gov-navy)] dark:text-white mb-4">Change Password</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                                <input
                                    type="password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitPasswordChange}
                                className="px-4 py-2 bg-[var(--color-gov-navy)] text-white font-medium rounded hover:bg-blue-900"
                            >
                                Update Password
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
