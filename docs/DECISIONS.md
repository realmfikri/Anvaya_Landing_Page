# Decisions

Append-only, newest first. Record the *why*.

---

## 2026-08-15 — The AIN Hire page ships at `/hire`, not `/ain-hire`

**Decision:** the page is `hire.html`, served at `https://anvaya.co.id/hire`.

**Why:** a Cloudflare Worker route `anvaya.co.id/ain-hire*` → `ain-hire-proxy` already claims that entire prefix and serves an older Indonesian AIN Hire page from the `ain-hire` repo. Requests to `/ain-hire.html` returned 404 from that Worker and never reached Pages. `/hire` is unclaimed, so Pages serves it directly.

**Rejected:** deleting or narrowing the `/ain-hire*` route — that would take down the existing page as a side effect of publishing a new one, which is a product call, not a deployment detail.

**Reversibility:** high, but it needs a route change on the zone, not just a file rename. If the old page is retired, remove the `/ain-hire*` route, rename the file back, and add a `_redirects` entry from `/hire`.

---

## 2026-08-15 — AIN Hire gets its own static page, not a section on the landing page

**Decision:** AIN Hire lives on its own page reusing `style.css`, linked from the AIN People card in the platform grid.

**Why:** the landing page sells the platform at one altitude — one card per module. AIN Hire needs candidate-journey and recruiter-workspace detail that would unbalance that grid, and a separate URL is shareable with a prospect who only cares about hiring. Reusing `style.css` (rather than a new stylesheet or a framework) keeps the brand tokens in one place; page-specific layout sits in a `<style>` block in the page, matching what `demo.html` already does.

**Rejected:** expanding the AIN People card inline (buries the detail, breaks the grid rhythm); a separate app/subdomain (nothing here needs a build step or a backend).

**Reversibility:** high. The page is one self-contained file plus a link and a handful of CSS rules.
