# Animal Crossing fishing native acceptance

2026-10-15, actual Mac Chrome/intrepion, dedicated tab222225542 at isolated http://fidelity-qa-20261015.localhost:5173/. User/root/Witness tabs and existing localhost/127 saves untouched. Final reviewed production build,11 actual tests/typecheck/build passed. Native CUA clicks/keys only; read-only visible-button waits synchronized the bite reaction, with no hidden state or DOM event injection.

Camera: fixed oblique/top-down2D island. Controls: WASD/arrows or tap/destination walking, R equips rod, click water aims, E casts/reels, Escape cancels, menu/destination actions retain ordinary island loop.

Observed end-to-end: fresh0catches/15shells → Field guide / Walk to pond dock → R → click water ahead of lower west-facing shadow. First E/E deliberately reeled early; visible `Too early: the fish escaped...`, no award. Recast, visibly waited for `Nibble… do not reel yet`, captured nibble.jpg, then waited for the visible UNDER/reel prompt and pressed native E. Visible `Caught a Sunfin! 1 of6 species...`. A second water aim outside the fish's cone showed `Line cast, but outside the fish's view` and `Retrieve missed cast`; Escape canceled. Put rod away, Journal / Walk to Worktable, Craft / Trade one fish +8shells. Reload showed23shells at worktable. Field guide after reload showed Sunfin,1of6species,1catch; miss/cancel did not add another catch.

Evidence: early-failure.jpg, nibble.jpg, caught-sunfin.jpg, trade-reload.jpg, collection-reload.jpg. No source fix/build/restart required by QA. Remaining limits: custom0.85-second reaction window, fixed2Dcamera/two pond shadows, no original3D/island ecology/campaign parity or hardware/audio QA.

Native screenshots and the session record are preserved in `qa/fidelity-2026-10-15/`. No additional browser playthrough was performed by the documentation reviewer.

## Included native captures

- [early-failure.jpg](qa/fidelity-2026-10-15/early-failure.jpg)
- [nibble.jpg](qa/fidelity-2026-10-15/nibble.jpg)
- [caught-sunfin.jpg](qa/fidelity-2026-10-15/caught-sunfin.jpg)
- [trade-reload.jpg](qa/fidelity-2026-10-15/trade-reload.jpg)
- [collection-reload.jpg](qa/fidelity-2026-10-15/collection-reload.jpg)
