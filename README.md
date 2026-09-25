# [YOUR NAME] — Computer Operator & IT Specialist Portfolio

A self-contained, dependency-free portfolio website (HTML5 + CSS3 + vanilla JavaScript) for a
Computer Operator / IT Technical Specialist. It runs by opening `index.html` — no build step, no
package manager, no server required.

---

## 1. Project overview

| Item          | Detail                                                                                                                 |
| ------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Purpose       | Professional portfolio: services, skills, sample projects, experience, certifications, contact                         |
| Stack         | HTML5, CSS3 (custom properties), vanilla JavaScript (ES5-compatible syntax, no build tools)                            |
| Dependencies  | None. Only external request is the Google Fonts stylesheet (optional — the site works without it)                      |
| Data storage  | `localStorage` for the theme only. No cookies, no analytics, no tracking                                               |
| Backend       | None required. Contact form is front-end validated and ready for Formspree / Netlify Forms / EmailJS / custom backend  |
| Accessibility | Semantic landmarks, skip link, visible focus states, ARIA where needed, reduced-motion support, no colour-only meaning |
| Security      | Defensive/educational security content only. No credentials, no API keys, no unauthorised tooling                      |
| Visual system | One accent colour (`--accent`) over a neutral base. Roughly 75% neutral / 20% secondary surfaces / 5% accent           |

### Folder structure

```text
portfolio-website/
├── index.html                  # All page content and sections
├── css/
│   └── style.css               # Design tokens, layout, components, responsive + a11y rules
├── js/
│   └── script.js               # Theme, nav, scroll, reveal, filter, form validation (no dependencies)
├── assets/
│   ├── favicon.svg             # Site icon
│   ├── profile.svg             # Portrait placeholder (replace with your photo)
│   ├── og-image.svg            # Social preview source (export a 1200×630 PNG as og-image.png)
│   └── [YOUR-CV].pdf           # CV placeholder — replace with your real PDF
└── README.md                   # This file
```

### Section map (IDs match the navigation)

| Nav label      | Section ID        | Notes                                                           |
| -------------- | ----------------- | --------------------------------------------------------------- |
| Home           | `#home`           | Hero, positioning, primary CTAs                                 |
| About          | `#about`          | Approach + editable statistic cards                             |
| Skills         | `#skills`         | Six grouped skill cards                                         |
| —              | `#skill-levels`   | Skill visualisation (linked from the hero CTA, not the top nav) |
| Services       | `#services`       | Nine service cards                                              |
| Projects       | `#projects`       | Eight sample projects with category filter                      |
| Experience     | `#experience`     | Five placeholder timeline entries                               |
| Certifications | `#certifications` | Six placeholder certification / education cards                 |
| —              | `#tools`          | Tools and technologies grid                                     |
| —              | `#why`            | "Why work with me"                                              |
| Contact        | `#contact`        | Details + validated form                                        |
| —              | footer            | Navigation, social links, back-to-top                           |

---

## 2. Local setup

### Simplest (file system)

Double-click `index.html`, or run:

```powershell
# PowerShell (Windows)
Start-Process "D:\coding\portfolio-website\index.html"
```

Everything works, except that `fetch()` to a remote form endpoint is blocked by the browser's
origin rules on `file://` URLs. For that one feature, use a local server.

### With a local server (recommended)

```powershell
# Python 3
cd D:\coding\portfolio-website
python -m http.server 5500
# then open http://localhost:5500

# Node.js alternative
npx serve .
```

VS Code users can simply use the **Live Server** extension and click _Go Live_.

### Verifying your edits

- Navigation, mobile menu, theme toggle, project filter, and form validation need no server — test
  them by opening the file directly.
- Check the browser console (F12) for errors after any change.

---

## 3. Deployment

### GitHub Pages

```powershell
cd D:\coding\portfolio-website
git init
git add .
git commit -m "Add IT portfolio website"
git branch -M main
git remote add origin https://github.com/[YOUR GITHUB USERNAME]/[YOUR REPO].git
git push -u origin main
```

Then: **GitHub → repository → Settings → Pages → Build and deployment → Source: Deploy from a
branch → Branch: `main` / `root` → Save.**

Your site appears at `https://[YOUR GITHUB USERNAME].github.io/[YOUR REPO]/` after a minute or two.

Notes for Pages:

