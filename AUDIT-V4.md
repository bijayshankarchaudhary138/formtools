# FormTools V4 Audit & Deployment Notes

Generated from the supplied FormTools V3 project.

## Completed in V4

### PDF
- Merge PDF: browser-side merge with object-stream output.
- Split PDF: selected pages can be emitted as individual PDFs in a ZIP or as one selected-pages PDF.
- Rotate PDF: 90/180/270 degrees; optional page ranges.
- JPG to PDF: A4, Letter or fit-to-image page sizing.
- PDF to JPG: optional page ranges, render scale and JPG quality.
- PDF to Text: extraction output is shown on-page and downloaded.
- PDF Compressor: lossless metadata/object-stream optimization plus optional raster/visual compression.
- PDF Editor: page-number selection for adding text.

### Background remover
- Browser-side model retained.
- Cached model session reused between runs.
- Input is capped to 2048px maximum dimension for stability; normal Full-HD images are supported without downscaling.
- Preview/result object URLs are cleaned up.
- Progress and failure messages improved.

### SEO / UX
- Related-tools rail on upgraded PDF tool pages.
- Reusable FAQ/privacy/help section on tool pages.
- Local-link audit: 0 broken internal links in the supplied project.
- Basic HTML audit: 1 H1, title and canonical present on all 68 HTML pages checked.
- Sitemap rebuilt from implemented HTML pages: 68 URLs.
- No invented URLs were added to the sitemap.

### Performance / caching
- Service-worker static cache version bumped to V4 to prevent stale V3 JavaScript.
- Static assets can use long-lived immutable caching.
- HTML is configured for revalidation.

### Security headers
`_headers` was added for Cloudflare Pages-style deployments with:
- HSTS
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy
- CSP
- frame-ancestors protection
- static asset cache policy

The CSP intentionally allows the published browser libraries/models already used by the project. Review it again if another third-party library is added.

## Important limitations
- Browser PDF compression in "raster" mode trades searchable/selectable text for smaller visual PDFs. The default lossless mode preserves the PDF structure.
- Scanned PDFs still need OCR for text extraction; PDF-to-text does not claim OCR.
- Background removal requires downloading a browser AI model from the configured model host.
- Cloudflare Dashboard settings cannot be changed from this ZIP. The `_headers` file is the deployable part; after deployment, verify HTTPS, cache rules and security headers in Cloudflare.
- No ranking or indexing position can be guaranteed by SEO changes.

## Final manual checks after deployment
1. Open every PDF tool and run a small test PDF.
2. Test a 1920px image on Background Remover.
3. Test 20KB/50KB/100KB image pages.
4. Open Search Console and resubmit the updated `sitemap.xml` if Google reports a changed sitemap.
5. Run URL Inspection for the important landing pages.
6. In Cloudflare, use HTTPS/Always Use HTTPS and verify the `_headers` response is active.
7. Do not enable aggressive HTML rewriting/minification until the deployed site has been smoke-tested.

