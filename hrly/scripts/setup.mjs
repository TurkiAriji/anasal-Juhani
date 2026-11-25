// Run locally only: secrets are read from environment, never printed.
const token=process.env.BOT_TOKEN;
if(!token)throw Error('Set BOT_TOKEN privately first');
async function api(method,body={}){const r=await fetch(`https://api.telegram.org/bot${token}/${method}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});const j=await r.json();if(!r.ok||!j.ok)throw Error('Telegram request failed: '+method);return j.result;}
if(process.argv[2]==='owner'){
 const info=await api('getWebhookInfo');if(info.url)throw Error('Webhook already configured; this helper is for a new bot only.');
 const updates=await api('getUpdates',{limit:100,timeout:0,allowed_updates:['message']});
 for(let m of updates.map(x=>x.message).filter(m=>m?.chat?.type==='private'&&m.text==='/start'))console.log('Candidate owner ID:',m.from.id,'— verify this is your own message before using it.');
}else if(process.argv[2]==='webhook'){
 const url=new URL(process.env.WORKER_URL);if(url.protocol!=='https:')throw Error('HTTPS required');const secret=process.env.WEBHOOK_SECRET;if(!secret||!/^[A-Za-z0-9_-]{32,256}$/.test(secret))throw Error('Set a strong webhook secret');
 const target=new URL('/webhook',url).href;
 const prior=await api('getWebhookInfo');
 if(prior.url && prior.url!==target)throw Error('Existing webhook points to a different deployment.');
 await api('setWebhook',{url:new URL('/webhook',url).href,secret_token:secret,allowed_updates:['message'],max_connections:1,drop_pending_updates:false});await api('setMyCommands',{commands:[{command:'start',description:'القائمة الرئيسية'},{command:'quiz',description:'اختبار الموارد البشرية'},{command:'calc',description:'الحاسبات'},{command:'news',description:'المستجدات الرسمية'},{command:'discipline',description:'المخالفات والجزاءات'},{command:'discipline_quiz',description:'اختبار الجزاءات'},{command:'progress',description:'نتائج الاختبارات'},{command:'clear',description:'مسح سياق البوت'},{command:'cancel',description:'إلغاء الاختبار'}]});const registered=await api('getWebhookInfo');if(registered.url!==target)throw Error('Webhook registration not confirmed');console.log('Webhook and commands configured. Send /start in Telegram to test.');
}else throw Error('Use owner or webhook');
