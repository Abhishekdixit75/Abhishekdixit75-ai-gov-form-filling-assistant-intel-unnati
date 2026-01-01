"use client";
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function ContactPage() {
    const { t } = useLanguage();
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-[var(--color-gov-navy)] dark:text-white mb-2">{t('contact.title')}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{t('contact.subtitle')}</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Contact Info Cards */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-l-4 border-[var(--color-gov-blue)]">
                            <div className="flex items-start gap-4">
                                <MapPin className="text-[var(--color-gov-blue)] mt-1" />
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">{t('contact.office')}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {t('contact.address.line1')}<br />
                                        {t('contact.address.line2')}<br />
                                        {t('contact.address.line3')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-l-4 border-[var(--color-gov-green)]">
                            <div className="flex items-start gap-4">
                                <Phone className="text-[var(--color-gov-green)] mt-1" />
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">{t('contact.helpline')}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {t('contact.phone.tollfree')}<br />
                                        {t('contact.phone.support')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-l-4 border-[var(--color-gov-saffron)]">
                            <div className="flex items-start gap-4">
                                <Clock className="text-[var(--color-gov-saffron)] mt-1" />
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">{t('contact.hours')}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {t('contact.hours.days')}<br />
                                        {t('contact.hours.closed')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-[var(--color-gov-navy)] dark:text-white mb-6">{t('contact.form.title')}</h2>
                        <form className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('contact.label.name')}</label>
                                    <input type="text" className="w-full px-4 py-3 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-[var(--color-gov-blue)] outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('contact.label.email')}</label>
                                    <input type="email" className="w-full px-4 py-3 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-[var(--color-gov-blue)] outline-none transition-all" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('contact.label.subject')}</label>
                                <select className="w-full px-4 py-3 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-[var(--color-gov-blue)] outline-none transition-all">
                                    <option>Select a Topic</option>
                                    <option>General Query</option>
                                    <option>Technical Support</option>
                                    <option>Feedback</option>
                                    <option>Complaint</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('contact.label.message')}</label>
                                <textarea rows={4} className="w-full px-4 py-3 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-[var(--color-gov-blue)] outline-none transition-all"></textarea>
                            </div>
                            <button type="submit" className="bg-[var(--color-gov-navy)] hover:bg-blue-900 text-white font-bold py-3 px-8 rounded shadow-lg transition-transform active:scale-95">
                                {t('contact.btn.send')}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
