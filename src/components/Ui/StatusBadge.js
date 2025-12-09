/**
 * StatusBadge Component
 * Displays employee/rider status with appropriate colors and Arabic labels
 * 
 * Status Colors:
 * - enable (نشط): Green - Active/Working
 * - disable (غير نشط): Red - Inactive
 * - fleeing (هارب): Dark Red/Crimson - Critical situation
 * - vacation (إجازة): Blue - Temporary absence
 * - accident (حادث): Orange - Medical leave due to accident
 * - sick (مريض): Yellow/Amber - Medical leave due to illness
 */

export default function StatusBadge({ status }) {
    const statusConfig = {
        enable: {
            label: 'نشط',
            bgColor: 'bg-green-100',
            textColor: 'text-green-800',
        },
        disable: {
            label: 'غير نشط',
            bgColor: 'bg-red-100',
            textColor: 'text-red-800',
        },
        fleeing: {
            label: 'هارب',
            bgColor: 'bg-rose-100',
            textColor: 'text-rose-800',
        },
        vacation: {
            label: 'إجازة',
            bgColor: 'bg-blue-100',
            textColor: 'text-blue-800',
        },
        accident: {
            label: 'حادث',
            bgColor: 'bg-orange-100',
            textColor: 'text-orange-800',
        },
        sick: {
            label: 'مريض',
            bgColor: 'bg-yellow-100',
            textColor: 'text-yellow-800',
        },
    };

    const config = statusConfig[status] || statusConfig.disable;

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
            {config.label}
        </span>
    );
}
