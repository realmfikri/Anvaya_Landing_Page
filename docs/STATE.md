# State — 16 August 2026

## Works
- `hire.html` — AIN Hire product page, **live at https://anvaya.co.id/hire**. Copy is written against the real v2 product (`../ain-hire/v2/docs/PRODUCT.md`, `GOLDEN_JOURNEY.md`, `PRIVACY_AND_AI_GOVERNANCE.md`): apply-first public job portal, CV–Role Match, structured interview with server-side STT, optional assessment, human shortlist/handoff/sign-off, internal mobility. Primary CTA opens `https://ain-hire.anvaya.co.id/`; secondary goes to `demo.html`.
- `index.html` — the AIN People card in the platform grid links to `hire.html` with an "Explore AIN Hire" affordance; footer link added too.
- `style.css` — `.prod` is `display:block` (one card is now an anchor) and gained `.p-more` styles.
- Deployed to Cloudflare Pages (`anvaya-landing-page`, branch `main`) and verified live.

## In flight
Nothing half-finished.

## Next steps
- Decide what happens to the **older Indonesian AIN Hire page at `https://anvaya.co.id/ain-hire`** (see "Don't be fooled by"). Today there are two AIN Hire marketing pages on the same apex domain, served by different systems, and only the new one is linked from the landing page.

## Don't be fooled by
- **`/ain-hire` on the apex domain is NOT this repo.** A Cloudflare Worker route `anvaya.co.id/ain-hire*` → script `ain-hire-proxy` intercepts the whole prefix and serves the Next.js page from the `ain-hire` repo ("AIN Hire by Anvaya — Rekrutmen berbasis bukti kerja"). That is why this page ships as `hire.html` → `/hire`: **any path starting with `ain-hire` on anvaya.co.id never reaches Pages.** The full route list on the zone is `/ain-hire*`, `/ain-hire-mvp*`, `/ain-hire-v2*`, `/ain-hire-demo*`, `/job-portal*`.
- The product is **not** WhatsApp-first. An earlier prototype (`../ain-hire/panduan_demo_ain_hiring.md`) had a WhatsApp career agent; v2 does not. Candidates apply from the public job page and check status with a six-digit email OTP.
- `hire.html` deliberately does **not** load `main.js`. That file assumes the tweaks-panel DOM from `index.html` and throws without it, so the page carries its own inline script for nav state, scroll reveals, and CTA routing. `demo.html` does the same.
- Any new top-level page must be added to the `entries` array in `scripts/build-static.mjs` or it silently won't ship.
- Section content is gated behind `.reveal` (`opacity:0` until IntersectionObserver adds `.in`). A headless or hidden-tab screenshot shows a black page; that's the observer not firing, not a broken layout.
