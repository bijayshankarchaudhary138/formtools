# FormTools V31 Final Master

Base: Anthropic V29-FIXED.

Preserved:
- Existing tool pages and SEO cluster.
- Existing PDF/image tools.
- Existing 300+ page structure.
- Anthropic fixes for passport background and SEO duplicates.

Additional fixes:
- Passport background quality selector: Fast (~5 MB u2netp) / High quality (u2net_human_seg).
- Passport exact-KB JPG pipeline now uses iterative quality search plus controlled downscaling.
- Passport output uses the actual compressed canvas dimensions.
- PNG explicitly reports that exact KB is not enforced losslessly; JPG is recommended for target-KB requirements.
- Existing passport crop, zoom, position, background, print-copy, comparison and overlay features retained.
- Existing compressor retained with quality-first and resize fallback.

Static QA performed:
- ZIP extraction succeeded.
- Passport HTML references required IDs used by passport-v24.js.
- JavaScript syntax check performed for active passport and compressor engines.
- No deletion of existing tool directories performed.
