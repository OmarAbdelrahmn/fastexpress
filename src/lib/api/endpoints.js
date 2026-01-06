// File: src/lib/api/endpoints.js
"use client";
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    ADMIN_REGISTER: "/api/auth/register/admin",
    MASTER_REGISTER: "/api/auth/register/master",
  },

  // Account
  ACCOUNT: {
    ME: "/api/me",
    UPDATE_INFO: "/api/me/info",
    CHANGE_PASSWORD: "/api/me/change-password",
  },

  // Admin
  ADMIN: {
    USERS: "/api/admin/users",
    BY_ID: (id) => `/api/admin/users/id/${id}`,
    BY_NAME: (username) => `/api/admin/users/name/${username}`,
    TOGGLE_STATUS: (username) => `/api/admin/users/${username}/toggle-status`,
    CHANGE_ROLE: "/api/admin/users/role",
  },

  // Company
  COMPANY: {
    LIST: "/api/company/",
    CREATE: "/api/company",
    BY_NAME: (name) => `/api/company/${name}`,
    UPDATE: (name) => `/api/company/${name}`,
    DELETE: (name) => `/api/company/${name}`,
  },

  // Employee
  EMPLOYEE: {
    DELETED: "/api/employee/deleted",
    LIST: "/api/employee",
    CREATE: "/api/employee",
    BY_IQAMA: (iqamaNo) => `/api/employee/${iqamaNo}`,
    ONE: (iqamaNo) => `/api/employee/one/${iqamaNo}`,
    UPDATE: (iqamaNo) => `/api/employee/${iqamaNo}`,
    DELETE: (iqamaNo) => `/api/employee/${iqamaNo}`,
    SEARCH: "/api/employee/search",
    MULTI_SEARCH: "/api/employee/multi-search",
    SMART_SEARCH: "/api/employee/smart-search",
  },

  // Housing
  HOUSING: {
    LIST: "/api/housing",
    CREATE: "/api/housing",
    BY_NAME: (name) => `/api/housing/${name}`,
    UPDATE: (name) => `/api/housing/${name}`,
    DELETE: (name) => `/api/housing/${name}`,
    ADD_EMPLOYEE: (iqamaNo, housingName) =>
      `/api/housing/${iqamaNo}/add/${housingName}`,
    CHANGE_EMPLOYEE: (iqamaNo, oldHousing, newHousing) =>
      `/api/housing/${iqamaNo}/change/${oldHousing}/${newHousing}`,
    BY_MANAGER: (managerIqamaNo) => `/api/housing/manager/${managerIqamaNo}`,
  },

  // Rider
  RIDER: {
    LIST: "/api/rider",
    CREATE: "/api/rider",
    BY_ID: (id) => `/api/rider/id/${id}`,
    BY_IQAMA: (iqamaNo) => `/api/rider/iqama/${iqamaNo}`,
    UPDATE: (iqamaNo) => `/api/rider/${iqamaNo}`,
    DELETE: (iqamaNo) => `/api/rider/${iqamaNo}`,
    CHANGE_WORKING_ID: "/api/rider/change-working-id",
    ADD_EMPLOYEE: (iqamaNo) => `/api/rider/${iqamaNo}/add-employee`,
    SMART_SEARCH: "/api/rider/smart-search",
    SEARCH: "/api/rider/search",
  },

  // Roles
  ROLES: {
    LIST: "/api/roles",
    UPDATE: "/api/roles",
    TOGGLE_STATUS: (roleName) => `/api/roles/toggle-status?roleName=${roleName}`,
  },

  // Shift
  SHIFT: {
    LIST: "/api/shift/range",
    CREATE: "/api/shift",
    UPDATE: "/api/shift",
    BY_WORKING_ID: (workingId) => `/api/shift/${workingId}`,
    DELETE: (workingId) => `/api/shift/${workingId}`,
    BY_RIDER: (workingId) => `/api/shift/rider/${workingId}`,
    BY_DATE: "/api/shift/date",
    DELETE_BY_DATE: "/api/shift/date",
    DATE_RANGE: "/api/shift/range",
    DELETE_DATE_RANGE: "/api/shift/range",
    IMPORT: "/api/shift/import",
    DELETE_RIDER_DATE_RANGE: (workingId) =>
      `/api/shift/rider/${workingId}/range`,
    COMPARISONS: "/api/shift/comparisons",
    CREATE_COMPARISONS: "/api/shift/comparisons/import",
    RESOLVE_COMPARISONS: "/api/shift/comparisons/resolve",
  },

  // Substitution
  SUBSTITUTION: {
    LIST: "/api/substitution",
    CREATE: "/api/substitution",
    ACTIVE: "/api/substitution/active",
    INACTIVE: "/api/substitution/inactive",
    HISTORY: (riderWorkingId) => `/api/substitution/history/${riderWorkingId}`,
    STOP: (workingId) => `/api/substitution/${workingId}/stop`,
  },

  // Vehicles
  VEHICLES: {
    LIST: "/api/vehicles",
    CREATE: "/api/vehicles",
    BY_CHASE: (vehicleNumber) => `/api/vehicles/chase/${vehicleNumber}`,
    BY_SERIAL: (serial) => `/api/vehicles/serial/${serial}`,
    BY_PLATE: (plate) => `/api/vehicles/plate/${plate}`,
    UPDATE: (plateNumber) => `/api/vehicles/${plateNumber}`,
    DELETE: (vehicleNumber) => `/api/vehicles/${vehicleNumber}`,
    TAKE: "/api/vehicles/take",
    RETURN: "/api/vehicles/return",
    TAKEN_VEHICLES: "/api/vehicles/taken",
    AVAILABLE_VEHICLES: "/api/vehicles/available",
    HISTORY: (plateNumber) => `/api/vehicles/vehicle-history/${plateNumber}`,
    IS_AVAILABLE: (plateNumber) => `/api/vehicles/is-available/${plateNumber}`,
    CHANGE_LOCATION: (plateNumber) =>
      `/api/vehicles/change-location/${plateNumber}`,
    REPORT_PROBLEM: "/api/vehicles/report-problem",
    FIX_PROBLEM: "/api/vehicles/fix-problem",
    ALL_WITH_RIDERS: "/api/vehicles/with-riders",
    WITH_RIDER: (plateNumber) => `/api/vehicles/with-rider/${plateNumber}`,
    STOLE_REPORT: "/api/vehicles/stolen",
    BREAK_UP: "/api/vehicles/break-up",
    RECOVER_STOLEN: "/api/vehicles/recover-stolen",
    GROUP_BY_STATUS: "/api/vehicles/group-by-status",
  },

  TEMP: {
    VEHICLES: {
      REQUEST_RETURN: "/api/temp/vehicle-request-return",
      REQUEST_TAKE: "/api/temp/vehicle-request-take",
      REQUEST_PROBLEM: "/api/temp/vehicle-request-problem",
      GET_PENDING: "/api/temp/vehicles",
      RESOLVE: "/api/temp/vehicle-resolve",
      // EMPLOYEES: `${BASE_URL}/api/Temp/employees`,
      // RESOLVE_EMPLOYEES: `${BASE_URL}/api/Temp/employees`,
      // IMPORT_EXCEL: `${BASE_URL}/api/Temp/import-employees`,
      // REQUEST_ENABLE: (iqamaNo) => `${BASE_URL}/api/Temp/employee-request-enable/${iqamaNo}`,
      // REQUEST_DISABLE: (iqamaNo) => `${BASE_URL}/api/Temp/employee-request-disable/${iqamaNo}`,
      // PENDING_STATUS_CHANGES: `${BASE_URL}/api/Temp/employee-pending-status-changes`,
      // RESOLVE_STATUS_CHANGES: `${BASE_URL}/api/Temp/employee-resolve-status-changes`,
    },
  },
  // Reports
  REPORTS: {
    DASHBOARD: "/api/Report",
    MONTHLY: (workingId) => `/api/Report/monthly/${workingId}`,
    MONTHLY_ALL: "/api/Report/monthly/all",
    YEARLY: (workingId) => `/api/Report/yearly/${workingId}`,
    YEARLY_ALL: "/api/Report/yearly/all",
    CUSTOM_PERIOD: (workingId) => `/api/Report/riders/${workingId}/renge`,
    CUSTOM_PERIOD_ALL: "/api/Report/all/range",
    COMPANY_PERFORMANCE: "/api/Report/company-performance",
    COMPARE_COMPANY_PERIODS: "/api/Report/compare-company-periods",
    PROBLEM: "/api/Report/problem",
    RIDERS_COMPARE_PERIODS: "/api/Report/riders/compare-periods",
    COMPARE_RIDER_PERIODS: (workingId) => `/api/Report/riders/compare/${workingId}`,
    COMPARE_RIDER_MONTHLY: (workingId) => `/api/Report/riders/compare-monthly/${workingId}`,
    COMPARE_RIDER_YEARLY: (workingId) => `/api/Report/riders/compare-yearly/${workingId}`,
    COMPARE_HOUSING: "/api/Report/housing/compare",
    COMPARE_HOUSINGS: "/api/Report/housing",
    HOUSING_RIDERS: "/api/Report/housing/riders",
    HOUSING_RIDERS_COMPARE: "/api/Report/housing/riders-compare",
    TOP_RIDERS_YEARLY: "/api/Report/top-riders/yearly",
    TOP_RIDERS_MONTHLY: "/api/Report/top-riders/monthly",
    TOP_RIDERS_COMPANY: "/api/Report/top-riders/company",
    STACKED: (workingId) => `/api/Report/stacked/${workingId}`,
    STACKEDd: "/api/Report/stacked",
    ALL_HOUSINGS_REJECTION: "/api/Report/all-housings/rejection",
    ALL_HOUSINGS_SUMMARY: "/api/Report/all-housings/summary",
    RIDER_HISTORY: (iqamaNo) => `/api/Report/rider-history?riderIqamaNo=${iqamaNo}`,
    RIDER_PERFORMANCE_DETAIL: "/api/Report/rider-daily-detail",
  },

  // Member
  MEMBER: {
    LOGIN: "/api/Member/member/login",
    DASHBOARD: "/api/Member/dashboard",
    DETAILS: "/api/Member/details",
    EMPLOYEES: "/api/Member/employees",
    EMPLOYEE_DETAILS: (iqamaNo) => `/api/Member/employees/${iqamaNo}`,
    RIDERS: "/api/Member/riders",
    RIDER_PERFORMANCE: (riderId) => `/api/Member/riders/${riderId}/performance`,
    SHIFTS: "/api/Member/shifts",
    SHIFTS_SUMMARY: "/api/Member/shifts/summary",
    VEHICLES: "/api/Member/vehicles",
    VEHICLE_HISTORY: (vehicleNumber) => `/api/Member/vehicles/${vehicleNumber}/history`,
    VEHICLE_PENDING: "/api/Member/vehicles/operations/pending",
    DISABILITIES: "/api/Member/disabilities",
    SUBSTITUTIONS_ACTIVE: "/api/Member/substitutions/active",
    REQ_EMPLOYEE_UPDATES: "/api/Member/requests/employee-updates",
    REQ_STATUS_CHANGES: "/api/Member/requests/status-changes",
    REQ_VEHICLE_OPERATIONS: "/api/Member/vehicles/operations/pending",
    REQUEST_STATUS_CHANGE: "/api/member/employees/request-status-change",
    VEHICLE_REQUEST_TAKE: "/api/member/vehicles/request-take",
    VEHICLE_REQUEST_RETURN: "/api/member/vehicles/request-return",
    VEHICLE_REQUEST_REPORT_PROBLEM: "/api/member/vehicles/request-report-problem",
    VEHICLE_REQUEST_FIX_PROBLEM: "/api/member/request-fix-problem",
    VEHICLE_PROBLEMS: "/api/member/vehicles/problems",
    REPORTS_MONTHLY: "/api/Member/reports/monthly",
    REPORTS_EXPORT: "/api/Member/reports/export",
    REPORTS_DAILY_DETAILED: "/api/member/reports/daily-detailed",
    REPORTS_DAILY_SUMMARY: "/api/member/reports/daily-summary",
    REPORTS_COMPARE_PERIODS: "/api/member/reports/compare-periods",
    REPORTS_REJECTION: "/api/Member/reports/rejection",
    REPORTS_RIDERS_SUMMARY: "/api/Member/reports/riders-summary",
    REPORTS_RIDER_DAILY_DETAIL: "/api/Member/reports/rider-daily-detail",
    RIDER_PERFORMANCE_DETAIL: "/api/Report/rider-daily-detail",
  },
};