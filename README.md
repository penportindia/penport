# Penport India

Company website and software catalogue for Penport India, with a personalized demo enquiry flow.

[Website](https://penportindia.github.io/penport/) · [Software solutions](https://penportindia.github.io/penport/catalogue.html) · [Book a demo](https://penportindia.github.io/penport/book-demo.html)

## Run locally

Requires Python 3. Run from the repository root:

```sh
python -m http.server 8000
```

Open http://localhost:8000/. No build step is required. Fonts, icons, animations and embedded videos use external providers.

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
