# Two-axis code review

Review compared `git diff 1d6d8ff...bc92f46` and the commit list, with independent parallel reviewers as requested by Matt Pocock's Code Review skill. Specification: docs/SPEC.md. Standards: CONTRIBUTING.md, GLOSSARY.md and the local-first ADR. Review base is the initial specification commit, chosen autonomously because the user authorized recommended decisions without questions.

## Standards

No hard violations of CONTRIBUTING.md, GLOSSARY.md, or the ADR found. State changes remain behind commands; original content and module boundaries follow documented conventions.

Heuristic findings:
- Shotgun Surgery / duplicated fishing rules: independent bite timing constants caused a 100-ms interval where the button promised BITE but the command rejected it. Fixed with shared BITE_START_MS/BITE_END_MS and the same expiration in the UI and renderer.
- Duplicated eligibility rule: reclaim menu allowed exactly 110 units, while the command required less than 110. Fixed with shared canReclaim and a red/green public-command regression test for the boundary.
- Repeated species-to-avatar cascade: fixed with a shared avatar map.

## Spec

One P2 finding: keyboard users could not import saves because the label was nonfocusable and its file input was hidden. Replaced the label with a focusable button that activates the hidden file input through the normal click/keyboard action.

Other specified gameplay requirements were represented in implementation and domain tests; no material scope creep. Review was code-based, separate from the browser playthrough.

Initial findings: Standards 3 heuristics (two concrete boundary defects), Spec 1 accessibility defect. All four addressed before the final push.
