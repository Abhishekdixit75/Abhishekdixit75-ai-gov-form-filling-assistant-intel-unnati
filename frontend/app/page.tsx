
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { FileText, ArrowRight, Loader2, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { useLanguage } from '@/context/LanguageContext';

export default function Home() {
  const router = useRouter();
  const [forms, setForms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedForm, setSelectedForm] = useState<string | null>(null);

  useEffect(() => {
    api.listForms()
      .then((data) => setForms(data.forms || []))
      .catch((err) => {
        console.error("Failed to load forms", err);
        // Fallback for demo/offline
        setForms(['income_certificate', 'domicile_certificate', 'birth_certificate']);
      });
  }, []);

  const handleStart = async () => {
    if (!selectedForm) return;
    setLoading(true);
    try {
      const data = await api.initSession(selectedForm);
      if (data.session_id) {
        localStorage.setItem(`session_${data.session_id}_reqs`, JSON.stringify(data.required_documents));
        localStorage.setItem(`session_${data.session_id}_form`, selectedForm);
        router.push(`/session/${data.session_id}/upload`);
      }
    } catch (e) {
      alert("Failed to start session");
      setLoading(false);
    }
  };

  const getFormTitle = (key: string) => {
    return key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const { t } = useLanguage();

  /* Dynamic Quote Logic */
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setQuoteIndex((prev) => (prev + 1) % 4);
        setFade(true);
      }, 300); // Wait for fade out
    }, 4000); // Change every 4 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* HERO SECTION */}
      <div className="bg-[var(--color-gov-navy)] text-white relative overflow-hidden">
        {/* Subtle Government Doodles Background */}
        <div className="absolute inset-0 bg-doodle pointer-events-none"></div>

        {/* User Requested Watermark Image */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: "url('/image.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat"
          }}
        ></div>

        {/* Abstract Tricolor Background Elements */}
        <div className="absolute top-0 left-0 w-full h-2 bg-[var(--color-gov-saffron)] opacity-80"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500 rounded-full blur-[100px] opacity-10 pointer-events-none translate-x-1/2 -translate-y-1/2 animate-float"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-600 rounded-full blur-[100px] opacity-10 pointer-events-none -translate-x-1/2 translate-y-1/2 animate-float" style={{ animationDelay: '2s' }}></div>

        <div className="max-w-[1200px] mx-auto px-4 py-20 lg:py-28 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm font-medium mb-6 backdrop-blur-sm hover:scale-105 transition-transform cursor-default min-w-[200px] justify-center">
            <Sparkles size={16} className="text-[var(--color-gov-saffron)]" />
            <span className={`transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'}`}>
              {t(`home.pill.${quoteIndex}`)}
            </span>
          </div>

          <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            <br />
            <span className={`text-[var(--color-gov-saffron)] inline-block transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'} pr-2`}>
              {t(`home.hero.title.highlight.${quoteIndex}`)}
            </span>
          </h1>

          <p className="text-lg lg:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t('home.hero.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-[var(--color-gov-saffron)] hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-orange-500/20 transition-all active:scale-95 hover:-translate-y-1"
            >
              {t('home.btn.start')}
            </button>
            <button
              onClick={() => router.push('/how-it-works')}
              className="bg-transparent border border-white/30 hover:bg-white/10 text-white font-semibold py-3 px-8 rounded-lg transition-all hover:-translate-y-1"
            >
              {t('home.btn.learn')}
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-[1200px] mx-auto px-4 py-16" id="services">

        {/* FEATURES */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="p-8 bg-white dark:bg-[#1e293b] rounded-xl shadow-sm hover:shadow-md border-t-4 border-[var(--color-gov-navy)] transition-all group">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 text-[var(--color-gov-navy)] dark:text-blue-300 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('home.feature.verify')}</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{t('home.feature.verify.desc')}</p>
          </div>

          <div className="p-8 bg-white dark:bg-[#1e293b] rounded-xl shadow-sm hover:shadow-md border-t-4 border-[var(--color-gov-saffron)] transition-all group">
            <div className="w-14 h-14 bg-orange-50 dark:bg-orange-900/20 text-[var(--color-gov-saffron)] rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('home.feature.autofill')}</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{t('home.feature.autofill.desc')}</p>
          </div>

          <div className="p-8 bg-white dark:bg-[#1e293b] rounded-xl shadow-sm hover:shadow-md border-t-4 border-[var(--color-gov-green)] transition-all group">
            <div className="w-14 h-14 bg-green-50 dark:bg-green-900/20 text-[var(--color-gov-green)] rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FileText size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('home.feature.instant')}</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{t('home.feature.instant.desc')}</p>
          </div>
        </div>

        {/* SELECTION AREA */}
        <div className="bg-white dark:bg-[#1e293b] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-8 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <h2 className="text-2xl font-bold text-[var(--color-gov-navy)] dark:text-gray-100">{t('home.select.title')}</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{t('home.select.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 p-8">
            {forms.map((formKey) => (
              <div
                key={formKey}
                onClick={() => setSelectedForm(formKey)}
                className={`group relative p-6 rounded-lg border-2 transition-all cursor-pointer flex items-center gap-5 hover:shadow-md
                            ${selectedForm === formKey
                    ? "border-[var(--color-gov-navy)] bg-blue-50/30 dark:bg-blue-900/10 ring-1 ring-[var(--color-gov-navy)]"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-700"}`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors
                            ${selectedForm === formKey ? 'bg-[var(--color-gov-navy)] text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-[var(--color-gov-navy)]'}`}>
                  <FileText size={24} />
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold text-lg transition-colors ${selectedForm === formKey ? 'text-[var(--color-gov-navy)] dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'}`}>
                    {getFormTitle(formKey)}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium uppercase tracking-wide">State Dept. Function</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                            ${selectedForm === formKey ? 'border-[var(--color-gov-navy)] dark:border-blue-400 bg-[var(--color-gov-navy)] dark:bg-blue-400' : 'border-gray-300 dark:border-gray-600'}`}>
                  {selectedForm === formKey && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex justify-end">
            <button
              onClick={handleStart}
              disabled={!selectedForm || loading}
              className="bg-[var(--color-gov-navy)] hover:bg-blue-900 text-white py-3 px-8 rounded-lg font-bold text-lg flex items-center gap-3 transition-all shadow-lg active:scale-95 disabled:opacity-70 disabled:grayscale disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Proceed to Apply"}
              {!loading && <ArrowRight size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
