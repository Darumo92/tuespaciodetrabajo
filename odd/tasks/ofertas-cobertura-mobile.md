# Offer validity, audit coverage and responsive product heroes

## Objective and authorized scope
- Fix inherited mobile overflow without hiding content or clipping the document.
- User approved separating structural validity from strict commercial audit coverage. Explicit unaudited state never means unavailable or audited; only recent evidenced available offers can display prices.
- Local implementation only, branch `fix/ofertas-cobertura-mobile`, base `4423ace`. No remote access, push, PR or publication.
- Preserve unrelated backlinks/recovery documents, `opencode.json` and untracked `.atl/`.
- RDD global OFF confirmed; never enable or start native review. Native read-only risk assessment and proportional independent verification still apply.
- Configured strict TDD not established; previous documented mode OFF. Default applicable test-first: observed deterministic RED/GREEN for offers and layout contract; real browser viewport RED/GREEN using existing MCP, no new dependencies needed.
- Delivery: `ask-on-risk`; forecast 250–400 authored lines. Reuse the selected `feature-branch-chain` if the budget is exceeded, keeping one honest coherent slicing pass and no PR creation. Never minify or omit tests to meet a budget.
- Mirror topic: `odd/ofertas-cobertura-mobile/tasks`; locator observation **139**. Parent reconciled initial full document; worker must mirror this updated full document and compare exact readback before return.

## Tasks and routes
- [x] **MOBILE-1:** Fix image, media-grid and fallback intrinsic sizing. Delegated direct: coordinated components, regression test and responsive browser checks. Observed regression-first and independent browser proof; local commit `a6e18fc` includes coordinated components, test and documentation.
- [x] **OFFERS-1:** Separate schema/integrity validation from audit coverage with explicit unaudited semantics. Delegated direct: validator, consumer types, tests, CLI command and documentation require coordinated edits. Verified with regression-first tests and independent validation; local commit `140a036`. Strict coverage correctly remains nonzero for 264 missing real audits; evidence and freshness checks are preserved.

## Acceptance and exact checks
- No horizontal document overflow at 320/390/760/1440 px for new Anker/Perixx ES+EN and existing Trust, including image fallback. Preserve image proportions, legibility and desktop layout.
- `validate:offers` checks genuine structural validity; a new `validate:offers:coverage` checks complete recent commercial coverage and must honestly report missing audits. Explicit unaudited records cannot contain price/seller/availability/evidence claims or masquerade as attempted-unavailable.
- Distinguish file maintenance dates from offer `checkedAt`; never refresh commercial proof by touching a file. Missing/partial markets count as pending, not audited. Malformed, stale, future-dated or wrong-currency available offers remain errors and unusable.
- Required: `npm test -- src/components/producto/FichaHero.test.ts src/lib/product-offers.test.ts scripts/validate-product-offers.test.ts`; `npm test`; `npm run validate:productos`; `npm run validate:offers`; `npm run validate:offers:coverage`; `npm run build`; `npm run validate:ratones-build`; `npm run validate:selector-build`; `git diff --check`.
- The strict coverage command's expected failure is an explicit pending external-data outcome, never a PASS. Unexpected failure in any other required check means partial.
- Observe all commands in foreground, normalized source before final proof; run parent spot check and risk-required independent verification before local work-unit commits. Record commit IDs, rollback boundaries, counts and any unperformed check.

## Evidence and next action
- Diagnosis: registry was created empty in `691d6ad`, currently 132 products with no ES/US audits; 133 errors combined missing entries with stale file timestamp. Runtime prices only consume usable available offers, while YAML CTAs do not use this registry.
- Inherited mobile baseline: 420px image + 32px media padding + 2px border = 454px. Grid item lacked `min-width: 0`; image prevented flex shrinking; fallback also needed responsive bounds.
- Implemented unaudited default (empty registry preserved), explicit claim-free unaudited records, separate strict `--coverage`, maintenance-only `updatedAt`, valid fresh audited counts, and runtime unknown-key rejection. Existing audited offer evidence/freshness/currency/condition and four-attempt unavailable rules remain enforced.
- Implemented media `min-width: 0`, responsive image/fallback bounds and square canvas with contained photos. No document overflow hiding, clipping or typography scaling.

## Worker evidence — observed 2026-10-03
- skill_resolution: **paths-injected**. Read `.claude/skills/impeccable/SKILL.md`, `/home/darumo/.agents/skills/work-unit-commits/SKILL.md`, `/home/darumo/.agents/skills/chained-pr/SKILL.md`; ran Impeccable context and read product register. Optional newer skill not installed; dependency/config changes outside scope.
- Test-first RED: exact focused runner exit 1, **16 failed / 38 passed (54)**. First GREEN: **54 passed**. Added two supplemental cases after GREEN (complete strict coverage and forbidden unavailable default); final focused proof **56 passed**, exit 0. No configured strict TDD claim.
- Browser RED before CSS edits: actual Anker ES on MCP connection, viewport 320 and 390, document **453px**, image **420x420px**, media **453.33px**. Earlier parent measured 454px; browser rounding differs, root cause unchanged.
- Browser GREEN: Anker and Perixx ES+EN plus inherited Trust EN at **320/390/760/1440**, HTTP 200 for all five routes. **20 image scenarios**: document/client widths **305/375/745/1425** (15px scrollbar), all hero CTAs within viewport. Natural image dimensions Anker **300x281**, Perixx **243x300**, Trust **299x300**; square canvases **271.33/341.33/420/367.48**, `object-fit: contain` preserves photograph proportions.
- Fallback GREEN: **20 additional DOM-only scenarios**, matching source fallback markup and actual compiled scoped CSS; same document/client and square dimensions, label role img, name text within box, **15.2px** fixed name font. Restored actual Anker ES page afterward. No claim that failed image requests automatically render fallback; component selects fallback only for absent image props.
- MCP navigation initially timed out while the page nevertheless loaded; used existing page with `goto(..., waitUntil: domcontentloaded)` through discovered MCP run-code tool. Never created a browser context. Console errors were blocked Clarity analytics requests, not product images. Screenshot: `.playwright-mcp/page-2026-10-03T19-07-31-519Z.png`.
- Previous preview was not listening; worker started `npm run preview -- --host 127.0.0.1 --port 4321` (shell `sh_103223b58001PW56ABs0db1hfO`), kept running and served rebuilt dist. No unrelated process killed; no authenticated remote access or publication.
- Source normalized before final proof via `node scripts/optimize-images.mjs`: **0 converted, 0 skipped**, exit 0. Build likewise generated no tracked out-of-scope changes; user backlinks/recovery/opencode/.atl unchanged by worker.

