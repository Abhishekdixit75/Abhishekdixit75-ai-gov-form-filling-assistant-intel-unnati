
'use client';

import React from 'react';
import GovtEmblem from '@/components/ui/GovtEmblem';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';

export default function Footer() {
    const { t } = useLanguage();

    return (
        <footer className="bg-[var(--color-gov-navy)] text-white mt-auto">
            {/* Top Footer */}
            <div className="max-w-[1200px] mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Column 1: About */}
                <div>
                    <h3 className="text-[var(--color-gov-saffron)] font-bold text-lg mb-4">{t('footer.about')}</h3>
                    <p className="text-sm text-white/80 leading-relaxed">
                        {t('footer.desc')}
                    </p>
                </div>

                {/* Column 2: Links */}
                <div>
                    <h3 className="text-[var(--color-gov-saffron)] font-bold text-lg mb-4">{t('footer.links')}</h3>
                    <ul className="space-y-2 text-sm text-white/80">
                        <li><a href="https://www.india.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline transition-all hover:translate-x-1 inline-block">National Portal of India</a></li>
                        <li><a href="https://uidai.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline transition-all hover:translate-x-1 inline-block">UIDAI (Aadhaar)</a></li>
                        <li><Link href="/digilocker-info" className="hover:text-white hover:underline transition-all hover:translate-x-1 inline-block">DigiLocker Integration</Link></li>
                        <li><a href="https://meity.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline transition-all hover:translate-x-1 inline-block">MeitY</a></li>
                    </ul>
                </div>

                {/* Column 3: Contact */}
                <div>
                    <h3 className="text-[var(--color-gov-saffron)] font-bold text-lg mb-4">{t('footer.contact')}</h3>
                    <p className="text-sm text-white/80 leading-relaxed mb-2">
                        Ministry of Electronics & IT<br />
                        Electronics Niketan, 6, CGO Complex<br />
                        Lodhi Road, New Delhi - 110003
                    </p>
                    <p className="text-sm text-white/80">Email: support@meity.gov.in</p>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="bg-[#001732] py-4 border-t border-white/10">
                <div className="max-w-[1200px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <GovtEmblem className="w-8 h-8 opacity-80" />
                        <span className="text-xs text-white/60">© {new Date().getFullYear()} {t('footer.rights')}</span>
                    </div>
                    <div className="text-xs text-white/50">
                        Powered by <span className="text-white/80 font-bold">Intel Unnati</span>
                        <img src="/intel_logo.png" alt="Intel Logo" className="h-6 w-auto inline-block ml-2 bg-white px-1 py-0.5 rounded" />
                    </div>
                </div>
            </div>
        </footer>
    );
}
