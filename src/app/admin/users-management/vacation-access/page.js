'use client';

import { useEffect, useMemo, useState } from 'react';
import { KeyRound, RefreshCw, Save } from 'lucide-react';
import Alert from '@/components/Ui/Alert';
import Button from '@/components/Ui/Button';
import Card from '@/components/Ui/Card';
import PageHeader from '@/components/layout/pageheader';
import SearchableSelect from '@/components/Ui/SearchableSelect';
import { TokenManager } from '@/lib/auth/tokenManager';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { VacationService, listFromResponse } from '@/lib/api/vacationService';

const VACATION_ROLES = [
  { value: 1, label: 'العمليات' },
  { value: 2, label: 'المحاسب' },
  { value: 3, label: 'الإدارة' },
  { value: 4, label: 'الموارد البشرية (HR)' },
];

const userIdOf = (item) => item?.userId ?? item?.id ?? item?.user?.id;
const roleValuesOf = (item) => {
  const rawRoles = item?.roles ?? item?.vacationRoles ?? item?.roleValues ?? [];
  const values = Array.isArray(rawRoles)
    ? rawRoles
    : typeof rawRoles === 'string'
      ? rawRoles.split(',')
      : rawRoles && typeof rawRoles === 'object'
        ? Object.values(rawRoles)
        : [rawRoles];
  return values.map(Number).filter((role) => VACATION_ROLES.some((item) => item.value === role));
};
const userNameOf = (item) => item?.userName || item?.username || item?.name || item?.user?.userName || 'بدون اسم';

export default function VacationAccessPage() {
  const [users, setUsers] = useState([]);
  const [accessEntries, setAccessEntries] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const currentUser = TokenManager.getUserFromToken() || {};
  const rawRoles = currentUser.roles ?? currentUser.role ?? currentUser['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? [];
  const isMaster = (Array.isArray(rawRoles) ? rawRoles : [rawRoles]).some((role) => String(role).toLowerCase() === 'master');

  const load = async () => {
    if (!isMaster) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [usersResponse, accessResponse] = await Promise.all([
        ApiService.get(API_ENDPOINTS.ADMIN.USERS),
        VacationService.access(),
      ]);
      setUsers(listFromResponse(usersResponse));
      setAccessEntries(listFromResponse(accessResponse));
    } catch (error) {
      setNotice({ type: 'error', text: error.message || 'تعذر تحميل صلاحيات الإجازات.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const accessByUserId = useMemo(
    () => new Map(accessEntries.map((entry) => [String(userIdOf(entry)), entry])),
    [accessEntries],
  );
  const assignedUsers = useMemo(() => accessEntries.map((entry) => {
    const matchingUser = users.find((user) => String(userIdOf(user)) === String(userIdOf(entry)));
    // Keep `roles` from the vacation-access API; identity roles on the user object are unrelated.
    return { ...(matchingUser || {}), ...entry };
  }), [accessEntries, users]);

  const selectUser = (event) => {
    const userId = event.target.value;
    setSelectedUserId(userId);
    setSelectedRoles(roleValuesOf(accessByUserId.get(String(userId))));
  };

  const toggleRole = (role) => setSelectedRoles((current) =>
    current.includes(role) ? current.filter((value) => value !== role) : [...current, role],
  );

  const save = async () => {
    if (!selectedUserId) {
      setNotice({ type: 'error', text: 'اختر مستخدماً أولاً.' });
      return;
    }
    setSaving(true);
    try {
      await VacationService.updateAccess(selectedUserId, selectedRoles);
      setNotice({ type: 'success', text: 'تم حفظ صلاحيات الإجازات للمستخدم.' });
      await load();
    } catch (error) {
      setNotice({ type: 'error', text: error.message || 'تعذر حفظ صلاحيات الإجازات.' });
    } finally {
      setSaving(false);
    }
  };

  return <div className="space-y-6" dir="rtl">
    <PageHeader
      title="صلاحيات الإجازات"
      subtitle="تعيين صلاحيات العمليات والمحاسب والإدارة للمستخدمين. هذه الصلاحيات مستقلة عن أدوار الهوية."
      icon={KeyRound}
      actions={<Button variant="outline" onClick={load} loading={loading}><RefreshCw size={17} /> تحديث</Button>}
      stats={[
        { label: 'إجمالي المستخدمين', value: users.length },
        { label: 'لديهم صلاحيات إجازات', value: accessEntries.length },
      ]}
    />

    {!isMaster && <Alert type="warning" title="وصول محدود" message="إدارة صلاحيات الإجازات متاحة لدور Master فقط." />}
    {notice && <Alert type={notice.type} title={notice.type === 'success' ? 'تم الحفظ' : 'خطأ'} message={notice.text} onClose={() => setNotice(null)} />}

    {isMaster && <>
      <Card title="تعيين صلاحيات مستخدم">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <SearchableSelect
            label="المستخدم"
            name="userId"
            required
            value={selectedUserId}
            onChange={selectUser}
            placeholder="ابحث باسم المستخدم أو الاسم الكامل"
            options={users.map((user) => ({
              id: userIdOf(user),
              name: [userNameOf(user), user.fullName].filter(Boolean).join(' — '),
            }))}
          />
          <Button variant="blue" onClick={save} loading={saving} disabled={!selectedUserId} className="min-w-36"><Save size={17} /> حفظ الصلاحيات</Button>
        </div>

        <div className="mt-6 border-t border-gray-100 pt-5">
          <p className="mb-3 text-sm font-medium text-gray-700">أدوار الإجازات</p>
          <div className="flex flex-wrap gap-3">
            {VACATION_ROLES.map((role) => <label key={role.value} className={`cursor-pointer rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${selectedRoles.includes(role.value) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}>
              <input type="checkbox" className="ml-2 h-4 w-4 accent-blue-600" checked={selectedRoles.includes(role.value)} onChange={() => toggleRole(role.value)} />
              {role.label}
            </label>)}
          </div>
        </div>
      </Card>

      <Card title="المستخدمون المعيّنون لصلاحيات الإجازات">
        {loading ? <div className="flex justify-center py-10"><div className="h-9 w-9 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" /></div>
          : assignedUsers.length === 0 ? <div className="py-10 text-center text-gray-500">لا توجد صلاحيات إجازات معيّنة حتى الآن.</div>
            : <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-right text-xs font-medium text-gray-500">المستخدم</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500">الاسم</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500">صلاحيات الإجازات</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500">إجراء</th></tr></thead><tbody className="divide-y divide-gray-200 bg-white">{assignedUsers.map((user, index) => { const userId = userIdOf(user); const roles = roleValuesOf(user); return <tr key={userId || index} className="hover:bg-gray-50"><td className="px-6 py-4 text-sm font-medium text-gray-900">{user.userName || user.username || '—'}</td><td className="px-6 py-4 text-sm text-gray-700">{user.fullName || user.name || '—'}</td><td className="px-6 py-4"><div className="flex flex-wrap gap-2">{roles.map((role) => <span key={role} className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">{VACATION_ROLES.find((item) => item.value === role)?.label || 'غير معروف'}</span>)}</div></td><td className="px-6 py-4"><button onClick={() => { setSelectedUserId(String(userId)); setSelectedRoles(roles); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-sm font-medium text-blue-600 hover:text-blue-800">تعديل</button></td></tr>; })}</tbody></table></div>}
      </Card>
    </>}
  </div>;
}
