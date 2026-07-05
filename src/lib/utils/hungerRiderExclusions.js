const EXCLUDED_HUNGER_RIDERS = [
  { workingId: "1891281", iqamaNo: "2547202743", phoneNumber: "539615402" },
  { workingId: "2133164", iqamaNo: "2551466572", phoneNumber: "575180629" },
  { workingId: "1747364", iqamaNo: "2535984260", phoneNumber: "502977012" },
  { workingId: "1807881", iqamaNo: "2537940112", phoneNumber: "532866207" },
  { workingId: "2039796", iqamaNo: "2563501960", phoneNumber: "555136976" },
  { workingId: "2076229", iqamaNo: "2567515149", phoneNumber: "537862951" },
  { workingId: "1810683", iqamaNo: "2543366724", phoneNumber: "573483047" },
  { workingId: "2404548", iqamaNo: "2581604408", phoneNumber: "539928114" },
  { workingId: "2004751", iqamaNo: "2558406787", phoneNumber: "530240569" },
  { workingId: "1944323", iqamaNo: "2554149357", phoneNumber: "505507537" },
  { workingId: "1851295", iqamaNo: "2537543791", phoneNumber: "567188636" },
  { workingId: "1742410", iqamaNo: "2540831860", phoneNumber: "549959443" },
  { workingId: "2052429", iqamaNo: "2565193600", phoneNumber: "533280509" },
  { workingId: "2155353", iqamaNo: "2574943185", phoneNumber: "561827737" },
  { workingId: "2404595", iqamaNo: "2580695365", phoneNumber: "558594452" },
  { workingId: "2158587", iqamaNo: "2574885048", phoneNumber: "539880442" },
  { workingId: "1816465", iqamaNo: "2537389005", phoneNumber: "534306195" },
  { workingId: "2014347", iqamaNo: "2559213927", phoneNumber: "557460527" },
  { workingId: "2432317", iqamaNo: "2585478775", phoneNumber: "554134652" },
  { workingId: "1941089", iqamaNo: "2551658061", phoneNumber: "511052065" },
  { workingId: "1933419", iqamaNo: "2543378968", phoneNumber: "536407824" },
  { workingId: "1842559", iqamaNo: "2536467240", phoneNumber: "581942627" },
];

const normalizeIdentifier = (value) => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

const EXCLUDED_WORKING_IDS = new Set(EXCLUDED_HUNGER_RIDERS.map((rider) => rider.workingId));
const EXCLUDED_IQAMA_NOS = new Set(EXCLUDED_HUNGER_RIDERS.map((rider) => rider.iqamaNo));
const EXCLUDED_PHONE_NUMBERS = new Set(EXCLUDED_HUNGER_RIDERS.map((rider) => rider.phoneNumber));

const numberValue = (value) => Number(value) || 0;
const percent = (part, total) => (total > 0 ? (part / total) * 100 : 0);

export const hungerRiderExclusions = EXCLUDED_HUNGER_RIDERS;

export const isExcludedHungerRider = (rider = {}) => {
  const workingId = normalizeIdentifier(
    rider.workingId ?? rider.workingID ?? rider.workId ?? rider.idNumber ?? rider.ID_NUMBER
  );
  const iqamaNo = normalizeIdentifier(
    rider.iqamaNo ?? rider.employeeIqamaNo ?? rider.iqama ?? rider.eqama ?? rider.EQAMA
  );
  const phoneNumber = normalizeIdentifier(
    rider.phoneNumber ?? rider.mobileNo ?? rider.mobileNumber ?? rider.phone ?? rider.NUMBER
  );

  return (
    EXCLUDED_WORKING_IDS.has(workingId) ||
    EXCLUDED_IQAMA_NOS.has(iqamaNo) ||
    EXCLUDED_PHONE_NUMBERS.has(phoneNumber)
  );
};

export const getExcludedHungerRiderMatch = (rider = {}) => {
  const workingId = normalizeIdentifier(
    rider.workingId ?? rider.workingID ?? rider.workId ?? rider.idNumber ?? rider.ID_NUMBER
  );
  const iqamaNo = normalizeIdentifier(
    rider.iqamaNo ?? rider.employeeIqamaNo ?? rider.iqama ?? rider.eqama ?? rider.EQAMA
  );
  const phoneNumber = normalizeIdentifier(
    rider.phoneNumber ?? rider.mobileNo ?? rider.mobileNumber ?? rider.phone ?? rider.NUMBER
  );

  return EXCLUDED_HUNGER_RIDERS.find(
    (excludedRider) =>
      excludedRider.workingId === workingId ||
      excludedRider.iqamaNo === iqamaNo ||
      excludedRider.phoneNumber === phoneNumber
  );
};

export const filterOnlyExcludedHungerRiders = (riders = []) => {
  if (!Array.isArray(riders)) return [];
  return riders.filter((rider) => isExcludedHungerRider(rider));
};

export const filterExcludedHungerRiders = (riders = []) => {
  if (!Array.isArray(riders)) return [];
  return riders.filter((rider) => !isExcludedHungerRider(rider));
};

const rebuildTierDistribution = (riders = [], previous = {}) => {
  const total = riders.length;
  const counts = riders.reduce(
    (acc, rider) => {
      const orders = numberValue(rider.totalOrders);
      const tier =
        rider.tier ||
        (orders >= 450 ? 1 : orders >= 400 ? 2 : 3);

      if (tier === 1) acc.excellentCount += 1;
      else if (tier === 2) acc.goodCount += 1;
      else acc.poorCount += 1;

      return acc;
    },
    { excellentCount: 0, goodCount: 0, poorCount: 0 }
  );

  return {
    ...previous,
    ...counts,
    excellentPercentage: percent(counts.excellentCount, total),
    goodPercentage: percent(counts.goodCount, total),
    poorPercentage: percent(counts.poorCount, total),
  };
};

