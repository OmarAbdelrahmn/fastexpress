import React, { memo } from 'react';

const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white rounded-xl shadow-md p-6 border-t-4" style={{ borderTopColor: color }}>
        <div className="flex items-center justify-between">
            <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">{title}</p>
                <p className="text-3xl font-bold" style={{ color }}>{value}</p>
            </div>
            <Icon size={40} style={{ color }} className="opacity-80" />
        </div>
    </div>
);

export default memo(StatCard);
