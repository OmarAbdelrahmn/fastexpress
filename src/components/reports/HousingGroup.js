import React, { useState, memo } from 'react';
import { Building, Users } from 'lucide-react';
import RidersTableDesktop from './RidersTableDesktop';
import RidersTableMobile from './RidersTableMobile';

const HousingGroup = ({ housing, t, language, selectedCompany }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-4">
            <div
                className={`bg-gradient-to-r ${isExpanded ? 'from-indigo-600 to-purple-600' : 'from-gray-50 to-gray-100'} px-6 py-4 cursor-pointer hover:shadow-md transition-all`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${isExpanded ? 'bg-white/20' : 'bg-indigo-100'}`}>
                            <Building className={isExpanded ? 'text-white' : 'text-indigo-600'} size={24} />
                        </div>
                        <div>
                            <h3 className={`text-lg font-bold ${isExpanded ? 'text-white' : 'text-gray-800'}`}>
                                {housing.housingName}
                            </h3>
                            <p className={`text-sm ${isExpanded ? 'text-indigo-100' : 'text-gray-500'}`}>
                                {housing.summaryReport?.startDate} - {housing.summaryReport?.endDate}
                                {' '}({housing.summaryReport?.totalExpectedDays} ايام العمل)
                            </p>
                        </div>
                    </div>
                    <span className={`text-xl font-bold transition-transform duration-300 ${isExpanded ? 'text-white rotate-180' : 'text-gray-400'}`}>
                        ▼
                    </span>
                </div>
            </div>

            {isExpanded && housing.summaryReport?.riderSummaries && housing.summaryReport.riderSummaries.length > 0 && (
                <div className="p-6 bg-white border-t border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Users className="text-purple-600" size={20} />
                            {t('riderDetails')} 
                            <span className="bg-purple-100 text-purple-700 py-1 px-3 rounded-full text-sm">
                                {housing.summaryReport.riderSummaries.length}
                            </span>
                        </h4>
                    </div>

                    <RidersTableDesktop 
                        riderSummaries={housing.summaryReport.riderSummaries} 
                        selectedCompany={selectedCompany} 
                        totalExpectedDays={housing.summaryReport?.totalExpectedDays}
                    />
                    
                    <RidersTableMobile 
                        riderSummaries={housing.summaryReport.riderSummaries} 
                        selectedCompany={selectedCompany} 
                        totalExpectedDays={housing.summaryReport?.totalExpectedDays}
                    />
                </div>
            )}
        </div>
    );
};

export default memo(HousingGroup);
