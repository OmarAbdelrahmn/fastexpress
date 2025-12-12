"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ApiService } from "@/lib/api/apiService";
import Card from "@/components/Ui/Card";
import Button from "@/components/Ui/Button";
import Alert from "@/components/Ui/Alert";
import Input from "@/components/Ui/Input";
import PageHeader from "@/components/layout/pageheader";
import { UserPlus, Save, ArrowRight, Home, Users } from "lucide-react";
import { useLanguage } from "@/lib/context/LanguageContext";


export default function HousingAddEmployeePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [loadingHousings, setLoadingHousings] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [housings, setHousings] = useState([]);
  const [formData, setFormData] = useState({
    iqamaNo: "",
    housingName: "",
  });

  useEffect(() => {
    loadHousings();
  }, []);

  const loadHousings = async () => {
    setLoadingHousings(true);
    try {
      const data = await ApiService.get("/api/Housing");
      setHousings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading housings:", err);
      setErrorMessage(t("housing.loadError"));
    } finally {
      setLoadingHousings(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      await ApiService.put(
        `/api/Housing/${formData.iqamaNo}/add/${formData.housingName}`,
        null
      );

      setSuccessMessage(t("housing.addToHousingSuccess"));
      setTimeout(() => {
        router.push(`/housing/manage`);
      }, 1500);
    } catch (err) {
      console.error("Error adding employee to housing:", err);
      if (err?.status === 404) {
        setErrorMessage(t("errors.generalError"));
      } else if (err?.status === 400) {
        setErrorMessage(t("errors.generalError"));
      } else if (err?.status === 409) {
        setErrorMessage(t("housing.addToHousingError"));
      } else {
        setErrorMessage(err?.message || t("errors.generalError"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("housing.addEmployee")}
        subtitle={t("housing.addEmployee")}
        icon={UserPlus}
        actionButton={{
          text: t("common.back"),
          icon: <ArrowRight size={18} />,
          onClick: () => router.push(`housing/manage`),
          variant: "secondary",
        }}
      />

      {errorMessage && (
        <Alert
          type="error"
          title={t("common.error")}
          message={errorMessage}
          onClose={() => setErrorMessage("")}
        />
      )}

      {successMessage && (
        <Alert
          type="success"
          title={t("common.success")}
          message={successMessage}
          onClose={() => setSuccessMessage("")}
        />
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 mb-1">
                {t("housing.totalHousing")}
              </p>
              <p className="text-3xl font-bold text-blue-700">
                {housings.length}
              </p>
            </div>
            <Home className="text-blue-500" size={40} />
          </div>
        </div>

        <div className="bg-green-50 border-r-4 border-green-500 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 mb-1">
                {t("housing.availableSpaces")}
              </p>
              <p className="text-3xl font-bold text-green-700">
                {housings.reduce(
                  (sum, h) => sum + (h.capacity - (h.currentOccupancy || 0)),
                  0
                )}
              </p>
            </div>
            <Users className="text-green-500" size={40} />
          </div>
        </div>
      </div>

      <Card>
        {loadingHousings ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded-lg mb-6">
              <div className="flex items-start gap-3">
                <UserPlus className="text-blue-600 mt-1" size={24} />
                <div>
                  <h3 className="font-semibold text-blue-800 mb-1">
                    {t("employees.title")}
                  </h3>
                  <p className="text-sm text-blue-600">
                    {t("housing.addEmployee")}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label={t("employees.iqamaNumber")}
                type="text"
                name="iqamaNo"
                value={formData.iqamaNo}
                onChange={handleInputChange}
                required
                placeholder={t("employees.enterIqamaNumber")}
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t("housing.housingName")} <span className="text-red-500">*</span>
                </label>
                <select
                  name="housingName"
                  value={formData.housingName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">{t("housing.selectHousing")}</option>
                  {housings.map((housing) => (
                    <option key={housing.name} value={housing.name}>
                      {housing.name} - {t("housing.capacity")}: {housing.employees.length || 0}/
                      {housing.capacity}
                      {housing.employees.length >= housing.capacity &&
                        ` (${t("housing.full")})`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {formData.housingName && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3">
                  {t("common.details")}
                </h3>
                {housings.find((h) => h.name === formData.housingName) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{t("housing.address")}</p>
                      <p className="font-medium text-gray-800">
                        {
                          housings.find((h) => h.name === formData.housingName)
                            .address
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{t("housing.totalCapacity")}</p>
                      <p className="font-medium text-gray-800">
                        {
                          housings.find((h) => h.name === formData.housingName)
                            .capacity
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        {t("housing.currentOccupancy")}
                      </p>
                      <p
                        className={`font-medium ${housings.find((h) => h.name === formData.housingName)
                            .employees.length >=
                            housings.find((h) => h.name === formData.housingName)
                              .capacity
                            ? "text-red-600"
                            : "text-green-600"
                          }`}
                      >
                        {housings.find((h) => h.name === formData.housingName)
                          .employees.length || 0}{" "}
                        /
                        {
                          housings.find((h) => h.name === formData.housingName)
                            .capacity
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push(`/housing/manage`)}
                disabled={loading}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" loading={loading} disabled={loading}>
                <Save size={18} className="ml-2" />
                {t("housing.addEmployee")}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
