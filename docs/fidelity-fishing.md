# Aimed rod and fish-shadow slice

> Final native acceptance completed on 2026-10-15. See [the normal-input record](LOCAL_ACCEPTANCE_2026-10-15.md) for observed outcomes and remaining limits. Earlier worker statements below describe source-only handoff evidence.

Primary research read 2026-10-15: [Nintendo fishing guide](https://play.nintendo.com/news-tips/tips-tricks/fishing-new-horizons-tips-and-tricks/) establishes an equipped pole, casting in front of a fish shadow, false nibbles and immediate input on bobber submergence. This bounded implementation uses two original pond silhouettes, an 85-unit cast, seeded 1–3 nibbles and a custom 0.85-second reaction window. It does not claim original numeric timing, species ecology or a 3D camera.

`src/fishing.ts` is the transient rod/cast/nibble/reel seam; `src/game.ts` validates an awarded species and updates the existing inventory/collection; `src/world.ts` renders orientation, bobber submergence and rod; `src/main.ts` integrates normal aim/equip/reel/cancel controls. Old fixed elapsed-time catch commands are removed. v1 island schema/key and all saved resources, decor, friendships/day remain unchanged.

All 11 tests passed both staged and in the actual repository: pole/water/front placement, wrong cast, nibble/early miss, submerged success once, late escape/cancel and unchanged legacy save, plus all existing island/save tests. Actual strict typecheck and production build passed. Existing preview PID64483 on5173 serves the updated dist; all independent reviews and focused native acceptance have completed. See central evidence below.

Normal-input route: Field guide → Walk to pond dock → close menu → R → click water just ahead of the west-facing lower shadow → E → wait through nibbles → E on UNDER → receive fish/collection → R off → craft menu/worktable trade → reload island. Demonstrate an initial miss-cast and early reel failure too. Blur/move/Escape must cancel with no reward. No state injection.

Remaining scope: fixed 2D island camera, manual day refresh, two stationary fish patrol origins, no rod durability/seasons. No commits/pushes or preview restart by this worker.

Native acceptance (2026-10-15): Early/off-target failures; false nibble→UNDER reel catches Sunfin; trade 15→23 shells; reload 1 catch/1 species. Camera: Fixed oblique/top-down 2D island. Controls: Walk/tap; R rod; water-click aim; E cast/reel; Escape cancel. Central evidence: [native acceptance](LOCAL_ACCEPTANCE_2026-10-15.md) (screenshots alongside). Limit: Custom timing and fixed pond/camera; no original 3D ecology/campaign parity. Existing localhost/127-origin saves were untouched; test progress was isolated at `http://fidelity-qa-20261015.localhost:5173/`.
