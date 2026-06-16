const FIELDS = ['name', 'email', 'company', 'phone', 'team', 'area', 'message', 'page', 'submittedAt'];

function clean(value) {
  return String(value == null ? '' : value).slice(0, 2000).trim();
}

function json(data, init = {}) {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('Cache-Control', 'no-store');

  return new Response(JSON.stringify(data), {
    ...init,
    headers,
  });
}

async function readBody(request) {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    try {
      return await request.json();
    } catch {
      return {};
    }
  }

  if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    return Object.fromEntries(formData.entries());
  }

  try {
    return JSON.parse(await request.text());
  } catch {
    return {};
  }
}

export async function onRequestPost(context) {
  const { request, env = {} } = context;
  let body = await readBody(request);

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    body = {};
  }

  const data = {};
  for (const field of FIELDS) data[field] = clean(body[field]);
  data.submittedAt = data.submittedAt || new Date().toISOString();
  data.ip = clean(request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')).split(',')[0];

  if (!data.name || !data.email || !data.company) {
    return json({ error: 'Name, email, and company are required.' }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return json({ error: 'Please provide a valid email address.' }, { status: 400 });
  }

  if (clean(body._gotcha)) {
    return json({ ok: true });
  }

  console.log('DEMO_REQUEST', JSON.stringify(data));

  const results = [];

  if (env.SHEET_WEBHOOK_URL) {
    try {
      const response = await fetch(env.SHEET_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      results.push(`sheet:${response.status}`);
    } catch (error) {
      console.error('SHEET_WEBHOOK_ERROR', error.message);
      results.push('sheet:error');
    }
  }

  if (env.RESEND_API_KEY && env.NOTIFY_EMAIL) {
    try {
      const lines = FIELDS
        .filter((field) => data[field])
        .map((field) => `${field}: ${data[field]}`)
        .join('\n');

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: env.FROM_EMAIL || 'Anvaya <onboarding@resend.dev>',
          to: [env.NOTIFY_EMAIL],
          reply_to: data.email,
          subject: `New demo request - ${data.company} (${data.name})`,
          text: lines,
        }),
      });
      results.push(`email:${response.status}`);
    } catch (error) {
      console.error('RESEND_ERROR', error.message);
      results.push('email:error');
    }
  }

  return json({ ok: true, stored: results });
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: 'POST, OPTIONS',
    },
  });
}

export async function onRequest() {
  return json(
    { error: 'Method not allowed' },
    {
      status: 405,
      headers: {
        Allow: 'POST',
      },
    },
  );
}
