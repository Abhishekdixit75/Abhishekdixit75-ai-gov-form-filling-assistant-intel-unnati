'use client';

import React from 'react';
import { FileText, User, ShieldCheck, Upload, AlertCircle, Trash2, Edit } from 'lucide-react';

interface StatCardProps {
    title: string;
    subtext: string;
    icon: React.ElementType;
    colorClass: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, subtext, icon: Icon, colorClass }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex items-start gap-4 card-hover">
            <div className={`p-3 rounded-full ${colorClass} bg-opacity-10`}>
                <Icon size={24} className={colorClass.replace('bg-', 'text-')} />
            </div>
            <div>
                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{subtext}</p>
            </div>
        </div>
    );
};

export const StatusTable = () => {
    const data = [
        { number: 'DC71176-0795', app: 'Althedhot Driot', date: '11/1/2055', status: 'Licaneut', statusColor: 'bg-orange-100 text-orange-600' },
        { number: 'DC71176-0795', app: 'Althedhot Driot', date: '11/1/2055', status: 'Femisad', statusColor: 'bg-green-100 text-green-600' },
        { number: 'DC71176-0795', app: 'Althedhot Driot', date: '11/1/2055', status: 'Gembosi', statusColor: 'bg-red-100 text-red-600' },
        { number: 'DC71176-0795', app: 'Althedhot Driot', date: '11/1/2055', status: 'Pembosi', statusColor: 'bg-green-100 text-green-600' },
    ];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">Data Tables</h3>
                <input
                    type="text"
                    placeholder="Search"
                    className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm bg-gray-50 dark:bg-gray-900"
                />
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                    <thead className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-semibold">
                        <tr>
                            <th className="px-6 py-3">Number</th>
                            <th className="px-6 py-3">Application ot</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {data.map((row, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="px-6 py-4 font-medium">{row.number}</td>
                                <td className="px-6 py-4">{row.app}</td>
                                <td className="px-6 py-4">{row.date}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${row.statusColor}`}>
                                        {row.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button className="text-green-600 hover:bg-green-50 p-1 rounded"><ShieldCheck size={18} /></button>
                                        <button className="text-blue-600 hover:bg-blue-50 p-1 rounded"><Edit size={18} /></button>
                                        <button className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
                <button className="px-3 py-1 border rounded hover:bg-gray-50 text-sm">Previous</button>
                <button className="px-3 py-1 bg-[var(--color-gov-navy)] text-white rounded text-sm">1</button>
                <button className="px-3 py-1 border rounded hover:bg-gray-50 text-sm">Next</button>
            </div>
        </div>
    );
};
