(() => {
 const base=String(window.WENJIANG_STATS_URL||'').replace(/\/$/,'');
 const key=d=>String(d.id||((d.season||(d.cat==='s11'?'s11':d.cat==='s165'?'s165':'s18'))+'|'+d.n));
 const status={rank:'尚未请求',copy:'尚未上报',storage:'尚未检查'};
 async function request(path,body){
  if(!/^https:\/\//.test(base))throw Error('统计地址未配置');
  const controller=typeof AbortController==='function'?new AbortController():null;
  let timer;const options={method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,cache:'no-store',...(controller?{signal:controller.signal}:{})};
  try{return await Promise.race([fetch(base+path,options).then(async r=>{if(!r.ok)throw Error('统计接口 HTTP '+r.status);return r.json()}),new Promise((_,reject)=>{timer=setTimeout(()=>{if(controller)controller.abort();reject(Error('统计网络请求超时'))},12000)})]);}finally{clearTimeout(timer)}
 }
 function device(){
  let id=localStorage.getItem('wenjiang-stats-device-v1');
  if(!id){
   const bytes=new Uint8Array(16);
   if(!window.crypto||!crypto.getRandomValues)throw Error('浏览器不支持安全设备标识');
   crypto.getRandomValues(bytes);bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
   const h=Array.from(bytes,x=>x.toString(16).padStart(2,'0')).join('');id=h.slice(0,8)+'-'+h.slice(8,12)+'-'+h.slice(12,16)+'-'+h.slice(16,20)+'-'+h.slice(20);
   localStorage.setItem('wenjiang-stats-device-v1',id);
   if(localStorage.getItem('wenjiang-stats-device-v1')!==id)throw Error('设备标识未保存');
  }
  status.storage='可读写';return id;
 }
 window.WenjiangStats={enabled:!!base,key,status,
  async rank(season){try{const r=await request('/rank?channel=web&season='+encodeURIComponent(season));status.rank='已连接，'+(r.items||[]).length+'套热门阵容';return r}catch(e){status.rank=e.message;throw e}},
  async record(d){try{await request('/copy',{channel:'web',device:device(),lineup:key(d)});status.copy='上报成功';return true}catch(e){status.copy=e.message;return false}}
 };
})();
