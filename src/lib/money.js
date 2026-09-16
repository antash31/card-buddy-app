// #genai: Rupee formatting for scored figures.
//
// Indian digit grouping (1,20,000 rather than 120,000) and a real minus sign, because these
// figures are set in tabular numerals next to each other and a hyphen reads as a dash.
export function formatRupees(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '—';

  const magnitude = Math.abs(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${amount < 0 ? '\u2212' : ''}Rs.${magnitude}`;
}

export function formatPoints(value) {
  const points = Number(value);
  if (!Number.isFinite(points)) return '—';
  return points.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}
