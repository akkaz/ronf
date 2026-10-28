export const HOUR_GRACE_MS=2*60*1000;
// Optional lesson reminders use local time on the teacher’s device.
export const DEFAULT_BELLS=['09:00','10:00','11:00','12:00','13:00','14:00'];
export function cleanBells(value){
 const items=Array.isArray(value)?value:String(value||'').split(/[\s,;]+/);
 const result=[...new Set(items.filter(t=>typeof t==='string'&&/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(t)))].sort();
 return result.length&&result.length<=24?result:DEFAULT_BELLS.slice();
}
export function nextBell(now=Date.now(),bells=DEFAULT_BELLS){
 const parts=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{hourCycle:'h23',hour:'2-digit',minute:'2-digit',second:'2-digit'}).formatToParts(now).map(p=>[p.type,p.value]));
 const minute=+parts.hour*60+(+parts.minute),fraction=(+parts.second)*1000+(now%1000);
 for(const value of cleanBells(bells)){const [h,m]=value.split(':').map(Number),delta=(h*60+m-minute)*60000-fraction;if(delta>0&&delta<=8*3600000)return now+delta;}
 // Outside school hours, a lesson still has a definite end, at the next full hour.
 return now+(60-(minute%60))*60000-fraction;
}
export function hourState(deadline,now=Date.now()){
 if(!Number.isFinite(deadline)||deadline<=0)return {pending:false,expired:false,remaining:0};
 return {pending:now>=deadline,expired:now>=deadline+HOUR_GRACE_MS,remaining:Math.max(0,Math.ceil((deadline+HOUR_GRACE_MS-now)/1000))};
}
export function validDeadline(value,now=Date.now()){
 return typeof value==='number'&&Number.isFinite(value)&&value>now&&value<=now+8*3600000;
}
