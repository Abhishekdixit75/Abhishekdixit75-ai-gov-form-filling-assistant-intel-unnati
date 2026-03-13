"use client";

import { AlertTriangle, Lock, ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export default function DigiLockerInfoPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 flex items-center justify-center">
            <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="bg-[var(--color-gov-navy)] p-6 text-center">
                    <div className="mx-auto bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                        <Lock className="text-[var(--color-gov-saffron)] w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">DigiLocker Integration Status</h1>
                    <p className="text-blue-100 text-sm">Why is live connectivity not available?</p>
                </div>

                <div className="p-8 space-y-6">
                    <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-[var(--color-gov-saffron)] p-4 rounded-r">
                        <div className="flex gap-3">
                            <AlertTriangle className="text-[var(--color-gov-saffron)] flex-shrink-0" />
                            <div>
                                <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm mb-1">Restricted Access API</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    DigiLocker APIs are <strong>restricted government resources</strong>. Access is strictly limited to registered partners and government agencies.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">Technical Requirements Missing:</h2>

                        <div className="flex items-start gap-3">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs font-bold mt-0.5">1</span>
                            <div>
                                <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm">Partner Registration</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Requires official onboarding and approval by the National e-Governance Division (NeGD).</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs font-bold mt-0.5">2</span>
                            <div>
                                <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm">Client Credentials</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Valid <code>CLIENT_ID</code> and <code>CLIENT_SECRET</code> are mandated for OAuth 2.0 token exchange.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs font-bold mt-0.5">3</span>
                            <div>
                                <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm">Whitelisted IP/Domain</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">API calls are blocked from unauthorized domains and local development environments without prior auditing.</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-center">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 px-6 py-2 bg-[var(--color-gov-navy)] text-white rounded hover:bg-blue-900 transition-colors font-medium text-sm"
                        >
                            <ArrowLeft size={16} /> Return to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
