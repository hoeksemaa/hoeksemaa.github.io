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
- **Collections:** `_projects/` - each markdown file becomes a project page at `/projects/:name`
- **Layouts:** `_layouts/default.html` - base template with nav (Home | Projects | Contact)
- **Styling:** `assets/css/style.css` - custom CSS overrides

## Content Structure

All content pages use YAML frontmatter. Project files in `_projects/` require `title` and `date` fields. Root pages (`index.md`, `projects.md`, `contact.md`) use `layout: default`.
