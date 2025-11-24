// File: src/lib/api/endpoints.js
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ADMIN_REGISTER: '/auth/admin-register',
    MASTER_REGISTER: '/auth/master-register',
  },

  // Account
  ACCOUNT: {
    ME: '/me',
    UPDATE_INFO: '/me/info',
    CHANGE_PASSWORD: '/me/change-password',
  },

  // Admin
  ADMIN: {
    LIST: '/admin',
    BY_ID: (id) => `/admin/id/${id}`,
    BY_NAME: (username) => `/admin/name/${username}`,
    TOGGLE_STATUS: (username) => `/admin/toggle-status/${username}`,
    CHANGE_ROLE: '/admin/change-role',
  },

  // Company
  COMPANY: {
    LIST: '/company',
    CREATE: '/company',
    BY_NAME: (name) => `/company/${name}`,
    UPDATE: (name) => `/company/${name}`,
    DELETE: (name) => `/company/${name}`,
  },

  // Employee
  EMPLOYEE: {
    LIST: '/employee',
    CREATE: '/employee',
    BY_IQAMA: (iqamaNo) => `/employee/${iqamaNo}`,
    UPDATE: (iqamaNo) => `/employee/${iqamaNo}`,
    DELETE: (iqamaNo) => `/employee/${iqamaNo}`,
    SEARCH: '/employee/search',
    MULTI_SEARCH: '/employee/multi-search',
    SMART_SEARCH: '/employee/smart-search',
  },

  // Housing
  HOUSING: {
    LIST: '/housing',
    CREATE: '/housing',
    BY_NAME: (name) => `/housing/${name}`,
    UPDATE: (name) => `/housing/${name}`,
    DELETE: (name) => `/housing/${name}`,
    CHANGE_HOUSING: (iqamaNo, oldHousing, newHousing) => 
      `/housing/${iqamaNo}/${oldHousing}-${newHousing}`,
    BY_MANAGER: (managerIqamaNo) => `/housing/${managerIqamaNo}/manager`,
  },

  // Rider
  RIDER: {
    LIST: '/rider',
    CREATE: '/rider',
    BY_ID: (id) => `/rider/id/${id}`,
    BY_IQAMA: (iqamaNo) => `/rider/iqama/${iqamaNo}`,
    UPDATE: (iqamaNo) => `/rider/${iqamaNo}`,
    DELETE: (iqamaNo) => `/rider/${iqamaNo}`,
    CHANGE_WORKING_ID: '/rider/change-working-id',
    CHANGE_EMPLOYEE: (iqamaNo) => `/rider/change-employee/${iqamaNo}`,
    SMART_SEARCH: '/rider/smart-search',
  },

  // Roles
  ROLES: {
    LIST: '/roles',
    UPDATE: '/roles',
    TOGGLE_STATUS: (roleName) => `/roles/toggle-status/${roleName}`,
  },

  // Shift
  SHIFT: {
    LIST: '/shift',
    CREATE: '/shift',
    UPDATE: '/shift',
    BY_WORKING_ID_DATE: (workingId, shiftDate) => 
      `/shift/${workingId}/${shiftDate}`,
    DELETE: (workingId, shiftDate) => `/shift/${workingId}/${shiftDate}`,
    BY_RIDER: (workingId) => `/shift/rider/${workingId}`,
    BY_DATE: (shiftDate) => `/shift/date/${shiftDate}`,
    DELETE_BY_DATE: (shiftDate) => `/shift/date/${shiftDate}`,
    DATE_RANGE: '/shift/date-range',
    DELETE_DATE_RANGE: '/shift/date-range',
    IMPORT: (shiftDate) => `/shift/import/${shiftDate}`,
    DELETE_RIDER_DATE_RANGE: (workingId) => `/shift/rider/${workingId}/date-range`,
    COMPARISONS: (shiftDate) => `/shift/comparisons/${shiftDate}`,
    CREATE_COMPARISONS: (shiftDate) => `/shift/comparisons/${shiftDate}`,
    RESOLVE_COMPARISONS: '/shift/comparisons/resolve',
  },

  // Substitution
  SUBSTITUTION: {
    LIST: '/substitution',
    CREATE: '/substitution',
    ACTIVE: '/substitution/active',
    INACTIVE: '/substitution/inactive',
    HISTORY: (riderWorkingId) => `/substitution/history/${riderWorkingId}`,
    UPDATE: (workingId) => `/substitution/${workingId}`,
  },

  // Vehicles
  VEHICLES: {
    LIST: '/vehicle',
    CREATE: '/vehicle/create',
    BY_CHASE: (vehicleNumber) => `/vehicle/chase/${vehicleNumber}`,
    BY_SERIAL: (serial) => `/vehicle/serial/${serial}`,
    BY_PLATE: (plate) => `/vehicle/plate/${plate}`,
    UPDATE: (plateNumber) => `/vehicle/${plateNumber}`,
    DELETE: (vehicleNumber) => `/vehicle/${vehicleNumber}`,
    TAKE: '/vehicle/take-vehicle',
    RETURN: '/vehicle/return-vehicle',
    TAKEN_VEHICLES: '/vehicle/taken-vehicles',
    AVAILABLE_VEHICLES: '/vehicle/available-vehicles',
    HISTORY: (plateNumber) => `/vehicle/vehicle-history/${plateNumber}`,
    IS_AVAILABLE: (plateNumber) => `/vehicle/is-available/${plateNumber}`,
    CHANGE_LOCATION: (plateNumber) => `/vehicle/change-location/${plateNumber}`,
    REPORT_PROBLEM: '/vehicle/report-problem',
    FIX_PROBLEM: '/vehicle/fix-problem',
    ALL_WITH_RIDERS: '/vehicle/all-vehicles-with-riders',
    WITH_RIDER: (plateNumber) => `/vehicle/vehicle-with-rider/${plateNumber}`,
    STOLE_REPORT: '/vehicle/stole-report',
    BREAK_UP: '/vehicle/break-up',
    RECOVER_STOLEN: '/vehicle/recover-stolen',
  },

  // Reports
  REPORTS: {
    ALL: '/report',
    MONTHLY: (workingId) => `/report/monthly/${workingId}`,
    MONTHLY_ALL: '/report/monthly/all',
    YEARLY: (workingId) => `/report/yearly/${workingId}`,
    YEARLY_ALL: '/report/yearly/all',
    CUSTOM_PERIOD: (workingId, startDate, endDate) => 
      `/report/${workingId}/${startDate}-${endDate}`,
    CUSTOM_PERIOD_ALL: (startDate, endDate) => 
      `/report/all/${startDate}-${endDate}`,
    COMPANY_PERFORMANCE: '/report/company-performance',
    COMPARE_COMPANY_PERIODS: '/report/compare-company-periods',
    PROBLEM: '/report/problem',
    RIDERS: '/report/riders',
    COMPARE_RIDER_PERIODS: (workingId) => 
      `/report/compare-rider-periods/${workingId}`,
    COMPARE_RIDER_MONTHLY: (workingId, year1, month1, year2, month2) =>
      `/report/compare-rider-monthly/${workingId}/${year1}/${month1}/${year2}/${month2}`,
    COMPARE_RIDER_YEARLY: (workingId, year1, year2) =>
      `/report/compare-rider-yearly/${workingId}/${year1}/${year2}`,
    COMPARE_HOUSING: '/report/compare-housing',
    HOUSING: '/report/housing',
    HOUSING_COMPARE: '/report/housing-compare',
    TOP_RIDERS_YEARLY: '/report/top-riders-yearly',
    TOP_RIDERS_MONTHLY: '/report/top-riders-monthly',
    TOP_RIDERS_COMPANY: '/report/top-riders-company',
  },
};