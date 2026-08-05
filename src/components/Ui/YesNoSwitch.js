"use client";

export default function YesNoSwitch({
  value,
  onChange,
  disabled = false,
  yesLabel = "Yes",
  noLabel = "No",
}) {
  return (
    <div
      className={`inline-flex items-center rounded-lg bg-gray-100 p-0.5 dark:bg-gray-800 ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      }`}
      role="group"
      aria-label="Yes or No"
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(true)}
        aria-pressed={value}
        className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
          value
            ? "bg-white text-emerald-600 shadow-sm dark:bg-gray-700 dark:text-emerald-400"
            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        }`}
      >
        {yesLabel}
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(false)}
        aria-pressed={!value}
        className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
          !value
            ? "bg-white text-rose-600 shadow-sm dark:bg-gray-700 dark:text-rose-400"
            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        }`}
      >
        {noLabel}
      </button>
    </div>
  );
}
