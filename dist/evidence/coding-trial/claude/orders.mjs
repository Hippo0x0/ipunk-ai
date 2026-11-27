// Deliberately faulty fixture. Repair this file without changing the tests.
const MAX_SAFE_CENTS = BigInt(Number.MAX_SAFE_INTEGER);
const MONEY_RE = /^(0|[1-9]\d*)(?:\.(\d{1,2}))?$/;

function toCents(value) {
  const match = MONEY_RE.exec(value);
  if (!match) {
    throw new Error(`malformed money value: ${value}`);
  }
  const whole = BigInt(match[1]);
  const frac = (match[2] ?? '').padEnd(2, '0');
  const cents = whole * 100n + BigInt(frac);
  if (cents > MAX_SAFE_CENTS) {
    throw new Error(`unsafe cents: ${value}`);
  }
  return cents;
}

export function summarizeOrders(orders) {
  const paid = [];
  const seen = new Set();
  let totalCents = 0n;

  for (const order of orders) {
    if (order.status !== 'paid') {
      continue;
    }

    if (seen.has(order.id)) {
      throw new Error(`duplicate paid id: ${order.id}`);
    }
    seen.add(order.id);

    const amountCents = toCents(order.amount);
    const refundCents = toCents(order.refund ?? '0');
    if (refundCents > amountCents) {
      throw new Error('refund exceeds amount');
    }

    const netCents = amountCents - refundCents;
    totalCents += netCents;
    if (totalCents > MAX_SAFE_CENTS) {
      throw new Error('unsafe aggregate total');
    }

    paid.push({ id: order.id, netCents });
  }

  const ids = paid.map(({ id }) => id).sort();
  const highest = paid.reduce((best, curr) => {
    if (best === undefined) return curr;
    if (curr.netCents > best.netCents) return curr;
    if (curr.netCents === best.netCents && curr.id < best.id) return curr;
    return best;
  }, undefined);

  return {
    ids,
    count: paid.length,
    net_cents: Number(totalCents),
    highest_id: highest === undefined ? null : highest.id,
  };
}
