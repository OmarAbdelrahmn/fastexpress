'use client';

import AccountantInventoryPage, { formatDate } from '@/components/accountant/AccountantInventoryPage';
import { accountingService } from '@/lib/api/accountingService';

export default function AccountantSparePartsPage() {
  return (
    <AccountantInventoryPage
      title="قطع الغيار"
      subtitle="إدارة مخزون قطع الغيار ومواقع التخزين"
      addLabel="إضافة قطعة"
      searchPlaceholder="بحث باسم القطعة أو الموقع..."
      service={accountingService.spareParts}
      historyColumns={[
        { header: 'رقم المركبة', render: (row) => row.vehicleNumber || '-' },
        { header: 'الكمية المستخدمة', render: (row) => row.quantityUsed ?? row.quantity ?? '-' },
        { header: 'تاريخ الاستخدام', render: (row) => formatDate(row.usedAt || row.createdAt) },
      ]}
    />
  );
}
