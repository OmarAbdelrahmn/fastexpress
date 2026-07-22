'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  BarChart3,
  BookOpenCheck,
  Boxes,
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  CircleDollarSign,
  ClipboardCheck,
  FileInput,
  FileSpreadsheet,
  Files,
  Landmark,
  Languages,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptText,
  Scale,
  Settings2,
  ShieldCheck,
  UserRound,
  UsersRound,
  Wrench,
  WalletCards,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/authContext';
import { useLanguage } from '@/lib/context/LanguageContext';
import { accountingDirection, accountingT } from '@/lib/accounting/i18n';
import { useAccountingWorkspace } from '@/lib/accounting/AccountingWorkspaceContext';
import { cn, getInitials } from './utils';

export const ACCOUNTING_NAVIGATION = [
  {
    key: 'overview',
    labelKey: 'nav.overview',
    items: [
      { key: 'dashboard', labelKey: 'nav.dashboard', href: '/accountant/dashboard', icon: LayoutDashboard, permission: 'View' },
    ],
  },
  {
    key: 'revenueCycle',
    labelKey: 'nav.revenueCycle',
    items: [
      { key: 'files', labelKey: 'nav.files', href: '/accountant/files', icon: Files, permission: 'View' },
      { key: 'imports', labelKey: 'nav.imports', href: '/accountant/imports', icon: FileInput, permission: 'View' },
      { key: 'compensation', labelKey: 'nav.compensation', href: '/accountant/compensation', icon: Scale, permission: 'View' },
    ],
  },
  {
    key: 'riders',
    labelKey: 'nav.riders',
    items: [
      { key: 'payroll', labelKey: 'nav.payroll', href: '/accountant/payroll', icon: UsersRound, permission: 'View' },
      { key: 'payments', labelKey: 'nav.payments', href: '/accountant/payments', icon: WalletCards, permission: 'View' },
      { key: 'riderProfiles', labelKey: 'nav.riderProfiles', href: '/accountant/riders', icon: UserRound, permission: 'View' },
    ],
  },
  {
    key: 'accounting',
    labelKey: 'nav.accounting',
    items: [
      { key: 'ledgerSetup', labelKey: 'nav.ledgerSetup', href: '/accountant/ledger', icon: Settings2, permission: 'View' },
      { key: 'journals', labelKey: 'nav.journals', href: '/accountant/journals', icon: BookOpenCheck, permission: 'View' },
      { key: 'reports', labelKey: 'nav.reports', href: '/accountant/reports', icon: BarChart3, permission: 'View' },
    ],
  },
  {
    key: 'operations',
    labelKey: 'nav.operations',
    items: [
      { key: 'receivables', labelKey: 'nav.receivables', href: '/accountant/operations/receivables', icon: CircleDollarSign, permission: 'View' },
      { key: 'payables', labelKey: 'nav.payables', href: '/accountant/operations/payables', icon: ReceiptText, permission: 'View' },
      { key: 'expenses', labelKey: 'nav.expenses', href: '/accountant/operations/expenses', icon: ClipboardCheck, permission: 'View' },
      { key: 'inventory', labelKey: 'nav.inventory', href: '/accountant/operations/inventory', icon: Boxes, permission: 'View' },
      { key: 'treasury', labelKey: 'nav.treasury', href: '/accountant/operations/treasury', icon: Landmark, permission: 'View' },
      { key: 'compliance', labelKey: 'nav.compliance', href: '/accountant/operations/compliance', icon: BriefcaseBusiness, permission: 'View' },
    ],
  },
  {
    key: 'administration',
    labelKey: 'nav.administration',
    items: [
      { key: 'financialAccess', labelKey: 'nav.financialAccess', href: '/accountant/access', icon: ShieldCheck, permission: 'Configure', roles: ['Master'] },
      { key: 'setup', labelKey: 'nav.setup', href: '/accountant/setup', icon: Wrench, permission: 'Configure' },
    ],
  },
];

function userName(user) {
  return user?.unique_name ?? user?.name ?? user?.preferred_username ?? user?.email ?? user?.sub ?? 'Fast Express';
}

function userSecondary(user) {
  return user?.email ?? user?.preferred_username ?? '';
}

