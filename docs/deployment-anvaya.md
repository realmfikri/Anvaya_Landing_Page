# Deploying the Anvaya Landing Page

## Goal

Deploy the Anvaya landing page so it is available at:

```text
https://anvaya.muhamadfikri.com
```

## Source Repositories

Source repository requested for this deployment:

```text
https://github.com/alilsyahril/Anvaya_Landing_Page
```

Local checkout used for deployment:

```text
origin   git@github.com:realmfikri/Anvaya_Landing_Page.git
upstream git@github.com:alilsyahril/Anvaya_Landing_Page.git
branch   main
```

Reference deployment that is already working:

```text
https://github.com/realmfikri/muhamadfikri
https://muhamadfikri.com
```

That reference site uses GitHub Pages with GitHub Actions, so this repository follows the same deployment model.

## Why GitHub Pages

GitHub Pages was chosen because the existing `muhamadfikri.com` deployment already works with GitHub Pages and GitHub Actions. The Anvaya landing page is mostly plain static HTML, CSS, JavaScript, images, and fonts, so it can be published from a generated `dist/` folder without requiring a framework build.

## Stack After Inspection

The repository is a simple static landing page. It is not Astro, Next.js, or Vite.

Important files:

```text
index.html
demo.html
style.css
main.js
agents.js
contours.js
earth-data.js
globe.js
assets/
fonts/
api/demo.js
vercel.json
package.json
```

`package.json` originally had metadata only and no scripts.

`vercel.json` enables Vercel clean URLs:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "cleanUrls": true,
  "trailingSlash": false
}
```

## Static Compatibility

The public landing page assets are static-compatible.

One file is not static-compatible:

```text
api/demo.js
```

That file is a Vercel Node serverless function. It accepts POST requests from `demo.html` and can forward submissions to a Google Sheet or Resend email using environment variables such as:

```text
SHEET_WEBHOOK_URL
RESEND_API_KEY
NOTIFY_EMAIL
FROM_EMAIL
```

GitHub Pages cannot run serverless functions, so `api/` is intentionally not copied to `dist/`. The landing page and demo page can be hosted on GitHub Pages, but the demo form submission endpoint needs a separate backend if lead capture must work in production.

Good backend options for the form are:

```text
Vercel serverless functions
Cloudflare Pages Functions
Cloudflare Workers
An external form service
```

## Files Changed

Deployment files added or updated:

```text
.gitignore
package.json
scripts/build-static.mjs
.github/workflows/deploy.yml
README.md
docs/deployment-anvaya.md
```

## Build Process

Run:

```bash
npm run build
```

The build script:

1. Deletes old `dist/`.
2. Creates a new `dist/`.
3. Copies the static site files into `dist/`.
4. Excludes non-static and local-only files such as `.git`, `.github`, `node_modules`, `.env`, `.vercel`, docs, and `api/`.
5. Creates `dist/CNAME`.
6. Creates `dist/.nojekyll`.
7. Creates `dist/demo/index.html` as a static redirect to `/demo.html`, preserving the previous Vercel-style `/demo` route.

Files copied into `dist/`:

```text
index.html
demo.html
style.css
main.js
agents.js
contours.js
earth-data.js
globe.js
assets/
fonts/
```

## Why `dist/CNAME` Is Generated

GitHub Pages uses a `CNAME` file to associate the deployed artifact with a custom domain. The build script generates:

```text
dist/CNAME
```

with this exact domain:

```text
anvaya.muhamadfikri.com
```

The GitHub repository Pages settings may still need the custom domain configured through the UI or API, but keeping `CNAME` in the uploaded artifact makes the deployment reproducible.

## GitHub Actions Deployment Workflow

The workflow is:

```text
.github/workflows/deploy.yml
```

It runs on:

```text
push to main
manual workflow_dispatch
```

It performs these steps:

1. Checks out the repository.
2. Sets up Node.js 22.
3. Installs dependencies using the lockfile/package manager that exists.
4. Runs `npm run build`.
5. Configures GitHub Pages.
6. Uploads `dist/` as the Pages artifact.
7. Deploys the artifact with `actions/deploy-pages@v4`.

The workflow sets `enablement: true` on `actions/configure-pages@v5`. The first run failed before this was added because GitHub Pages was not enabled yet:

```text
Get Pages site failed. Please verify that the repository has Pages enabled and configured to build using GitHub Actions, or consider exploring the enablement parameter for this action.
```

After `enablement: true` was added, follow-up runs still failed because the workflow token could not create the Pages site:

```text
Create Pages site failed. Error: Resource not accessible by integration
```

That means a repository admin must enable GitHub Pages manually, or use an authenticated GitHub CLI/session with sufficient admin rights.

## GitHub Pages Settings

For this workflow-based Pages deployment, the repository should be configured as:

```text
Settings -> Pages -> Source -> GitHub Actions
```

The custom domain should be:

```text
anvaya.muhamadfikri.com
```

CLI/API configuration to use when GitHub CLI is available:

```bash
gh auth status
gh repo view --json owner,name,url
OWNER="$(gh repo view --json owner -q .owner.login)"
REPO="$(gh repo view --json name -q .name)"

