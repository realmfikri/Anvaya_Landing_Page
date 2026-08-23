# State — 23 August 2026

## Works
- `hire.html` → **/hire**, the AIN Hire product page. Structure, top to bottom: hero ("Four assistants. One hire you can explain") → **film** → four assistants → **worked example (97 → 69)** → both sides of the hire → governance → fit → CTA. Sections carry ids `top`, `film`, `assistants`, `example`, `how`, `governance`, `fit`; nav and footer link them.
- **Film is self-hosted** — `assets/ain-hire-promo.mp4` (1:41, 1920×1080, 22 MB) with `preload="none"` behind a poster facade (`assets/ain-hire-film-poster.jpg`, 1600×900). Nothing loads until the visitor clicks, and **no third-party requests at all** — the earlier YouTube embed is gone. Chapter pills seek into the video (`data-t` seconds): 0:56 is the 97 → 69 moment.
- `index.html` — the AIN People card in the platform grid is now an `<a>` to `hire.html` with an "Explore AIN Hire" affordance; footer links it too. `style.css` gained `.prod{display:block}` and the `.p-more` rules to make the card a link without breaking the grid.
- `scripts/build-static.mjs` lists `hire.html` in `entries`.
- Deployed to Cloudflare Pages (project `anvaya-landing-page`, branch `main`) via `npm run deploy:cloudflare`.
- `.claude/launch.json` — `landing-static` serves `dist/` on :4173 for local preview. Run `npm run build` first; it serves the build output, not the source tree.

## In flight
Nothing half-finished.

## Next steps
- Consider an Indonesian version of the page; the film is English-only and the product UI is Indonesian.
- Decide what happens to the older Indonesian AIN Hire page at `https://anvaya.co.id/ain-hire` (a different system — see below).
- Replace the reconstructed half of the worked example with real rows if the showcase data becomes reachable. The page already discloses that it is illustrative.

## Don't be fooled by
- **The 97 → 69 example is part real, part reconstruction, and the page says so in the `.disc` note at `hire.html:464` — don't quietly delete that note.** Real: Lukman's CV score of 97, his rank, the quoted evidence line, the "not recommended to advance" outcome. Reconstructed: the interview competency split and the anchored levels behind the 55, plus the 33%/67% stage weights — chosen so the arithmetic checks end to end.
- **Do not claim time saved, cost saved, accuracy, bias reduction, or market primacy anywhere on this page.** None of it is measured in AIN Hire. Lukman is also **not** rank 1.
- **`/ain-hire` on the apex domain is NOT this repo.** A Cloudflare Worker route `anvaya.co.id/ain-hire*` → script `ain-hire-proxy` claims the whole prefix and serves the Next.js page from the `ain-hire` repo. That is why this page ships as `hire.html` → `/hire`. Other routes on the zone: `/ain-hire-mvp*`, `/ain-hire-v2*`, `/ain-hire-demo*`, `/job-portal*`.
- The product is **not** WhatsApp-first. Candidates apply from the public job page and check status with a six-digit email OTP.
- `hire.html` deliberately does **not** load `main.js` (it assumes `index.html`'s tweaks-panel DOM and throws without it). The page carries its own inline script: nav state, scroll reveals, CTA routing, and the film facade.
- Any new top-level page or asset **directory** must be in the `entries` array in `scripts/build-static.mjs` or it silently won't ship. (New files inside `assets/` are fine — the whole directory is copied.)
- Section content is gated behind `.reveal` (`opacity:0` until IntersectionObserver adds `.in`). A headless or hidden-tab screenshot shows a black page. Force it: `document.querySelectorAll('.reveal').forEach(e=>e.classList.add('in'))`.
- `.ev li` (assistant bullets) is **not** flex — bullets are absolutely positioned. It was flex once, and every `<b>` inside became its own flex item, shredding the line into columns. Don't "restore" flex there.
- Branch `agent/add-ain-hire-page` holds an **abandoned** earlier variant of this page built on a YouTube embed. It was kept so the work isn't lost; do not merge it.
