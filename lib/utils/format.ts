/** Compact counts for stat rows: 240 → "240", 1250 → "1.3k", 12000 → "12k". */
export function formatCompactNumber(value: number): string {
  if (value < 1000) return String(Math.round(value));
  const thousands = value / 1000;
  return `${thousands < 10 ? thousands.toFixed(1).replace(/\.0$/, '') : Math.round(thousands)}k`;
}

/** 0.724 → 72 (clamped to 0–100). */
export function toPercent(fraction: number): number {
  return Math.round(Math.min(1, Math.max(0, fraction)) * 100);
}

/** "Grace Manuel" → "GM"; "grace" → "G". */
export function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}
