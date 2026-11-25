export function inspectResponse(raw){
 let value;try{value=JSON.parse(raw);}catch{return {formatError:'Response is not a single valid JSON object. Keep the original; do not silently remove fences or repair it.'};}
 if(!value||typeof value!=='object'||Array.isArray(value))return {formatError:'Expected a JSON object with table, document and notice fields.'};
 const t=value.table,d=value.document,notice=typeof value.notice==='string'?value.notice:'';
 const words=notice.trim()?notice.trim().split(/\s+/).length:0;
 const quote=(actual,id,sentence)=>actual===sentence||actual===id+' '+sentence;
 const checks=[
 ['Single JSON object',true],
 ['Five expected order IDs, sorted',JSON.stringify(t?.included_order_ids)===JSON.stringify(['A101','A102','A104','A106','A107'])],
 ['Paid order count is 5',t?.paid_order_count===5],
 ['Net revenue is 138 USD',t?.net_revenue_usd===138],
 ['Highest net order is A104',t?.highest_net_order_id==='A104'],
 ['Cutoff evidence matches the source',quote(d?.cutoff?.evidence,'[P2]','Requests received at or after 16:00 UTC are reviewed the next business day.')],
 ['Weekend evidence matches the source',quote(d?.weekend?.evidence,'[P3]','Weekend requests are reviewed on the next business day.')],
 ['Delivery is not stated, with null evidence',d?.delivery?.answer==='not stated'&&d?.delivery?.evidence===null],
 ['Notice has 35–55 whitespace-separated words',words>=35&&words<=55]
 ].map(([name,passed])=>({name,passed}));
 const namedDays=[...new Set((JSON.stringify([d?.cutoff?.answer,d?.weekend?.answer]).match(/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/gi)??[]))];
 return {checks,notice_word_count:words,named_calendar_days:namedDays,manual_review_required:['Check that each answer follows the policy, not just that its quotation matches.','Check any named weekday against a real business calendar; the synthetic policy supplies no holiday calendar.','Check exactly two sentences and all notice facts: date, UTC time, planned length, affected uploads, uncertain end time and saving drafts.'],qualification:'These are checks of this synthetic task, not an overall writing score or product ranking.'};
}
