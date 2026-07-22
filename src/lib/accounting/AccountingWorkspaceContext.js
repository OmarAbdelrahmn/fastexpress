'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { accountingApi } from '@/lib/api/accountingApi';

export const ACCOUNTING_PERMISSION_FLAGS = Object.freeze({
  View: 1,
  Prepare: 2,
  Approve: 4,
  Post: 8,
  ManagePeriods: 16,
  Configure: 32,
  All: 63,
});

const FULL_ACCESS_ROLES = new Set(['Master', 'Accountant']);
const LEGAL_ENTITY_STORAGE_KEY = 'accounting:selectedLegalEntityId';
const FISCAL_PERIOD_STORAGE_KEY = 'accounting:selectedFiscalPeriodId';
const WORKSPACE_STORAGE_KEY = 'accounting:workspaceFallback';
const AccountingWorkspaceContext = createContext(null);

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === '') return [];
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return trimmed.split(',').map((item) => item.trim()).filter(Boolean);
    }
  }
  return [value];
}

function normalizeRoles(user) {
  return asArray(
    user?.roles
      ?? user?.role
      ?? user?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
  ).map(String);
}

function entityIdOf(entity) {
  if (typeof entity === 'string' || typeof entity === 'number') return String(entity);
  return String(entity?.id ?? entity?.legalEntityId ?? entity?.value ?? '');
}

function normalizeLegalEntity(entity) {
  const id = entityIdOf(entity);
  if (!id) return null;
  if (typeof entity === 'string' || typeof entity === 'number') {
    return { id, name: id, code: '' };
  }
  return {
    ...entity,
    id,
    name: entity.name
      ?? entity.legalName
      ?? entity.legalEntityName
      ?? entity.displayName
      ?? entity.code
      ?? id,
    code: entity.code ?? entity.legalEntityCode ?? '',
  };
}

function normalizeFiscalPeriod(period) {
  const id = String(period?.id ?? period?.fiscalPeriodId ?? period?.value ?? '');
  if (!id) return null;
  const now = new Date();
  const start = period?.startDate ? new Date(period.startDate) : null;
  const end = period?.endDate ? new Date(period.endDate) : null;
  return {
    ...period,
    id,
    name: period.name ?? period.label ?? period.periodName ?? id,
    isCurrent: period.isCurrent
      ?? (start && end && !Number.isNaN(start.valueOf()) && !Number.isNaN(end.valueOf())
        ? start <= now && now <= end
        : false),
  };
}

function uniqueById(values, normalize) {
  const seen = new Set();
  return asArray(values)
    .map(normalize)
    .filter((value) => {
      if (!value || seen.has(value.id)) return false;
      seen.add(value.id);
      return true;
    });
}

function unwrapResponse(response) {
  return response?.data ?? response?.result ?? response;
}

function workspaceFromOrganizationResponse(response) {
  const payload = unwrapResponse(response) ?? {};
  const rawEntities = payload.legalEntities ?? payload.LegalEntities;
  const fiscalYears = payload.fiscalYears
    ?? payload.FiscalYears
    ?? asArray(rawEntities).flatMap(
      (entity) => entity?.fiscalYears ?? entity?.FiscalYears ?? []
    );
  const rawPeriods = payload.fiscalPeriods
    ?? payload.FiscalPeriods
    ?? asArray(fiscalYears).flatMap((year) => year?.periods ?? year?.Periods ?? []);

  return {
    tenant: payload.tenant ?? payload.Tenant,
    hasLegalEntities: rawEntities !== undefined,
    legalEntities: uniqueById(rawEntities, normalizeLegalEntity),
    hasFiscalPeriods: rawPeriods !== undefined,
    fiscalPeriods: uniqueById(rawPeriods, normalizeFiscalPeriod),
  };
}

function readStoredWorkspace() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(WORKSPACE_STORAGE_KEY) ?? 'null');
    if (!stored || typeof stored !== 'object') return null;
    return {
      tenant: stored.tenant,
      legalEntities: uniqueById(stored.legalEntities, normalizeLegalEntity),
      fiscalPeriods: uniqueById(stored.fiscalPeriods, normalizeFiscalPeriod),
    };
  } catch {
    window.localStorage.removeItem(WORKSPACE_STORAGE_KEY);
    return null;
  }
}

function inferLegalEntities(user) {
  const source = user?.legalEntities
    ?? user?.legal_entities
    ?? user?.accessibleLegalEntities
    ?? user?.legalEntityIds
    ?? user?.legalEntityId;
  return asArray(source).map(normalizeLegalEntity).filter(Boolean);
}

function defaultFiscalPeriod() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const id = `${now.getFullYear()}-${month}`;
  return {
    id,
    name: id,
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    isCurrent: true,
  };
}

function permissionMaskFrom(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && /^\d+$/.test(value.trim())) return Number(value);

  return asArray(value).reduce((mask, permission) => {
    const normalized = String(permission).toLowerCase().replace(/[\s_-]/g, '');
    const match = Object.entries(ACCOUNTING_PERMISSION_FLAGS).find(
      ([name]) => name.toLowerCase() === normalized
    );
    return match ? mask | match[1] : mask;
  }, 0);
}

