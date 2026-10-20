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

## Deploy: GitHub Pages at saedi.in

The site is served by GitHub Pages from the `main` branch root. `CNAME` holds the
custom domain and `.nojekyll` skips Jekyll processing.

1. **Repository visibility.** The SAEDI-in organisation is on the free plan, which
   only serves Pages from public repositories. Make this repo public
   (Settings > General > Danger Zone > Change visibility) or upgrade the plan.
2. **Enable Pages.** Settings > Pages > Build and deployment > Source: *Deploy from a
   branch*, Branch: `main`, folder `/ (root)`. Or from a terminal:
   ```bash
   gh api -X POST repos/SAEDI-in/onboarding-website/pages -f 'source[branch]=main' -f 'source[path]=/'
   ```
3. **Custom domain.** Settings > Pages > Custom domain: `saedi.in`, Save. (The
   `CNAME` file sets this too; the setting just makes it explicit.)
4. **DNS at the registrar** (saedi.in is currently parked at Hostinger; hPanel >
   Domains > saedi.in > DNS / Name servers). Remove the parking `A` record and add:

   | Type  | Name | Value                    |
   | ----- | ---- | ------------------------ |
   | A     | @    | 185.199.108.153          |
   | A     | @    | 185.199.109.153          |
   | A     | @    | 185.199.110.153          |
   | A     | @    | 185.199.111.153          |
   | AAAA  | @    | 2606:50c0:8000::153      |
   | AAAA  | @    | 2606:50c0:8001::153      |
   | AAAA  | @    | 2606:50c0:8002::153      |
   | AAAA  | @    | 2606:50c0:8003::153      |
   | CNAME | www  | saedi-in.github.io       |

   DNS changes take from a few minutes to a day to spread.
5. **HTTPS.** Once Settings > Pages shows the DNS check passing, GitHub issues a
   certificate (usually within an hour). Then tick **Enforce HTTPS**.
6. Optional but recommended: verify the domain for the organisation
   (Organisation settings > Pages > Verified domains) so nobody else can claim it.

Every push to `main` redeploys the site within a minute or two.

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

- Contact email is `support@saedi.in` everywhere (footer, FAQ, About, form error text, ambassador mailto). Search for `support@saedi.in` to change it.
- `[Founder name]`, `[Founder photo]`, founder bio and the LinkedIn link on `about.html`.
- The founder's "Connect on LinkedIn" button on `about.html` (`href="#"`). The footer LinkedIn icon already points to the company page, <https://www.linkedin.com/company/saedi-in/>. Instagram is left out until there is an account.
- FAQ answers on `how-it-works.html` that mention reward policy and pricing.
- `og:image` meta tags are not set yet. Add a 1200×630 image to `assets/` and reference it on each page.

## Design notes

- Fonts: Geist (body), Martian Mono (labels, hero wordmark), Fraunces (logo wordmark) from Google Fonts.
- Breakpoints: 768px (gutters and section padding), 860–960px (two-column grids), 920px (desktop nav).
- Header and footer are duplicated in each page because there is no templating. Change all four when editing them, or add a static site generator later.
- Animations respect `prefers-reduced-motion`.
