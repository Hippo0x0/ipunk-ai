// Deliberately faulty fixture. Repair this file without changing the tests.
export function summarizeOrders(orders) {
  const paid = orders.filter(order => order.status === 'paid');
  const net = order => Number(order.amount) - Number(order.refund || 0);
  paid.sort((a,b) => net(b) - net(a));
  return {
    ids: paid.map(order => order.id),
    count: orders.length,
    net_cents: paid.reduce((sum,order) => sum + net(order),0) * 100,
    highest_id: paid[0]?.id ?? null
  };
}
