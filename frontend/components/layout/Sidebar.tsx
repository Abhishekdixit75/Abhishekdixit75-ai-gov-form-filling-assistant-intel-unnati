'use client';

import React from 'react';
import { LayoutDashboard, FileText, UserCircle, Briefcase, Settings, LogOut, ChevronRight, Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function Sidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();
    const [isCollapsed, setIsCollapsed] = React.useState(false);

    const { t } = useLanguage();
    const navItems = [
        { name: t('nav.dashboard'), icon: LayoutDashboard, path: '/dashboard' },
        { name: t('nav.profile'), icon: UserCircle, path: '/dashboard/profile' },
        { name: t('nav.applications'), icon: FileText, path: '/dashboard/applications' },
        { name: t('nav.services'), icon: Briefcase, path: '/dashboard/services' },
        { name: t('nav.settings'), icon: Settings, path: '/dashboard/settings' },
    ];

    return (
        <aside className={`flex flex-col h-full bg-[var(--color-gov-navy)] text-white transition-all duration-300 relative ${isCollapsed ? 'w-16' : 'w-64'}`}>
            {/* Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-6 bg-[var(--color-gov-saffron)] rounded-full p-1 text-white shadow-md z-20 hover:scale-110 transition-transform"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <Menu size={14} />}
            </button>

            {/* Menu Items */}
            <div className="flex-1 py-6 overflow-y-auto">
                <div className="px-3 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`
                                    flex items-center gap-3 px-3 py-3 rounded-md transition-all group
                                    ${isActive
                                        ? 'bg-white/10 text-[var(--color-gov-saffron)] shadow-sm'
                                        : 'text-white/70 hover:bg-white/5 hover:text-white'}
                                `}
                            >
                                <item.icon size={20} className={`${isActive ? 'text-[var(--color-gov-saffron)]' : ''}`} />
                                {!isCollapsed && (
                                    <span className="text-sm font-medium tracking-wide">
                                        {item.name}
                                    </span>
                                )}
                            </Link>
                        )
                    })}
                </div>
            </div>

            {/* Footer / Profile Snippet */}
            <button
                onClick={logout}
                className={`flex items-center gap-3 text-white/70 hover:text-white transition-colors w-full ${isCollapsed ? 'justify-center' : ''}`}
            >
                <LogOut size={18} />
                {!isCollapsed && <span className="text-sm font-medium">{t('dashboard.signout')}</span>}
            </button>

            {/* Branding */}
            <div className={`p-4 bg-[var(--color-gov-navy)] border-t border-white/10 ${isCollapsed ? 'hidden' : 'block'}`}>
                <div className="flex items-center justify-center gap-2 opacity-80">
                    <span className="text-xs text-white/60">Powered by</span>
                    <img src="/intel_logo.png" alt="Intel" className="h-5 w-auto bg-white px-1 py-0.5 rounded" />
                </div>
            </div>
        </aside >
    );
}
