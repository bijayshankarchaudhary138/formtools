# FormTools.in — Production Starter v1

This build is intentionally a tested foundation, not a claim that every planned PDF/AI feature is already complete.

## Included
- SEO-first homepage with tool search and category architecture
- Canonical URLs, robots meta, Open Graph basics
- WebSite/WebApplication/CollectionPage JSON-LD
- robots.txt + sitemap.xml
- Responsive/mobile-first CSS
- Browser-side image processing engine
- Exact 20KB / 50KB / 100KB target presets
- Separate intent pages for:
  - compress image to 50KB
  - compress JPG to 50KB
  - image under 50KB
  - equivalent 20KB/100KB variants
- Exact 140×60 signature preset
- Government category architecture
- Dedicated Cyber Cafe section
- Search route
- 404 page
- Web manifest

## Next production modules
1. Production-grade exact-size image algorithm with validation/retry and format-specific behavior.
2. Full PDF processing engine: merge, split, compress, render, convert, editor, sign, watermark, page management.
3. OCR.
4. Cyber-cafe print-sheet generator, scanner cleanup, QR/barcode and text utilities.
5. Government notification specification database with official source + effective date + verification workflow.
6. Search Console integration and SEO expansion based on actual query data.
7. Accessibility, automated tests, security headers, caching, analytics and Core Web Vitals monitoring.
8. Move to a framework/backend only when the feature set needs it; keep the public URLs stable.

## Deployment
The site can be deployed as static files to Cloudflare Pages, GitHub Pages, or another static host. The domain can remain formtools.in.

## SEO note
No hosting provider can guarantee a #1 Google ranking. The architecture is designed to make the site technically crawlable and search-intent focused; ranking will depend on the quality, usefulness, authority and competition for each query.