- All asset paths in this project are relative (`css/style.css`, `assets/...`), so it works from a
  subpath with no changes.
- If you use a custom domain, add a `CNAME` file in the root containing the bare domain name.

### Netlify

**Drag and drop:** open <https://app.netlify.com/drop> and drag the `portfolio-website` folder onto
the page. Done — no configuration needed.

**Git-connected:** _Add new site → Import an existing project →_ choose the repository, then:

| Setting           | Value                                                              |
| ----------------- | ------------------------------------------------------------------ |
| Build command     | _(leave empty)_                                                    |
| Publish directory | `/` (or `portfolio-website` if the repo root contains that folder) |

**To enable the contact form via Netlify Forms**, edit the `<form>` tag in `index.html`:

```html
<form
  class="contact-form"
  id="contact-form"
  name="contact"
  method="post"
  data-netlify="true"
  novalidate
>
  <input type="hidden" name="form-name" value="contact" />
  <!-- ...existing fields... -->
</form>
```

Netlify's own form handling takes over on submit (submissions appear under _Forms_ in the Netlify
dashboard). The JavaScript validation still runs first, so the error messages keep working. Because
the form now has a real `action`, you may also set `data-endpoint="/"` if you prefer the JS `fetch()`
path — either approach works, just do not enable both.

### Vercel

**Dashboard:** _Add New… → Project →_ import the repository, then set:

| Setting          | Value                        |
| ---------------- | ---------------------------- |
| Framework Preset | **Other**                    |
| Build Command    | _(leave empty)_              |
| Output Directory | `.` (or `portfolio-website`) |

**CLI:**

```powershell
npm i -g vercel
cd D:\coding\portfolio-website
vercel        # preview deployment
vercel --prod # production deployment
```

Vercel serves static files without configuration. For forms, use Formspree or EmailJS
(Vercel has no built-in form handling).

---

## 4. Enabling real form delivery

The form validates input but **does not send email by itself** — the interface says so explicitly
rather than pretending a message was delivered. Choose one option:

### Option A — Formspree

1. Create a form at <https://formspree.io> and copy the endpoint (for example
   `https://formspree.io/f/abcdwxyz`).
2. In `index.html`, add `action` and `method` to the `<form>`:

```html
<form
  class="contact-form"
  id="contact-form"
  action="https://formspree.io/f/abcdwxyz"
  method="post"
  novalidate
></form>
```

Formspree's AJAX mode works with either this or the `data-endpoint` attribute below.

### Option B — `data-endpoint` (uses the built-in fetch handler)

In `index.html`, set the attribute on the form — no other change needed:

```html
<form
  class="contact-form"
  id="contact-form"
  method="post"
  data-endpoint="https://formspree.io/f/abcdwxyz"
  novalidate
></form>
```

The script POSTs a `FormData` payload, shows "Sending your message…", clears the fields on success,
and shows a clear error with your email address if the request fails.

### Option C — EmailJS

1. Add the EmailJS browser SDK before the closing `</body>` tag:

```html
<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
```

2. Initialise it and call `emailjs.sendForm(...)` inside a submit handler in `js/script.js`.
   Keep the public key in `emailjs.init({ publicKey: "..." })` — EmailJS public keys are
   origin-restricted client keys, not secrets. **Never** place an SMTP password or private API key
   in front-end code.

### Option D — Custom backend

Set `action` to your endpoint and `method="post"`, and remove `data-endpoint` so the browser posts
normally. Validate again on the server: never trust client-side validation alone.

---

## 5. Customization checklist

Work top to bottom; every placeholder is written as `[LIKE THIS]` so you can search for `[` in your
editor to find them all.

- [ ] **Name** — `[YOUR NAME]` (appears in `<title>`, header brand, hero, contact list, footer, and
      the copyright). Also update the initials in `.brand-mark` (`YN`).
- [ ] **Title** — `[YOUR TITLE]` in the hero role line.
- [ ] **Profile photo** — replace `assets/profile.svg` with your own square image (480×480 px or
      larger, compressed). If you use a `.jpg`/`.webp`, update the `src` and keep the `alt` text
      descriptive.
- [ ] **Email, phone, location, website, GitHub, LinkedIn** — `[YOUR EMAIL]`, `[YOUR PHONE]`,
      `[YOUR LOCATION]`, `[YOUR WEBSITE]`, `[YOUR GITHUB]`, `[YOUR LINKEDIN]`. They appear in the
      hero facts, contact list, footer, and inside `js/script.js` (the mailto fallback uses
      `[YOUR EMAIL]` twice).
