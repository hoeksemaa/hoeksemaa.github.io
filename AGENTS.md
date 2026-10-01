# AGENTS.md

This file gives guidance to AI coding agents that work with code in this repository.

## Project Overview

Personal portfolio website built with Jekyll, hosted on GitHub Pages at https://hoeksemaa.github.io.

## Development Commands

```bash
# Install dependencies
bundle install

# Run local development server (http://localhost:4000)
bundle exec jekyll serve

# Build site for production
bundle exec jekyll build
```

## Architecture

- **Static site generator:** Jekyll with kramdown markdown
- **Theme:** minima
- **Collections:** `_projects/` - each markdown file becomes a project page at `/projects/:name`; `_videos/` - each markdown file becomes a video page at `/videos/:name`, listed on `/videos`
- **Layouts:** `_layouts/default.html` - base template; the sidebar nav is rendered from `_data/navigation.yml`
- **Navigation:** `_data/navigation.yml` - the single list of sidebar links (label, url, icon), in display order. Edit a label here and every page picks it up.
- **Styling:** `assets/css/style.css` - custom CSS overrides
- **Favicon:** one brain icon for the whole site. `_layouts/default.html` links `assets/images/favicon.png` on every page. `favicon.ico` at the root covers files without the layout. Pages do not set their own icon.
- **Analytics:** a Cloudflare Worker sits in front of GitHub Pages and logs each page request. It also serves the list at `/analytics`, so no file in this repo makes that page. The site has no analytics script, and pages need no setup to be logged. Source: https://github.com/hoeksemaa/site-analytics

## Content Structure

All content pages use YAML frontmatter. Project files in `_projects/` require `title` and `date` fields. Video files in `_videos/` require `title` and `date` fields and embed a `<video>` whose file lives in `assets/video/` (mp4, H.264 + AAC, `faststart`, under GitHub's 100 MB file limit). Root pages (`index.md`, `projects.md`, `writings.md`, `videos.md`, `contact.md`) use `layout: default`.

## Custom domain

The site moved to https://johnhoeksema.com on 2026-09-29. John bought the domain with Cloudflare Registrar, so Cloudflare runs its DNS. `hoeksemaa.github.io`, `www`, and `http://` all redirect to `https://johnhoeksema.com`. John completed these steps:

1. In Cloudflare DNS, he added four `A` records for `@` (`185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`) and a `www` `CNAME` to `hoeksemaa.github.io`. All records are "DNS only" (grey cloud).
2. In the repo settings, he set Pages → Custom domain to `johnhoeksema.com`. GitHub committed the `CNAME` file.
3. GitHub issued the HTTPS certificate for both names, and he turned on "Enforce HTTPS".
4. For the analytics Worker, he set the four `@` records to "Proxied" (orange cloud), and he set SSL/TLS to "Full". The `www` record stays "DNS only". Do not set SSL/TLS to "Flexible": with GitHub's "Enforce HTTPS", it causes a redirect loop.