gh api -X POST "/repos/${OWNER}/${REPO}/pages" -f build_type=workflow || \
gh api -X PUT "/repos/${OWNER}/${REPO}/pages" -f build_type=workflow

gh api -X PUT "/repos/${OWNER}/${REPO}/pages" \
  -f cname='anvaya.muhamadfikri.com'
```

During this local deployment setup, `gh` was not available in the terminal:

```text
/bin/bash: line 1: gh: command not found
```

Because of that, GitHub Pages source and custom domain settings could not be changed from this environment through `gh`. The workflow attempted Pages enablement through `actions/configure-pages@v5`, but GitHub rejected creation with:

```text
Resource not accessible by integration
```

Use the manual settings path above, or install/authenticate GitHub CLI and rerun the commands with an account that has repository admin access.

If the CLI/API fails because of permissions or an existing Pages configuration, use the manual settings path above.

## Cloudflare DNS

For a GitHub Pages custom subdomain, create this DNS record:

```text
Type: CNAME
Name: anvaya
Target: realmfikri.github.io
Proxy status: DNS only / grey cloud first
TTL: Auto
```

The actual GitHub owner for this checkout is `realmfikri`, so the target is:

```text
realmfikri.github.io
```

Use DNS only first. After GitHub Pages verifies the domain and provisions HTTPS, Cloudflare proxying can be evaluated separately if needed.

## Cloudflare API Credentials

Credentials were not stored in the repository and should not be committed.

The deployment can use Cloudflare from the terminal only if these environment variables are already available:

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ZONE_ID
```

Do not print their values.

During this local deployment setup, both variables were unavailable, so DNS could not be changed from the terminal.

If both variables are set in a future shell, create or update the DNS record with the Cloudflare API. If either variable is missing, create the DNS record manually in the Cloudflare dashboard.

## Commands Run

Inspection:

```bash
pwd
git remote -v
git branch --show-current
ls -la
cat package.json
cat vercel.json
find . -maxdepth 2 -type f | sort
rg -n "(/api/|fetch\\(|XMLHttpRequest|axios|vercel|import\\s|src=|href=|url\\()" -S .
```

Local build verification:

```bash
npm run build
find dist -maxdepth 2 -type f | sort | head -100
cat dist/CNAME
test -f dist/index.html
test -f dist/demo.html
test -f dist/.nojekyll
```

GitHub configuration and deployment:

```bash
gh auth status
gh repo view --json owner,name,url
gh api -X POST "/repos/${OWNER}/${REPO}/pages" -f build_type=workflow
gh api -X PUT "/repos/${OWNER}/${REPO}/pages" -f build_type=workflow
gh api -X PUT "/repos/${OWNER}/${REPO}/pages" -f cname='anvaya.muhamadfikri.com'
git status
git add package.json scripts/build-static.mjs .github/workflows/deploy.yml docs/deployment-anvaya.md README.md
git commit -m "Deploy Anvaya landing page to GitHub Pages"
git push origin main
gh workflow list
gh workflow run "Deploy to GitHub Pages"
gh run list --limit 5
gh run watch
```

Production verification:

