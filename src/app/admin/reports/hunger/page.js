'use client';

import { redirect } from 'next/navigation';

export default function EmployeesPage() {
  redirect('/admin/reports/hunger/summary');
}