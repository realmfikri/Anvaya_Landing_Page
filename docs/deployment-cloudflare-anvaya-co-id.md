# Deploying Anvaya to Cloudflare Pages

## Goal

Deploy the Anvaya landing page to Cloudflare Pages at:

```text
https://anvaya.co.id
https://www.anvaya.co.id
```

The canonical host is:

```text
https://anvaya.co.id
```

`www.anvaya.co.id` should redirect to the apex domain.

## What Changed

The repository was updated for Cloudflare Pages:

```text
scripts/build-static.mjs
functions/api/demo.js
wrangler.toml
package.json
README.md
docs/deployment-anvaya.md
docs/deployment-cloudflare-anvaya-co-id.md
```

The old GitHub Pages workflow and Vercel-only deployment files were removed:

```text
.github/workflows/deploy.yml
api/demo.js
vercel.json
```

The build still outputs static assets to:

```text
dist/
```

The build script now defaults `CUSTOM_DOMAIN` to:

```text
anvaya.co.id
```

It no longer generates GitHub Pages-only files such as `CNAME` or `.nojekyll`. It generates `dist/_redirects` for Cloudflare Pages:

```text
https://www.anvaya.co.id/* https://anvaya.co.id/:splat 301
```

Cloudflare Pages clean URLs serve `demo.html` at `/demo` and canonicalize `/demo.html` back to `/demo`, so the build does not add a separate `/demo` redirect.

The demo form backend was ported from a Vercel serverless function to a Cloudflare Pages Function:

```text
functions/api/demo.js
```

It handles:

```text
POST /api/demo
```

It preserves these optional environment variables:

```text
SHEET_WEBHOOK_URL
RESEND_API_KEY
NOTIFY_EMAIL
FROM_EMAIL
```

## Why Cloudflare Pages

Cloudflare Pages is the right deployment target because the domain will be managed in Cloudflare DNS and the site is a static landing page with one small serverless form endpoint. Pages can serve the static `dist/` output and deploy the colocated `functions/api/demo.js` backend without using a separate Vercel or GitHub Pages deployment.

## Build

Install dependencies:

```bash
npm install
```

Build command:

```bash
npm run build
```

Build output directory:

```text
dist
```

Cloudflare Pages dashboard settings should use:

```text
Build command: npm run build
Build output directory: dist
Root directory: /
Production branch: main
```

## Deploy

Deploy command:

```bash
npx wrangler pages deploy dist --project-name anvaya-landing-page --branch main
```

Authentication should use an existing `CLOUDFLARE_API_TOKEN` environment variable when available. If that is not available, use an existing Wrangler login session.

If neither auth method exists, run this owner action locally and then retry the deploy:

```bash
npx wrangler login
```

Do not commit Cloudflare tokens, local Wrangler credentials, `.env` files, webhook URLs, or email API keys.

## Owner Dashboard Steps

These steps still require the Cloudflare account owner:

1. Add `anvaya.co.id` as a Cloudflare zone if it is not already present.
2. Create or open the Pages project named `anvaya-landing-page`.
3. If using Git integration, connect `realmfikri/Anvaya_Landing_Page`.
4. Set the production branch to `main`.
5. Set the build command to `npm run build`.
6. Set the build output directory to `dist`.
7. Add the custom domain `anvaya.co.id` to the Pages project.
8. Add the custom domain `www.anvaya.co.id` to the same Pages project.
9. In Pages project settings, set any production environment variables needed by the demo form:

```text
SHEET_WEBHOOK_URL
RESEND_API_KEY
NOTIFY_EMAIL
FROM_EMAIL
```

The generated `_redirects` file redirects `www.anvaya.co.id` to `anvaya.co.id`, but Cloudflare must first route `www.anvaya.co.id` to this Pages project. If the `www` custom domain is not attached to the Pages project, create a Cloudflare Redirect Rule instead:

```text
When hostname equals www.anvaya.co.id
Forward to https://anvaya.co.id/$1
Status code 301
Preserve path and query string
```

## JagoanHosting Nameserver Steps

The domain is active at JagoanHosting and DNS will be moved to Cloudflare manually.

1. In Cloudflare, add the site `anvaya.co.id`.
2. Copy the two Cloudflare nameservers assigned to the zone.
3. Log in to JagoanHosting.
4. Open domain management for `anvaya.co.id`.
5. Open the nameserver settings.
6. Replace the current nameservers with the two Cloudflare nameservers.
7. Save the change.
8. Wait for registry and DNS propagation.
9. In Cloudflare DNS, confirm the zone becomes active.
10. Use the Pages custom domain flow to create the apex and `www` DNS records. If records must be created manually, point both hosts to the Pages project target shown by Cloudflare.

## Verification

Check nameservers:

```bash
dig NS anvaya.co.id
```

Check the production host:

```bash
curl -I https://anvaya.co.id
```

Check the `www` redirect:

```bash
curl -I https://www.anvaya.co.id
```

Check the `/demo` route:

```bash
curl -I https://anvaya.co.id/demo
```

Check the demo form backend with non-sensitive test data:

```bash
curl -sS -X POST https://anvaya.co.id/api/demo \
  -H 'content-type: application/json' \
  --data '{"name":"Test User","email":"test@example.com","company":"Example Co"}'
```

Expected backend response:

```json
{"ok":true,"stored":[]}
```

If `SHEET_WEBHOOK_URL` or Resend variables are configured, `stored` should include the integration status codes.

## Rollback

Code rollback:

```bash
git revert <commit-sha>
npm install
npm run build
npx wrangler pages deploy dist --project-name anvaya-landing-page --branch main
```

Cloudflare Pages rollback:

1. Open Cloudflare dashboard.
2. Go to Workers & Pages.
3. Open `anvaya-landing-page`.
4. Open Deployments.
5. Select the previous known-good deployment.
6. Use Rollback.

DNS rollback:

1. If Cloudflare nameservers have not propagated, revert nameservers in JagoanHosting.
2. If Cloudflare is already active, remove or change the Pages custom domains and DNS records in Cloudflare.
3. Wait for DNS and certificate state to settle before retesting.

## Known Limitations

The deploy command above is a direct Wrangler upload. If the Cloudflare dashboard Git integration is also enabled, keep its build settings aligned with this document.

The demo backend is ported to Cloudflare Pages Functions, but durable lead capture and email notification only work after the owner configures `SHEET_WEBHOOK_URL` or the Resend environment variables in Cloudflare Pages. Without those variables, submissions validate successfully and are written to Cloudflare function logs only.

The `www` redirect depends on `www.anvaya.co.id` being attached to the same Pages project or on an explicit Cloudflare Redirect Rule.

DNS migration timing depends on JagoanHosting, the registry, recursive resolver caches, and Cloudflare zone activation.
