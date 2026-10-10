# Driftwood Bay

An original cozy single-player island game for a local browser. The player explores a small illustrated island, gathers renewable materials, fishes, meets three animal neighbors, fulfills their requests, crafts six kinds of furniture, and places or reclaims decorations. The opening quest is to craft and place a welcome bench, then speak to Pip to open the neighborhood picnic. Progress persists across refreshes.

## Acceptance criteria
- Keyboard and touch/pointer movement, action, and menu controls; responsive desktop and phone layout.
- Canvas island with original characters and art; readable accessible DOM journal, inventory, recipes, dialogue, and settings.
- Resource gathering only in range; replenishment every session-paced day, without real-time waiting or clock tricks.
- Fishing includes an observable bite and a forgiving timing window; catches join the collection.
- Requests consume the required items and reward shells/friendship; completed requests never reward twice in a day.
- Crafting consumes materials and placement visibly changes the world; reclaiming is lossless.
- Opening quest can be completed without exhausting finite materials or special timing luck.
- Versioned, validated local saves; malformed/future saves never crash or get silently overwritten. Export/import and explicit new-island control.
- No Nintendo assets, backend, paid service, public deployment, or unrelated repository work.

## Authorized seams
User asked for autonomous recommended decisions, without interview questions. Adopt public game commands and save serialization as domain seams, plus player-facing browser flows. Unit tests catch rules, progression and malformed saves; browser flows catch controls, menu integration and visual feedback. Neither alone guarantees performance on every device.
