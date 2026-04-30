"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  RefreshCw,
  Users,
  ShoppingBag,
  Clock,
  Wallet,
  TrendingUp,
  Bike,
  CheckCircle,
  Truck,
  XCircle,
  Wifi,
  WifiOff,
  ChevronDown,
  ChevronUp,
  Activity,
  Filter,
} from "lucide-react";
import PageHeader from "@/components/layout/pageheader";

const API_BASE = "https://express-extension-manager.premiumasp.net/";
const HUNGER_COMPANY_ID = "463";
const KEETA_ORG_ID = "2960";
const REFRESH_INTERVAL = 30_000; // 30 s

const KEETA_STATUS = {
  20: { label: "بدون طلب", color: "#d97706", bg: "#fef3c7" },
  30: { label: "لديه طلب", color: "#059669", bg: "#d1fae5" },
  40: { label: "غير متصل", color: "#64748b", bg: "#f1f5f9" },
  50: { label: "مقيّد", color: "#dc2626", bg: "#fef2f2" },
  60: { label: "مجدول، ولكن غير متصل", color: "#7c3aed", bg: "#f5f3ff" },
};


function todayDate() {
  return new Date().toISOString().split("T")[0];
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ────────────────────────────────────────────
//  Sub-components
// ────────────────────────────────────────────

function CountdownTimer({ interval, lastFetch }) {
  const [seconds, setSeconds] = useState(Math.ceil(interval / 1000));

  useEffect(() => {
    const tick = () => {
      const elapsed = Date.now() - lastFetch;
      const remaining = Math.max(0, Math.ceil((interval - elapsed) / 1000));
      setSeconds(remaining);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lastFetch, interval]);

  return (
    <div className="flex items-center gap-1.5 text-xs font-mono bg-white/20 text-white px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm">
      <Clock size={12} className="animate-pulse" />
      <span className="font-bold">{seconds}s</span>
    </div>
  );
}

function StatPill({ icon: Icon, label, value, color }) {
  return (
    <div
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-white shadow-sm"
      style={{ background: color }}
    >
      <Icon size={16} />
      <span className="text-xs font-medium opacity-80">{label}</span>
      <span className="text-lg font-extrabold ml-1">{value ?? "—"}</span>
    </div>
  );
}

function RiderRow({ rider, index }) {
  return (
    <tr
      className="border-b border-gray-50 hover:bg-blue-50/40 transition-colors"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <td className="px-4 py-2.5 text-sm font-medium text-gray-800 text-right">
        {rider.riderName}
      </td>
      <td className="px-4 py-2.5 text-center">
        <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
          <ShoppingBag size={11} /> {rider.orders}
        </span>
      </td>
      <td className="px-4 py-2.5 text-center">
        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
          <Wallet size={11} /> {rider.wallet?.toFixed(1)}
        </span>
      </td>
      <td className="px-4 py-2.5 text-center">
        <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-full">
          <Clock size={11} /> {rider.workingHours?.toFixed(1)}h
        </span>
      </td>
    </tr>
  );
}

function KeetaCourierRow({ courier, index }) {
  const status = KEETA_STATUS[courier.statusCode] ?? { label: "غير معروف", color: "#9ca3af", bg: "#f3f4f6" };
  return (
    <tr
      className="border-b border-gray-50 hover:bg-orange-50/40 transition-colors"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <td className="px-4 py-2.5 text-sm font-medium text-gray-800 text-right">
        {courier.courierName}
      </td>
      <td className="px-4 py-2.5 text-center">
        <span
          className="inline-block text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ color: status.color, background: status.bg }}
        >
          {status.label}
        </span>
      </td>
      <td className="px-4 py-2.5 text-center">
        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
          <CheckCircle size={11} /> {courier.finishedTasks}
        </span>
      </td>
      <td className="px-4 py-2.5 text-center">
        <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
          <Truck size={11} /> {courier.deliveringTasks}
        </span>
      </td>
      <td className="px-4 py-2.5 text-center">
        <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full">
          <XCircle size={11} /> {courier.canceledTasks}
        </span>
      </td>
      <td className="px-4 py-2.5 text-center">
        <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-full">
          <Clock size={11} /> {courier.onlineHours?.toFixed(1)}h
        </span>
      </td>
    </tr>
  );
}

function Section({ title, badge, badgeColor, children, defaultOpen = true, accentColor }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className="bg-white rounded-2xl shadow-sm border overflow-hidden"
      style={{ borderColor: `${accentColor}30` }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50/70 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ background: accentColor }}
          />
          <span className="font-bold text-gray-900 text-base">{title}</span>
          {badge !== undefined && (
            <span
              className="text-xs font-bold px-2.5 py-0.5 rounded-full text-white"
              style={{ background: badgeColor ?? accentColor }}
            >
              {badge}
            </span>
          )}
        </div>
        {open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>
      {open && <div className="px-6 pb-5">{children}</div>}
    </div>
  );
}

// ────────────────────────────────────────────
//  Main Page
// ────────────────────────────────────────────

export default function LiveStatsPage() {
  const [hungerData, setHungerData] = useState(null);
  const [keetaData, setKeetaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState(Date.now());
  const [online, setOnline] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const timerRef = useRef(null);

  const fetchAll = useCallback(async () => {
    const date = todayDate();
    setError(null);
    try {
      const [hunger, keeta] = await Promise.all([
        fetchJson(`${API_BASE}api/rider-stats/${HUNGER_COMPANY_ID}/${date}`),
        fetchJson(`${API_BASE}api/keeta-stats/${KEETA_ORG_ID}/${date}`),
      ]);
      console.log(hunger, keeta);
      setHungerData(hunger);
      setKeetaData(keeta);
      setOnline(true);
    } catch (e) {
      console.error("Live stats fetch error:", e);
      setError(e.message);
      setOnline(false);
    } finally {
      setLoading(false);
      setLastFetch(Date.now());
    }
  }, []);

  useEffect(() => {
    fetchAll();
    timerRef.current = setInterval(fetchAll, REFRESH_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [fetchAll]);

  const date = todayDate();

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      <PageHeader
        title="لوحة الإحصاءات الحية"
        subtitle={`${date} · يتجدد كل 30 ثانية`}
        icon={Activity}
        actions={
          <>
            <span
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg backdrop-blur-sm border ${
                online
                  ? "bg-emerald-400/20 text-emerald-50 border-emerald-400/30"
                  : "bg-red-400/20 text-red-50 border-red-400/30"
              }`}
            >
              {online ? <Wifi size={12} /> : <WifiOff size={12} />}
              {online ? "متصل" : "غير متصل"}
            </span>

            <CountdownTimer interval={REFRESH_INTERVAL} lastFetch={lastFetch} />

            <button
              onClick={fetchAll}
              disabled={loading}
              className="flex items-center gap-2 text-sm font-semibold text-blue-600 bg-white px-4 py-1.5 rounded-lg shadow-sm hover:bg-blue-50 hover:scale-[1.03] active:scale-100 transition-all disabled:opacity-60"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              تحديث
            </button>
          </>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm font-medium">
            <XCircle size={18} className="flex-shrink-0" />
            <span>تعذّر تحميل البيانات: {error}</span>
          </div>
        )}

        {/* ── HUNGER SECTION ── */}
        <Section
          title="إحصاءات Hunger Station"
          badge={hungerData?.totalRiders}
          accentColor="#f59e0b"
          defaultOpen={true}
        >
          {loading && !hungerData ? (
            <SkeletonStats />
          ) : hungerData ? (
            <>
              {/* Summary pills */}
              <div className="flex flex-wrap gap-3 mb-6">
                <StatPill
                  icon={Users}
                  label="المندوبون"
                  value={hungerData.totalRiders}
                  color="linear-gradient(135deg,#f59e0b,#d97706)"
                />
                <StatPill
                  icon={ShoppingBag}
                  label="الطلبات"
                  value={hungerData.totalOrders}
                  color="linear-gradient(135deg,#3b82f6,#2563eb)"
                />
                <StatPill
                  icon={Wallet}
                  label="المحفظة الكلية"
                  value={hungerData.totalWallet?.toFixed(1)}
                  color="linear-gradient(135deg,#10b981,#059669)"
                />
                <StatPill
                  icon={Clock}
                  label="ساعات العمل"
                  value={hungerData.totalWorkingHours?.toFixed(1)}
                  color="linear-gradient(135deg,#8b5cf6,#7c3aed)"
                />
              </div>

              {/* Riders table */}
              {hungerData.riders?.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-amber-100">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-amber-50 to-orange-50 text-amber-800">
                        <th className="px-4 py-3 text-right font-semibold">المندوب</th>
                        <th className="px-4 py-3 text-center font-semibold">الطلبات</th>
                        <th className="px-4 py-3 text-center font-semibold">المحفظة</th>
                        <th className="px-4 py-3 text-center font-semibold">ساعات العمل</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hungerData.riders
                        .slice()
                        .sort((a, b) => (b.orders ?? 0) - (a.orders ?? 0))
                        .map((r, i) => (
                          <RiderRow key={r.riderId ? `${r.riderId}-${i}` : i} rider={r} index={i} />
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState label="لا يوجد مندوبون لهذا اليوم" />
              )}
            </>
          ) : (
            <EmptyState label="لا توجد بيانات" />
          )}
        </Section>

        {/* ── KEETA SECTION ── */}
        <Section
          title="إحصاءات Keeta"
          badge={keetaData?.totalCouriers}
          accentColor="#6366f1"
          defaultOpen={true}
        >
          {loading && !keetaData ? (
            <SkeletonStats />
          ) : keetaData ? (
            <>
              {/* Summary pills */}
              <div className="flex flex-wrap gap-3 mb-6">
                <StatPill
                  icon={Users}
                  label="المناديب"
                  value={keetaData.totalCouriers}
                  color="linear-gradient(135deg,#6366f1,#4f46e5)"
                />
                <StatPill
                  icon={CheckCircle}
                  label="تم التسليم"
                  value={keetaData.totalFinished}
                  color="linear-gradient(135deg,#10b981,#059669)"
                />
                <StatPill
                  icon={Truck}
                  label="جاري التسليم"
                  value={keetaData.totalDelivering}
                  color="linear-gradient(135deg,#3b82f6,#2563eb)"
                />
                <StatPill
                  icon={XCircle}
                  label="ملغاة"
                  value={keetaData.totalCanceled}
                  color="linear-gradient(135deg,#ef4444,#dc2626)"
                />
                <StatPill
                  icon={Clock}
                  label="ساعات أونلاين"
                  value={keetaData.totalOnlineHours?.toFixed(1)}
                  color="linear-gradient(135deg,#8b5cf6,#7c3aed)"
                />
                <StatPill
                  icon={Users}
                  label="العدد الحالي"
                  value={keetaData.couriers?.filter(c => statusFilter === "all" || String(c.statusCode) === statusFilter).length}
                  color="linear-gradient(135deg,#475569,#334155)"
                />
              </div>

              {/* Couriers table */}
              {keetaData.couriers?.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-indigo-100">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-800">
                        <th className="px-4 py-3 text-right font-semibold">المندوب</th>
                        <th className="px-4 py-3 text-center font-semibold">
                          <div className="flex items-center justify-center gap-2 group">
                            <span>الحالة</span>
                            <div className="relative flex items-center">
                              <Filter 
                                size={14} 
                                className={`transition-colors ${statusFilter !== 'all' ? 'text-indigo-600' : 'text-indigo-300 group-hover:text-indigo-500'}`}
                              />
                              <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full appearance-none"
                                title="تصفية حسب الحالة"
                              >
                                <option value="all">الكل</option>
                                {Object.entries(KEETA_STATUS).map(([code, { label }]) => (
                                  <option key={code} value={code}>{label}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </th>
                        <th className="px-4 py-3 text-center font-semibold">منتهية</th>
                        <th className="px-4 py-3 text-center font-semibold">جارية</th>
                        <th className="px-4 py-3 text-center font-semibold">ملغاة</th>
                        <th className="px-4 py-3 text-center font-semibold">ساعات أونلاين</th>
                      </tr>
                    </thead>
                    <tbody>
                      {keetaData.couriers
                        .slice()
                        .sort((a, b) => (b.finishedTasks ?? 0) - (a.finishedTasks ?? 0))
                        .filter(c => statusFilter === "all" || String(c.statusCode) === statusFilter)
                        .map((c, i) => (
                          <KeetaCourierRow key={c.courierId ? `${c.courierId}-${i}` : i} courier={c} index={i} />
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState label="لا يوجد مناديب لهذا اليوم" />
              )}
            </>
          ) : (
            <EmptyState label="لا توجد بيانات" />
          )}
        </Section>
      </div>
    </div>
  );
}

function EmptyState({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
      <Bike size={36} className="opacity-40" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

function SkeletonStats() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="flex gap-3 flex-wrap">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 w-32 rounded-xl bg-gray-200" />
        ))}
      </div>
      <div className="h-56 rounded-xl bg-gray-100" />
    </div>
  );
}
