// Author-written reference used to validate this fixture, not an agent output.
function cents(value) {
  if(typeof value!=='string'||!/^(0|[1-9]\d*)(\.\d{1,2})?$/.test(value))throw new Error('Invalid decimal money');
  const [whole,fraction='']=value.split('.');
  const exact=BigInt(whole)*100n+BigInt(fraction.padEnd(2,'0'));
  if(exact>BigInt(Number.MAX_SAFE_INTEGER))throw new Error('Unsafe cents');
  return Number(exact);
}
export function summarizeOrders(orders) {
  const ids=[],seen=new Set();let total=0,highestId=null,highestNet=-1;
  for(const order of orders){
    if(order.status!=='paid')continue;
    if(typeof order.id!=='string'||seen.has(order.id))throw new Error('Invalid or duplicate ID');
    seen.add(order.id);ids.push(order.id);
    const amount=cents(order.amount),refund=cents(order.refund===undefined?'0':order.refund);
    if(refund>amount)throw new Error('Refund exceeds amount');
    const net=amount-refund;
    if(!Number.isSafeInteger(total+net))throw new Error('Unsafe total');
    total+=net;
    if(net>highestNet||(net===highestNet&&order.id<highestId)){highestNet=net;highestId=order.id;}
  }
  return {ids:ids.sort(),count:ids.length,net_cents:total,highest_id:highestId};
}
