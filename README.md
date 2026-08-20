# FormTools V4

This build contains the advanced browser image/PDF tools, related-tool navigation, SEO help sections, background-remover stability improvements, sitemap refresh, service-worker cache refresh and deployable security headers.

# FormTools.in — Browser-first production build

FormTools is a static/browser-first toolkit for images, PDFs, OCR and cyber-café utilities.

## Current build
- Browser-side image compression with target-size retries and progressive downscaling.
- 20KB / 50KB / 100KB image and JPG intent pages.
- 140×60 signature preset.
- PDF merge, split-to-ZIP, rotate, JPG/image-to-PDF, PDF-to-JPG-to-ZIP, PDF text extraction.
- Browser PDF metadata optimization (not full raster recompression).
- Basic PDF text editor.
- Browser OCR with Tesseract.js.
- Browser AI background removal using `@bunnio/rembg-web` + U²-NetP.
- Photo sheet, print helper, scan cleanup, QR/barcode, file renaming and ZIP extraction utilities.
- Responsive/mobile-first UI, canonical URLs, robots.txt, sitemap.xml, JSON-LD, 404 page.
- Service-worker caching for the small first-party static assets (CSS/JS/manifest).
- No paid API is required for the browser tools.

## Background remover
Background removal runs locally in the browser. The default model is U²-NetP (~4.6 MiB), fetched on first use and then cached by the browser. U²-NetP is Apache-2.0 according to the model mirror/model card used by this build. The browser library `@bunnio/rembg-web` is MIT-licensed. See `THIRD-PARTY-NOTICES.md` for attribution.

## Important limitations
- Browser-only PDF compression cannot guarantee large reductions for image-heavy PDFs; the compressor performs structural/metadata optimization.
- The PDF editor is a lightweight browser editor, not an Acrobat-equivalent full editor.
- OCR quality depends on the input image and language model.
- Background-removal quality is best-effort with U²-NetP; larger models can improve difficult hair/fur edges but increase download and processing cost.

## Deployment
Upload the contents of this folder to the existing `formtools` GitHub/Cloudflare deployment. Do not change the existing domain, nameservers or DNS records just to deploy this static update.

## SEO
The build includes canonical URLs, robots.txt, sitemap.xml and WebApplication JSON-LD. Ranking cannot be guaranteed; each indexed page should provide a genuinely useful working tool and unique search intent.
