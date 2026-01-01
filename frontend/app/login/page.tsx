"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Lock, Mail, ArrowRight, Eye, EyeOff, Loader2, User } from "lucide-react";
import GovtEmblem from '@/components/ui/GovtEmblem';

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const { login } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const formData = new FormData();
        formData.append("username", username);
        formData.append("password", password);

        try {
            const res = await fetch("http://127.0.0.1:8000/token", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "Login failed");
            }

            const data = await res.json();
            login(data.access_token);
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FF9933]/20 via-white to-[#138808]/20 relative overflow-hidden">
            {/* Background Tricolor Elements */}
            <div className="absolute top-0 left-0 w-full h-2 bg-[#FF9933]" />
            <div className="absolute bottom-0 left-0 w-full h-2 bg-[#138808]" />
            <div className="absolute inset-0 bg-[url('/chakra.png')] bg-center bg-no-repeat opacity-5 bg-[length:600px_600px] pointer-events-none animate-spin-slow" />

            {/* Login Card */}
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 border-t-8 border-[#FF9933] relative z-10 m-4">

                {/* Header Logos */}
                <div className="flex justify-center items-center gap-6 mb-8">
                    <img src="/g20.png" alt="G20" className="h-12 object-contain" />
                    <div className="w-px h-10 bg-gray-300 dark:bg-gray-600"></div>
                    <GovtEmblem className="h-16 w-32" />
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-[var(--color-gov-navy)] dark:text-white uppercase tracking-wider">
                        Welcome Back
                    </h1>
                    <p className="text-sm text-gray-500 mt-2 font-medium">
                        Log in to access Citizen Services
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r flex items-start gap-2">
                        <span className="font-bold">Error:</span> {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5 ml-1">
                            Username
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[var(--color-gov-blue)] transition-colors">
                                <User size={18} />
                            </div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-[var(--color-gov-blue)] focus:border-transparent outline-none transition-all text-sm font-medium"
                                placeholder="Enter your username"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5 ml-1">
                            Password
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[var(--color-gov-blue)] transition-colors">
                                <Lock size={18} />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-12 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-[var(--color-gov-blue)] focus:border-transparent outline-none transition-all text-sm font-medium"
                                placeholder="Enter your password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[var(--color-gov-navy)] hover:bg-[#003366] text-white py-3 rounded-md font-bold text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            <>
                                Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase font-bold">OR</span>
                        <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                    </div>

                    <Link
                        href="/digilocker-info"
                        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border-2 border-[#663399] text-[#663399] dark:text-[#a855f7] dark:border-[#a855f7] rounded-md hover:bg-[#663399]/5 transition-colors font-bold text-sm"
                    >
                        {/* Fake DigiLocker Icon since we don't have the svg handy, usually cloud icon */}
                        Sign In with DigiLocker
                    </Link>
                </form>


                <div className="mt-8 text-center bg-gray-50 dark:bg-gray-900/50 -mx-8 -mb-8 p-4 border-t border-gray-100 dark:border-gray-700 rounded-b-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        New User?{" "}
                        <Link href="/signup" className="font-bold text-[var(--color-gov-blue)] hover:underline">
                            Register Here
                        </Link>
                    </p>
                    <div className="flex items-center justify-center gap-2 opacity-80 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Powered by</span>
                        <img src="/intel_logo.png" alt="Intel" className="h-4 w-auto" />
                    </div>
                </div>
            </div>
        </div>
    );
}