function accessEntityId(access) {
  return String(access?.legalEntityId ?? access?.entityId ?? access?.id ?? '');
}

export function AccountingWorkspaceProvider({ children, user, initialWorkspace = {} }) {
  const roles = useMemo(() => normalizeRoles(user), [user]);
  const organizationRequestIdentity = useMemo(() => String(
    user?.id ?? user?.userId ?? user?.sub ?? roles.join('|')
  ), [roles, user]);
  const hasFullAccessRole = roles.some((role) => FULL_ACCESS_ROLES.has(role));
  const [workspace, setWorkspace] = useState(initialWorkspace);
  const [selectedLegalEntityId, setSelectedLegalEntityIdState] = useState('');
  const [selectedFiscalPeriodId, setSelectedFiscalPeriodIdState] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [workspaceHydrated, setWorkspaceHydrated] = useState(false);
  const [organizationLoading, setOrganizationLoading] = useState(false);
  const [organizationError, setOrganizationError] = useState(null);
  const [workspaceSource, setWorkspaceSource] = useState('initial');

  const legalEntities = useMemo(() => {
    const source = workspace.legalEntities ?? workspace.entities ?? inferLegalEntities(user);
    const seen = new Set();
    return asArray(source)
      .map(normalizeLegalEntity)
      .filter((entity) => {
        if (!entity || seen.has(entity.id)) return false;
        seen.add(entity.id);
        return true;
      });
  }, [user, workspace.entities, workspace.legalEntities]);

  const fiscalPeriods = useMemo(() => {
    const source = workspace.fiscalPeriods ?? workspace.periods;
    const normalized = asArray(source).map(normalizeFiscalPeriod).filter(Boolean);
    return normalized.length ? normalized : [defaultFiscalPeriod()];
  }, [workspace.fiscalPeriods, workspace.periods]);

  useEffect(() => {
    const storedEntityId = window.localStorage.getItem(LEGAL_ENTITY_STORAGE_KEY);
    const storedPeriodId = window.localStorage.getItem(FISCAL_PERIOD_STORAGE_KEY);
    const storedWorkspace = readStoredWorkspace();

    if (storedEntityId) setSelectedLegalEntityIdState(storedEntityId);
    if (storedPeriodId) setSelectedFiscalPeriodIdState(storedPeriodId);
    if (storedWorkspace) {
      setWorkspace((current) => ({
        ...storedWorkspace,
        ...current,
        legalEntities: current.legalEntities ?? current.entities ?? storedWorkspace.legalEntities,
        fiscalPeriods: current.fiscalPeriods ?? current.periods ?? storedWorkspace.fiscalPeriods,
      }));
      setWorkspaceSource('stored');
    }
    setWorkspaceHydrated(true);
  }, []);

  useEffect(() => {
    if (!workspaceHydrated || !organizationRequestIdentity) return undefined;

    let cancelled = false;
    setOrganizationLoading(true);
    setOrganizationError(null);

    accountingApi.organization.getCurrent()
      .then((response) => {
        if (cancelled) return;
        const organization = workspaceFromOrganizationResponse(response);

        setWorkspace((current) => ({
          ...current,
          ...(organization.tenant ? { tenant: organization.tenant } : {}),
          ...(organization.hasLegalEntities
            ? { legalEntities: organization.legalEntities }
            : {}),
          ...(organization.hasFiscalPeriods
            ? { fiscalPeriods: organization.fiscalPeriods }
            : {}),
        }));
        setWorkspaceSource('organization');
      })
      .catch((requestError) => {
        if (cancelled) return;
        // The cached/manual workspace remains usable if the bootstrap route is unavailable.
        setWorkspaceSource((current) => current === 'initial' ? 'fallback' : current);
        if (requestError?.status !== 404) setOrganizationError(requestError);
      })
      .finally(() => {
        if (!cancelled) setOrganizationLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [organizationRequestIdentity, workspaceHydrated]);

  useEffect(() => {
    if (!workspaceHydrated) return;
    window.localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify({
      tenant: workspace.tenant,
      legalEntities,
      fiscalPeriods,
    }));
  }, [fiscalPeriods, legalEntities, workspace.tenant, workspaceHydrated]);

  useEffect(() => {
    if (!legalEntities.length) {
      setSelectedLegalEntityIdState('');
      return;
    }
    if (!legalEntities.some((entity) => entity.id === selectedLegalEntityId)) {
      setSelectedLegalEntityIdState(legalEntities[0].id);
    }
  }, [legalEntities, selectedLegalEntityId]);

  useEffect(() => {
    if (!fiscalPeriods.length) return;
    if (!fiscalPeriods.some((period) => period.id === selectedFiscalPeriodId)) {
      const current = fiscalPeriods.find((period) => period.isCurrent) ?? fiscalPeriods[0];
      setSelectedFiscalPeriodIdState(current.id);
    }
  }, [fiscalPeriods, selectedFiscalPeriodId]);

  useEffect(() => {
    if (!workspaceHydrated) return;
    if (selectedLegalEntityId) {
      window.localStorage.setItem(LEGAL_ENTITY_STORAGE_KEY, selectedLegalEntityId);
    } else {
      window.localStorage.removeItem(LEGAL_ENTITY_STORAGE_KEY);
    }
  }, [selectedLegalEntityId, workspaceHydrated]);

  useEffect(() => {
    if (!workspaceHydrated) return;
    if (selectedFiscalPeriodId) {
      window.localStorage.setItem(FISCAL_PERIOD_STORAGE_KEY, selectedFiscalPeriodId);
    } else {
      window.localStorage.removeItem(FISCAL_PERIOD_STORAGE_KEY);
    }
  }, [selectedFiscalPeriodId, workspaceHydrated]);

  const setSelectedLegalEntityId = useCallback((id) => {
    const normalized = id ? String(id) : '';
    setSelectedLegalEntityIdState(normalized);
    if (normalized) window.localStorage.setItem(LEGAL_ENTITY_STORAGE_KEY, normalized);
    else window.localStorage.removeItem(LEGAL_ENTITY_STORAGE_KEY);
  }, []);

  const setSelectedFiscalPeriodId = useCallback((id) => {
    const normalized = id ? String(id) : '';
    setSelectedFiscalPeriodIdState(normalized);
    if (normalized) window.localStorage.setItem(FISCAL_PERIOD_STORAGE_KEY, normalized);
    else window.localStorage.removeItem(FISCAL_PERIOD_STORAGE_KEY);
  }, []);

  const updateWorkspace = useCallback((nextWorkspace) => {
    setWorkspace((current) => {
      const next = typeof nextWorkspace === 'function' ? nextWorkspace(current) : nextWorkspace;
      return { ...current, ...(next ?? {}) };
    });
  }, []);

  const selectedLegalEntity = useMemo(
    () => legalEntities.find((entity) => entity.id === selectedLegalEntityId) ?? null,
    [legalEntities, selectedLegalEntityId]
  );

  const selectedFiscalPeriod = useMemo(
    () => fiscalPeriods.find((period) => period.id === selectedFiscalPeriodId) ?? null,
    [fiscalPeriods, selectedFiscalPeriodId]
  );

  const permissionMask = useMemo(() => {
    if (hasFullAccessRole) return ACCOUNTING_PERMISSION_FLAGS.All;

    const accessRecords = asArray(
      workspace.financialAccess ?? workspace.access ?? user?.financialAccess ?? user?.accountingAccess
    );
    const selectedAccess = accessRecords.find(
      (access) => !selectedLegalEntityId || accessEntityId(access) === selectedLegalEntityId
    );

    return permissionMaskFrom(
      selectedAccess?.permissions
        ?? selectedAccess?.permissionMask
        ?? user?.accountingPermissions
        ?? user?.financialPermissions
        ?? 0
    );
  }, [hasFullAccessRole, selectedLegalEntityId, user, workspace.access, workspace.financialAccess]);

  const can = useCallback((requiredPermission) => {
    if (!requiredPermission) return true;
    const required = asArray(requiredPermission);
    return required.every((permission) => {
      const flag = typeof permission === 'number'
        ? permission
        : ACCOUNTING_PERMISSION_FLAGS[permission] ?? 0;
      return flag !== 0 && (permissionMask & flag) === flag;
    });
  }, [permissionMask]);

  const hasRole = useCallback((requiredRole) => {
    return asArray(requiredRole).some((role) => roles.includes(String(role)));
  }, [roles]);

  const value = useMemo(() => ({
    user,
    roles,
    isMaster: roles.includes('Master'),
    isAccountant: roles.includes('Accountant'),
    hasRole,
    legalEntities,
    selectedLegalEntity,
    legalEntityId: selectedLegalEntityId,
    selectedLegalEntityId,
    setSelectedLegalEntityId,
    fiscalPeriods,
    selectedFiscalPeriod,
    selectedFiscalPeriodId,
    setSelectedFiscalPeriodId,
    permissionMask,
    can,
    workspace,
    updateWorkspace,
    workspaceHydrated,
    workspaceReady: workspaceHydrated && !organizationLoading,
    workspaceSource,
    organizationLoading,
    organizationError,
    loading,
    setLoading,
    error,
    setError,
  }), [
    can,
    error,
    fiscalPeriods,
    hasRole,
    legalEntities,
    loading,
    permissionMask,
    roles,
    selectedFiscalPeriod,
    selectedFiscalPeriodId,
    selectedLegalEntity,
    selectedLegalEntityId,
    setSelectedFiscalPeriodId,
    setSelectedLegalEntityId,
    updateWorkspace,
    user,
    workspace,
    workspaceHydrated,
    workspaceSource,
    organizationError,
    organizationLoading,
  ]);

  return (
    <AccountingWorkspaceContext.Provider value={value}>
      {children}
    </AccountingWorkspaceContext.Provider>
  );
}

export function useAccountingWorkspace() {
  const context = useContext(AccountingWorkspaceContext);
  if (!context) {
    throw new Error('useAccountingWorkspace must be used within AccountingWorkspaceProvider');
  }
  return context;
}

export function useAccountingCapability(permission) {
  return useAccountingWorkspace().can(permission);
}
