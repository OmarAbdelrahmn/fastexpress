'use client';

import AccountantInventoryPage, { formatDate } from '@/components/accountant/AccountantInventoryPage';
import { accountingService } from '@/lib/api/accountingService';

export default function AccountantRiderAccessoriesPage() {
  return (
    <AccountantInventoryPage
      title="معدات السائقين"
      subtitle="إدارة مخزون معدات السائقين ومواقع التخزين"
      addLabel="إضافة معدة"
      searchPlaceholder="بحث باسم المعدة أو الموقع..."
      service={accountingService.riderAccessories}
      historyColumns={[
        { header: 'رقم السائق', render: (row) => row.riderId || row.iqamaNo || '-' },
        { header: 'الكمية المصروفة', render: (row) => row.quantityIssued ?? row.quantity ?? '-' },
        { header: 'تاريخ الصرف', render: (row) => formatDate(row.issuedAt || row.createdAt) },
      ]}
    />
  );
}
