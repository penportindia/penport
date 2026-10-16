# Penport India company profile and search publication

## Confirmed company profile

Penport India is a software development company based in Patna, Bihar, India,
founded by Raushan Singh in 2021. The company develops custom software, school
ERP, business management systems, websites and mobile applications for schools,
businesses and organizations. Its catalogue includes School OS, HR management,
inventory management and ID card solutions. Prospective clients can explore
features and request a personalized demo through the website.

- Website: https://penportindia.github.io/penport/
- Email: penportindia@gmail.com
- Phone: +91 70048 48750
- GitHub: https://github.com/penportindia
- Facebook (owner-confirmed): https://www.facebook.com/penportindia

The location, founder and founding year were confirmed by the owner. Only a
year is known; do not invent a founding day/month, street address, postal code,
registration number, awards, client counts, ratings or reviews.

## Implementation

The home page has company-focused search and social titles/descriptions,
Organization and WebSite structured data, a linked founder identity, city/state
address and a linked service catalogue. At the owner's request, the original
visible home introduction is retained; the additional company profile facts are
provided in metadata and structured data only. Google may decline enhanced
search appearances when structured data is not supported by visible content.
The catalogue
and booking pages have distinct descriptions and retain their canonical URLs,
breadcrumbs and relevant structured data. The thank-you page remains noindex
and stays outside the sitemap. The Google verification file is preserved.

The Facebook URL was confirmed by the owner and updated in the visible link
and Organization.sameAs. Other social links were retained from the original site,
not independently verified. Before relying on them as official company identities,
confirm that each Instagram, YouTube and LinkedIn URL belongs to Penport India;
correct or remove mismatches in both visible links and Organization.sameAs.

## After publishing

1. Run `python scripts/validate.py` with Python and Node.js installed, then verify
   that GitHub Pages serves the updated HTML after deployment.
2. Test the deployed home URL using Google's Rich Results Test and Schema Markup
   Validator. Local JSON checks alone do not establish Google rich-result eligibility.
3. In the verified Search Console property, submit/check
   `https://penportindia.github.io/penport/sitemap.xml`. Use URL Inspection for
   the home, catalogue and booking pages; request indexing after publication.
4. Monitor indexing, branded queries (Penport India, Penport India Patna) and
   relevant service queries in Search Console. Search titles and descriptions
   are suggestions; Google may rewrite them and does not guarantee rankings,
   sitelinks or a knowledge panel.

## Hosting limitations and next steps

Google reads robots.txt at the host root. The project's `/penport/robots.txt`
does not control crawling for `penportindia.github.io`. Do not assume that its
sitemap directive replaces direct submission to Search Console. Root hosting
would need changes to the separate `penportindia.github.io` repository.

Google supports site names at domain/subdomain roots, not project subdirectories.
An owned domain or the account's GitHub Pages root would provide a clearer
company identity. Coordinate hosting, redirects, canonical URLs, structured
data and sitemap before changing domains.

Keep the same factual profile on owner-controlled company listings and social
profiles. Creating or editing external profiles is separate from this code
change. Check Google Business Profile eligibility before creating a local
listing; an online-only business may not qualify. Do not use an invented office
address to obtain a listing.

References:
- https://developers.google.com/search/docs/appearance/structured-data/organization
- https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- https://developers.google.com/search/docs/appearance/site-names
- https://developers.google.com/search/docs/appearance/snippet
- https://developers.google.com/search/docs/crawling-indexing/robots/intro
