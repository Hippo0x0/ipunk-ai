import { videoBudget } from './video-budget-math.mjs';

export function runwayTrialBudget({ balance, shortAttempts, longAttempts, shortCost = 25, longCost = 50 }) {
  if (![balance, shortAttempts, longAttempts].every(value => Number.isSafeInteger(value) && value >= 0 && value <= 10_000)) {
    throw new RangeError('Enter whole numbers between 0 and 10,000.');
  }
  if (![shortCost, longCost].every(value => Number.isSafeInteger(value) && value > 0 && value <= 10_000)) {
    throw new RangeError('Enter credit costs between 1 and 10,000.');
  }
  const creditsFor = (attempts, cost) => attempts === 0 ? 0 : videoBudget({
    credits: balance, cost, clips: attempts, attempts: 1,
  }).required;
  const shortCredits = creditsFor(shortAttempts, shortCost);
  const longCredits = creditsFor(longAttempts, longCost);
  const required = shortCredits + longCredits;
  const remaining = Math.max(0, balance - required);
  return {
    shortCredits,
    longCredits,
    required,
    remaining,
    shortfall: Math.max(0, required - balance),
    extraShortAttempts: Math.floor(remaining / shortCost),
    extraLongAttempts: Math.floor(remaining / longCost),
  };
}
