"use client";
import { useLanguage } from "@/context/LanguageContext";

export default function ProjectsPage() {
    const { t } = useLanguage();
    const projects = [
        {
            title: t("project.di.title"),
            status: t("project.di.status"),
            desc: t("project.di.desc"),
            tags: ["Infrastructure", "Empowerment"],
            img: "/digital_india.png",
            link: "https://www.digitalindia.gov.in/"
        },
        {
            title: t("project.sc.title"),
            status: t("project.sc.status"),
            desc: t("project.sc.desc"),
            tags: ["Urban", "Development"],
            img: "/smartcity.png",
            link: "https://smartcities.gov.in/"
        },
        {
            title: t("project.bn.title"),
            status: t("project.bn.status"),
            desc: t("project.bn.desc"),
            tags: ["Connectivity", "Rural"],
            img: "/bharat_net.png",
            link: "https://bbnl.nic.in/"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 border-b border-gray-200 dark:border-gray-700 pb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--color-gov-navy)] dark:text-white">{t('projects.title')}</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">{t('projects.subtitle')}</p>
                    </div>
                </div>

                <div className="space-y-8">
                    {projects.map((proj, i) => (
                        <a
                            key={i}
                            href={proj.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col md:flex-row hover:shadow-lg transition-shadow"
                        >
                            <div className="md:w-1/3 h-48 md:h-auto overflow-hidden bg-gray-100 dark:bg-gray-700 relative">
                                <img
                                    src={proj.img}
                                    alt={proj.title}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <div className="p-6 md:w-2/3 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold text-[var(--color-gov-navy)] dark:text-white">{proj.title}</h3>
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full 
                                            ${proj.status === 'Ongoing' ? 'bg-blue-100 text-blue-700' :
                                                proj.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {proj.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300 mb-4">{proj.desc}</p>
                                </div>
                                <div className="flex gap-2">
                                    {proj.tags.map(tag => (
                                        <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded border border-gray-200 dark:border-gray-600">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
