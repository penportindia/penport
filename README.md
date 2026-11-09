# Penport India

Company website and software catalogue for Penport India, with a personalized demo enquiry flow.

[Website](https://penportindia.github.io/penport/) · [Software solutions](https://penportindia.github.io/penport/catalogue.html) · [Book a demo](https://penportindia.github.io/penport/book-demo.html)

## Run locally

Requires Python 3. Run from the repository root:

```sh
python -m http.server 8000
```

Open http://localhost:8000/ to preview the original static pages. The blog requires
the Jekyll preview described below. Fonts, icons, animations and embedded videos
use external providers.

## Structure

| Location                      | Responsibility                                               |
| ----------------------------- | ------------------------------------------------------------ |
| Root HTML files               | Public pages, metadata and structured data                   |
| assets/css/style.css          | Shared tokens, base layout and original visual system        |
| assets/css/components.css     | Reusable cards, page layouts and responsive enhancements     |
| assets/js/main.js             | Shared animations, video modal and confirmation display      |
| assets/js/accessibility.js    | Dialog focus handling and accessible form errors             |
| assets/js/catalogue.js        | Catalogue data, filtering and project details                |
| assets/js/book-demo.js        | Demo prefill, client validation and submission               |
| scripts/validate.py           | Static HTML, local links, structured data and sitemap checks |
| .github/workflows/quality.yml | Automated quality checks on pushes and pull requests         |
| docs/architecture.md          | Data flow, integrations and maintenance guidance             |

## Validate changes

Requires Python 3 and Node.js:

```sh
python scripts/validate.py
```

The validator checks JavaScript syntax without executing submissions. It does not send demo requests. Before merging UI changes, also review desktop and mobile layouts and keyboard navigation in a browser.

Optional consistent formatting:

```sh
npx prettier@3.6.2 --write "*.html" "assets/**/*.css" "assets/**/*.js" "*.md" "docs/*.md" ".prettierrc.json" ".github/**/*.yml"
```

## Demo enquiries

The form posts to the Google Apps Script web app configured in assets/js/book-demo.js. That backend is maintained outside this repository. Backend validation, storage permissions and notification recipients must be managed there. The public website contact email is penportindia@gmail.com.

## SEO and publication

The sitemap includes Home, Catalogue and Book Demo. Confirmation pages use noindex. Keep canonical URLs, JSON-LD and the sitemap aligned if the production domain changes. Preserve the Google verification HTML file.

Changes in a review branch do not affect production until merged and published by the configured GitHub Pages setup. Check the Pages deployment after merging. For an already submitted sitemap at the same URL, monitor its read status in Search Console. After significant published updates, a URL Inspection indexing request is optional.

See [architecture and maintenance](docs/architecture.md) for details.

See [company profile and SEO publication](docs/company-seo.md) for the confirmed
Patna/Bihar company details, search metadata and post-publication checks.

## Blog publishing

The blog uses GitHub Pages-compatible Jekyll and Markdown. Existing HTML pages
remain static. Shared blog layouts live in `_layouts`, reusable cards and product
promotions in `_includes`, articles in `_posts`, and scoped styles and progressive
enhancement in `assets/css/blog.css` and `assets/js/blog.js`.

Create `_posts/YYYY-MM-DD-your-article-slug.md` with this front matter followed by
Markdown content:

```yaml
---
title: "Your article title"
description: "A unique, useful summary for readers and search engines."
date: 2026-11-09 12:00:00 +0530
category: School Management
tags: [Education Technology, School Administration]
---
```

Use the actual publication date. Future-dated articles remain unpublished until
a build runs after their date; `published: false` hides a draft. The filename
controls the URL `/blog/your-article-slug/`. Do not add another H1 in the body:
the layout supplies the article title. Use H2–H6 for sections. Kramdown supports
tables, blockquotes, emphasis, lists and fenced code blocks with language names
for Rouge syntax highlighting. For captions, use `<figure>`, `<img>` and
`<figcaption>` HTML within Markdown. Only publish trusted, reviewed content.

Optional `image: /assets/images/blog/example.webp` and `image_alt: "Description"`
override the local default illustration. Use optimized 16:9 images. Broken
featured images fall back to the bundled illustration when JavaScript is enabled;
the default illustration needs no external request. Social previews use the
existing company logo. Optional `last_modified_at` records a meaningful update.

New posts automatically appear in listing, category filters, search, related
articles, sitemap and the Atom feed at `/feed.xml`. Reading time uses 200 words
per minute. Search covers titles, descriptions and tags; category filters combine
with search. Collections show six articles at a time with Load more. Without
JavaScript all article links and content remain available.

Product destinations are configured under `products` in `_config.yml`. The
PenportSchoolMS demo uses the existing School MS booking option, and Penport ID
Card Solution links to the existing catalogue entry. Existing catalogue and
booking names are preserved.

### Preview and deployment

Install Ruby 3.3 and Bundler, then run:

```sh
bundle install
bundle exec jekyll serve
```

Open `http://localhost:4000/penport/blog/`. Python's simple HTTP server cannot
render Jekyll source. `_config.yml` keeps the existing production host and
`/penport` base URL; update both together if hosting changes.

VS Code Live Server also serves source files without processing Jekyll. Opening
`blog/index.html` with Live Server displays its YAML front matter instead of the
blog. Use the Jekyll server above for the whole site, including the existing HTML
pages. On Windows, install Ruby+Devkit 3.3 from RubyInstaller, complete its Devkit
setup, reopen the terminal, and run the commands above from the repository root.
If Bundler is missing, run `gem install bundler` first. Jekyll watches Markdown
changes and rebuilds the pages while the server is running.

In GitHub repository Settings → Pages, use **Deploy from a branch**, select the
publishing branch and **/(root)**. GitHub Pages builds Jekyll automatically; do
not add `.nojekyll`. If an existing custom deployment copies raw source, change
that pipeline to build Jekyll and publish `_site` instead. The quality workflow
validates source and builds Jekyll; it does not deploy. Merge/push to the configured
publishing branch, then check the Pages build and published blog, post, sitemap
and feed URLs. No hosting settings have been changed by this implementation.

Before publishing, review desktop and mobile widths, keyboard focus, search plus
category combinations, empty state, Load more with over six posts, image fallback,
share links, related articles and product CTAs. Run `python scripts/validate.py`
and `bundle exec jekyll build`, followed by `python scripts/validate.py --built`.
A successful build does not verify browser layout,
live deployment, search indexing or the external demo backend.
