"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GovtEmblem from '@/components/ui/GovtEmblem';
import { Lock, Mail, User, ArrowRight, Loader2 } from "lucide-react";

export default function SignupPage() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        full_name: ""
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const res = await fetch("http://127.0.0.1:8000/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "Registration failed");
            }

            // Redirect to login on success
            router.push("/login?registered=true");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FF9933]/20 via-white to-[#138808]/20 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-2 bg-[#FF9933]" />
            <div className="absolute bottom-0 left-0 w-full h-2 bg-[#138808]" />
            <div className="absolute inset-0 bg-[url('/chakra.png')] bg-center bg-no-repeat opacity-5 bg-[length:600px_600px] pointer-events-none animate-spin-slow" />

            {/* Signup Card */}
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 border-t-8 border-[#138808] relative z-10 m-4">

                {/* Header Logos */}
                <div className="flex justify-center items-center gap-6 mb-8">
                    <img src="/g20.png" alt="G20" className="h-12 object-contain" />
                    <div className="w-px h-10 bg-gray-300 dark:bg-gray-600"></div>
                    <GovtEmblem className="h-16 w-32" />
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-[var(--color-gov-navy)] dark:text-white uppercase tracking-wider">
                        Create Account
                    </h1>
                    <p className="text-sm bg-gradient-to-r from-orange-500 via-blue-600 to-green-600 bg-clip-text text-transparent font-bold mt-2">
                        Start your journey with CitizenAI
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r flex items-start gap-2">
                        <span className="font-bold">Error:</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5 ml-1">Full Name</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[var(--color-gov-green)] transition-colors">
                                <User size={18} />
                            </div>
                            <input
                                type="text"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-[var(--color-gov-green)] focus:border-transparent outline-none transition-all text-sm font-medium"
                                placeholder="Your Name"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5 ml-1">Email Address</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[var(--color-gov-green)] transition-colors">
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-[var(--color-gov-green)] focus:border-transparent outline-none transition-all text-sm font-medium"
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5 ml-1">Password</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[var(--color-gov-green)] transition-colors">
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-[var(--color-gov-green)] focus:border-transparent outline-none transition-all text-sm font-medium"
                                placeholder="Create a password"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[var(--color-gov-green)] hover:bg-green-700 text-white py-3 rounded-md font-bold text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            <>
                                Register Account <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center bg-gray-50 dark:bg-gray-900/50 -mx-8 -mb-8 p-4 border-t border-gray-100 dark:border-gray-700 rounded-b-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Already have an account?{" "}
                        <Link href="/login" className="font-bold text-[var(--color-gov-green)] hover:underline">
                            Sign In
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
