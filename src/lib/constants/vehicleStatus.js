import {
    CheckCircle,
    Users,
    AlertTriangle,
    Shield,
    PackageX,
    Car,
} from "lucide-react";

export const VehicleStatusType = {
    Taken: 1,
    Returned: 2, // Equivalent to Available
    Problem: 3,
    Stolen: 4,
    BreakUp: 5,
};

export const normalizeVehicleStatus = (status) => {
    if (typeof status === "number") return status;
    if (!status) return VehicleStatusType.Returned; // Default to Available/Returned if undefined logic allows

    const lowerStatus = String(status).toLowerCase().trim();

    if (lowerStatus === "taken") return VehicleStatusType.Taken;
    if (lowerStatus === "returned" || lowerStatus === "available") return VehicleStatusType.Returned;
    if (lowerStatus === "problem") return VehicleStatusType.Problem;
    if (lowerStatus === "stolen") return VehicleStatusType.Stolen;
    if (lowerStatus === "breakup" || lowerStatus === "break-up") return VehicleStatusType.BreakUp;

    // Attempt to parse if it's a string number "1"
    const parsed = parseInt(status, 10);
    return isNaN(parsed) ? null : parsed;
};

export const getVehicleStatusAttributes = (statusType, t) => {
    const normalizedStatus = normalizeVehicleStatus(statusType);

    switch (normalizedStatus) {
        case VehicleStatusType.Taken:
            return {
                key: "taken",
                label: t ? t('vehicles.statusTaken') : "Taken", // Fallback if t not provided
                color: "indigo",
                icon: Users,
                styles: {
                    bg: "bg-indigo-50",
                    border: "border-indigo-200",
                    text: "text-indigo-600",
                    badge: "bg-indigo-600",
                },
            };
        case VehicleStatusType.Returned: // Available
            return {
                key: "available",
                label: t ? t('vehicles.statusAvailable') : "Available",
                color: "green",
                icon: CheckCircle,
                styles: {
                    bg: "bg-green-50",
                    border: "border-green-200",
                    text: "text-green-600",
                    badge: "bg-green-600",
                },
            };
        case VehicleStatusType.Problem:
            return {
                key: "problem",
                label: t ? t('vehicles.statusProblem') : "Problem",
                color: "orange",
                icon: AlertTriangle,
                styles: {
                    bg: "bg-orange-50",
                    border: "border-orange-200",
                    text: "text-orange-600",
                    badge: "bg-orange-600",
                },
            };
        case VehicleStatusType.Stolen:
            return {
                key: "stolen",
                label: t ? t('vehicles.statusStolen') : "Stolen",
                color: "red",
                icon: Shield,
                styles: {
                    bg: "bg-red-50",
                    border: "border-red-200",
                    text: "text-red-600",
                    badge: "bg-red-600",
                },
            };
        case VehicleStatusType.BreakUp:
            return {
                key: "breakup",
                label: t ? t('vehicles.statusBreakup') : "BreakUp",
                color: "gray",
                icon: PackageX,
                styles: {
                    bg: "bg-gray-50",
                    border: "border-gray-200",
                    text: "text-gray-600",
                    badge: "bg-gray-600",
                },
            };
        default:
            return {
                key: "unknown",
                label: t ? t('common.unknown') : "Unknown",
                color: "gray",
                icon: Car,
                styles: {
                    bg: "bg-gray-50",
                    border: "border-gray-200",
                    text: "text-gray-600",
                    badge: "bg-gray-600",
                },
            };
    }
};
