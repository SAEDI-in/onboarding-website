# SAEDI website

The onboarding (waitlist) site for SAEDI ("IDEAS" spelled backwards). Built from
the "SAEDI website" design canvas: <https://claude.ai/artifact/6zFw2g953X7osdUCYpsmBh>.
The actual product website will live in its own repository later.

Plain static HTML, CSS and JavaScript. No build step, no framework. Deploy the
folder as-is to Netlify, Vercel, Cloudflare Pages, GitHub Pages or any static host.

## Pages

| File                 | Page            | Notes                                        |
| -------------------- | --------------- | -------------------------------------------- |
| `index.html`         | Home            | Hero with IDEAS → SAEDI flip, problem, animated turnaround, steps, audiences, waitlist |
| `how-it-works.html`  | How it works    | Seven-step journey, FAQ, call to action      |
| `for-students.html`  | For students    | Benefits, campus model, ambassador banner, waitlist |
| `about.html`         | About           | Mission, founder, stage, contact             |

Shared pieces:

- `css/styles.css` — every token, component and page style. Light theme only, as designed.
- `js/main.js` — mobile menu, hero replay, waitlist form.
- `assets/favicon.svg` — app-icon mark from the logo artboard.

## Run locally

Any static server works. From this folder:

```bash
python -m http.server 8080
```

Then open <http://localhost:8080>. Opening the HTML files directly from disk also
works, apart from the Google Fonts request on some browsers.

## Waitlist form

The form on Home and For students posts to the URL in `js/config.js`
(`waitlistEndpoint`). While it is empty, the form shows its success state and logs
the entry to the browser console, but sends nothing anywhere.

**Google Sheets (recommended for now):** follow
[integrations/google-sheets/README.md](integrations/google-sheets/README.md). It
takes about five minutes and needs no server: a small Apps Script attached to a
sheet appends a row per entry.

Any other endpoint that accepts a POST works too. The body is JSON sent with
`Content-Type: text/plain` (so the browser does not send a CORS preflight), and the
endpoint should reply with JSON `{"ok": true}`:

```json
{ "name": "", "email": "", "role": "ideas | build | both", "college": "", "skills": "", "page": "/index.html", "submittedAt": "ISO date", "userAgent": "" }
```

Spam: a hidden honeypot field (`website`) is in the form. If it is filled, the
site shows success without sending, and the Apps Script ignores it as well.

## Before launch: fill in the placeholders

Everything in square brackets is a placeholder carried over from the design.

- `[hello@yourdomain.com]` — contact email, in the header links, footer, FAQ, About and form error text (search for `yourdomain.com`).
- `[Founder name]`, `[Founder photo]`, founder bio and the LinkedIn link on `about.html`.
- The founder's "Connect on LinkedIn" button on `about.html` (`href="#"`). The footer LinkedIn icon already points to the company page, <https://www.linkedin.com/company/saedi-in/>. Instagram is left out until there is an account.
- FAQ answers on `how-it-works.html` that mention reward policy and pricing.
- `og:image` meta tags are not set yet. Add a 1200×630 image to `assets/` and reference it on each page.

## Design notes

- Fonts: Geist (body), Martian Mono (labels, hero wordmark), Fraunces (logo wordmark) from Google Fonts.
- Breakpoints: 768px (gutters and section padding), 860–960px (two-column grids), 920px (desktop nav).
- Header and footer are duplicated in each page because there is no templating. Change all four when editing them, or add a static site generator later.
- Animations respect `prefers-reduced-motion`.
