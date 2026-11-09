# Architecture and maintenance

## Application model

A static multipage website served by GitHub Pages. Existing HTML pages own their
content and metadata; shared CSS and browser scripts handle presentation and
interactions. Their public paths remain at the repository root. The blog uses
GitHub Pages-compatible Jekyll to render `_posts` Markdown through `_layouts`
and `_includes`. `_config.yml` configures the production base URL and product
CTA destinations. Blog CSS is scoped to `body[data-page="blog"]`; existing page
styles and scripts remain independent. Search, filtering and Load more enhance
server-rendered article cards without making article content depend on JavaScript.
The Jekyll sitemap template includes all published posts, and jekyll-feed generates
the Atom feed. See README for publishing and local preview instructions.

| Page           | Behaviour                                                                      |
| -------------- | ------------------------------------------------------------------------------ |
| index.html     | Company introduction, founder portrait, services, project showcase and contact |
| catalogue.html | Static catalogue content enhanced with client-side search, filters and dialogs |
| book-demo.html | Project prefill, contact/requirement form and Apps Script submission           |
| thank-you.html | Confirmation ID from URL; excluded from indexing                               |

## Request flow

A project link passes its name through the project query parameter. Booking normalizes supported aliases, validates input and POSTs URL-encoded fields to Apps Script. A successful JSON response redirects to the confirmation page. The static frontend does not implement authentication or store enquiries on a server.

The Apps Script endpoint is public by design. Client-side validation, the honeypot and timing checks are convenience measures. The backend must independently validate submitted fields, enforce abuse controls and protect stored enquiry data. Updating the displayed contact email does not reconfigure backend notifications.

## Styling

Load style.css before components.css. The first contains design tokens and the original landing system; the second adds component and page layouts. Scope page-specific styles with body data-page attributes. Respect reduced-motion preferences and preserve the original founder hero unless a redesign is explicitly requested.

## Content and SEO

Catalogue data lives in CATALOGUE_PROJECTS in catalogue.js. The initial HTML cards and ItemList schema provide crawlable equivalents. Update all three together when adding or removing solutions; validation checks their names and counts. Home showcase and booking options should also match supported project names.

Each public page has one H1, a unique title and description, a canonical URL and appropriate structured data. Keep organization facts factual. Do not add fabricated reviews, ratings, office addresses or claims. Update sitemap lastmod only after a meaningful page change. The confirmation page remains noindex and outside the sitemap.

The sitemap currently uses the GitHub Pages project URL. Google site names are supported at domain/subdomain roots, not individual subdirectories. An owned domain requires coordinated canonical, schema, sitemap and hosting changes.

## Maintenance workflow

1. Create a branch and make the smallest scoped change.
2. Format the changed HTML, CSS and JavaScript.
3. Run python scripts/validate.py.
4. Review widths of 320, 390, 768 and 1440 pixels, focus states and reduced motion.
5. Review the pull request and merge when ready.
6. Confirm the production Pages deployment and inspect changed URLs.

The quality workflow validates source, builds Jekyll and checks generated blog
metadata, schema, links, sitemap and feed. It does not publish a site. Browser
layout, live performance, backend delivery and Google indexing require separate checks.
