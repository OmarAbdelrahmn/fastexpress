"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ApiService } from "@/lib/api/apiService";
import Card from "@/components/Ui/Card";
import Button from "@/components/Ui/Button";
import Alert from "@/components/Ui/Alert";
import Input from "@/components/Ui/Input";
import PageHeader from "@/components/layout/pageheader";
import {
  CheckCircle,
  Search,
  Car,
  MapPin,
  Calendar,
  Info,
  Eye,
} from "lucide-react";

export default function AvailableVehiclesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadAvailableVehicles();
  }, []);

  const loadAvailableVehicles = async () => {
    setLoading(true);
    try {
      const data = await ApiService.get("/api/vehicles/available");
      setAvailableVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading available vehicles:", err);
      setErrorMessage("حدث خطأ في تحميل المركبات الجاهزة للتسليم");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowDetailsModal(true);
  };

  const filteredVehicles = availableVehicles.filter(
    (v) =>
      v.plateNumberA?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.serialNumber?.toString().includes(searchTerm) ||
      v.vehicleType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="المركبات الجاهزة للتسليم"
        subtitle={`${filteredVehicles.length} مركبة جاهزة للاستخدام`}
        icon={CheckCircle}
        actionButton={{
          text: "تحديث البيانات",
          icon: <CheckCircle size={18} />,
          onClick: loadAvailableVehicles,
          variant: "secondary",
        }}
      />

      {errorMessage && (
        <Alert
          type="error"
          title="خطأ"
          message={errorMessage}
          onClose={() => setErrorMessage("")}
        />
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border-r-4 border-green-500 p-5 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 mb-1">
                إجمالي الجاهزة للتسليم
              </p>
              <p className="text-3xl font-bold text-green-700">
                {availableVehicles.length}
              </p>
            </div>
            <CheckCircle className="text-green-500" size={40} />
          </div>
        </div>

        <div className="bg-blue-50 border-r-4 border-blue-500 p-5 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 mb-1">محددة الموقع</p>
              <p className="text-3xl font-bold text-blue-700">
                {availableVehicles.filter((v) => v.location).length}
              </p>
            </div>
            <MapPin className="text-blue-500" size={40} />
          </div>
        </div>

        <div className="bg-purple-50 border-r-4 border-purple-500 p-5 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 mb-1">النتائج المعروضة</p>
              <p className="text-3xl font-bold text-purple-700">
                {filteredVehicles.length}
              </p>
            </div>
            <Search className="text-purple-500" size={40} />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="mb-4">
          <div className="relative">
            <Search
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="البحث برقم اللوحة، النوع، الموقع، أو الشركة المصنعة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </Card>

      {/* Vehicles Grid */}
      <Card>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <CheckCircle size={20} className="text-green-600" />
          قائمة المركبات الجاهزة للتسليم
        </h3>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="text-center py-12">
            <Car className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">لا توجد مركبات جاهزة للتسليم</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVehicles.map((vehicle) => (
              <div
                key={vehicle.vehicleNumber}
                className="border-2 border-green-200 rounded-lg p-4 bg-green-50 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Car className="text-green-600" size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">
                        {vehicle.plateNumberA}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {vehicle.vehicleType}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-600 text-white rounded-full text-xs font-medium">
                    متاح
                  </span>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Car size={14} />
                    <span className="text-xs">
                      رقم تسلسلي: {vehicle.serialNumber}
                    </span>
                  </div>

                  {vehicle.manufacturer && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Info size={14} />
                      <span className="text-xs">
                        {vehicle.manufacturer} -{" "}
                        {vehicle.manufactureYear || "N/A"}
                      </span>
                    </div>
                  )}

                  {vehicle.location && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin size={14} />
                      <span className="text-xs">{vehicle.location}</span>
                    </div>
                  )}

                  {vehicle.licenseExpiryDate && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar size={14} />
                      <span className="text-xs">
                        انتهاء الرخصة:{" "}
                        {new Date(vehicle.licenseExpiryDate).toLocaleDateString(
                          "ar-SA"
                        )}
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => handleViewDetails(vehicle)}
                  variant="secondary"
                  className="w-full text-sm"
                >
                  <Eye size={16} className="ml-2" />
                  عرض التفاصيل
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Details Modal */}
      {showDetailsModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  تفاصيل المركبة
                </h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-bold text-green-800 mb-3">
                    المعلومات الأساسية
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-green-600 mb-1">رقم اللوحة (عربي)</p>
                      <p className="font-medium text-gray-800">
                        {selectedVehicle.plateNumberA}
                      </p>
                    </div>
                    <div>
                      <p className="text-green-600 mb-1">
                        رقم اللوحة (إنجليزي)
                      </p>
                      <p className="font-medium text-gray-800">
                        {selectedVehicle.plateNumberE || "غير محدد"}
                      </p>
                    </div>
                    <div>
                      <p className="text-green-600 mb-1">الرقم التسلسلي</p>
                      <p className="font-medium text-gray-800">
                        {selectedVehicle.serialNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-green-600 mb-1">رقم المركبة</p>
                      <p className="font-medium text-gray-800">
                        {selectedVehicle.vehicleNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-green-600 mb-1">نوع المركبة</p>
                      <p className="font-medium text-gray-800">
                        {selectedVehicle.vehicleType}
                      </p>
                    </div>
                    <div>
                      <p className="text-green-600 mb-1">الموقع</p>
                      <p className="font-medium text-gray-800">
                        {selectedVehicle.location || "غير محدد"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-gray-800 mb-3">
                    معلومات التصنيع
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">الشركة المصنعة</p>
                      <p className="font-medium text-gray-800">
                        {selectedVehicle.manufacturer || "غير محدد"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">سنة الصنع</p>
                      <p className="font-medium text-gray-800">
                        {selectedVehicle.manufactureYear || "غير محدد"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-gray-800 mb-3">
                    معلومات المالك
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">اسم المالك</p>
                      <p className="font-medium text-gray-800">
                        {selectedVehicle.ownerName || "غير محدد"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">رقم هوية المالك</p>
                      <p className="font-medium text-gray-800">
                        {selectedVehicle.ownerId || "غير محدد"}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-600 mb-1">تاريخ انتهاء الرخصة</p>
                      <p className="font-medium text-gray-800">
                        {selectedVehicle.licenseExpiryDate
                          ? new Date(
                              selectedVehicle.licenseExpiryDate
                            ).toLocaleDateString("ar-SA")
                          : "غير محدد"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() => setShowDetailsModal(false)}
                  variant="secondary"
                >
                  إغلاق
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