function isPathActive(pathname, href) {
  if (href === '/accountant/dashboard') return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarNavigation({ onNavigate }) {
  const pathname = usePathname();
  const { locale } = useLanguage();
  const { can, hasRole, selectedLegalEntity } = useAccountingWorkspace();
  const t = (key) => accountingT(locale, key);

  const groups = ACCOUNTING_NAVIGATION.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      const roleAllowed = !item.roles || hasRole(item.roles);
      return roleAllowed && can(item.permission);
    }),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="accounting-brand">
        <div className="accounting-brand__mark" aria-hidden="true">FE</div>
        <div className="min-w-0">
          <p className="truncate text-sm font-black tracking-tight text-white" dir="ltr">{t('shell.brand')}</p>
          <p className="mt-0.5 truncate text-[11px] font-medium text-blue-100">{t('shell.product')}</p>
        </div>
      </div>

      <nav aria-label={t('shell.primaryNavigation')} className="accounting-nav">
        {groups.map((group) => (
          <div key={group.key} className="accounting-nav__group">
            <p className="accounting-nav__group-label">{t(group.labelKey)}</p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = isPathActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? 'page' : undefined}
                    className={cn('accounting-nav__link', active && 'accounting-nav__link--active')}
                  >
                    <Icon aria-hidden="true" size={17} strokeWidth={1.8} />
                    <span className="min-w-0 flex-1 truncate">{t(item.labelKey)}</span>
                    {active && <span className="accounting-nav__active-marker" aria-hidden="true" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="accounting-sidebar__footer">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-800">
          <Building2 aria-hidden="true" size={16} />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{t('workspace.entityContext')}</p>
          <p className="mt-0.5 truncate text-xs font-bold text-slate-700">
            {selectedLegalEntity?.name ?? t('workspace.noLegalEntity')}
          </p>
        </div>
      </div>
    </div>
  );
}

function WorkspaceControls() {
  const { locale } = useLanguage();
  const {
    legalEntities,
    selectedLegalEntityId,
    setSelectedLegalEntityId,
    fiscalPeriods,
    selectedFiscalPeriodId,
    setSelectedFiscalPeriodId,
    can,
  } = useAccountingWorkspace();
  const t = (key) => accountingT(locale, key);

  return (
    <div className="accounting-workspace-controls" aria-label={t('workspace.entityContext')}>
      <label className="accounting-context-control">
        <span className="accounting-context-control__label">{t('workspace.legalEntity')}</span>
        <span className="relative flex items-center">
          <Building2 className="accounting-context-control__icon" aria-hidden="true" size={15} />
          <select
            value={selectedLegalEntityId}
            onChange={(event) => setSelectedLegalEntityId(event.target.value)}
            disabled={!legalEntities.length}
            aria-label={t('workspace.legalEntity')}
          >
            {!legalEntities.length && <option value="">{t('workspace.noLegalEntity')}</option>}
            {legalEntities.map((entity) => (
              <option key={entity.id} value={entity.id}>
                {entity.code ? `${entity.code} · ${entity.name}` : entity.name}
              </option>
            ))}
          </select>
          <ChevronDown className="accounting-context-control__chevron" aria-hidden="true" size={14} />
        </span>
      </label>

      <label className="accounting-context-control">
        <span className="accounting-context-control__label">{t('workspace.fiscalPeriod')}</span>
        <span className="relative flex items-center">
          <FileSpreadsheet className="accounting-context-control__icon" aria-hidden="true" size={15} />
          <select
            value={selectedFiscalPeriodId}
            onChange={(event) => setSelectedFiscalPeriodId(event.target.value)}
            aria-label={t('workspace.fiscalPeriod')}
          >
            {fiscalPeriods.map((period) => (
              <option key={period.id} value={period.id}>
                {period.name}{period.isCurrent ? ` · ${t('workspace.currentPeriod')}` : ''}
              </option>
            ))}
          </select>
          <ChevronDown className="accounting-context-control__chevron" aria-hidden="true" size={14} />
        </span>
      </label>

      {can('Configure') && (
        <Link
          href="/accountant/setup"
          className="accounting-setup-link"
          aria-label={t('nav.manageSetup')}
        >
          <Settings2 aria-hidden="true" size={16} />
          <span>{t('nav.manageSetup')}</span>
        </Link>
      )}
    </div>
  );
}

function UserControls() {
  const { logout } = useAuth();
  const { locale, changeLanguage } = useLanguage();
  const { user, roles } = useAccountingWorkspace();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const t = (key) => accountingT(locale, key);
  const name = userName(user);
  const roleLabel = roles.includes('Master') ? t('shell.master') : t('shell.accountant');

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && open) {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        className="accounting-icon-button"
        onClick={() => changeLanguage(locale === 'ar' ? 'en' : 'ar')}
        aria-label={locale === 'ar' ? t('shell.switchToEnglish') : t('shell.switchToArabic')}
        title={locale === 'ar' ? 'English' : 'العربية'}
      >
        <Languages aria-hidden="true" size={18} />
        <span className="text-[10px] font-black" aria-hidden="true">{locale === 'ar' ? 'EN' : 'ع'}</span>
      </button>

      <div ref={containerRef} className="relative">
        <button
          ref={triggerRef}
          type="button"
          className="accounting-user-trigger"
          onClick={() => setOpen((current) => !current)}
          aria-haspopup="true"
          aria-expanded={open}
          aria-controls="accounting-user-popover"
          aria-label={`${open ? t('shell.closeUserMenu') : t('shell.openUserMenu')}: ${name}`}
        >
          <span className="accounting-avatar" aria-hidden="true">{getInitials(name)}</span>
          <span className="hidden min-w-0 text-start sm:block">
            <span className="block max-w-32 truncate text-xs font-bold text-slate-800">{name}</span>
            <span className="mt-0.5 block text-[10px] font-semibold text-slate-500">{roleLabel}</span>
          </span>
          <ChevronDown aria-hidden="true" size={14} className={cn('hidden text-slate-400 transition sm:block', open && 'rotate-180')} />
        </button>

        {open && (
          <div id="accounting-user-popover" className="accounting-user-popover">
            <div className="border-b border-slate-100 p-3">
              <p className="text-[10px] font-semibold text-slate-400">{t('shell.signedInAs')}</p>
              <p className="mt-1 truncate text-sm font-black text-slate-900">{name}</p>
              {userSecondary(user) && <p className="mt-0.5 truncate text-xs text-slate-500" dir="ltr">{userSecondary(user)}</p>}
              <p className="mt-2 inline-flex rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-800">{roleLabel}</p>
            </div>
            <div className="p-1.5">
              <button
                type="button"
                onClick={logout}
                className="flex min-h-10 w-full items-center gap-2 rounded-lg px-3 py-2 text-start text-sm font-bold text-red-700 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
              >
                <LogOut aria-hidden="true" size={17} />
                {t('shell.logout')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AccountingShell({ children }) {
  const pathname = usePathname();
  const { locale } = useLanguage();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef(null);
  const drawerTriggerRef = useRef(null);
  const direction = accountingDirection(locale);
  const t = (key) => accountingT(locale, key);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const drawer = drawerRef.current;
    const focusable = drawer?.querySelectorAll(
      'a[href], button:not([disabled]), select:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    focusable?.[0]?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setDrawerOpen(false);
        drawerTriggerRef.current?.focus();
        return;
      }
      if (event.key !== 'Tab' || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [drawerOpen]);

  return (
    <div className="accounting-shell" dir={direction}>
      <a href="#accounting-main-content" className="accounting-skip-link">{t('shell.skipToContent')}</a>

      <aside className="accounting-sidebar" aria-label={t('shell.primaryNavigation')}>
        <SidebarNavigation />
      </aside>

      <div className="accounting-shell__workspace">
        <header className="accounting-topbar">
          <div className="accounting-topbar__start">
            <button
              ref={drawerTriggerRef}
              type="button"
              className="accounting-icon-button accounting-mobile-only"
              onClick={() => setDrawerOpen(true)}
              aria-label={t('shell.openNavigation')}
              aria-expanded={drawerOpen}
              aria-controls="accounting-mobile-navigation"
            >
              <Menu aria-hidden="true" size={20} />
            </button>
            <div className="accounting-mobile-brand min-w-0 items-center gap-2.5">
              <span className="accounting-brand__mark accounting-brand__mark--small" aria-hidden="true">FE</span>
              <span className="truncate text-sm font-black text-slate-900" dir="ltr">{t('shell.brand')}</span>
            </div>
          </div>
          <WorkspaceControls />
          <UserControls />
        </header>

        <main id="accounting-main-content" tabIndex="-1" className="accounting-main">
          {children}
        </main>
      </div>

      {drawerOpen && (
        <div className="accounting-mobile-layer">
          <button
            type="button"
            className="accounting-drawer-backdrop"
            onClick={() => setDrawerOpen(false)}
            aria-label={t('shell.closeNavigation')}
          />
          <aside
            ref={drawerRef}
            id="accounting-mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label={t('shell.primaryNavigation')}
            className="accounting-drawer"
          >
            <button
              type="button"
              className="accounting-drawer__close"
              onClick={() => {
                setDrawerOpen(false);
                drawerTriggerRef.current?.focus();
              }}
              aria-label={t('shell.closeNavigation')}
            >
              <X aria-hidden="true" size={19} />
            </button>
            <SidebarNavigation onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}
    </div>
  );
}
