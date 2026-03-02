"use client";

import { useState, useEffect } from "react";
import { ApiService } from "@/lib/api/apiService";
import Modal from "@/components/Ui/Model";
import Alert from "@/components/Ui/Alert";
import { useLanguage } from "@/lib/context/LanguageContext";
import { Save, Loader2 } from "lucide-react";

export default function ConfigModal({ isOpen, onClose }) {
    const { t, language } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [formData, setFormData] = useState({
        targetOrdersPerDay: 0,
        targetHoursPerDay: 0,
        minWorkingHoursPerDay: 0,
        fullMonthTargetOrders: 0,
        firstCriticalDaysCount: 0,
        lastCriticalDaysCount: 0,
        maxStartDayForExistingRiders: 0,
        allowedMissingDays28: 0,
        allowedMissingDays29: 0,
        allowedMissingDays30: 0,
        allowedMissingDays31: 0,
        sundayIsSpecialDay: false,
        mondayIsSpecialDay: false,
        tuesdayIsSpecialDay: false,
        wednesdayIsSpecialDay: false,
        thursdayIsSpecialDay: false,
        fridayIsSpecialDay: false,
        saturdayIsSpecialDay: false,
        thursdayIsCriticalDay: false,
        criticalDaysOfMonth: []
    });

    useEffect(() => {
        if (isOpen) {
            fetchConfig();
            setErrorMessage("");
            setSuccessMessage("");
        }
    }, [isOpen]);

    const fetchConfig = async () => {
        setLoading(true);
        setErrorMessage("");
        try {
            const response = await ApiService.get("/api/Report/config/validation");
            if (response) {
                setFormData(response);
            }
        } catch (error) {
            console.error("Failed to fetch keta validation config:", error);
            setErrorMessage(t('common.error') || "Failed to fetch configuration");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'criticalDaysOfMonth') {
            // Convert comma-separated string to array of numbers
            const daysArray = value
                .split(',')
                .map(day => day.trim())
                .filter(day => day !== '' && !isNaN(day))
                .map(Number);

            setFormData(prev => ({
                ...prev,
                [name]: daysArray
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrorMessage("");
        setSuccessMessage("");
        try {
            await ApiService.put("/api/Report/config/validation", formData);
            setSuccessMessage(t('common.success') || "Configuration saved successfully");
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (error) {
            console.error("Failed to update keta validation config:", error);
            setErrorMessage(t('common.error') || "Failed to save configuration");
        } finally {
            setSaving(false);
        }
    };

    const NumberInput = ({ label, name }) => (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <input
                type="number"
                name={name}
                value={formData[name] ?? 0}
                onChange={handleChange}
                step="any"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
        </div>
    );

    const CheckboxInput = ({ label, name }) => (
        <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors">
            <input
                type="checkbox"
                name={name}
                checked={formData[name] ?? false}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-700 select-none">{label}</span>
        </label>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={t('keta.validation.settings.title')}
            size="xl"
            dir={language === 'ar' ? 'rtl' : 'ltr'}
        >
            <div className="space-y-4">
                {errorMessage && (
                    <Alert
                        type="error"
                        title={t("common.error") || "Error"}
                        message={errorMessage}
                        onClose={() => setErrorMessage("")}
                    />
                )}

                {successMessage && (
                    <Alert
                        type="success"
                        title={t("common.success") || "Success"}
                        message={successMessage}
                        onClose={() => setSuccessMessage("")}
                    />
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                        <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-600" />
                        <p>{t('common.loading') || "Loading..."}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="col-span-1 md:col-span-2 lg:col-span-3">
                                <h4 className="font-bold text-gray-900 border-b pb-2 mb-2">{t('keta.validation.settings.primaryTargets')}</h4>
                            </div>
                            <NumberInput label={t('keta.validation.settings.targetOrdersPerDay')} name="targetOrdersPerDay" />
                            <NumberInput label={t('keta.validation.settings.targetHoursPerDay')} name="targetHoursPerDay" />
                            <NumberInput label={t('keta.validation.settings.minWorkingHoursPerDay')} name="minWorkingHoursPerDay" />
                            <NumberInput label={t('keta.validation.settings.fullMonthTargetOrders')} name="fullMonthTargetOrders" />

                            <div className="col-span-1 md:col-span-2 lg:col-span-3 mt-4">
                                <h4 className="font-bold text-gray-900 border-b pb-2 mb-2">{t('keta.validation.settings.allowedMissingDays')}</h4>
                            </div>
                            <NumberInput label={t('keta.validation.settings.daysMonth28')} name="allowedMissingDays28" />
                            <NumberInput label={t('keta.validation.settings.daysMonth29')} name="allowedMissingDays29" />
                            <NumberInput label={t('keta.validation.settings.daysMonth30')} name="allowedMissingDays30" />
                            <NumberInput label={t('keta.validation.settings.daysMonth31')} name="allowedMissingDays31" />

                            <div className="col-span-1 md:col-span-2 lg:col-span-3 mt-4">
                                <h4 className="font-bold text-gray-900 border-b pb-2 mb-2">{t('keta.validation.settings.advancedSettings')}</h4>
                            </div>
                            <NumberInput label={t('keta.validation.settings.firstCriticalDaysCount')} name="firstCriticalDaysCount" />
                            <NumberInput label={t('keta.validation.settings.lastCriticalDaysCount')} name="lastCriticalDaysCount" />
                            <NumberInput label={t('keta.validation.settings.maxStartDayForExistingRiders')} name="maxStartDayForExistingRiders" />

                            <div className="col-span-1 md:col-span-2 lg:col-span-3 mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <CheckboxInput label={t('keta.validation.settings.thursdayIsCriticalDay')} name="thursdayIsCriticalDay" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-sm font-medium text-gray-700">{t('keta.validation.settings.criticalDaysOfMonth')}</label>
                                    <input
                                        type="text"
                                        name="criticalDaysOfMonth"
                                        value={formData.criticalDaysOfMonth?.join(', ') || ''}
                                        onChange={handleChange}
                                        placeholder={t('keta.validation.settings.criticalDaysOfMonthPlaceholder')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                            >
                                {t('common.cancel') || "Cancel"}
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                {t('common.save') || "Save"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </Modal>
    );
}
