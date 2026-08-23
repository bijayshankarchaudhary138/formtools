# V26 Production UX Ultimate

This package is a production-hardening layer on top of V25.

Goals:
- Consistent, mobile-first controls.
- Clear status/error feedback.
- Dynamic target-KB labels.
- Shared image/file validation helpers.
- Responsive specification cards.
- Preserve existing tool engines rather than replacing them with fake implementations.

Required production QA:
1. Passport: upload -> preset -> custom unit -> DPI -> target KB -> crop -> background -> single JPG/PNG -> print copies.
2. Compressor: target 20/50/100/custom KB and verify actual bytes after download.
3. Background remover: first run, second run, offline/error state, large image.
4. Mobile: touch crop, no horizontal overflow, download works.
5. Console/network: no uncaught JS errors and no failed critical assets.
6. Verify every new SEO landing page points to a genuinely working tool.
