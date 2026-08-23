# V28 Final Production QA
Active engines replaced:
- assets/passport-v24.js
- assets/universal-compressor.js

Key fixes:
- Passport target-KB is actually applied to JPG output.
- Passport custom target KB is respected.
- Passport DPI -> pixel calculation is live.
- Manual crop frame movement and corner resizing remain available.
- Zoom now changes the source crop, not just the UI frame.
- Position sliders and reset work together.
- Passport single JPG/PNG download.
- Passport print sheets: 1/4/6/8/12/16/24/32/custom.
- Before/after metadata remains visible.
- Compressor target size is dynamically labeled.
- Compressor uses binary-search JPEG quality before dimension reduction.
- Compressor falls back to controlled downscaling when quality alone cannot reach the target.
- Bulk processing remains limited to 10 images.

Important: browser AI background removal still depends on model download/device capability; it is not honestly possible to guarantee identical speed on every device. Live-device QA is required before calling the site production-final.
