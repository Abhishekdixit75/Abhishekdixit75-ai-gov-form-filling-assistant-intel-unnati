'use client';

import React from 'react';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-[calc(100vh-theme(spacing.20)-theme(spacing.12))]"> {/* Adjusting height based on header/navstrip */}
            {/* Sidebar */}
            <div className="hidden md:block h-full shadow-xl z-30">
                <Sidebar />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#0b1120] p-4 md:p-8 relative">
                {children}
            </div>
        </div>
    );
}
