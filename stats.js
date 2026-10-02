(() => {
 const base=String(window.WENJIANG_STATS_URL||'').replace(/\/$/,'');
 const key=d=>String(d.id||((d.season||(d.cat==='s11'?'s11':d.cat==='s165'?'s165':'s18'))+'|'+d.n));
 async function request(path,body){
  if(!/^https:\/\//.test(base))throw Error('未配置');
  const r=await fetch(base+path,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(7000),cache:'no-store'});
  if(!r.ok)throw Error('统计不可用');return r.json();
 }
 window.WenjiangStats={enabled:!!base,key,
  async rank(season){return request('/rank?channel=web&season='+encodeURIComponent(season));},
  async record(d){
   if(!base)return false;
   try{
    let id=localStorage.getItem('wenjiang-stats-device-v1');
    if(!id){id=crypto.randomUUID();localStorage.setItem('wenjiang-stats-device-v1',id);}
    await request('/copy',{channel:'web',device:id,lineup:key(d)});return true;
   }catch{return false;}
  }
 };
})();
