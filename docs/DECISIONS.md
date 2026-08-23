# Decisions

Append-only, newest first. Record the *why*, not the *what*.

## 2026-08-23 — Self-host the film instead of embedding YouTube
The AIN Hire page carries a 1:41 product film. We ship it as `assets/ain-hire-promo.mp4` served from our own origin, not as a YouTube embed.

**Why:** the page makes a governance argument (consent records, deletion, "humans decide"). Handing every visitor to a third-party tracker on the same page undercuts it. Self-hosting means the page makes **zero** third-party requests. `preload="none"` behind a poster facade keeps the 22 MB off the initial load, so the cost is paid only by visitors who actually press play.

**Rejected:** a click-to-play YouTube facade (still hands off to Google on click, and chapter deep-links depend on their player); a video CDN (another vendor and bill for one file).

**Reversible:** yes, cheaply — swap the `<video>` for an iframe. Note that 22 MB sits under Cloudflare Pages' 25 MB per-file limit but leaves little headroom; a longer or higher-bitrate cut will need a different home.

## 2026-08-23 — Abandon the YouTube-embed variant on `agent/add-ain-hire-page`
An earlier build of this page (branch `agent/add-ain-hire-page`, commits `0511459` and `71f7b3e`) used a YouTube embed and a different section order. `redesign/hire-page` was rebuilt from `main` rather than layered on top of it, and that rebuild is what shipped.

**Why:** the two diverged too far to reconcile line by line, and the rebuild is the version we want. The branch is kept, unmerged, so the work is recoverable rather than deleted.

**Reversible:** the branch still exists; nothing was force-pushed.

## 2026-08-23 — Make the AIN People card a link, not a card with a link inside
`index.html`'s platform grid card for AIN People became an `<a>` wrapping the whole card, which required `.prod{display:block}` in `style.css`.

**Why:** the whole card is the target users aim at. A small link inside a large clickable-looking card is the worse affordance. `display:block` is needed because an anchor is inline by default and the grid item collapsed without it — don't remove it.

**Reversible:** yes, trivially.

## 2026-08-15 — Ship the page at `/hire`, not `/ain-hire`
See `docs/STATE.md` → "Don't be fooled by". A Cloudflare Worker route `anvaya.co.id/ain-hire*` → script `ain-hire-proxy` already claims that whole prefix for a different repo's Next.js app.

**Why:** the route match is prefix-wide, so `/ain-hire-anything` never reaches Pages. `/hire` is the shortest path that is actually free.

**Reversible:** only by changing the zone's Worker routes, which would break the other app. Treat as fixed.
