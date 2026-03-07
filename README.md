# domains-for-sale

Config-driven static site system for domain sale pages. One repo, one template, one Cloudflare Pages project per domain.

## How it works

Each domain gets a JSON file in `domains/`. The build script renders the shared HTML template for each domain and writes the output to `dist/<domain>/index.html`. Each Cloudflare Pages project points at its own subfolder in `dist/`.

## Quick start

```bash
# 1. Add your domain config
cp domains/example.com.json domains/your-domain.com.json
# edit the new file with real values

# 2. Build
npm run build

# 3. Preview locally (optional)
npx serve dist/your-domain.com
```

## Adding a domain

1. Create `domains/your-domain.com.json` — fill in all fields (see below)
2. Register the hostname in Cloudflare Turnstile → copy the site key into the JSON
3. Push to `main`
4. Create a new Cloudflare Pages project → set build output directory to `dist/your-domain.com`
5. Add the domain as a Custom Domain in that Pages project

## Domain config schema

```json
{
  "domain": "your-domain.com",
  "price": "$4,500",
  "tagline": "Short punchy description of the domain's value",
  "description": "Longer paragraph about use cases, history, or SEO value.",
  "web3forms_key": "YOUR_WEB3FORMS_KEY",
  "turnstile_site_key": "YOUR_TURNSTILE_SITE_KEY",
  "contact_email": "you@youremail.com",
  "redirect_url": "https://your-domain.com?success=true"
}
```

## Account setup checklist

### Web3Forms (form backend)
- [ ] Sign up at https://web3forms.com
- [ ] Confirm your email address
- [ ] Copy your Access Key into each domain JSON as `web3forms_key`

### Cloudflare Turnstile (CAPTCHA)
- [ ] Go to https://dash.cloudflare.com → Turnstile → Add Site
- [ ] Register each domain separately (one site key per hostname)
- [ ] Choose **Managed** challenge type
- [ ] Copy each Site Key into the corresponding domain JSON as `turnstile_site_key`

### Cloudflare Pages (hosting)
- [ ] Connect this repo in Cloudflare Pages → Create Project → Connect to Git
- [ ] Per domain: Build command `node build.js`, output directory `dist/<domain>`
- [ ] Per domain: Add the domain as a Custom Domain

## Per-domain go-live checklist

- [ ] `web3forms_key` set
- [ ] `turnstile_site_key` set (registered for correct hostname)
- [ ] `redirect_url` points to the correct domain
- [ ] Cloudflare Pages build output directory set to `dist/<domain>`
- [ ] Custom domain added in Cloudflare Pages
- [ ] Test form submission end-to-end

## Repository structure

```
/
├── template/
│   └── index.html       # Single shared template
├── domains/
│   └── *.json           # One file per domain
├── dist/                # Git-ignored; generated at build time
├── build.js
├── package.json
└── .gitignore
```
