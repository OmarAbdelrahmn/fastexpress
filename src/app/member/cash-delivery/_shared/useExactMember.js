'use client';

import { TokenManager } from '@/lib/auth/tokenManager';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function primaryRole(user) {
  const rawRoles = user?.roles
    ?? user?.role
    ?? user?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
    ?? [];
  return String(Array.isArray(rawRoles) ? rawRoles[0] ?? '' : rawRoles);
}

export function useExactMember() {
  const router = useRouter();
  const [state, setState] = useState({ checking: true, allowed: false });

  useEffect(() => {
    const user = TokenManager.getUserFromToken();
    const allowed = primaryRole(user) === 'Member';
    setState({ checking: false, allowed });
    if (!allowed) router.replace('/member/dashboard');
  }, [router]);

  return state;
}
