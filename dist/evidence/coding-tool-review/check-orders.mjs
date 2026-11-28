import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

if (process.argv.length !== 3) {
  console.error('Usage: node check-orders.mjs path/to/reviewed/orders.mjs');
  process.exit(2);
}

const { summarizeOrders } = await import(pathToFileURL(resolve(process.argv[2])));
assert.equal(typeof summarizeOrders, 'function');

const paid = (id, amount) => ({ id, status: 'paid', amount });
const checks = [
  ['reject numeric ID', () => assert.throws(() => summarizeOrders([paid(7, '1')]))],
  ['reject numeric amount', () => assert.throws(() => summarizeOrders([paid('A', 1)]))],
  ['reject null refund', () => assert.throws(() => summarizeOrders([{ ...paid('A', '1'), refund: null }]))],
  ['reject array amount', () => assert.throws(() => summarizeOrders([paid('A', ['1'])]))],
  ['accept missing refund', () => assert.deepEqual(
    summarizeOrders([paid('A', '1.2')]),
    { ids: ['A'], count: 1, net_cents: 120, highest_id: 'A' },
  )],
  ['accept maximum safe cents', () => assert.equal(
    summarizeOrders([paid('A', '90071992547409.91')]).net_cents,
    Number.MAX_SAFE_INTEGER,
  )],
  ['use lexical ordering for ties', () => assert.deepEqual(
    summarizeOrders([paid('a', '1'), paid('Z', '1')]),
    { ids: ['Z', 'a'], count: 2, net_cents: 200, highest_id: 'Z' },
  )],
  ['ignore malformed unpaid records', () => assert.deepEqual(
    summarizeOrders([{ id: false, status: 'pending', amount: [] }]),
    { ids: [], count: 0, net_cents: 0, highest_id: null },
  )],
];

const results = checks.map(([name, check]) => {
  try {
    check();
    return { name, passed: true };
  } catch {
    return { name, passed: false };
  }
});

console.log(JSON.stringify({ passed: results.filter(result => result.passed).length, total: results.length, results }, null, 2));
process.exitCode = results.every(result => result.passed) ? 0 : 1;
