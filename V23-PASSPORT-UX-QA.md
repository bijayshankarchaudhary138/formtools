# V23 Passport UX QA

Changes: PI7-inspired step workflow; manual crop box with drag/resize handles; country presets; original/white/off-white/blue/red/transparent background previews; single JPG/PNG download; 1/4/6/8/12/16/24/32/custom print copies; A4/A5/Letter; before/after details.

Background remover: corrected rembg-web usage to use documented newSession/remove API and fallback remove path; progress/status/error feedback added.

Limitation: AI background removal still depends on browser WebAssembly/model download and cannot be truthfully called 100% tested without a live browser run on the deployed site.
