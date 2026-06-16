// Anvaya — demo request handler (Vercel serverless function, Node runtime).
//
// Storage is pluggable via environment variables. With NO env vars set it still
// works on deploy: every submission is written to the function logs (visible in
// the Vercel dashboard → Project → Logs). Add ONE of the options below to make
// responses durable & viewable:
//
//   SHEET_WEBHOOK_URL  → POST each submission to a Google Apps Script web app
//                        that appends a row to a Google Sheet (recommended,
//                        free, see README_DEPLOY.md).
//   RESEND_API_KEY     → email each submission via Resend.
//   NOTIFY_EMAIL       → recipient for the Resend email (e.g. you@anvaya.co.id).
//   FROM_EMAIL         → verified Resend sender (default: onboarding@resend.dev).
//
// No npm dependencies — uses the global fetch built into Vercel's Node runtime.

const FIELDS = ['name', 'email', 'company', 'phone', 'team', 'area', 'message', 'page', 'submittedAt'];

function clean(v) {
  return String(v == null ? '' : v).slice(0, 2000).trim();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // body may arrive parsed (object) or raw (string) depending on runtime
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  const data = {};
  for (const f of FIELDS) data[f] = clean(body[f]);
  data.submittedAt = data.submittedAt || new Date().toISOString();
  data.ip = clean(req.headers['x-forwarded-for']).split(',')[0];

  // ---- minimal validation ----
  if (!data.name || !data.email || !data.company) {
    return res.status(400).json({ error: 'Name, email, and company are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }
  // honeypot: bots fill hidden fields
  if (clean(body['_gotcha'])) {
    return res.status(200).json({ ok: true });
  }

  // ---- always log (durable enough to never lose a lead while you wire storage) ----
  console.log('DEMO_REQUEST', JSON.stringify(data));

  const results = [];

  // ---- Option 1: Google Sheet via Apps Script web app ----
  if (process.env.SHEET_WEBHOOK_URL) {
    try {
      const r = await fetch(process.env.SHEET_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      results.push('sheet:' + r.status);
    } catch (e) {
      console.error('SHEET_WEBHOOK_ERROR', e.message);
      results.push('sheet:error');
    }
  }

  // ---- Option 2: email notification via Resend ----
  if (process.env.RESEND_API_KEY && process.env.NOTIFY_EMAIL) {
    try {
      const lines = FIELDS.filter(f => data[f]).map(f => `${f}: ${data[f]}`).join('\n');
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + process.env.RESEND_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.FROM_EMAIL || 'Anvaya <onboarding@resend.dev>',
          to: [process.env.NOTIFY_EMAIL],
          reply_to: data.email,
          subject: `New demo request — ${data.company} (${data.name})`,
          text: lines,
        }),
      });
      results.push('email:' + r.status);
    } catch (e) {
      console.error('RESEND_ERROR', e.message);
      results.push('email:error');
    }
  }

  return res.status(200).json({ ok: true, stored: results });
}
