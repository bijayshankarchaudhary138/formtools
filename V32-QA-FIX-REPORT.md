# V32 QA + Fix Report

Based on V31 Final Master.

## Static checks
- HTML pages: 329
- JavaScript files: 8
- CSS files: 4
- JavaScript syntax errors: 0
- Verified root-relative/local href targets: fixed 15 broken `/passport-size-photo/` links.
- Remaining unresolved local href scan: 1 dynamic JS template reference in `search/index.html` (`${x[1]}`), intentionally not treated as a static URL.
- Duplicate title groups: 4, all correspond to URLs consolidated by `_redirects` 301 rules and are intentional.

## Passport
- Passport pages contain the background step and live specification hooks.
- Passport engine reference is present.
- Existing pages preserved.

## Important QA boundary
Static inspection cannot certify browser-only AI/WebAssembly speed, camera permissions, touch gestures, GPU memory behavior, or exact downloaded-byte targets on every device. Those require live browser/device testing.
