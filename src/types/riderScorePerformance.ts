// TypeScript contracts for Rider Daily Scores (RiderScorePerformance)

export interface RiderScorePerformance {
  id: number;
  riderId: number;
  workingId: string;
  sourceRiderId: string;
  riderName: string;
  substituteRiderName: string | null;
  performanceDate: string; // YYYY-MM-DD

  totalVerificationRequests: number;
  successfulVerificationRequests: number;
  verificationSuccessRate: number; // 0–1

  grossOrders: number;
  completedOrders: number;
  completedOrdersInTime: number;
  failedOrdersByRider: number;

  onTimeDeliveryScore: number; // 0–1
  finalDeliveryQualityScore: number; // 0–1
  segment: string;

  createdAt: string;
  updatedAt: string | null;
}

export interface RiderScoreTotals {
  recordCount: number;
  riderCount: number;
  totalVerificationRequests: number;
  successfulVerificationRequests: number;
  verificationSuccessRate: number;
  grossOrders: number;
  completedOrders: number;
  completedOrdersInTime: number;
  failedOrdersByRider: number;
  averageOnTimeDeliveryScore: number;
  averageFinalDeliveryQualityScore: number;
}

export interface RiderScoreDay {
  performanceDate: string;
  records: RiderScorePerformance[];
  totals: RiderScoreTotals;
}

export interface RiderScoreListResponse {
  startDate: string | null;
  endDate: string | null;
  days: RiderScoreDay[];
  totals: RiderScoreTotals;
}

export interface RiderScoreFilters {
  riderId?: number | string;
  workingId?: string;
  date?: string; // YYYY-MM-DD
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  segment?: string;
}

export interface RiderScoreImportResult {
  totalRecords: number;
  successCount: number;
  errorCount: number;
  errors: Array<{
    rowNumber: number;
    riderWorkingId: string;
    message: string;
  }>;
}