export const applyHungerSummaryExclusions = (data) => {
  if (!data?.housingDistributions) return data;

  const housingDistributions = data.housingDistributions
    .map((housing) => {
      const riders = filterExcludedHungerRiders(housing.riders || []);
      const totalOrders = riders.reduce((sum, rider) => sum + numberValue(rider.totalOrders), 0);

      return {
        ...housing,
        riders,
        totalRiders: riders.length,
        totalOrders,
        tierDistribution: rebuildTierDistribution(riders, housing.tierDistribution),
      };
    })
    .filter((housing) => housing.riders.length > 0 || !housing.riders);

  const allRiders = housingDistributions.flatMap((housing) => housing.riders || []);
  const totalOrders = allRiders.reduce((sum, rider) => sum + numberValue(rider.totalOrders), 0);

  return {
    ...data,
    housingDistributions,
    companySummary: data.companySummary
      ? {
          ...data.companySummary,
          totalRiders: allRiders.length,
          totalOrders,
          tierDistribution: rebuildTierDistribution(allRiders, data.companySummary.tierDistribution),
        }
      : data.companySummary,
  };
};

export const applyDetailedDailyPerformanceExclusions = (data) => {
  if (!data?.housingDetails) return data;

  const housingDetails = data.housingDetails
    .map((housing) => ({
      ...housing,
      riders: filterExcludedHungerRiders(housing.riders || []),
    }))
    .filter((housing) => housing.riders.length > 0);

  const allRiders = housingDetails.flatMap((housing) => housing.riders || []);
  const summary = allRiders.reduce(
    (acc, rider) => {
      const period = rider.periodSummary || {};
      acc.totalWorkingDays += numberValue(period.totalWorkingDays);
      acc.totalAbsentDays += numberValue(period.totalAbsentDays);
      acc.grandTotalHours += numberValue(period.totalWorkingHours);
      acc.grandTotalTargetHours += numberValue(period.totalTargetHours);
      acc.grandTotalOrders += numberValue(period.totalAcceptedOrders ?? rider.acceptedOrders);
      acc.grandTotalTargetOrders += numberValue(period.totalTargetOrders);
      return acc;
    },
    {
      totalHousings: housingDetails.length,
      totalRiders: allRiders.length,
      totalWorkingDays: 0,
      totalAbsentDays: 0,
      grandTotalHours: 0,
      grandTotalTargetHours: 0,
      grandTotalOrders: 0,
      grandTotalTargetOrders: 0,
    }
  );

  return {
    ...data,
    housingDetails,
    summary: data.summary
      ? {
          ...data.summary,
          ...summary,
          companyWideAttendanceRate: percent(summary.totalWorkingDays, summary.totalWorkingDays + summary.totalAbsentDays),
          companyWideOrdersCompletionRate: percent(summary.grandTotalOrders, summary.grandTotalTargetOrders),
        }
      : data.summary,
  };
};

export const applyRejectionReportExclusions = (data) => {
  if (!Array.isArray(data)) return data;

  return data
    .map((housing) => {
      const riderDetails = filterExcludedHungerRiders(housing.rejectionReport?.riderDetails || []);

      return {
        ...housing,
        rejectionReport: housing.rejectionReport
          ? {
              ...housing.rejectionReport,
              riderDetails,
              totalRiders: riderDetails.length,
            }
          : housing.rejectionReport,
      };
    })
    .filter((housing) => (housing.rejectionReport?.riderDetails || []).length > 0);
};

export const applyMonthlyValidationExclusions = (data) => {
  if (!data?.riderValidations) return data;

  const riderValidations = filterExcludedHungerRiders(data.riderValidations);
  const validRiders = riderValidations.filter((rider) => rider.isValidForMonth).length;

  return {
    ...data,
    riderValidations,
    totalRiders: riderValidations.length,
    validRiders,
    invalidRiders: riderValidations.length - validRiders,
  };
};

export const applyHousingPerformanceExclusions = (data) => {
  if (!Array.isArray(data)) return data;

  return data
    .map((housing) => {
      const riderSummaries = filterExcludedHungerRiders(housing.summaryReport?.riderSummaries || []);

      return {
        ...housing,
        summaryReport: housing.summaryReport
          ? {
              ...housing.summaryReport,
              riderSummaries,
              totalRiders: riderSummaries.length,
            }
          : housing.summaryReport,
      };
    })
    .filter((housing) => (housing.summaryReport?.riderSummaries || []).length > 0);
};

export const applyGenericHungerReportExclusions = (data) => {
  if (!data) return data;

  if (Array.isArray(data)) {
    if (data.some((item) => item?.summaryReport?.riderSummaries)) {
      return applyHousingPerformanceExclusions(data);
    }
    return filterExcludedHungerRiders(data);
  }
  if (data.housingDistributions) return applyHungerSummaryExclusions(data);
  if (data.housingDetails) return applyDetailedDailyPerformanceExclusions(data);
  if (data.riderValidations) return applyMonthlyValidationExclusions(data);
  if (data.riderDetails) return { ...data, riderDetails: filterExcludedHungerRiders(data.riderDetails) };
  if (data.riderSummaries) return { ...data, riderSummaries: filterExcludedHungerRiders(data.riderSummaries) };
  if (data.riders) return { ...data, riders: filterExcludedHungerRiders(data.riders) };
  if (data.topRiders) return { ...data, topRiders: filterExcludedHungerRiders(data.topRiders) };

  return data;
};
