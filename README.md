# International Tea Room (ITR) — website

Website for the International Tea Room virtual seminar series on gastruloids and
stem cell-based embryo models. Built with [Hugo](https://gohugo.io/), deployed to
GitHub Pages via GitHub Actions (same setup as cbudjan.com).

## Quick start

```bash
brew install hugo          # once
hugo server -D             # live preview at http://localhost:1313/itr-site/
```

Push to `main` → GitHub Actions builds and deploys. A weekly scheduled build keeps
the upcoming/past split of the schedule current.

**One-time GitHub setup:** repo *Settings → Pages → Source: GitHub Actions*.

## Choosing a design

Edit `params.design` in `hugo.toml`:

| value | look | when to pick it |
|---|---|---|
| `tearoom` | warm paper tones, serif headings, terracotta accent | emphasises the informal "tea room" origin and community feel |
| `atlas` | white/cool grey, geometric sans, teal accent, card grid | neutral, institutional; closest to vgzt.org |
| `microscope` | dark hero with fluorescence image, cyan/magenta accents | visual and shareable; needs a good hero image |

Everything else (layouts, content, timezone widget, forms) is shared, so switching is free.

## Where things live

```
hugo.toml                     site config, nav, design choice, form endpoints
content/
  _index.md                   home page text
  about.md                    about / format / history
  contact.md                  contact page (form + email)
  subscribe.md                join / subscribe form (screened sign-up)
  schedule/_index.md          intro text for schedule page (talks are listed automatically)
  people/_index.md            people landing (speakers + organizers rendered from data/talks)
  talks/YYYY-MM-DD-slug.md    ONE FILE PER TALK — this drives schedule, speakers, .ics files
data/
  organizers.yaml             current + past organizers
  seasons.yaml                season labels and date ranges
themes/itr/                   layouts + CSS (assets/css/base.css + variants/*.css)
static/img/                   images (add speaker photos under img/speakers/, organizers under img/organizers/)
```

## Adding a talk

```bash
hugo new talks/2026-11-09-lastname.md
```

Fill in the front matter (date is UK local time, `timeZone = "Europe/London"` in
config handles GMT/BST). The talk then appears automatically on the schedule, the
speakers page, and gets its own `/talks/<slug>/calendar.ics` file.

## Hero / banner images

The Microscope design uses a full-bleed microscopy image behind the home hero and
behind the title banner of every sub-page. Put images in `static/img/heroes/` and:

- set the site default in `hugo.toml` → `params.hero_image` (+ `hero_credit`)
- override per page with `hero_image:` / `hero_credit:` in that page's front matter
  (`about.md`, `contact.md`, `subscribe.md`, `schedule/_index.md`, `people/_index.md`)

Images are shown at ~50 % opacity under a dark left-to-right gradient, so bright,
high-contrast fluorescence images on black backgrounds work best. Aim for ≥1800 px
wide, JPEG, under ~400 KB.

## Forms (Google Forms)

GitHub Pages is static, so both forms are **Google Forms embedded in an iframe**,
owned by the shared organizers' Gmail account (so every submission lands in one inbox).

1. Create the two forms from that Gmail account. Suggested questions (mirroring the
   preview forms shown on the site until the URLs are set):

   **Join / subscribe:** full name · email (institutional preferred) · lab & institution ·
   position (PhD / postdoc / staff scientist / PI / student / industry / other) ·
   lab website or profile URL (optional) · models you work with (checkboxes: mouse
   gastruloids, human gastruloids, other-species gastruloids, TLS/somitoids/neuruloids,
   blastoids/embryoids/ETX, 2D micropatterns, organoids/assembloids, computational,
   other) · 1–2 sentences on research interest · what you'd like (checkboxes: email
   announcements, Slack invite, recordings) · get involved (checkboxes: present my work,
   suggest a speaker) · anything else / speaker suggestions ·
   how did you hear about us · consent checkbox (required).

   **Contact:** name · email · topic (general / speaker suggestion or I'd like to present /
   membership / Slack access / Zoom or website issue / other) · message.

2. In Google Forms: *Send → `<>` (Embed HTML)* and copy the `src` URL
   (ends in `?embedded=true`).
3. Paste it into `params.forms.subscribe_google_form_url` / `contact_google_form_url`
   in `hugo.toml`. Adjust `*_form_height` so the embed doesn't get an inner scrollbar.
4. Optional: in the form's *Responses* tab, link a Google Sheet — that sheet becomes the
   membership list.

Tip: turn **off** "Restrict to users in your organisation" and "Limit to 1 response"
so people without a Google account can submit.

## Moving the repo to a shared GitHub account (later)

GitHub → repo *Settings → General → Transfer ownership*. The transfer keeps history,
issues and collaborators, and old URLs redirect. Afterwards:

1. Re-enable Pages on the new owner (*Settings → Pages → Source: GitHub Actions*)
   and re-run the deploy workflow.
2. Update `baseURL` in `hugo.toml` to `https://<new-owner>.github.io/itr-site/`
   (unnecessary once a custom domain is in place — the domain hides the owner).
3. Update `params.social.github` and the `git remote` on your clone.

Alternative in the meantime: add the other organizers as collaborators on your repo.

## Custom domain (later)

1. Buy the domain, point `A`/`ALIAS` records at GitHub Pages (or a `CNAME` to `cbudjan.github.io`).
2. Add `static/CNAME` containing the bare domain.
3. Change `baseURL` in `hugo.toml`.
