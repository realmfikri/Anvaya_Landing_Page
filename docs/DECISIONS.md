# Decisions

Append-only, newest first. Record the *why*.

---

## 2026-08-16 — `/hire` leads with the film and a worked example, and discloses what is reconstructed

**Decision:** the AIN Hire page now sells in the film's language — the four assistants (JD · Screening & Interview · Report · Talent) — with the `AinHireAssistants` cut embedded near the top and a worked example that walks Lukman Sinaga from CV 97 to combined 69. The reconstructed middle of that chain is disclosed on the page in a visible note.

**Why:** the previous page was accurate but read as a specification — a feature inventory at one flat altitude, with nothing a prospect could point at. The film already solved the "what does this actually do" problem for a recruiter in 86 seconds, and its script (`../ain-hire-video/script-assistants.json`) carries a set of concrete, sourced numbers (481 applicants, funnel 481/481/38/9, coverage 455/26/0, cross-role 55/50). Reusing that framing keeps the page, the film, and the product telling one story instead of three. The disclosure stays because the page's whole claim is "every number opens to its source" — a marketing page that hides its own illustrative figures argues against the product.

**Rejected:** an autoplaying background video (the argument is carried by narration and on-screen numbers, both of which need sound and attention); a plain YouTube `<iframe>` on load (~hundreds of KB and third-party cookies for a page most visitors will read, not watch — the facade loads nothing until clicked); dropping the reconstruction note to keep the section clean; inventing the interview competency names as if sourced (they are plausible labels on a disclosed reconstruction, and the note says so).

**Reversibility:** high. The film, assistants, and example sections are three self-contained blocks in `hire.html`; the earlier feature sections were kept below them and still stand alone.

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
