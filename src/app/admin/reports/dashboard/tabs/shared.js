// Shared design tokens & primitives for all dashboard tabs

export const PALETTE = {
  blue:    '#2563eb',
  emerald: '#059669',
  violet:  '#7c3aed',
  amber:   '#d97706',
  rose:    '#e11d48',
  cyan:    '#0891b2',
  slate:   '#475569',
  indigo:  '#4338ca',
};

export const CHART_COLORS = [
  '#2563eb', '#059669', '#7c3aed', '#d97706',
  '#e11d48', '#0891b2', '#db2777', '#84cc16',
];

export const TOOLTIP_STYLE = {
  borderRadius: '10px',
  border: 'none',
  boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.12), 0 4px 6px -2px rgb(0 0 0 / 0.05)',
  fontSize: '13px',
  direction: 'ltr',
};

/** KPI stat card */
export function StatCard({ label, value, icon: Icon, accent = '#2563eb', trend, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200 p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${accent}15` }}
        >
          <Icon size={20} style={{ color: accent }} strokeWidth={2} />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800 leading-none">
          {typeof value === 'number' ? value.toLocaleString() : value ?? '—'}
        </p>
        <p className="text-xs text-slate-400 font-medium mt-1.5">{label}</p>
        {sub && <p className="text-xs text-slate-300 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

/** Section card wrapper */
export function ChartCard({ title, icon: Icon, accent = '#2563eb', children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-5 ${className}`}>
      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-5">
        <span
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${accent}15` }}
        >
          <Icon size={15} style={{ color: accent }} strokeWidth={2.2} />
        </span>
        {title}
      </h3>
      {children}
    </div>
  );
}

/** Filter bar wrapper */
export function FilterBar({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4">
      <div className="flex flex-wrap items-center gap-3">
        {title && (
          <div className="flex items-center gap-2 me-auto">
            {Icon && <Icon size={16} className="text-blue-500" />}
            <span className="font-semibold text-slate-700 text-sm">{title}</span>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

/** Pill button for quick filters */
export function PillButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
        active
          ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
          : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
      }`}
    >
      {children}
    </button>
  );
}

/** Date input */
export function DateInput({ value, onChange, label }) {
  return (
    <div className="flex items-center gap-1.5">
      {label && <span className="text-xs text-slate-500 font-medium">{label}</span>}
      <input
        type="date"
        value={value}
        onChange={onChange}
        className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
      />
    </div>
  );
}

/** Loading skeleton */
export function LoadingSkeleton({ rows = 3, height = 'h-64' }) {
  return (
    <div className={`${height} flex flex-col gap-3 justify-center`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-slate-100 rounded-lg animate-pulse"
          style={{ width: `${70 + (i % 3) * 10}%`, animationDelay: `${i * 100}ms` }}
        />
      ))}
    </div>
  );
}

/** Empty state */
export function EmptyState({ message = 'لا توجد بيانات' }) {
  return (
    <div className="h-48 flex flex-col items-center justify-center gap-3 text-slate-400">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
        <span className="text-xl">📊</span>
      </div>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

/** Error banner */
export function ErrorBanner({ message }) {
  return (
    <div className="bg-rose-50 border border-rose-200 text-rose-700 px-5 py-4 rounded-2xl text-sm flex items-center gap-3">
      <span className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0 text-rose-500 font-bold text-xs">!</span>
      {message}
    </div>
  );
}

/** Custom recharts dot */
export const ChartDot = ({ cx, cy, stroke }) => (
  <circle cx={cx} cy={cy} r={3.5} fill={stroke} stroke="#fff" strokeWidth={2} />
);

/** View mode toggle (Chart / Table) */
export function ViewToggle({ mode, onChange }) {
  return (
    <div className="flex border border-slate-200 rounded-lg overflow-hidden">
      {['chart', 'table'].map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`px-4 py-1.5 text-xs font-semibold transition-all ${
            mode === m ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'
          }`}
        >
          {m === 'chart' ? '📈 مخطط' : '📋 جدول'}
        </button>
      ))}
    </div>
  );
}