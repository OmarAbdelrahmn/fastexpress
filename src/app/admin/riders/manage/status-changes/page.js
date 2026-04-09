'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useLanguage } from '@/lib/context/LanguageContext';
import Card from '@/components/Ui/Card';
import Table from '@/components/Ui/Table';
import Alert from '@/components/Ui/Alert';
import Input from '@/components/Ui/Input';
import Button from '@/components/Ui/Button';
import SearchableSelect from '@/components/Ui/SearchableSelect';
import StatusBadge from '@/components/Ui/StatusBadge';
import PageHeader from '@/components/layout/pageheader';
import { History, Search, ArrowLeft, User, MapPin, Briefcase, Globe, Shield, Activity, Clock, Users } from 'lucide-react';

export default function RiderStatusChangesPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [iqamaNo, setIqamaNo] = useState('');
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingRiders, setLoadingRiders] = useState(false);
  const [riderData, setRiderData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Load riders list on mount for the searchable select
  useEffect(() => {
    fetchRiders();
  }, []);

  const fetchRiders = async () => {
    setLoadingRiders(true);
    try {
      const data = await ApiService.get(API_ENDPOINTS.RIDER.LIST);
      if (Array.isArray(data)) {
        // Format riders for SearchableSelect
        const formattedRiders = data.map(r => ({
          id: r.iqamaNo,
          name: `${r.nameAR} - ${r.iqamaNo}`
        }));
        setRiders(formattedRiders);
      }
    } catch (err) {
      console.error('Error fetching riders:', err);
    } finally {
      setLoadingRiders(false);
    }
  };

  const handleSearch = async (e, forcedIqama = null) => {
    e?.preventDefault();
    const searchIqama = (forcedIqama || iqamaNo)?.toString().trim();
    if (!searchIqama) return;

    setLoading(true);
    setErrorMessage('');
    setRiderData(null);

    try {
      const data = await ApiService.get(API_ENDPOINTS.RIDER.STATUS_CHANGES(searchIqama));
      setRiderData(data);
    } catch (err) {
      console.error('Error fetching status changes:', err);
      setErrorMessage(err?.message || t('employees.riderStatusChanges.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleRiderSelect = (e) => {
    const selectedIqama = e.target.value;
    setIqamaNo(selectedIqama);
    if (selectedIqama) {
      handleSearch(null, selectedIqama);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const logColumns = [
    {
      header: t('employees.riderStatusChanges.changedAt'),
      accessor: 'changedAt',
      render: (row) => (
        <span className="text-sm font-medium text-gray-700">
          {formatDate(row.changedAt)}
        </span>
      )
    },
    {
      header: t('employees.riderStatusChanges.oldStatus'),
      accessor: 'oldStatus',
      render: (row) => (
        <StatusBadge status={row.oldStatus} />
      )
    },
    {
      header: t('employees.riderStatusChanges.newStatus'),
      accessor: 'newStatus',
      render: (row) => (
        <StatusBadge status={row.newStatus} />
      )
    },
    {
      header: t('employees.riderStatusChanges.changeSource'),
      accessor: 'changeSource',
      render: (row) => (
        <span className="text-sm text-blue-600 font-medium">
          {row.changeSource === 'StatusRequest' 
            ? t('employees.riderStatusChanges.statusRequest') 
            : t('employees.riderStatusChanges.directUpdate')}
        </span>
      )
    },
    {
      header: t('employees.riderStatusChanges.changedBy'),
      accessor: 'changedBy',
      render: (row) => (
        <div className="flex items-center gap-1">
          <User size={14} className="text-gray-400" />
          <span className="text-sm text-gray-600">{row.changedBy || '-'}</span>
        </div>
      )
    },
    {
      header: t('employees.riderStatusChanges.reason'),
      accessor: 'reason',
      render: (row) => (
        <span className="text-sm text-gray-500 italic max-w-xs truncate block">
          {row.reason || '-'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('employees.riderStatusChanges.title')}
        subtitle={t('employees.riderStatusChanges.description')}
        icon={History}
        actionButton={{
          text: t('common.back'),
          icon: <ArrowLeft size={18} />,
          onClick: () => router.push('/admin/riders/manage'),
          variant: 'secondary'
        }}
      />

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <div className="space-y-2">
            <SearchableSelect
              label={t('employees.riderStatusChanges.selectRider') || "اختر المندوب"}
              options={riders}
              value={iqamaNo}
              onChange={handleRiderSelect}
              placeholder={t('employees.riderStatusChanges.searchPlaceholder')}
              loading={loadingRiders}
            />
          </div>
          
          <div className="flex gap-2 pb-0.5">
            <div className="flex-1">
              <Input
                value={iqamaNo}
                onChange={(e) => setIqamaNo(e.target.value)}
                placeholder={t('employees.riderStatusChanges.searchPlaceholder')}
                icon={<Shield size={18} />}
              />
            </div>
            <Button onClick={handleSearch} loading={loading} disabled={loading || !iqamaNo?.toString().trim()}>
              <Search size={18} />
            </Button>
          </div>
        </div>
      </Card>

      {errorMessage && (
        <Alert
          type="error"
          title={t('common.error')}
          message={errorMessage}
          onClose={() => setErrorMessage('')}
        />
      )}

      {riderData && (
        <>
          {/* Rider information summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <User size={20} className="text-blue-500" />
                {t('employees.riderStatusChanges.riderSummary')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-400" />
                    <span className="text-sm font-bold text-gray-700">{riderData.nameAR}</span>
                    <span className="text-xs text-gray-500 italic">({riderData.nameEN})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">{t('employees.iqamaNumber')}:</span>
                    <span className="text-sm font-medium">{riderData.iqamaNo}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">{t('employees.jobTitle')}:</span>
                    <span className="text-sm font-medium">{riderData.jobTitle || '-'}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Globe size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">{t('employees.country')}:</span>
                    <span className="text-sm font-medium">{riderData.country}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">{t('employees.excelColumns.status')}:</span>
                    <StatusBadge status={riderData.currentStatus} />
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">Housing:</span>
                    <span className="text-sm font-medium truncate" title={riderData.housingAddress}>
                      {riderData.housingName || '-'}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Activity size={20} className="text-purple-500" />
                {t('employees.riderStatusChanges.stats')}
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-purple-50 p-2 rounded">
                  <span className="text-sm text-purple-700">{t('employees.riderStatusChanges.totalChanges')}</span>
                  <span className="font-bold text-purple-800">{riderData.totalChanges}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b pb-2">
                  <span className="text-gray-600">{t('employees.riderStatusChanges.directUpdates')}</span>
                  <span className="font-medium text-gray-800">{riderData.directUpdates}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b pb-2">
                  <span className="text-gray-600">{t('employees.riderStatusChanges.statusRequests')}</span>
                  <span className="font-medium text-gray-800">{riderData.statusRequests}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock size={12} />
                    <span>{t('employees.riderStatusChanges.firstChange')}:</span>
                  </div>
                  <div className="text-sm font-medium">{formatDate(riderData.firstChangeAt)}</div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock size={12} />
                    <span>{t('employees.riderStatusChanges.lastChange')}:</span>
                  </div>
                  <div className="text-sm font-medium font-bold text-blue-600">{formatDate(riderData.lastChangeAt)}</div>
                </div>
              </div>
            </Card>
          </div>

          <Card>
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {t('employees.riderStatusChanges.logs')}
            </h3>
            {riderData.logs && riderData.logs.length > 0 ? (
              <Table
                columns={logColumns}
                data={riderData.logs}
                loading={loading}
              />
            ) : (
              <div className="text-center py-10 text-gray-500 italic">
                {t('employees.riderStatusChanges.noLogs')}
              </div>
            )}
          </Card>
        </>
      )}

      {!riderData && !loading && !errorMessage && (
        <div className="text-center py-20 opacity-50">
          <History size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-xl font-medium text-gray-400">
            {t('employees.riderStatusChanges.enterIqama')}
          </p>
        </div>
      )}
    </div>
  );
}