- [ ] **Phone link** — set the real international number in `href="tel:+10000000000"` (two places:
      hero and contact).
- [ ] **CV** — add your PDF to `assets/` and update the download link in the hero.
- [ ] **SEO metadata** — `<title>`, meta description, canonical URL, `og:*` and `twitter:*` tags.
- [ ] **Social preview image** — export `assets/og-image.svg` as a 1200×630 PNG named
      `og-image.png`, or replace it with your own graphic.
- [ ] **Statistics** — four cards in `#about`: `[YEARS OF EXPERIENCE]`,
      `[DEVICES SUPPORTED]`, `[LAB PROJECTS]`, `[CERTIFICATIONS HELD]`. Use only numbers you can
      support.
- [ ] **Skill levels** — `data-level` on each `.level-meter` in `#skill-levels`
      (1 = Beginner … 5 = Professional Experience). Update the visible text label to match — the
      label is the accessible name, so never change one without the other.
- [ ] **Skill detail panels** — the expandable lists under each level row (`#level-hardware`,
      `#level-os`, …). Keep them honest and specific to what you have actually done.
- [ ] **Services detail panels** — the short second paragraph inside each service card
      (`#svc-troubleshooting`, `#svc-os`, …). Click the heading to check your wording renders well.
- [ ] **Projects** — replace all eight sample cards with your real work, or delete the ones you have
      not built. Keep `data-category` values aligned with the filter chips
      (`hardware`, `software`, `web`, `networking`, `cybersecurity`) or update the chips too.
- [ ] **Project detail blocks** — each card has a hidden `.project-data` block that feeds the modal.
      Update the `data-role` fields (`title`, `category`, `desc`, `problem`, `solution`, `result`) and
      the two `data-role` links. Both must stay in sync with the visible card text.
- [ ] **Project links** — `[PROJECT LINK]` and `[YOUR GITHUB]`, in the card *and* in its
      `.project-data` block. Remove the link rather than leaving a dead one.
- [ ] **Experience** — replace the five placeholders in `#experience` with real roles, or delete the
      entries that do not apply. Never invent employment history.
- [ ] **Certifications & education** — replace the six placeholders in `#certifications` with
      certifications you have actually completed. A short verifiable list beats a long uncertain one.
- [ ] **Tools** — remove any tool you do not genuinely use.
- [ ] **Privacy policy** — the footer links to `#privacy`, which is intentionally a placeholder.
      Add a real section, a separate page, or remove the link.
- [ ] **Form endpoint** — see section 4 above.
- [ ] **Colours and fonts** — edit the tokens at the top of `css/style.css`
      (`:root` for light, `html[data-theme="dark"]` for dark). Changing `--accent` restyles every
      button, badge, focus ring, progress bar and hover border at once. The related tokens are
      `--accent-strong` (gradient end), `--accent-soft` (tinted fills), `--accent-line` (hover
      borders) and `--accent-glow` (the hero glow).
- [ ] **Background texture strength** — `--grid-line`, `--dot-color` and `--glow-opacity`. Set
      `--glow-opacity: 0` to remove the hero glow entirely; the grid and dot textures can be deleted
      by removing `.hero::before` and `.section--dots::before`.
- [ ] **Hover lift distance** — `--lift` (default `-3px`). Set it to `0` if you want no movement on
      hover at all.
- [ ] **Content tone check** — re-read your text for claims you cannot support. Credible beats
      impressive: "practical troubleshooting and authorised security testing", not "I can hack
      anything".

---

## 6. How the JavaScript is organised

`js/script.js` is a single IIFE with clearly labelled modules. Nothing runs until the DOM is ready,
and every module exits quietly if its elements are missing — so you can delete a section from the
HTML without causing console errors.

