'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import Input from '@/components/Ui/Input';
import PageHeader from '@/components/layout/pageheader';
import { UserPlus, ArrowRight, Save, Search, User } from 'lucide-react';

export default function AddRiderToEmployeePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [companies, setCompanies] = useState([]);
  const [employeeData, setEmployeeData] = useState(null);
  const [searchIqama, setSearchIqama] = useState('');
  
  const [formData, setFormData] = useState({
    workingId: '',
    tshirtSize: '',
    licenseNumber: '',
    companyName: ''
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const data = await ApiService.get(API_ENDPOINTS.COMPANY.LIST);
      setCompanies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading companies:', err);
      setErrorMessage('حدث خطأ في تحميل قائمة الشركات');
    }
  };

  const handleSearchEmployee = async () => {
    if (!searchIqama.trim()) {
      setErrorMessage('الرجاء إدخال رقم الإقامة');
      return;
    }

    setSearchLoading(true);
    setErrorMessage('');
    setEmployeeData(null);

    try {
      const data = await ApiService.get(API_ENDPOINTS.EMPLOYEE.BY_IQAMA(searchIqama));
      
      if (data) {
        // Check if already a rider
        const riderCheck = await ApiService.get(API_ENDPOINTS.RIDER.BY_IQAMA(searchIqama));
        if (riderCheck && riderCheck.length > 0) {
          setErrorMessage('هذا الموظف مسجل بالفعل كمندوب');
          return;
        }
        
        setEmployeeData(data);
        setErrorMessage('');
      } else {
        setErrorMessage('لم يتم العثور على الموظف');
      }
    } catch (err) {
      console.error('Error searching employee:', err);
      setErrorMessage(err?.message || 'حدث خطأ في البحث عن الموظف');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!employeeData) {
      setErrorMessage('الرجاء البحث عن الموظف أولاً');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const requestData = {
        workingId: parseInt(formData.workingId),
        tshirtSize: formData.tshirtSize,
        licenseNumber: formData.licenseNumber,
        companyName: formData.companyName
      };

      await ApiService.post(
        API_ENDPOINTS.RIDER.ADD_EMPLOYEE(employeeData.iqamaNo),
        requestData
      );
      
      setSuccessMessage('تم تحويل الموظف إلى مندوب بنجاح');
      setTimeout(() => {
        router.push('/riders');
      }, 2000);
    } catch (err) {
      console.error('Error adding rider to employee:', err);
      setErrorMessage(err?.message || 'حدث خطأ أثناء تحويل الموظف إلى مندوب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="تحويل موظف إلى مندوب"
        subtitle="إضافة معلومات المندوب لموظف موجود"
        icon={UserPlus}
        actionButton={{
          text: 'العودة للقائمة',
          icon: <ArrowRight size={18} />,
          onClick: () => router.push('/riders'),
          variant: 'secondary'
        }}
      />

      {successMessage && (
        <Alert 
          type="success" 
          title="نجح" 
          message={successMessage}
          onClose={() => setSuccessMessage('')}
        />
      )}

      {errorMessage && (
        <Alert 
          type="error" 
          title="خطأ" 
          message={errorMessage}
          onClose={() => setErrorMessage('')}
        />
      )}

      {/* Search Employee */}
      <Card>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Search size={20} />
          البحث عن الموظف
        </h3>
        
        <div className="flex gap-3 mb-4">
          <Input
            label=""
            type="number"
            value={searchIqama}
            onChange={(e) => setSearchIqama(e.target.value)}
            placeholder="أدخل رقم إقامة الموظف..."
            onKeyPress={(e) => e.key === 'Enter' && handleSearchEmployee()}
          />
          <Button 
            type="button" 
            onClick={handleSearchEmployee}
            loading={searchLoading}
            disabled={searchLoading}
            className="mt-0"
          >
            <Search size={18} className="ml-2" />
            بحث
          </Button>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-700">
            ابحث عن الموظف برقم الإقامة، ثم أضف معلومات المندوب الخاصة به
          </p>
        </div>
      </Card>

      {/* Employee Information (if found) */}
      {employeeData && (
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <User size={20} />
            معلومات الموظف
          </h3>
          
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-green-600 mb-1">رقم الإقامة</p>
                <p className="font-bold text-gray-800">{employeeData.iqamaNo}</p>
              </div>
              <div>
                <p className="text-sm text-green-600 mb-1">الاسم (عربي)</p>
                <p className="font-bold text-gray-800">{employeeData.nameAR}</p>
              </div>
              <div>
                <p className="text-sm text-green-600 mb-1">الاسم (إنجليزي)</p>
                <p className="font-bold text-gray-800">{employeeData.nameEN}</p>
              </div>
              <div>
                <p className="text-sm text-green-600 mb-1">المسمى الوظيفي</p>
                <p className="font-medium text-gray-800">{employeeData.jobTitle}</p>
              </div>
              <div>
                <p className="text-sm text-green-600 mb-1">البلد</p>
                <p className="font-medium text-gray-800">{employeeData.country}</p>
              </div>
              <div>
                <p className="text-sm text-green-600 mb-1">رقم الهاتف</p>
                <p className="font-medium text-gray-800">{employeeData.phone}</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Rider Information Form (only show if employee found) */}
      {employeeData && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <h3 className="text-lg font-bold text-gray-800 mb-4">معلومات المندوب</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="رقم العمل"
                type="number"
                name="workingId"
                value={formData.workingId}
                onChange={handleInputChange}
                required
                placeholder="أدخل رقم العمل"
              />

              <Input
                label="رقم الرخصة"
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleInputChange}
                required
                placeholder="أدخل رقم الرخصة"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  مقاس التيشرت <span className="text-red-500">*</span>
                </label>
                <select
                  name="tshirtSize"
                  value={formData.tshirtSize}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">اختر المقاس</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                  <option value="XXXL">XXXL</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الشركة <span className="text-red-500">*</span>
                </label>
                <select
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">اختر الشركة</option>
                  {companies.map((company) => (
                    <option key={company.name} value={company.name}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEmployeeData(null);
                  setSearchIqama('');
                  setFormData({
                    workingId: '',
                    tshirtSize: '',
                    licenseNumber: '',
                    companyName: ''
                  });
                }}
                disabled={loading}
              >
                إلغاء
              </Button>
              <Button type="submit" loading={loading} disabled={loading}>
                <Save size={18} className="ml-2" />
                تحويل إلى مندوب
              </Button>
            </div>
          </Card>
        </form>
      )}

      {/* Instructions */}
      {!employeeData && (
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4">كيفية الاستخدام</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <div className="bg-blue-100 p-1 rounded mt-0.5">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <p>ابحث عن الموظف الموجود باستخدام رقم الإقامة</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-blue-100 p-1 rounded mt-0.5">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <p>تأكد من صحة معلومات الموظف المعروضة</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-blue-100 p-1 rounded mt-0.5">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <p>أدخل معلومات المندوب الإضافية (رقم العمل، الرخصة، إلخ)</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-blue-100 p-1 rounded mt-0.5">
                <span className="text-blue-600 font-bold">4</span>
              </div>
              <p>احفظ التغييرات لتحويل الموظف إلى مندوب</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}