# State — 16 August 2026

## Works
- `hire.html` — AIN Hire product page, **live at https://anvaya.co.id/hire**. Rebuilt this session to sell rather than only describe. Structure, top to bottom: hero ("Four assistants. One hire you can explain") → **film section** → benefit stat strip → why (today vs with AIN Hire) → **four assistants** → **worked example (97 → 69)** → candidate journey → recruiter workspace → governance → fit → CTA. Nav and footer link the three new sections (`#film`, `#assistants`, `#example`).
- **Film embed** — `https://youtu.be/IipuaAGAXVI` (`ain-hire-assistants.mp4`, 1:26, the `AinHireAssistants` cut from `../ain-hire-video`). Click-to-play facade: local poster + red play button, and **nothing is requested from YouTube until the visitor clicks** (verified: 0 third-party requests on load). Chapter pills jump into the film with `?start=` — 0:14 JD, 0:31 Screening & Interview, 0:56 the 97 → 69 moment, 1:00 Report, 1:12 Talent. Beat times come from `../ain-hire-video/script-assistants.json` (`beats[].at`).
- `assets/ain-hire-film-poster.jpg` — poster frame, `sips`-converted from `../ain-hire-video/frames-assistants/a57.png` (the 97 → 69 title card, which still carries the film's own "Demonstration data" badge).
- Copy for the four assistants and the worked example is sourced from `../ain-hire-video/script-assistants.json` — same numbers, same honesty boundaries (see "Don't be fooled by").
- `index.html` — the AIN People card in the platform grid links to `hire.html`; footer link too.
- `.claude/launch.json` — `landing-static` (`python3 -m http.server 4173`) for local preview. Note the browser preview tool reads `../.claude/launch.json` (repo parent, `Anvaya/`), which also has an entry serving this folder.
- Deployed previously to Cloudflare Pages (`anvaya-landing-page`, branch `main`). **This session's changes are built (`npm run build`) but not committed and not deployed.**

## In flight
Nothing half-finished. Uncommitted: `hire.html`, `assets/ain-hire-film-poster.jpg`, `.claude/launch.json`, these docs.

## Next steps
- Commit and `npm run deploy:cloudflare`, then eyeball `/hire` on the live domain (the film facade and the chapter deep-links are the only interactive parts).
- **Replace the reconstructed middle of the worked example with real rows** when Cloud SQL is reachable — see below. The page discloses that it is illustrative, but the real breakdown would be strictly better.
- Consider an Indonesian version of the page; the film is English-only and the product UI is Indonesian.
- Still open from before: decide what happens to the older Indonesian AIN Hire page at `https://anvaya.co.id/ain-hire` (different system, see below).

## Don't be fooled by
- **The 97 → 69 example is part real, part reconstruction, and the page says so in a `.disc` note — don't quietly delete that note.** Real rows in the showcase tenant: Lukman Sinaga's CV 97, Ayu Kusuma rank 1 at 98, Sari Wibowo 91, the quoted evidence line, "Not recommended to advance", the funnel 481/481/38/9, evidence coverage 455/26/0, and the 55/50 cross-role matches. Reconstructed: the interview competency split and anchored levels behind the 55, and the 33%/67% stage weights — chosen so the arithmetic checks end to end (`../ain-hire-video/script-assistants.json` → `claims_check`, key "RECONSTRUCTION").
- **Do not claim time saved, cost saved, accuracy, bias reduction, or market primacy anywhere on this page.** None of it is measured in AIN Hire, and the film deliberately drops all of it (same `claims_check`, key "NOT CLAIMED, ANYWHERE"). Lukman is also **not** rank 1 — Ayu is.
- **`/ain-hire` on the apex domain is NOT this repo.** A Cloudflare Worker route `anvaya.co.id/ain-hire*` → script `ain-hire-proxy` claims the whole prefix and serves the Next.js page from the `ain-hire` repo. That is why this page ships as `hire.html` → `/hire`. Route list on the zone: `/ain-hire*`, `/ain-hire-mvp*`, `/ain-hire-v2*`, `/ain-hire-demo*`, `/job-portal*`.
- The product is **not** WhatsApp-first. Candidates apply from the public job page and check status with a six-digit email OTP.
- `hire.html` deliberately does **not** load `main.js` (it assumes `index.html`'s tweaks-panel DOM and throws without it). The page carries its own inline script: nav state, scroll reveals, CTA routing, and the film facade.
- Any new top-level page or asset **directory** must be in the `entries` array in `scripts/build-static.mjs` or it silently won't ship. (New files inside `assets/` are fine — the whole directory is copied.)
- Section content is gated behind `.reveal` (`opacity:0` until IntersectionObserver adds `.in`). A headless or hidden-tab screenshot shows a black page. To screenshot locally, force it: `document.querySelectorAll('.reveal').forEach(e=>e.classList.add('in'))`.
- `.ev li` (assistant bullets) is **not** flex — bullets are absolutely positioned. It was flex once, and every `<b>` inside became its own flex item, shredding the line into columns. Don't "restore" flex there.
