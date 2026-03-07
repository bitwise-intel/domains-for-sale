# Domain Sale Page — Project Spec

## Overview

Build a config-driven static website system where each domain for sale gets its own dedicated page, generated from a single shared template. One GitHub repo manages all domains. Each domain is deployed as its own Cloudflare Pages project, pointed at its pre-built output subfolder.

---

## Tech Stack

| Concern        | Solution                  | Notes                                      |
|----------------|---------------------------|--------------------------------------------|
| Hosting        | Cloudflare Pages          | Free tier; one project per domain          |
| CAPTCHA        | Cloudflare Turnstile      | Free, no request limits, privacy-friendly  |
| Form backend   | Web3Forms                 | Free up to 250 submissions/month; forwards to email |
| Styling        | Tailwind CSS (CDN)        | Loaded in template; no build step for CSS  |
| JS             | Vanilla JS                | No framework needed                        |
| Build script   | Node.js                   | ~30 lines; renders template + JSON → HTML  |

---

## Repository Structure

```
/
├── template/
│   └── index.html          # Single source of truth for page design
├── domains/
│   ├── domain-one.com.json
│   ├── domain-two.com.json
│   └── domain-three.com.json
├── dist/                   # Git-ignored; generated at build time
│   ├── domain-one.com/
│   │   └── index.html
│   ├── domain-two.com/
│   │   └── index.html
│   └── domain-three.com/
│       └── index.html
├── build.js                # Build script
├── package.json
└── .gitignore              # Include: node_modules/, dist/
```

---

## Domain Config Schema

Each file in `domains/` is a JSON object describing one domain listing:

```json
{
  "domain": "example.com",
  "price": "$4,500",
  "tagline": "Short punchy description of the domain's value",
  "description": "Longer optional paragraph about use cases, history, or SEO value.",
  "web3forms_key": "YOUR_WEB3FORMS_KEY",
  "turnstile_site_key": "YOUR_TURNSTILE_SITE_KEY",
  "contact_email": "you@youremail.com",
  "redirect_url": "https://example.com?success=true"
}
```

Keys are intentionally per-domain so each can have its own Web3Forms key and Turnstile site (recommended — Cloudflare Turnstile lets you register each hostname separately).

---

## Template Tokens

The template uses `{{token}}` placeholders that the build script replaces at render time:

| Token                    | Source field             |
|--------------------------|--------------------------|
| `{{domain}}`             | `domain`                 |
| `{{price}}`              | `price`                  |
| `{{tagline}}`            | `tagline`                |
| `{{description}}`        | `description`            |
| `{{web3forms_key}}`      | `web3forms_key`          |
| `{{turnstile_site_key}}` | `turnstile_site_key`     |
| `{{contact_email}}`      | `contact_email`          |
| `{{redirect_url}}`       | `redirect_url`           |

---

## Build Script (`build.js`)

The script reads every JSON file in `domains/`, renders the template for each, and writes output to `dist/`.

```js
import fs from 'fs';
import path from 'path';

const templatePath = path.resolve('template/index.html');
const domainsDir = path.resolve('domains');
const distDir = path.resolve('dist');

const template = fs.readFileSync(templatePath, 'utf8');

fs.mkdirSync(distDir, { recursive: true });

for (const file of fs.readdirSync(domainsDir)) {
  if (!file.endsWith('.json')) continue;

  const config = JSON.parse(fs.readFileSync(path.join(domainsDir, file), 'utf8'));

  let html = template;
  for (const [key, value] of Object.entries(config)) {
    html = html.replaceAll(`{{${key}}}`, value);
  }

  const outDir = path.join(distDir, config.domain);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html);

  console.log(`Built: ${config.domain}`);
}
```

Add to `package.json`:
```json
{
  "type": "module",
  "scripts": {
    "build": "node build.js"
  }
}
```

Run locally with `npm run build`. The `dist/` folder is ephemeral — never commit it.

---

## Page Sections (Template)

### 1. Header
- Domain name (prominent — pulled from `{{domain}}`)
- Tagline (`{{tagline}}`)

