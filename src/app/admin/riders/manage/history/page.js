'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/context/LanguageContext';
import Card from '@/components/Ui/Card';
import Input from '@/components/Ui/Input';
import Button from '@/components/Ui/Button';
import PageHeader from '@/components/layout/pageheader';
import { History, Search, ArrowLeft } from 'lucide-react';

export default function HistorySearchPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [iqamaNo, setIqamaNo] = useState('');

  const handleSearch = (e) => {
    e?.preventDefault();
    if (iqamaNo.trim()) {
      router.push(`/admin/riders/manage/history/${iqamaNo.trim()}`);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('employees.history')}
        subtitle={t('employees.viewHistory')}
        icon={History}
        actionButton={{
          text: t('common.back'),
          icon: <ArrowLeft size={18} />,
          onClick: () => router.push('/admin/riders/manage'),
          variant: 'secondary'
        }}
      />

      <Card>
        <form onSubmit={handleSearch} className="max-w-xl mx-auto py-8">
          <div className="text-center mb-8">
            <History className="mx-auto text-blue-500 mb-4" size={48} />
            <h2 className="text-xl font-bold text-gray-800">
              {t('employees.history')}
            </h2>
            <p className="text-gray-600 mt-2">
              {t('employees.enterIqamaNumber')}
            </p>
          </div>

          <div className="space-y-4">
            <Input
              label={t('employees.iqamaNumber')}
              value={iqamaNo}
              onChange={(e) => setIqamaNo(e.target.value)}
              placeholder={t('employees.iqamaNumber')}
              required
              autoFocus
            />

            <Button
              type="submit"
              className="w-full"
              disabled={!iqamaNo.trim()}
            >
              <Search size={18} className="ml-2" />
              {t('common.search')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
