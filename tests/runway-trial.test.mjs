import assert from 'node:assert/strict';
import test from 'node:test';
import { runwayTrialBudget } from '../dist/runway-trial-math.mjs';

test('mixed durations share one balance and extra runs are alternatives', () => {
  assert.deepEqual(runwayTrialBudget({ balance: 125, shortAttempts: 1, longAttempts: 1 }), {
    shortCredits: 25, longCredits: 50, required: 75, remaining: 50,
    shortfall: 0, extraShortAttempts: 2, extraLongAttempts: 1,
  });
});

test('exact, insufficient and zero balances behave independently of attempts', () => {
  assert.equal(runwayTrialBudget({ balance: 125, shortAttempts: 3, longAttempts: 1 }).remaining, 0);
  assert.equal(runwayTrialBudget({ balance: 125, shortAttempts: 4, longAttempts: 1 }).shortfall, 25);
  assert.equal(runwayTrialBudget({ balance: 0, shortAttempts: 0, longAttempts: 0 }).required, 0);
});

test('invalid field values cannot produce a budget', () => {
  assert.throws(() => runwayTrialBudget({ balance: NaN, shortAttempts: 1, longAttempts: 1 }), RangeError);
  assert.throws(() => runwayTrialBudget({ balance: 125, shortAttempts: 1.5, longAttempts: 1 }), RangeError);
  assert.throws(() => runwayTrialBudget({ balance: 125, shortAttempts: 1, longAttempts: -1 }), RangeError);
  assert.throws(() => runwayTrialBudget({ balance: 10_001, shortAttempts: 1, longAttempts: 1 }), RangeError);
});

test('uses the displayed costs when credit presets differ', () => {
  const budget = runwayTrialBudget({
    balance: 125, shortAttempts: 1, longAttempts: 1, shortCost: 30, longCost: 60,
  });
  assert.equal(budget.required, 90);
  assert.equal(budget.extraShortAttempts, 1);
  assert.equal(budget.extraLongAttempts, 0);
});
