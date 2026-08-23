# V24 Passport UX + Universal KB Compressor

- Passport maker redesigned around one-page workflow: upload → size → unit/width/height → DPI → target KB → crop → background → adjustments → single download → print copies.
- Added related-tools sidebar.
- Added 1/4/6/8/12/16/24/32 print copy presets and custom copy input.
- Added single JPG/PNG output.
- Added original/edited comparison details.
- Added custom target KB to fixed KB landing pages.
- Added DPI + PX/MM/CM/Inch controls to KB compressor landing pages.
- Added bulk up to 10 images to compressor pages.
- Existing AI background removal remains browser-based and lazy-loaded only when requested.

Note: browser canvas processing cannot guarantee byte-perfect target sizes for every source; the compressor prioritizes staying at or below the requested target when possible.
