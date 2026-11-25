export const REVIEW_STATES=['unreviewed','supported','not-supported','unavailable'];
export function sourceLink(value){try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?{url:u.href,host:u.host}:null;}catch{return null;}}
export function readAudit(raw){
 if(typeof raw!=='string'||new TextEncoder().encode(raw).length>100000)throw new Error('Use an audit JSON file up to 100 kB.');
 let d;try{d=JSON.parse(raw);}catch{throw new Error('The audit file is not valid JSON.');}
 if(!d||d.version!==1||!Array.isArray(d.claims)||!d.claims.length||d.claims.length>20)throw new Error('Use a version 1 audit with 1–20 claims.');
 return d.claims.map(c=>{
  if(!c||typeof c.text!=='string'||c.text.length>4000||typeof c.source_url!=='string'||c.source_url.length>2000||typeof c.notes!=='string'||c.notes.length>4000||!REVIEW_STATES.includes(c.status))throw new Error('Each claim needs text, source_url, status and notes within the field limits.');
  if(c.source_url&&!sourceLink(c.source_url))throw new Error('Source links must be full https URLs without embedded login details.');
  if(c.status!=='unreviewed'&&(!c.text.trim()||!sourceLink(c.source_url)||!c.notes.trim()))throw new Error('Reviewed claims need claim text, an https source URL, and a source passage or reason.');
  return {text:c.text,source_url:c.source_url,status:c.status,notes:c.notes};
 });
}
export function writeAudit(claims){
 const d={version:1,mode:'manual_review',automated_fact_check:false,claims};
 d.claims=readAudit(JSON.stringify(d));return JSON.stringify(d,null,2)+'\n';
}
