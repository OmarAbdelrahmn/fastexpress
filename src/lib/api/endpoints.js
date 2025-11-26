// File: src/lib/api/endpoints.js
'use client';

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/api/Auth/login',
    REGISTER: '/api/auth/register',
    ADMIN_REGISTER: '/api/auth/register/admin',
    MASTER_REGISTER: '/api/auth/register/master',
  },

  // Account
  ACCOUNT: {
    ME: '/api/me',
    UPDATE_INFO: '/api/me/info',
    CHANGE_PASSWORD: '/api/me/change-password',
  },

  // Admin
  ADMIN: {
    USERS: '/api/admin/users',
    BY_ID: (id) => `/api/admin/users/id/${id}`,
    BY_NAME: (username) => `/api/admin/users/name/${username}`,
    TOGGLE_STATUS: (username) => `/api/admin/users/${username}/toggle-status`,
    CHANGE_ROLE: '/api/admin/users/role',
  },

  // Company
  COMPANY: {
    LIST: '/api/company/employees',
    CREATE: '/api/company',
    BY_NAME: (name) => `/api/company/${name}`,
    UPDATE: (name) => `/api/company/${name}`,
    DELETE: (name) => `/api/company/${name}`,
  },

  // Employee
  EMPLOYEE: {
    LIST: '/api/employee',
    CREATE: '/api/employee',
    BY_IQAMA: (iqamaNo) => `/api/employee/${iqamaNo}`,
    UPDATE: (iqamaNo) => `/api/employee/${iqamaNo}`,
    DELETE: (iqamaNo) => `/api/employee/${iqamaNo}`,
    SEARCH: '/api/employee/search',
    MULTI_SEARCH: '/api/employee/multi-search',
    SMART_SEARCH: '/api/employee/smart-search',
  },

  // Housing
  HOUSING: {
    LIST: '/api/housing',
    CREATE: '/api/housing',
    BY_NAME: (name) => `/api/housing/${name}`,
    UPDATE: (name) => `/api/housing/${name}`,
    DELETE: (name) => `/api/housing/${name}`,
    ADD_EMPLOYEE: (iqamaNo, housingName) => `/api/housing/${iqamaNo}/add/${housingName}`,
    CHANGE_EMPLOYEE: (iqamaNo, oldHousing, newHousing) => 
      `/api/housing/${iqamaNo}/change/${oldHousing}/${newHousing}`,
    BY_MANAGER: (managerIqamaNo) => `/api/housing/manager/${managerIqamaNo}`,
  },

  // Rider
  RIDER: {
    LIST: '/api/rider',
    CREATE: '/api/rider',
    BY_ID: (id) => `/api/rider/id/${id}`,
    BY_IQAMA: (iqamaNo) => `/api/rider/iqama/${iqamaNo}`,
    UPDATE: (iqamaNo) => `/api/rider/${iqamaNo}`,
    DELETE: (iqamaNo) => `/api/rider/${iqamaNo}`,
    CHANGE_WORKING_ID: '/api/rider/change-working-id',
    ADD_EMPLOYEE: (iqamaNo) => `/api/rider/${iqamaNo}/add-employee`,
    SMART_SEARCH: '/api/rider/smart-search',
  },

  // Roles
  ROLES: {
    LIST: '/api/roles',
    UPDATE: '/api/roles',
    TOGGLE_STATUS: (roleName) => `/api/roles/${roleName}/toggle-status`,
  },

  // Shift
  SHIFT: {
    LIST: '/api/shift/range',
    CREATE: '/api/shift',
    UPDATE: '/api/shift',
    BY_WORKING_ID: (workingId) => `/api/shift/${workingId}`,
    DELETE: (workingId) => `/api/shift/${workingId}`,
    BY_RIDER: (workingId) => `/api/shift/rider/${workingId}`,
    BY_DATE: '/api/shift/date',
    DELETE_BY_DATE: '/api/shift/date',
    DATE_RANGE: '/api/shift/range',
    DELETE_DATE_RANGE: '/api/shift/range',
    IMPORT: '/api/shift/import',
    DELETE_RIDER_DATE_RANGE: (workingId) => `/api/shift/rider/${workingId}/range`,
    COMPARISONS: '/api/shift/comparisons',
    CREATE_COMPARISONS: '/api/shift/comparisons/import',
    RESOLVE_COMPARISONS: '/api/shift/comparisons/resolve',
  },

  // Substitution
  SUBSTITUTION: {
    LIST: '/api/substitution',
    CREATE: '/api/substitution',
    ACTIVE: '/api/substitution/active',
    INACTIVE: '/api/substitution/inactive',
    HISTORY: (riderWorkingId) => `/api/substitution/history/${riderWorkingId}`,
    STOP: (workingId) => `/api/substitution/${workingId}/stop`,
  },

  // Vehicles
  VEHICLES: {
    LIST: '/api/vehicles',
    CREATE: '/api/vehicles',
    BY_CHASE: (vehicleNumber) => `/api/vehicles/chase/${vehicleNumber}`,
    BY_SERIAL: (serial) => `/api/vehicles/serial/${serial}`,
    BY_PLATE: (plate) => `/api/vehicles/plate/${plate}`,
    UPDATE: (plateNumber) => `/api/vehicles/${plateNumber}`,
    DELETE: (vehicleNumber) => `/api/vehicles/${vehicleNumber}`,
    TAKE: '/api/vehicles/take',
    RETURN: '/api/vehicles/return',
    TAKEN_VEHICLES: '/api/vehicles/taken',
    AVAILABLE_VEHICLES: '/api/vehicles/available',
    HISTORY: (plateNumber) => `/api/vehicles/vehicle-history/${plateNumber}`,
    IS_AVAILABLE: (plateNumber) => `/api/vehicles/is-available/${plateNumber}`,
    CHANGE_LOCATION: (plateNumber) => `/api/vehicles/change-location/${plateNumber}`,
    REPORT_PROBLEM: '/api/vehicles/report-problem',
    FIX_PROBLEM: '/api/vehicles/fix-problem',
    ALL_WITH_RIDERS: '/api/vehicles/with-riders',
    WITH_RIDER: (plateNumber) => `/api/vehicles/with-rider/${plateNumber}`,
    STOLE_REPORT: '/api/vehicles/stolen',
    BREAK_UP: '/api/vehicles/break-up',
    RECOVER_STOLEN: '/api/vehicles/recover-stolen',
    GROUP_BY_STATUS: '/api/vehicles/group-by-status',
  },

  // Reports
  REPORTS: {
    DASHBOARD: '/api/report',
    MONTHLY: (workingId) => `/api/report/monthly/${workingId}`,
    MONTHLY_ALL: '/api/report/monthly/all',
    YEARLY: (workingId) => `/api/report/yearly/${workingId}`,
    YEARLY_ALL: '/api/report/yearly/all',
    CUSTOM_PERIOD: (workingId) => `/api/report/riders/${workingId}/renge`,
    CUSTOM_PERIOD_ALL: '/api/report/all/range',
    COMPANY_PERFORMANCE: '/api/report/company-performance',
    COMPARE_COMPANY_PERIODS: '/api/report/compare-company-periods',
    PROBLEM: '/api/report/problem',
    RIDERS_COMPARE_PERIODS: '/api/report/riders/compare-periods',
    COMPARE_RIDER_PERIODS: (workingId) => `/api/report/riders/compare/${workingId}`,
    COMPARE_RIDER_MONTHLY: (workingId) => `/api/report/riders/compare-monthly/${workingId}`,
    COMPARE_RIDER_YEARLY: (workingId) => `/api/report/riders/compare-yearly/${workingId}`,
    COMPARE_HOUSING: '/api/report/housing/compare',
    HOUSING_RIDERS: '/api/report/housing/riders',
    HOUSING_RIDERS_COMPARE: '/api/report/housing/riders-compare',
    TOP_RIDERS_YEARLY: '/api/report/top-riders/yearly',
    TOP_RIDERS_MONTHLY: '/api/report/top-riders/monthly',
    TOP_RIDERS_COMPANY: '/api/report/top-riders/company',
  },
};