| Module          | What it does                                                                                                          | Degrades to                                                                                                                                                   |
| --------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Theme           | Reads/writes `data-theme`, persists in `localStorage`, follows the OS preference until the visitor chooses explicitly | Light theme                                                                                                                                                   |
| Mobile nav      | Toggles `.is-open`, keeps `aria-expanded` in sync, closes on link click / Escape / outside click / resize             | Always-visible inline nav on desktop                                                                                                                          |
| Smooth scroll   | Anchor clicks scroll with a sticky-header offset and move focus to the target section                                 | Instant jump (native `#anchor`)                                                                                                                               |
| Scrollspy       | Sets `aria-current="true"` on the nav link of the visible section; adds the header shadow                             | Nothing (purely informative)                                                                                                                                  |
| Back to top     | Shows after 500 px, updates a decorative progress ring, and drives the thin top progress line                         | Hidden button                                                                                                                                                 |
| Scroll reveal   | Adds `.js-reveal` then reveals with `IntersectionObserver`; a 3 s safety timer reveals anything left hidden           | Content visible from the start (no JS = no hidden content)                                                                                                    |
| Skill meters    | Maps `data-level` to a `--level-fill` CSS variable and syncs `aria-label`                                             | Empty track, labels still readable                                                                                                                            |
| Disclosure      | One shared accordion implementation (`initDisclosure`) driving both the skills and services sections                  | Sections stay readable; only the extras are unreachable                                                                                                        |
| Project filter  | Animated show/hide, updates `aria-pressed` and a live-region status message                                           | All cards visible                                                                                                                                             |
| Project modal   | Copies `.project-data` into the dialog, traps focus, restores focus on close                                          | `View details` buttons do nothing harmful; card text stays complete                                                                                            |
| Form validation | Per-field rules on blur, live re-check while invalid, success ticks, focus to first error, honeypot                   | Native HTML5 `required` / `type="email"` (the form has `novalidate` only so _custom_ messages are used; remove `novalidate` to fall back to browser messages) |

### Interaction notes

- **Skills and services expand on click, not hover.** Hover-only disclosure is unusable on touch
  devices, so each level row and service heading is a real `<button>` with `aria-expanded` and
  `aria-controls`. Panels animate with `grid-template-rows: 0fr → 1fr`, so they grow to their
  natural height with no hard-coded `max-height` guesswork.
- **Skills use accordion behaviour** (opening one closes the others). **Services do not**, so you can
  compare several service details at once.
- **The project modal** moves focus to its close button, traps Tab inside the dialog, closes on
  Escape or a backdrop click, and returns focus to the button that opened it. Each card carries a
  hidden `.project-data` block, so the modal has no duplicated content to fall out of sync.
- **Decoration is transform-only.** The hero glow, card lift, progress line and reveal animations
  use `transform`/`opacity`, so scrolling never triggers layout or paint work.
- **Mobile strips decoration** below 700 px: the hero glow, dot texture and all hover-lift effects
  are removed, because none of them are reachable or worth the cost on a phone.

### Accessibility notes

- `prefers-reduced-motion: reduce` disables smooth scrolling, the hero glow drift, all hover
  lifts, the reveal animation, card entry animations, modal transitions, icon micro-motions and all
  transitions. Filtering still works — it just happens instantly with no fade stage.
- Every `.level-meter` has a text label beside it, so difficulty is never communicated by colour or
  bar length alone.
- Form errors use `aria-invalid`, `aria-describedby`, `role="alert"`, and explicit messages; valid
  fields additionally show a tick icon, so state never depends on colour alone.
- The skip link jumps to `#main`; all sections are `tabindex="-1"` focus targets so in-page
  navigation carries keyboard focus with it.
- Focus outlines are 3 px with a 2 px offset and reset nothing on `:focus-visible`.

---

## 7. Security and responsible-practice notes

This site intentionally contains **no** offensive tooling and no credentials.

- The cybersecurity content covers awareness, defensive configuration, log review, vulnerability
  identification, hardening, and authorised testing only.
- The page states plainly that **security testing is performed only with proper authorization**, in
  the Cybersecurity skills card, the contact panel, and the home-lab project.
- No passwords, API keys, tokens, or private credentials exist anywhere in the source.
- `rel="noopener noreferrer"` is set on external links.
- The contact form contains a simple honeypot field. It is a spam nuisance-reduction measure, not a
  security control — add server-side validation and rate limiting when you connect a backend.
- If you later add a package manager, keep the dependency count low; every third-party script is an
  attack surface on a static site.

---

## 8. Final verification checklist

Run through this after customising, before publishing.

**Functionality**

- [ ] Open `index.html`; the page renders with no console errors (F12 → Console).
- [ ] All eight nav links scroll to the correct section, and the sticky header does not cover the
      heading of the target section.
