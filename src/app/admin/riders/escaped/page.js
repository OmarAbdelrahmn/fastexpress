'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { escapedService } from '@/lib/api/escapedService';
import Card from '@/components/Ui/Card';
import Table from '@/components/Ui/Table';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import Modal from '@/components/Ui/Model';
import PageHeader from '@/components/layout/pageheader';
import StatusBadge from '@/components/Ui/StatusBadge';
import { useLanguage } from '@/lib/context/LanguageContext';
import { AlertCircle, Calendar, FileText, Search, User, Trash2, Clock, Pin, Edit, Globe, ShieldAlert, NotebookTabs, Filter, Power, FileDown } from 'lucide-react';
import moment from 'moment';
import * as XLSX from 'xlsx';

export default function EscapedManagementPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [escapedEmployees, setEscapedEmployees] = useState([]);
  const [stats, setStats] = useState({
    totalEscaped: 0,
    nonePathCount: 0,
    reportedPathCount: 0,
    outagePathCount: 0,
    overdueCount: 0,
    dueWithin10DaysCount: 0,
    notificationsSentCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Modal states
  const [isPathModalOpen, setIsPathModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [activePath, setActivePath] = useState(null); // 'reported' or 'outage'
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Form states
  const [formData, setFormData] = useState({
    escapedAt: '',
    reportedAt: '',
    isReported: false,
    outageDate: '',
    outageVisaNumber: '',
  });
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [listData, statsData] = await Promise.all([
        escapedService.list(),
        escapedService.getStats(),
      ]);
      setEscapedEmployees(Array.isArray(listData) ? listData : []);
      console.log(listData);
      setStats(statsData || {
        totalEscaped: 0,
        nonePathCount: 0,
        reportedPathCount: 0,
        outagePathCount: 0,
        overdueCount: 0,
        dueWithin10DaysCount: 0,
        notificationsSentCount: 0
      });
    } catch (err) {
      console.error('Error loading escaped employees:', err);
      setErrorMessage(t('common.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPathModal = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      escapedAt: employee.escapedAt ? moment(employee.escapedAt).format('YYYY-MM-DD') : '',
      reportedAt: employee.reportedAt ? moment(employee.reportedAt).format('YYYY-MM-DD') : '',
      isReported: employee.isReported || false,
      outageDate: employee.outageDate ? moment(employee.outageDate).format('YYYY-MM-DD') : '',
      outageVisaNumber: employee.outageVisaNumber || '',
    });
    
    // Determine current path from backend activePath
    // 0: None, 1: Reported, 2: Outage
    if (employee.activePath === 2) {
      setActivePath('outage');
    } else if (employee.activePath === 1) {
      setActivePath('reported');
    } else {
      setActivePath(null);
    }
    
    setIsPathModalOpen(true);
  };

  const handleOpenNotesModal = (employee) => {
    setSelectedEmployee(employee);
    setNotes(employee.notes || '');
    setIsNotesModalOpen(true);
  };

  const handleSavePath = async () => {
    if (!selectedEmployee) return;
    
    try {
      // Logic for Path Switching or Initialization
      const newPathType = activePath === 'reported' ? 1 : 2;
      const isSwitch = selectedEmployee.activePath !== 0 && selectedEmployee.activePath !== newPathType;

      if (isSwitch) {
        // Use Switch Path API
        const payload = {
          newPath: newPathType,
          ...(newPathType === 1 
            ? { reportedAt: formData.reportedAt } 
            : { dateOfOutage: formData.outageDate, visaNumber: formData.outageVisaNumber }
          )
        };
        await escapedService.switchPath(selectedEmployee.iqamaNo, payload);
      } else {
        // Use Specific Path API
        if (activePath === 'reported') {
          const payload = {
            reportedAt: formData.reportedAt,
            isReported: formData.isReported,
            notes: formData.notes
          };
          await escapedService.markReported(selectedEmployee.iqamaNo, payload);
        } else if (activePath === 'outage') {
          const payload = {
            dateOfOutage: formData.outageDate,
            visaNumber: formData.outageVisaNumber,
            notes: formData.notes
          };
          await escapedService.markOutage(selectedEmployee.iqamaNo, payload);
        }
      }
      
      setSuccessMessage(t('common.success'));
      setIsPathModalOpen(false);
      loadData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving path:', err);
      setErrorMessage(err.message || t('common.saveError'));
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedEmployee) return;
    try {
      await escapedService.updateNotes(selectedEmployee.iqamaNo, notes);
      setSuccessMessage(t('common.success'));
      setIsNotesModalOpen(false);
      loadData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage(err.message || t('common.saveError'));
    }
  };

  const handleDeleteRecord = async (iqamaNo) => {
    if (!confirm(t('common.confirmDelete'))) return;
    
    try {
      await escapedService.delete(iqamaNo);
      setSuccessMessage(t('common.success'));
      loadData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting record:', err);
      setErrorMessage(err.message || t('common.deleteError'));
    }
  };

  const handleActivateRecord = async (iqamaNo) => {
    if (!confirm('هل أنت متأكد من تفعيل هروب هذا الموظف؟')) return;
    try {
      const res = await escapedService.deactivate(iqamaNo);
      setSuccessMessage(typeof res === 'string' ? res : (res?.message || res?.title || 'تم التفعيل بنجاح'));
      loadData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error activating record:', err);
      setErrorMessage(err.message || 'حدث خطأ أثناء التفعيل');
    }
  };

  const handleDeactivateRecord = async (iqamaNo) => {
    if (!confirm('هل أنت متأكد من تعطيل هروب هذا الموظف؟')) return;
    try {
      const res = await escapedService.deactivate(iqamaNo);
      setSuccessMessage(typeof res === 'string' ? res : (res?.message || res?.title || 'تم التعطيل بنجاح'));
      loadData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deactivating record:', err);
      setErrorMessage(err.message || 'حدث خطأ أثناء التعطيل');
    }
  };

  const handleForceDeleteRecord = async (iqamaNo) => {
    if (!confirm('هل أنت متأكد من الحذف النهائي لهذا البلاغ؟')) return;
    try {
      const res = await escapedService.forceDelete(iqamaNo);
      setSuccessMessage(typeof res === 'string' ? res : (res?.message || res?.title || 'تم الحذف النهائي بنجاح'));
      loadData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error force deleting record:', err);
      setErrorMessage(err.message || t('common.deleteError'));
    }
  };

  const filteredEmployees = escapedEmployees.filter(emp => {
    const matchesSearch = emp.nameAR?.includes(searchTerm) || 
      emp.nameEN?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.iqamaNo?.toString().includes(searchTerm);
      
      const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'reported' && emp.activePath === 1) ||
      (statusFilter === 'outage' && emp.activePath === 2) ||
      (statusFilter === 'none' && emp.activePath === 0);
      
    return matchesSearch && matchesStatus;
  });

  const handleExportNoPath = () => {
    const dataToExport = escapedEmployees.filter(emp => emp.activePath === 0).map(emp => ({
      'رقم الإقامة': emp.iqamaNo,
      'الاسم': emp.nameAR,
      'الوظيفة': emp.jobTitle,
      'تاريخ الهروب': emp.escapedAt ? moment(emp.escapedAt).format('YYYY-MM-DD') : '-',
      'تجاوز المهلة': emp.isOverdue ? 'نعم' : 'لا'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'بدون مسار');
    XLSX.writeFile(workbook, 'Escaped_No_Path.xlsx');
  };

  const handleExportWithPaths = () => {
    const dataToExport = escapedEmployees.filter(emp => emp.activePath !== 0).map(emp => ({
      'رقم الإقامة': emp.iqamaNo,
      'الاسم': emp.nameAR,
      'الوظيفة': emp.jobTitle,
      'المسار': emp.activePath === 1 ? 'تم الإبلاغ' : 'خروج نهائي',
      'تاريخ الهروب': emp.escapedAt ? moment(emp.escapedAt).format('YYYY-MM-DD') : '-',
      'الموعد النهائي': emp.removalDeadline ? moment(emp.removalDeadline).format('YYYY-MM-DD') : '-',
      'الأيام المتبقية': emp.remainingDaysToRemoval ?? '-',
      'ملاحظات': emp.notes || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'محددي المسار');
    XLSX.writeFile(workbook, 'Escaped_With_Paths.xlsx');
  };

  const columns = [
    { header: t('riders.iqamaNumber'), accessor: 'iqamaNo' },
    { 
      header: t('riders.nameArabic'), 
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{row.nameAR}</span>
          <span className="text-xs text-gray-400 font-normal">{row.jobTitle}</span>
        </div>
      )
    },
    {
      header: (
        <div className="flex items-center gap-2">
          <span>خروج / بلاغ</span>
          <div className="relative flex items-center justify-center w-6 h-6 rounded-md hover:bg-gray-100 transition-colors">
            <Filter 
              size={14} 
              className={statusFilter !== 'all' ? 'text-blue-600' : 'text-gray-400'} 
            />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              title="تصفية حسب الحالة"
            >
              <option value="all">الكل</option>
              <option value="reported">تم الإبلاغ</option>
              <option value="outage">خروج نهائي</option>
              <option value="none">غير محدد</option>
            </select>
          </div>
        </div>
      ),
      render: (row) => {
        let pathBadge;
        if (row.activePath === 2) pathBadge = <StatusBadge status="outage" text="خروج نهائي" />;
        else if (row.activePath === 1) pathBadge = <StatusBadge status="reported" text="تم الإبلاغ" />;
        else pathBadge = <StatusBadge status="None" text="غير محدد" />;

        return (
          <div className="flex flex-col gap-1.5 items-start">
            {pathBadge}
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${row.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {row.isActive !== false ? 'سجل نشط' : 'سجل معطل'}
            </span>
          </div>
        );
      }
    },
    {
      header: 'تاريخ الهروب',
      render: (row) => (
        <div className="text-sm">
          {row.escapedAt && (
            <div className="flex flex-col mb-1">
              <span className="text-gray-400 text-[10px] uppercase">تاريخ الهروب:</span>
              <span className="font-medium">{moment(row.escapedAt).format('YYYY-MM-DD')}</span>
            </div>
          )}
          {row.removalDeadline && (
            <div className="flex flex-col">
              <span className="text-gray-400 text-[10px] uppercase text-red-500">الموعد النهائي:</span>
              <span className="font-semibold text-red-600">{moment(row.removalDeadline).format('YYYY-MM-DD')}</span>
            </div>
          )}
        </div>
      )
    },
    {
      header: 'الأيام المتبقية',
      render: (row) => {
        const remaining = row.remainingDaysToRemoval;
        if (remaining === null || remaining === undefined) return '-';
        
        const isWarning = remaining <= 10;
        const isOverdue = row.isOverdue;
        
        return (
          <div className={`flex items-center gap-1 font-bold ${isOverdue ? 'text-red-700' : isWarning ? 'text-orange-600 animate-pulse' : 'text-blue-600'}`}>
            <Clock size={16} />
            <span>{remaining} يوم</span>
            {(isWarning || isOverdue) && <ShieldAlert size={16} />}
          </div>
        );
      }
    },
    {
      header: t('riders.actions'),
      render: (row) => (
        <div className="flex gap-2">
          <Button 
            onClick={() => handleOpenPathModal(row)}
            className="!p-2 !bg-blue-500 hover:!bg-blue-600 text-blue-600 border-none"
            title="تحديد المسار"
          >
            <Edit size={15} />
          </Button>
          <Button 
            onClick={() => handleOpenNotesModal(row)}
            className="!p-2 !bg-gray-500 hover:!bg-gray-600 text-gray-600 border-none"
            title="الملاحظات"
          >
            <NotebookTabs size={15} />
          </Button>
          {row.isActive !== false ? (
            <Button 
              onClick={() => handleDeactivateRecord(row.iqamaNo)}
              className="!p-2 !bg-orange-500 hover:!bg-orange-600 text-orange-600 border-none"
              title="تعطيل الموظف"
            >
              <Power size={15} />
            </Button>
          ) : (
            <Button 
              onClick={() => handleActivateRecord(row.iqamaNo)}
              className="!p-2 !bg-green-500 hover:!bg-green-600 text-green-600 border-none"
              title="إعادة تفعيل الموظف"
            >
              <Power size={15} />
            </Button>
          )}
          <Button 
            onClick={() => handleForceDeleteRecord(row.iqamaNo)}
            className="!p-2 !bg-red-500 hover:!bg-red-600 text-red-600 border-none"
            title="حذف نهائي"
          >
            <Trash2 size={15} />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="إدارة شؤون الموظفين الهاربين"
        subtitle="متابعة بلاغات الهروب وتواريخ الخروج من البلاد"
        icon={AlertCircle}
      />

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pr-4 pl-4">
        <Card className="flex items-center justify-between p-4 bg-white border-r-4 border-blue-500 !shadow-sm">
          <div>
            <p className="text-xs text-gray-500 mb-1">إجمالي الموظفين الهاربين</p>
            <p className="text-2xl font-bold text-blue-700">{stats.totalEscaped}</p>
          </div>
          <User className="text-blue-500 opacity-20" size={40} />
        </Card>
        <Card className="flex items-center justify-between p-4 bg-white border-r-4 border-red-500 !shadow-sm">
          <div>
            <p className="text-xs text-gray-500 mb-1">فترة الانتهاء</p>
            <p className="text-2xl font-bold text-red-700">{stats.dueWithin10DaysCount}</p>
          </div>
          <Clock className="text-red-500 opacity-20" size={40} />
        </Card>
        <Card className="flex items-center justify-between p-4 bg-white border-r-4 border-orange-500 !shadow-sm">
          <div>
            <p className="text-xs text-gray-500 mb-1">  تم الإبلاغات</p>
            <p className="text-2xl font-bold text-orange-700">{stats.reportedPathCount}</p>
          </div>
          <FileText className="text-orange-500 opacity-20" size={40} />
        </Card>
        <Card className="flex items-center justify-between p-4 bg-white border-r-4 border-green-500 !shadow-sm">
          <div>
            <p className="text-xs text-gray-500 mb-1">خروج نهائي</p>
            <p className="text-2xl font-bold text-green-700">{stats.outagePathCount}</p>
          </div>
          <Globe className="text-green-500 opacity-20" size={40} />
        </Card>
      </div>

      {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />}
      {errorMessage && <Alert type="error" message={errorMessage} onClose={() => setErrorMessage('')} />}

      <Card className="!shadow-sm !border-gray-100">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="relative w-full">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300" size={18} />
            <input 
              type="text" 
              placeholder="بحث بالاسم أو رقم الإقامة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
            />
          </div>
          <div className="flex gap-2 whitespace-nowrap">
            <Button onClick={handleExportNoPath} className="!bg-green-600 hover:!bg-green-700 text-white flex items-center gap-2">
              <FileDown size={18} />
              استخراج بدون مسار
            </Button>
            <Button onClick={handleExportWithPaths} className="!bg-blue-600 hover:!bg-blue-700 text-white flex items-center gap-2">
              <FileDown size={18} />
              استخراج بمسار
            </Button>
          </div>
        </div>

        <Table 
          columns={columns}
          data={filteredEmployees}
          loading={loading}
          className="rounded-xl overflow-hidden"
        />
      </Card>

      {/* Path Management Modal */}
      <Modal
        isOpen={isPathModalOpen}
        onClose={() => setIsPathModalOpen(false)}
        title={`إدارة حالة الموظف: ${selectedEmployee?.nameAR}`}
        size="lg"
      >
        <div className="space-y-6 py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Path 1: Reported */}
            <div 
              className={`p-5 border-2 rounded-2xl transition-all cursor-pointer relative overflow-hidden ${activePath === 'reported' ? 'border-orange-500 bg-orange-50/30 shadow-md ring-4 ring-orange-50' : 'border-gray-100 hover:border-gray-200 grayscale opacity-70'}`}
              onClick={() => setActivePath('reported')}
            >
              {activePath === 'reported' && <div className="absolute top-0 right-0 p-1 bg-orange-500 text-white rounded-bl-lg"><ShieldAlert size={14} /></div>}
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-lg"><FileText className="text-orange-600" size={20} /></div>
                <h4 className="font-bold text-orange-900">مسار بلاغ الهروب</h4>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5 px-1">تاريخ تقديم البلاغ</label>
                  <input 
                    type="date" 
                    value={formData.reportedAt}
                    onChange={(e) => setFormData({...formData, reportedAt: e.target.value})}
                    disabled={activePath !== 'reported'}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm"
                  />
                </div>
                <div className="flex items-center gap-2 p-1">
                  <input 
                    type="checkbox" 
                    id="isReported"
                    checked={formData.isReported}
                    onChange={(e) => setFormData({...formData, isReported: e.target.checked})}
                    disabled={activePath !== 'reported'}
                    className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <label htmlFor="isReported" className="text-sm font-semibold text-gray-700 cursor-pointer">تم تقديم البلاغ وتثبيته</label>
                </div>
              </div>
            </div>

            {/* Path 2: Outage */}
            <div 
              className={`p-5 border-2 rounded-2xl transition-all cursor-pointer relative overflow-hidden ${activePath === 'outage' ? 'border-green-500 bg-green-50/30 shadow-md ring-4 ring-green-50' : 'border-gray-100 hover:border-gray-200 grayscale opacity-70'}`}
              onClick={() => setActivePath('outage')}
            >
              {activePath === 'outage' && <div className="absolute top-0 right-0 p-1 bg-green-500 text-white rounded-bl-lg"><Globe size={14} /></div>}
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg"><Globe className="text-green-600" size={20} /></div>
                <h4 className="font-bold text-green-900">مسارالخروج النهائي</h4>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5 px-1">تاريخ الخروج / الإيقاف</label>
                  <input 
                    type="date" 
                    value={formData.outageDate} 
                    onChange={(e) => setFormData({...formData, outageDate: e.target.value})}
                    disabled={activePath !== 'outage'}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5 px-1">رقم تأشيرة الخروج</label>
                  <input 
                    type="text" 
                    placeholder="أدخل رقم التأشيرة..."
                    value={formData.outageVisaNumber}
                    onChange={(e) => setFormData({...formData, outageVisaNumber: e.target.value})}
                    disabled={activePath !== 'outage'}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50/50 p-4 rounded-2xl flex items-start gap-4 border border-blue-100/50">
            <div className="p-2 bg-blue-100 rounded-full"><AlertCircle className="text-blue-600" size={18} /></div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-blue-900">تنيه حول المهل الزمنية</p>
              <p className="text-xs text-blue-700 leading-relaxed opacity-80">
                اختيار مسار يغلق المسار الآخر تلقائياً. يتم احتساب مهلة الـ 60 يوماً وتنبيهات الـ 10 أيام بناءً على التواريخ المدخلة لكل مسار بشكل مستقل.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <Button onClick={() => setIsPathModalOpen(false)} className="!bg-white !text-gray-500 hover:!bg-gray-50 border-gray-200">إلغاء</Button>
            <Button onClick={handleSavePath} className="!bg-blue-600 hover:!bg-blue-700 text-white px-10 rounded-xl shadow-lg shadow-blue-100 transition-all font-bold">حفظ الحالة الجديدة</Button>
          </div>
        </div>
      </Modal>

      {/* Notes Modal */}
      <Modal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        title="ملاحظات الموظف"
      >
        <div className="space-y-4 py-2">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[150px] text-sm leading-relaxed"
            placeholder="اكتب أي ملاحظات إضافية هنا..."
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button onClick={() => setIsNotesModalOpen(false)} className="!bg-gray-100 !text-gray-600">إغلاق</Button>
            <Button onClick={handleSaveNotes} className="!bg-blue-600 text-white">حفظ الملاحظات</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
