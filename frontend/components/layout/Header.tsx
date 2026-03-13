"use client";

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Search, Menu, User, Globe, Moon, Sun, Monitor } from 'lucide-react';
import DarkModeToggle from '@/components/ui/DarkModeToggle';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SearchBar from '@/components/ui/SearchBar';

export default function Header() {
    const { t, language, toggleLanguage } = useLanguage();
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const pathname = usePathname();

    // Top Strip Components
    const TopStrip = () => (
        <div className="bg-[#f1f1f1] dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 text-[10px] py-0.5 px-4 hidden md:block">
            <div className="max-w-[1400px] mx-auto flex justify-between items-center text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{t('header.title')}</span>
                        <span className="h-3 w-px bg-gray-300 dark:bg-gray-700"></span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{t('header.subtitle')}</span>
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    <a href="#skip" className="hover:text-[var(--color-gov-blue)] transition-colors">Skip to Main Content</a>
                    <span className="h-3 w-px bg-gray-300 dark:bg-gray-700"></span>
                    <button
                        className="flex items-center gap-2 cursor-pointer hover:text-[var(--color-gov-blue)] transition-colors"
                        onClick={toggleLanguage}
                        aria-label="Toggle Language"
                    >
                        <Globe size={14} />
                        <span className="font-bold">{language === 'en' ? 'English' : 'हिंदी'}</span>
                    </button>
                    <span className="h-3 w-px bg-gray-300 dark:bg-gray-700"></span>
                    <DarkModeToggle />
                </div>
            </div>
        </div>
    );

    // Main Header Component
    const MainHeader = () => (
        <div className="bg-white dark:bg-[#111827] shadow-sm py-1.5 px-4 relative z-20">
            <div className="max-w-[1400px] mx-auto flex items-center justify-between">
                {/* Visual Identity Left */}
                <div className="flex items-center gap-4 md:gap-8">
                    {/* G20 Logo */}
                    <Link href="/" className="h-6 md:h-8 w-auto hidden sm:block">
                        <img src="/g20.png" alt="G20 India" className="h-full w-auto object-contain" />
                    </Link>
                    {/* Emblem & Ministry */}
                    <Link href="/" className="flex items-center gap-3 md:gap-4 group">
                        <img
                            src="/emblem.png"
                            alt="Satyamev Jayate"
                            className="h-8 md:h-10 w-auto object-contain drop-shadow-sm group-hover:drop-shadow-md transition-all"
                        />
                        <div className="flex flex-col justify-center">
                            <span className="text-xs md:text-sm font-bold text-[var(--color-gov-navy)] dark:text-white leading-tight">
                                {t('header.title')}
                            </span>
                            <span className="text-[8px] md:text-[9px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                {t('header.subtitle')}
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Right Side: Logos & Search */}
                <div className="flex items-center gap-4 md:gap-8">
                    {/* Azadi / Gov Logo */}
                    <Link href="/" className="hidden md:block h-7 w-auto">
                        <img src="/azadi.png" alt="Azadi Ka Amrit Mahotsav" className="h-full w-auto object-contain bg-white dark:bg-transparent rounded-sm px-1" />
                    </Link>

                    {/* Intel Branding */}
                    <div className="hidden md:flex items-center gap-2 border-l border-gray-300 dark:border-gray-700 pl-4">
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest leading-none">Powered<br />by</span>
                        <img src="/intel_logo.png" alt="Intel" className="h-8 w-auto bg-white p-0.5 rounded-sm object-contain" />
                    </div>



                    {/* Search Bar - Desktop */}
                    <div className="hidden lg:block w-96">
                        <SearchBar />
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="lg:hidden p-2 text-[var(--color-gov-navy)] dark:text-white"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <Menu size={24} />
                    </button>
                </div>
            </div>
        </div>
    );

    // Navigation Strip
    const NavStrip = () => (
        <div className="bg-[var(--color-gov-navy)] dark:bg-gray-900 border-t border-white/10 text-white shadow-md relative z-10">
            <div className="max-w-[1400px] mx-auto px-4 h-12 flex items-center justify-between">
                <nav className="hidden lg:flex items-center gap-1 h-full">
                    {[
                        { k: 'nav.home', path: '/' },
                        { k: 'nav.about', path: '/about' },
                        { k: 'nav.services', path: '/services' },
                        { k: 'nav.projects', path: '/projects' },
                        { k: 'nav.media', path: '/media' },
                        { k: 'nav.contact', path: '/contact' }
                    ].map((item, idx) => (
                        <Link
                            key={idx}
                            href={item.path}
                            className={`
                                h-full flex items-center px-4 text-base font-bold transition-colors
                                ${pathname === item.path
                                    ? 'bg-[var(--color-gov-saffron)] text-white shadow-inner'
                                    : 'hover:bg-white/10 text-white/90 hover:text-white'}
                            `}
                        >
                            {t(item.k)}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center bg-black/20 rounded ml-auto h-8 px-1">
                    {!user ? (
                        <>
                            <Link href="/login" className="flex items-center gap-2 px-3 py-1 text-sm font-bold hover:text-[var(--color-gov-saffron)] transition-colors border-r border-white/10 uppercase tracking-wide">
                                {t('nav.login')}
                            </Link>
                            <Link href="/signup" className="flex items-center gap-2 px-3 py-1 text-sm font-bold hover:text-[var(--color-gov-saffron)] transition-colors uppercase tracking-wide">
                                {t('nav.register')}
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/dashboard" className="flex items-center gap-2 px-3 py-1 text-sm font-bold hover:text-[var(--color-gov-saffron)] transition-colors border-r border-white/10 uppercase tracking-wide">
                                {t('nav.dashboard')}
                            </Link>
                            <button onClick={logout} className="flex items-center gap-2 px-3 py-1 text-sm font-bold text-red-200 hover:text-red-400 transition-colors uppercase tracking-wide">
                                {t('nav.logout')}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <header className="flex flex-col w-full sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-md">
            <TopStrip />
            <MainHeader />
            <NavStrip />

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="lg:hidden absolute top-full left-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-xl p-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
                    <nav className="flex flex-col gap-2">
                        {['Home', 'About Us', 'Services', 'Projects', 'Media', 'Contact'].map((item) => (
                            <Link key={item} href={`/${item.toLowerCase().replace(' ', '')}`} className="py-2 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded font-medium text-gray-800 dark:text-gray-200">
                                {item}
                            </Link>
                        ))}
                    </nav>

                    {/* Mobile Auth Buttons */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex flex-col gap-3">
                        {!user ? (
                            <div className="flex gap-4">
                                <Link
                                    href="/login"
                                    className="flex-1 text-center py-2 bg-gray-100 dark:bg-gray-800 rounded text-gray-800 dark:text-white font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/signup"
                                    className="flex-1 text-center py-2 bg-[var(--color-gov-saffron)] rounded text-white font-semibold hover:brightness-110 transition"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Register
                                </Link>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 px-2 py-2 text-gray-600 dark:text-gray-400 text-sm">
                                    <User size={16} />
                                    <span>Signed in as <strong>{user.full_name || user.email}</strong></span>
                                </div>
                                <Link
                                    href="/dashboard"
                                    className="w-full text-center py-2 bg-[var(--color-gov-navy)] rounded text-white font-semibold hover:bg-blue-900 transition"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Go to Dashboard
                                </Link>
                                <button
                                    onClick={() => {
                                        logout();
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full text-center py-2 border border-red-200 text-red-600 rounded font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <DarkModeToggle />
                            <button onClick={toggleLanguage} className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-300">
                                <Globe size={16} /> {language.toUpperCase()}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}