### 2. Domain Detail
- Asking price (large, prominent — `{{price}}`)
- Description paragraph (`{{description}}`)
- CTA button anchoring to the contact form

### 3. Contact / Inquiry Form
Fields:
- Name (required)
- Email (required)
- Message / offer (required)
- Cloudflare Turnstile widget
- Submit button

### 4. Footer
- Contact email (`{{contact_email}}`), copyright

---

## Cloudflare Turnstile Integration

1. Go to [https://dash.cloudflare.com](https://dash.cloudflare.com) → Turnstile → Add Site
2. Register each domain separately (one site key per hostname)
3. Choose **Managed** challenge type
4. Copy the **Site Key** into the domain's JSON config as `turnstile_site_key`

> Web3Forms handles server-side token verification natively — no backend needed.

### Template snippet:
```html
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>

<div class="cf-turnstile" data-sitekey="{{turnstile_site_key}}"></div>
```

---

## Web3Forms Integration

1. Sign up at [https://web3forms.com](https://web3forms.com) — one access key is fine for all domains, or create separate keys per domain for cleaner email routing
2. The form POSTs to `https://api.web3forms.com/submit`

### Template form wiring:
```html
<form id="contact-form" action="https://api.web3forms.com/submit" method="POST">
  <input type="hidden" name="access_key" value="{{web3forms_key}}" />
  <input type="hidden" name="subject" value="Domain Inquiry: {{domain}}" />
  <input type="hidden" name="redirect" value="{{redirect_url}}" />

  <!-- visible fields -->

  <div class="cf-turnstile" data-sitekey="{{turnstile_site_key}}"></div>
  <button type="submit">Send Inquiry</button>
</form>
```

---

## Success / Error Handling

- On `?success=true` in URL: show a thank-you message (JS check on page load)
- On network error: show inline error message, preserve form data
- Disable submit button while submitting to prevent double-submission

---

## Design Direction

- Clean, professional, minimal — conveys legitimacy to buyers
- Domain name should be the hero element — large, prominent, memorable
- Price clearly displayed — no burying it
- Mobile responsive
- No dark patterns, no fake urgency timers

---

## Deployment — Cloudflare Pages (Per Domain)

Each domain-for-sale gets its own Cloudflare Pages project. Repeat these steps for each:

1. Push repo to GitHub (one repo, shared across all)
2. Cloudflare Pages → Create Project → Connect to Git → select repo
3. Configure the project:
   - **Build command:** `node build.js`
   - **Build output directory:** `dist/the-domain-name.com`
4. Cloudflare Pages → Custom Domains → add the domain being sold
   - Works automatically if DNS is already on Cloudflare

> Each Pages project builds the entire `dist/` folder but only serves files from its configured output directory — so each project sees only its own page.

---

## GitHub Workflow

- `main` branch is the only branch needed
- Pushing to `main` triggers a rebuild on all connected Cloudflare Pages projects automatically
- To add a new domain: add a JSON file to `domains/`, create a new Pages project in Cloudflare, push

---

## Secrets / Keys Checklist

Per domain, before going live:

- [ ] `web3forms_key` set in JSON config
- [ ] `turnstile_site_key` set in JSON config (registered for correct hostname)
- [ ] `redirect_url` set to the correct domain URL
- [ ] Web3Forms account email confirmed
- [ ] Cloudflare Pages project build output directory set to `dist/<domain>`
- [ ] Custom domain added in Cloudflare Pages
- [ ] Test form submission end-to-end

---

## Adding a New Domain (Ongoing)

1. Create `domains/new-domain.com.json` with all required fields
2. Register hostname in Cloudflare Turnstile → copy new site key into JSON
3. Push to `main`
4. Create a new Cloudflare Pages project → set build output to `dist/new-domain.com`
5. Add custom domain in that Pages project

---

## Out of Scope

- Server-side logic / backend
- Database or CRM integration
- Payment processing (price is listed; negotiation happens over email)
- Analytics (add Cloudflare Web Analytics per Pages project later if desired — also free)
