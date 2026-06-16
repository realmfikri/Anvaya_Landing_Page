# Anvaya Landing Page

Static landing page for PT Anvaya Inteligensia Nusantara.

## Deployment

This repository is configured to build a static `dist/` directory and deploy it with Cloudflare Pages at:

https://anvaya.co.id

Build command:

```bash
npm run build
```

Deploy command:

```bash
npx wrangler pages deploy dist --project-name anvaya-landing-page --branch main
```

For the full setup, DNS details, verification steps, rollback steps, and demo form backend notes, see [docs/deployment-cloudflare-anvaya-co-id.md](docs/deployment-cloudflare-anvaya-co-id.md).