- [ ] The nav link for the visible section is highlighted while scrolling.
- [ ] Below 1024 px, the hamburger appears; it opens and closes the menu, and the icon animates to
      an X.
- [ ] The menu closes after tapping a link, pressing Escape, or clicking outside the panel.
- [ ] Theme toggle switches light/dark, the icon and label change, and the choice survives a reload
      (check `localStorage` key `portfolio-theme`).
- [ ] With no saved choice, a system dark-mode preference is respected on first load.
- [ ] Back-to-top appears after scrolling and returns to the top; the progress ring tracks scroll.
- [ ] Project filter chips show the right counts, update the live status text, and "All" restores
      every card.
- [ ] Submitting an empty form shows four inline errors and moves focus to the first invalid field.
- [ ] An invalid email (`name@`, `name.example.com`) is rejected; a valid one passes.
- [ ] A message under 20 characters is rejected with the current character count shown.
- [ ] A correct submission reports honestly that nothing was sent (until an endpoint is configured)
      and offers the mailto link.
- [ ] The footer year matches the current year.

**Content integrity**

- [ ] No `[PLACEHOLDER]` text remains (search for `[`).
- [ ] No invented employment, certification, award, or client claims.
- [ ] Every project link points somewhere real, or the link was removed.
- [ ] Statistics contain only numbers you can substantiate.
- [ ] Security wording still includes the authorisation statement.

**Responsiveness**

- [ ] Test at 320 px, 375 px, 768 px, 1024 px, 1440 px, and 1920 px — no horizontal scrolling, no
      text overflow, no overlapping elements.
- [ ] `tel:` and `mailto:` links work on a real phone.
- [ ] Tap targets (menu button, theme toggle, chips, buttons, skill rows, service headings) are
      comfortable to hit.
- [ ] Text remains readable in both themes at the smallest and largest sizes you tested.
- [ ] On a real phone, the hero glow and dot texture are absent and hover effects do not fire —
      decoration is desktop-only below 700 px.

**Accessibility**

- [ ] Tab from the top: skip link appears first, then brand, nav, theme toggle, menu button.
- [ ] Every interactive element shows a visible focus outline.
- [ ] Activate all controls with the keyboard only (Enter/Space).
- [ ] Screen reader announces the skill levels, form errors, and section landmarks sensibly.
- [ ] With OS "reduce motion" enabled, no reveal animation or smooth scrolling occurs.

**Interactive components (added in the visual-polish pass)**

- [ ] The thin progress line at the top of the page fills as you scroll and is visible in both themes.
- [ ] Clicking a skill level opens its panel, closes the previously open one, and rotates the chevron.
- [ ] Clicking a service heading reveals the extra paragraph; opening a second service does not close
      the first.
- [ ] `View details` on a project opens the modal with the *correct* project's title, category,
      problem, solution, result, and technologies.
- [ ] The modal closes on Escape, on the close button, and on a backdrop click — and focus returns to
      the button that opened it.
- [ ] Tab is trapped inside the open modal (Tab from the last control wraps to the first).
- [ ] The page behind an open modal cannot scroll.
- [ ] Filtering fades cards out and in smoothly, and clicking filter chips rapidly never leaves a card
      stuck invisible (the specific bug that was fixed during development).
- [ ] Card hover lifts by ~3px with an accent border and a visible top accent line; nothing rotates
      or scales dramatically.
- [ ] Valid form fields show a tick; invalid fields show red text and a message, not just colour.

**Performance and deployment**

- [ ] Fonts load; if they fail, the page still looks correct with system fallbacks.
- [ ] Replace `assets/profile.svg` with a compressed image (aim under ~200 KB).
- [ ] After deploying, confirm the live URL, favicon, and `og:image` resolve (check with a link
      preview tool).
- [ ] Verify the site over HTTPS and confirm no mixed-content warnings in the console.

---

## 9. License and attribution

The code in this project is yours to use and modify for your own portfolio. Replace all placeholder
content — names, contact details, projects, experience, and certifications — with your own
information before publishing.

Fonts: **Inter** and **JetBrains Mono**, served by Google Fonts under the SIL Open Font License. If
you would rather not depend on a third-party font request, download the font files into
`assets/fonts/`, self-host them with `@font-face`, and delete the two Google Fonts `<link>` tags.
