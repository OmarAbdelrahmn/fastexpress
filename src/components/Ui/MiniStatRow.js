'use client';
import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function MiniStatRow({
    icon: Icon,
    title,
    description,
    onClick,
    color = "#2563eb", // Default blue
    bgClass = "bg-white", // Default background
    className = ""
}) {
    // Helper for background color with opacity (approx 10%)
    const getBgStyle = (hexColor) => ({
        backgroundColor: `${hexColor}1A` // 1A is ~10% opacity in hex
    });

    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between p-3 ${bgClass} border border-gray-100 rounded-xl shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group text-right hover:border-blue-100 mb-2 last:mb-0 ${className}`}
        >
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg transition-colors" style={getBgStyle(color)}>
                    <Icon size={20} color={color} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-sm md:text-base">{title}</h3>
                    {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
                </div>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                <ChevronRight size={16} color="#000" className="rtl:rotate-180" />
            </div>
        </button>
    );
}