| Foreground command | Observed result |
|---|---|
| `npm test -- src/components/producto/FichaHero.test.ts src/lib/product-offers.test.ts scripts/validate-product-offers.test.ts` | PASS, exit 0, 3 files / 56 tests |
| `npm test` | PASS, exit 0, 14 files / 499 tests |
| `npm run validate:productos` | PASS, exit 0, 132 products |
| `npm run validate:offers` | PASS integrity only, exit 0; ES 0/132, US 0/132, 264 pending |
| `npm run validate:offers:coverage` | **FAIL**, exit 1, 264 missing audit errors; external coverage pending |
| `npm run build` | PASS, exit 0, 459 pages, CSP generated automatically |
| `npm run validate:ratones-build` | PASS, exit 0, 18 profiles, 2 catalogs, 2 interactive comparisons |
| `npm run validate:selector-build` | PASS, exit 0, 2 pages / 132 eligible products |
| `git diff --check` | PASS, exit 0, no whitespace errors; repeated after final evidence edit |

## Commit boundaries and next action
- Both implementation tasks are complete, independently verified and committed locally. During the earlier worker handoff both checkboxes were pending and the worker had made no commits; that historical phase is now closed. Commercial coverage remains **PARTIAL**, not complete.
- Actual OFFERS unit: `140a036` — `fix(offers): separate registry integrity from audit coverage`; **7 paths, +143/-27 = 170 lines**. Boundary: `src/data/product-offers.json`, `src/lib/product-offers.ts`, `src/lib/product-offers.test.ts`, `scripts/validate-product-offers.mjs`, `scripts/validate-product-offers.test.ts`, `package.json`, `docs/plans/selector-productos.md`. Rollback removes only the new integrity/coverage contract and its tests/plan; no mobile source changes belong to this unit.
- Actual MOBILE unit: `a6e18fc` — `fix(ui): keep product heroes within mobile viewport`; **7 paths, +134/-6 = 140 lines**. Boundary: `src/components/producto/FichaHero.astro`, `src/components/producto/ImagenProducto.astro`, `src/components/producto/FallbackImagen.astro`, `src/components/producto/FichaHero.test.ts`, `docs/agent-context/project_ratones_catalog_state.md`, `docs/agent-context/INDEX.md`, `odd/tasks/ofertas-cobertura-mobile.md`. Rollback removes responsive hero sizing and matching evidence/test while retaining OFFERS; preserve offers documentation when undoing this shared documentary boundary.
- Final allocation places all shared catalog-state, INDEX and ODD documents in MOBILE; the earlier partial-hunk proposal was not used. One bounded slicing pass: OFFERS then MOBILE, **+277/-33 = 310 lines** before passive closeout. Both units and their combined implementation remain below the advisory 400-line budget; cached feature-branch-chain was not needed. No minifying, dropped tests, new slice branches or PRs.
- Remaining work is genuine commercial evidence collection: **264 product/market audits**, outside this implementation. No implementation checkbox remains pending for missing commercial data. Human publication approval and separately authorized remote actions are still required; no push, PR or deployment is authorized for this fix branch.

## Parent verification and delivery
- Native read-only assessment was high/unassessable because of untracked inventory. RDD stayed OFF; the parent used writer self-verification plus a fresh independent verifier, without starting native review.
- Independent verifier passed 56 focused tests and 23 additional malformed/complete-coverage CLI probes. Integrity passed with 264 pending; strict coverage correctly failed with 264 missing-audit errors. No candidate blocker was found.
- Independent browser verification covered Trust EN, Perixx ES and Anker ES at 320/390/760/1440, including after disabling inherited body overflow masking in browser DOM: document and viewport widths matched. Nine catalog thumbnails retained 110px dimensions. DOM changes were restored.
- Parent reran `npm run validate:offers` and `git diff --check` successfully. Offer unit committed as `140a036` (143 additions, 27 deletions); coverage data remains genuinely unaudited, not claimed complete.
- Parent committed the independently verified mobile unit as `a6e18fc` (134 additions, 6 deletions). Both implementation units are closed; no source changes remain pending. Unrelated user backlinks/recovery/opencode/.atl changes are preserved. RDD remains globally OFF, without native review or authenticated remote actions.
- Passive closeout scope: this task document only, full observation-139 mirror/readback and whitespace check, followed by the authorized documentation-only commit. No tests, builds, browser/network activity, extra agents or functional source edits are needed for this evidence update. Closeout skill_resolution: **paths-injected**, `/home/darumo/.agents/skills/work-unit-commits/SKILL.md`.
