# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

## Content Structure

All content pages use YAML frontmatter. Project files in `_projects/` require `title` and `date` fields. Video files in `_videos/` require `title` and `date` fields and embed a `<video>` whose file lives in `assets/video/` (mp4, H.264 + AAC, `faststart`, under GitHub's 100 MB file limit). Root pages (`index.md`, `projects.md`, `writings.md`, `videos.md`, `contact.md`) use `layout: default`.
