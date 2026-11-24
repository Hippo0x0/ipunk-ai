export function videoBudget({ credits, cost, clips, attempts }) {
  if (![credits,cost,clips,attempts].every(Number.isFinite) || credits < 0 || cost <= 0 || !Number.isSafeInteger(clips) || clips < 1 || !Number.isSafeInteger(attempts) || attempts < 1) throw new Error('Use non-negative available credits, a positive attempt cost and positive whole numbers for clips and attempts.');
  const required = clips * attempts * cost;
  const perClip = attempts * cost;
  if (!Number.isFinite(required) || !Number.isFinite(perClip)) throw new Error('The entered values are too large.');
  const epsilon = Number.EPSILON * Math.max(1, Math.abs(required), Math.abs(credits)) * 4;
  const fits = required <= credits + epsilon;
  return { required, shortfall: fits ? 0 : required - credits, capacity: Math.min(Number.MAX_SAFE_INTEGER, Math.floor((credits + epsilon) / perClip)), fits };
}