```bash
curl -I https://anvaya.muhamadfikri.com
curl -L https://anvaya.muhamadfikri.com | head -40
curl -I https://anvaya.muhamadfikri.com/demo.html
curl -I https://anvaya.muhamadfikri.com/demo
curl -I https://anvaya.muhamadfikri.com/style.css
curl -I https://anvaya.muhamadfikri.com/main.js
```

## Verification Results

Record the final deployment results here:

```text
Local build: passed
Generated dist/CNAME: anvaya.muhamadfikri.com
Generated dist/.nojekyll: present
Generated dist/index.html: present
Generated dist/demo.html: present
Generated dist/demo/index.html redirect: present
Generated dist/api/: intentionally absent because api/demo.js is Vercel serverless code
Secret scan of dist/: no Cloudflare, Resend, webhook, bearer-token, or private-key patterns found
GitHub CLI auth/admin check: not completed because gh is not installed
First GitHub Actions run: failed at Configure Pages because Pages was not enabled
Follow-up GitHub Actions runs: failed at Configure Pages because the workflow token could not create the Pages site
GitHub Pages API check: 404 Not Found, meaning Pages is not enabled/created for this repository yet
GitHub Pages source configuration: manual repo-admin action required
GitHub Pages custom domain configuration: manual action required unless configured elsewhere
Cloudflare DNS configuration: manual action required because CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID were not set
Cloudflare DNS lookup for anvaya.muhamadfikri.com: no CNAME returned
Production curl checks: failed with "Could not resolve host: anvaya.muhamadfikri.com"
GitHub Actions deployment: failed before artifact upload because Pages is not enabled
Production URL: not live yet
```

## Troubleshooting

### 404 on the custom domain

Check:

```text
GitHub repo -> Settings -> Pages
```

Make sure the source is `GitHub Actions` and the latest workflow completed successfully.

### DNS not propagated

Check the DNS CNAME record:

```text
anvaya.muhamadfikri.com -> realmfikri.github.io
```

DNS changes can take time. Cloudflare should show the record as DNS only while GitHub verifies it.

### GitHub Pages is not enabled

Use:

```text
Settings -> Pages -> Source -> GitHub Actions
```

Then rerun the workflow.

### Custom domain is not set in GitHub Pages settings

Set:

```text
anvaya.muhamadfikri.com
```

in:

```text
Settings -> Pages -> Custom domain
```

Save and wait for GitHub's DNS and HTTPS checks.

### HTTPS certificate pending

After DNS is correct, GitHub may need time to issue the certificate. Keep Cloudflare DNS-only during the initial verification.

### CSS, JS, images, or fonts return 404

Run the local build and inspect `dist/`:

```bash
npm run build
find dist -maxdepth 2 -type f | sort
```

The build should include:

```text
dist/style.css
dist/main.js
dist/assets/
dist/fonts/
```

### `/demo` vs `/demo.html`

The original Vercel deployment used `cleanUrls`, so `/demo` may have worked there. GitHub Pages is static, so this build creates:

```text
dist/demo/index.html
```

as a redirect to:

```text
/demo.html
```

Both `/demo` and `/demo.html` should be tested after deployment.

### Demo form submission fails

`demo.html` posts to:

```text
/api/demo
```

GitHub Pages cannot run `api/demo.js`. If form submissions are required, deploy a backend separately and update the form endpoint, or use Vercel/Cloudflare Pages Functions instead of pure GitHub Pages.

### Cloudflare proxied vs DNS-only

For the initial setup, use:

```text
DNS only / grey cloud
```

This avoids certificate and verification confusion while GitHub Pages validates the domain.

## Redeploy Guide

1. Edit the source files.
2. Run:

   ```bash
   npm run build
   ```

3. Commit the changes.
4. Push to `main`.
5. GitHub Actions deploys automatically.

Manual deployment rerun:

```bash
gh workflow run "Deploy to GitHub Pages"
```

## Rollback Guide

Option 1: revert the latest deployment commit.

```bash
git revert <commit-sha>
git push origin main
```

Option 2: rerun an older successful GitHub Actions workflow from the Actions tab if GitHub still allows rerunning that artifact-producing workflow.

After rollback, verify:

```bash
curl -I https://anvaya.muhamadfikri.com
```
