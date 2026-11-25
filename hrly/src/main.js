export { PersonalBot } from './storage.js';

function personal(env) {
  return env.PERSONAL.get(env.PERSONAL.idFromName('owner'));
}

async function configure(request, env) {
  const host = new URL(request.url);
  if (host.protocol !== 'https:' || !host.hostname.endsWith('.workers.dev')) return new Response('استخدم رابط workers.dev', {status: 400});
  if (!env.BOT_TOKEN || !/^\d+$/.test(env.OWNER_ID || '') || !/^[\w-]{32,256}$/.test(env.WEBHOOK_SECRET || '')) return new Response('راجع إعدادات الأسرار الثلاثة في Cloudflare.', {status:503});
  const endpoint = 'https://api.telegram.org/bot' + env.BOT_TOKEN + '/';
  async function api(method, body) {
    const response = await fetch(endpoint + method, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const data = await response.json();
    if (!response.ok || !data.ok) throw Error('Telegram configuration failed');
    return data.result;
  }
  const url = new URL('/webhook',host.origin).href;
  const existing = await api('getWebhookInfo',{});
  if (existing.url && existing.url !== url) return new Response('البوت مرتبط بعنوان آخر. راجع الربط الحالي أولًا.',{status:409});
  await api('setWebhook',{url, secret_token:env.WEBHOOK_SECRET, max_connections:1,allowed_updates:['message']});
  const info = await api('getWebhookInfo',{});
  if (info.url !== url) throw Error('Webhook verification failed');
  const bot = await api('getMe',{});
  return new Response('تم الربط. افتح https://t.me/' + bot.username + ' وأرسل /start');
}

export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (path === '/' && request.method === 'GET') return new Response('<html lang="ar" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>HRly AI</title><h1>HRly AI</h1><form method="post" action="/connect"><label>مفتاح الربط WEBHOOK_SECRET <input type="password" name="key" required></label><button>تفعيل ربط Telegram</button></form></html>',{headers:{'Content-Type':'text/html; charset=utf-8'}});
    if (path === '/connect' && request.method === 'POST') {
      // Verify the setup secret before contacting Telegram.
      const form = await request.formData().catch(()=>null);
      if (!env.WEBHOOK_SECRET || form?.get('key') !== env.WEBHOOK_SECRET) return new Response('مفتاح الربط غير صحيح',{status:403});
      return configure(request,env);
    }
    if (path === '/health') return new Response('ok');
    if (path !== '/webhook' || request.method !== 'POST' || !env.WEBHOOK_SECRET || request.headers.get('X-Telegram-Bot-Api-Secret-Token') !== env.WEBHOOK_SECRET) return new Response('Forbidden',{status:403});
    return personal(env).fetch(request);
  },
  scheduled(event,env,ctx) {
    ctx.waitUntil(personal(env).fetch('https://internal/digest'));
  }
};
