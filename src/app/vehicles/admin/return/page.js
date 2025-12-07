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
  RefreshCw,
  Search,
  Car,
  Clock,
  User,
  MapPin,
  CheckCircle,
  Package,
} from "lucide-react";

export default function ReturnVehiclePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [takenVehicles, setTakenVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [riderIqama, setRiderIqama] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    loadTakenVehicles();
  }, []);

  const loadTakenVehicles = async () => {
    setLoading(true);
    try {
      const data = await ApiService.get(
        "/api/vehicles/taken?statusFilter=unavailable"
      );
      if (data && data.vehicles) {
        setTakenVehicles(data.vehicles);
      }
    } catch (err) {
      console.error("Error loading taken vehicles:", err);
      setErrorMessage("حدث خطأ في تحميل المركبات المستخدمة");
    } finally {
      setLoading(false);
    }
  };

  const searchVehicle = async () => {
    if (!searchTerm.trim()) {
      setErrorMessage("الرجاء إدخال رقم اللوحة للبحث");
      return;
    }

    setSearchLoading(true);
    setErrorMessage("");
    try {
      const data = await ApiService.get(
        `/api/vehicles/with-rider/${searchTerm}`
      );
      if (data) {
        setSelectedVehicle(data);
        setRiderIqama(data.currentRider?.employeeIqamaNo?.toString() || "");
        setErrorMessage("");
      } else {
        setErrorMessage(
          "لم يتم العثور على المركبة أو المركبة غير مستخدمة حالياً"
        );
        setSelectedVehicle(null);
      }
    } catch (err) {
      console.error("Error searching vehicle:", err);
      setErrorMessage("المركبة غير موجودة أو غير مستخدمة حالياً");
      setSelectedVehicle(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleReturnVehicle = async (e) => {
    e.preventDefault();

    if (!selectedVehicle) {
      setErrorMessage("الرجاء البحث عن المركبة أولاً");
      return;
    }

    if (!riderIqama.trim()) {
      setErrorMessage("الرجاء إدخال رقم إقامة المندوب");
      return;
    }

    if (!reason.trim()) {
      setErrorMessage("الرجاء إدخال سبب إرجاع المركبة");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await ApiService.post(
        `/api/vehicles/return?iqamaNo=${riderIqama}&vehicleNumber=${encodeURIComponent(
          selectedVehicle.plateNumberA
        )}&reason=${encodeURIComponent(reason)}`
      );

      setSuccessMessage("تم إرجاع المركبة بنجاح");
      setTimeout(() => {
        setSelectedVehicle(null);
        setSearchTerm("");
        setRiderIqama("");
        setReason("");
        loadTakenVehicles();
      }, 2000);
    } catch (err) {
      console.error("Error returning vehicle:", err);
      setErrorMessage(err?.message || "حدث خطأ أثناء إرجاع المركبة");
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicles = takenVehicles.filter(
    (v) =>
      v.plateNumberA?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.serialNumber?.toString().includes(searchTerm) ||
      v.riderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full">
      <PageHeader
        title="إرجاع مركبة"
        subtitle="قم بتسجيل إرجاع المركبة بعد الانتهاء من استخدامها"
        icon={RefreshCw}
        actionButton={{
          text: "تحديث القائمة",
          icon: <RefreshCw size={18} />,
          onClick: loadTakenVehicles,
          variant: "secondary",
        }}
      />

      <div className="px-6 space-y-6">
        {errorMessage && (
          <Alert
            type="error"
            title="خطأ"
            message={errorMessage}
            onClose={() => setErrorMessage("")}
          />
        )}

        {successMessage && (
          <Alert
            type="success"
            title="نجاح"
            message={successMessage}
            onClose={() => setSuccessMessage("")}
          />
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border-r-4 border-blue-500 p-5 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 mb-1">مركبات مستخدمة</p>
                <p className="text-3xl font-bold text-blue-700">
                  {takenVehicles.length}
                </p>
              </div>
              <Car className="text-blue-500" size={40} />
            </div>
          </div>

          <div className="bg-green-50 border-r-4 border-green-500 p-5 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 mb-1">مندوبين نشطين</p>
                <p className="text-3xl font-bold text-green-700">
                  {new Set(takenVehicles.map((v) => v.riderIqamaNo)).size}
                </p>
              </div>
              <User className="text-green-500" size={40} />
            </div>
          </div>

          <div className="bg-purple-50 border-r-4 border-purple-500 p-5 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 mb-1">أنواع مختلفة</p>
                <p className="text-3xl font-bold text-purple-700">
                  {new Set(takenVehicles.map((v) => v.vehicleType)).size}
                </p>
              </div>
              <Package className="text-purple-500" size={40} />
            </div>
          </div>

          <div className="bg-orange-50 border-r-4 border-orange-500 p-5 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 mb-1">نتائج البحث</p>
                <p className="text-3xl font-bold text-orange-700">
                  {filteredVehicles.length}
                </p>
              </div>
              <Search className="text-orange-500" size={40} />
            </div>
          </div>
        </div>

        {/* Search Section */}
        <Card>
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Search size={20} />
              البحث عن المركبة
            </h3>

            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="أدخل رقم اللوحة..."
                  onKeyPress={(e) => e.key === "Enter" && searchVehicle()}
                />
              </div>
              <Button
                onClick={searchVehicle}
                loading={searchLoading}
                disabled={searchLoading}
              >
                <Search size={18} className="ml-2" />
                بحث
              </Button>
            </div>
          </div>

          {/* Selected Vehicle Info */}
          {selectedVehicle && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                <Car size={18} />
                معلومات المركبة المحددة
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm mb-4">
                <div>
                  <p className="text-blue-600 mb-1">رقم اللوحة (عربي)</p>
                  <p className="font-medium text-gray-800">
                    {selectedVehicle.plateNumberA}
                  </p>
                </div>
                <div>
                  <p className="text-blue-600 mb-1">رقم اللوحة (إنجليزي)</p>
                  <p className="font-medium text-gray-800">
                    {selectedVehicle.plateNumberE || "غير محدد"}
                  </p>
                </div>
                <div>
                  <p className="text-blue-600 mb-1">الرقم التسلسلي</p>
                  <p className="font-medium text-gray-800">
                    {selectedVehicle.serialNumber}
                  </p>
                </div>
                <div>
                  <p className="text-blue-600 mb-1">رقم المركبة</p>
                  <p className="font-medium text-gray-800">
                    {selectedVehicle.vehicleNumber}
                  </p>
                </div>
                <div>
                  <p className="text-blue-600 mb-1">نوع المركبة</p>
                  <p className="font-medium text-gray-800">
                    {selectedVehicle.vehicleType}
                  </p>
                </div>
                <div>
                  <p className="text-blue-600 mb-1">الموقع</p>
                  <p className="font-medium text-gray-800">
                    {selectedVehicle.location || "غير محدد"}
                  </p>
                </div>
                {selectedVehicle.manufacturer && (
                  <div>
                    <p className="text-blue-600 mb-1">الشركة المصنعة</p>
                    <p className="font-medium text-gray-800">
                      {selectedVehicle.manufacturer}
                    </p>
                  </div>
                )}
                {selectedVehicle.manufactureYear && (
                  <div>
                    <p className="text-blue-600 mb-1">سنة الصنع</p>
                    <p className="font-medium text-gray-800">
                      {selectedVehicle.manufactureYear}
                    </p>
                  </div>
                )}
                {selectedVehicle.ownerName && (
                  <div>
                    <p className="text-blue-600 mb-1">اسم المالك</p>
                    <p className="font-medium text-gray-800">
                      {selectedVehicle.ownerName}
                    </p>
                  </div>
                )}
              </div>

              {/* Current Rider Info */}
              {selectedVehicle.currentRider && (
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                  <h5 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                    <User size={16} />
                    معلومات المندوب الحالي
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-green-600 mb-1">رقم الإقامة</p>
                      <p className="font-medium text-gray-800">
                        {selectedVehicle.currentRider.employeeIqamaNo}
                      </p>
                    </div>
                    <div>
                      <p className="text-green-600 mb-1">الاسم (عربي)</p>
                      <p className="font-medium text-gray-800">
                        {selectedVehicle.currentRider.riderName}
                      </p>
                    </div>
                    <div>
                      <p className="text-green-600 mb-1">الاسم (إنجليزي)</p>
                      <p className="font-medium text-gray-800">
                        {selectedVehicle.currentRider.riderNameE}
                      </p>
                    </div>
                    <div>
                      <p className="text-green-600 mb-1">تاريخ الاستلام</p>
                      <p className="font-medium text-gray-800">
                        {new Date(
                          selectedVehicle.currentRider.takenDate
                        ).toLocaleString("en-US")}
                      </p>
                    </div>
                    {selectedVehicle.currentRider.takenReason && (
                      <div className="col-span-2">
                        <p className="text-green-600 mb-1">سبب الاستلام</p>
                        <p className="font-medium text-gray-800">
                          {selectedVehicle.currentRider.takenReason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Vehicle Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-sm">
                <div>
                  <p className="text-blue-600 mb-1">الحالة الحالية</p>
                  <p className="font-medium text-gray-800">
                    {selectedVehicle.currentStatus}
                  </p>
                </div>
                {selectedVehicle.statusSince && (
                  <div>
                    <p className="text-blue-600 mb-1">منذ</p>
                    <p className="font-medium text-gray-800">
                      {new Date(selectedVehicle.statusSince).toLocaleString(
                        "en-US"
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Return Vehicle Form */}
          {selectedVehicle && (
            <div className="space-y-6">
              <div className="bg-orange-50 border-r-4 border-orange-500 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <RefreshCw className="text-orange-600 mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-orange-800 mb-1">
                      إرجاع المركبة
                    </h3>
                    <p className="text-sm text-orange-600">
                      تأكد من رقم إقامة المندوب وأدخل سبب الإرجاع
                    </p>
                  </div>
                </div>
              </div>

              <Input
                label="رقم إقامة المندوب"
                type="number"
                value={riderIqama}
                onChange={(e) => setRiderIqama(e.target.value)}
                required
                placeholder="أدخل رقم الإقامة..."
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  سبب إرجاع المركبة <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  rows={4}
                  placeholder="اشرح سبب إرجاع المركبة (مثل: انتهاء الدوام، إلخ)..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setSelectedVehicle(null);
                    setSearchTerm("");
                    setRiderIqama("");
                    setReason("");
                  }}
                  disabled={loading}
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleReturnVehicle}
                  loading={loading}
                  disabled={loading}
                >
                  <CheckCircle size={18} className="ml-2" />
                  تأكيد إرجاع المركبة
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Taken Vehicles Grid */}
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            المركبات المستخدمة حالياً
          </h3>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
              <p className="text-gray-600">لا توجد مركبات مستخدمة حالياً</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVehicles.map((vehicle) => (
                <div
                  key={vehicle.vehicleNumber}
                  className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50 hover:shadow-lg transition cursor-pointer"
                  onClick={() => {
                    searchVehicle();
                    setSearchTerm(vehicle.plateNumberA);
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Car className="text-blue-600" size={20} />
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
                    <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-medium">
                      مستخدمة
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Package size={14} />
                      <span className="text-gray-600">رقم تسلسلي:</span>
                      <span className="font-medium">
                        {vehicle.serialNumber}
                      </span>
                    </div>

                    {vehicle.riderName && vehicle.riderName !== "N/A" && (
                      <div className="bg-green-50 border border-green-200 p-2 rounded">
                        <div className="flex items-center gap-2 text-gray-700">
                          <User size={14} className="text-green-600" />
                          <span className="font-medium">
                            {vehicle.riderName}
                          </span>
                        </div>
                      </div>
                    )}

                    {vehicle.location && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin size={14} />
                        <span className="font-medium">{vehicle.location}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock size={14} />
                      <span className="text-gray-600">منذ:</span>
                      <span className="font-medium">
                        {new Date(vehicle.since).toLocaleDateString("en-US")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
