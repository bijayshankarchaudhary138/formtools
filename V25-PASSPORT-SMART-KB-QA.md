# V25 Passport + Smart KB QA

V25 is an incremental UX hardening package based on V24.

Implemented:
- Live target-KB button labeling when a target input is present.
- Live photo specification panel (width, height, unit, DPI, target KB).
- Responsive mobile styling.
- Existing V24 functionality retained rather than replaced blindly.

Before production push:
1. Test passport upload on desktop and mobile.
2. Test preset -> custom dimensions -> DPI -> target KB.
3. Test manual crop drag/zoom/pan and reset.
4. Test original/white/off-white/blue/red background selection.
5. Test single JPG/PNG download.
6. Test 1/4/6/8/12/16/24/32/custom print copies.
7. Test compressor target 50/100/custom KB and verify actual output size.
8. Test background remover first-run and second-run speed.
9. Test all console errors and broken network requests.
