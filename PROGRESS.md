# Setup Progress

## Status: In Progress
Last updated: 2026-03-10

---

## What's Done

- [x] **Project built** — `template/index.html`, `build.js`, `package.json`, `.gitignore`
- [x] **GitHub repo created** — `github.com/bitwise-intel/domains-for-sale` (public)
- [x] **Pushed to main** — remote is `git@github.com:bitwise-intel/domains-for-sale.git` (SSH)
- [x] **1Password SSH agent configured** — `~/.ssh/config` already has the 1Password socket; `gh` CLI is authenticated as `bitwise-intel` via SSH
- [x] **Web3Forms account created** — access key is in `bitwise.team.json`
- [x] **Cloudflare Turnstile site created** for `bitwise.team` — site key is in `bitwise.team.json`

---

## What's Not Done Yet

### Immediate: Fix `bitwise.team.json` before pushing

The file has real keys but still has placeholder values that need updating:

```json
"domain": "example.com"        → change to: "bitwise.team"
"contact_email": "hello@youremail.com" → change to your real email
"redirect_url": "https://example.com?success=true" → change to: "https://bitwise.team?success=true"
```

Also: `domains/example.com.json` was deleted locally but not committed. Commit both changes together:

```bash
git add domains/bitwise.team.json domains/example.com.json
git commit -m "Add bitwise.team domain config"
git push
```

---

### Stuck: Cloudflare Pages setup

The user got stuck connecting the GitHub repo to a Cloudflare Pages project. Steps to complete:

1. Go to **dash.cloudflare.com** → **Workers & Pages** → **Create** → **Pages** tab → **Connect to Git**
2. Authorize Cloudflare to access the `bitwise-intel` GitHub account (OAuth popup)
3. Select the `bitwise-intel/domains-for-sale` repo
4. Configure the project:
   - **Project name:** `bitwise-team` (becomes `bitwise-team.pages.dev`)
   - **Production branch:** `main`
   - **Build command:** `node build.js`
   - **Build output directory:** `dist/bitwise.team`
5. Click **Save and Deploy** — wait for first build to succeed
6. Go to the project → **Custom domains** → **Set up a custom domain** → enter `bitwise.team`
   - If DNS is already on Cloudflare, it wires up automatically
   - If not, you'll need to add a CNAME at your DNS provider pointing `bitwise.team` → `bitwise-team.pages.dev`

**Common sticking point:** Step 2 (the GitHub OAuth) opens a popup to authorize Cloudflare. Make sure you're logged into GitHub as `bitwise-intel` in the browser when you do this, not as your personal account.

---

### Still Needed Per Domain (After Pages is Working)

- [ ] Test form end-to-end: fill out form on the live page, confirm email arrives
- [ ] Add more domains: create a new `.json` in `domains/`, new Pages project per domain

---

## Repo Structure

```
/
├── template/index.html          # Shared page template (dark design, JetBrains Mono + Syne)
├── domains/
│   └── bitwise.team.json        # ← needs domain/email fields fixed before push
├── build.js                     # Renders template × each JSON → dist/
├── package.json                 # { "type": "module", "scripts": { "build": "node build.js" } }
├── .gitignore                   # dist/ and node_modules/ excluded
└── README.md                    # Full setup instructions
```

## Tech Stack

| Concern | Solution |
|---|---|
| Hosting | Cloudflare Pages (free, one project per domain) |
| CAPTCHA | Cloudflare Turnstile (free, no limits) |
| Form backend | Web3Forms (free up to 250/month) |
| Build | `node build.js` — vanilla Node, no dependencies |
| Template | `{{token}}` placeholders replaced per domain config |
