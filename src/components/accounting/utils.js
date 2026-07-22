export function cn(...values) {
  return values.filter(Boolean).join(' ');
}

export function getInitials(value) {
  const parts = String(value ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return 'FE';
  return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}
