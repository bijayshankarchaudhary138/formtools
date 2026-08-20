# Cloudflare deployment checklist

These are the recommended dashboard checks after uploading V4. They are intentionally not hard-coded into the site because the correct Cloudflare product mode (Pages/Workers/zone) matters.

## DNS / HTTPS
- DNS records should point to the production deployment.
- SSL/TLS mode: Full (strict) when the origin supports a valid certificate.
- Always Use HTTPS: ON.
- Automatic HTTPS Rewrites: ON if needed for legacy mixed content.

## Caching
- Browser Cache TTL: respect existing cache policy.
- Static `/assets/*`: the V4 `_headers` file requests 1-year immutable caching.
- HTML should remain revalidated so new SEO/content changes are picked up.
- Do not cache personalized or admin responses.

## Performance
- Brotli: ON.
- HTTP/2: ON.
- HTTP/3: ON if available.
- Early Hints: ON if available.
- Avoid stacking multiple minifiers or HTML transformations until the live site is tested.

## Security
- Bot Fight Mode / appropriate managed rules: review and enable only if they do not block legitimate tool usage.
- Security headers: supplied in `_headers`.
- HSTS should only be used after confirming the whole domain is HTTPS.

## Verification
Use browser DevTools Network/Response Headers and confirm:
- `strict-transport-security`
- `x-content-type-options: nosniff`
- `referrer-policy`
- `content-security-policy`
- `cache-control` on `/assets/*`

Do not enable `Cache Everything` for all HTML blindly; it can cause stale SEO pages.
