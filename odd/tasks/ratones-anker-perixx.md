# Mouse catalog: Anker A7852 and Perixx PERIMICE-513

## Objective and rationale

Add two useful ES/EN catalog profiles instead of this week's long article, as explicitly approved by the user. Explain exact-model connection, power, controls, fit checks and limitations without inventing hands-on experience.

## Authorized scope and constraints

- Branch: `feat/ratones-anker-perixx`; base: `92ea30b`.
- Local profiles, necessary schema/tests/listing integration, narrow comparison corrections and evidence docs are authorized. No push, PR, merge or publication.
- Preserve user changes in backlinks/recovery state, `opencode.json` and untracked `.atl/`.
- Public Amazon search CTAs were selected explicitly. No historical direct-ASIN CTA and no permanent numeric prices or fabricated offer audits.
- Anker A7852 / AK-98ANWVM-UBA is wireless USB-A receiver; Perixx 11168 / PERIMICE-513N is black wired USB-A, not wireless 713 or USB-C.
- Public source consultation: 2026-10-03. Images visually matched official exact-variant galleries.
- Playwright observed Anker 15.99 EUR Prime-only and Perixx 17.99 EUR, VAT included, in stock; these are dated observations, not universal current offers. Indicative economic tier is editorial, not a price promise.
- RDD: global OFF, read on 2026-10-03. Do not start native review or change the switch.
- TDD configuration: prior task records OFF; no new strict mode found. Default deterministic test-first policy applies to USB power behavior: observe a failing regression, implement, rerun. Passive prose has no meaningful runnable RED.
- Delivery strategy: `ask-on-risk`; user selected `feature-branch-chain` after the pair alone reached 489 authored lines. Revised forecast: 650–800 authored lines, generated files excluded. Keep useful content intact; one honest slicing pass, no PR creation or publication.
- Engram mirror: observation #115, topic `odd/ratones-anker-perixx/tasks`, locator `odd/tasks/ratones-anker-perixx.md`; full-document update and readback receipt on 2026-10-03. No section-only or summary mirror substitutes for this document.

## Work unit

- [x] **MOUSE-USB-1 — Represent USB-powered mice.** Route: delegated direct; schema and bilingual labels need coordinated behavior/tests. Observed deterministic RED then GREEN with `npm test -- src/lib/productos.test.ts`; independent checks and parent readback passed. Local commit `bc69035` contains this independent prerequisite (17 authored changed lines); RDD OFF/unmanaged.
- [ ] **MOUSE-AP-1 — Publish-ready local bilingual pair and integration (PARTIAL).** Local commit `d777ca9` preserves the implemented pair and integration; independent verification and parent readback passed. Mandatory offer audits and human publication acceptance remain pending. One premium editorial writer authored the coherent pair; integration includes nine-mouse counts/selector/build checks, contextual links and the Anker dimension correction. This second work unit depends on MOUSE-USB-1; its oversized cohesive slice is reported honestly rather than reducing content to fit.

## Acceptance and verification

- Four localized routes contain coherent buyer guidance, correct variants, visually matched images, dated methodology and Amazon search CTAs, without invented measurements or medical promises.
- Nine mice / eighteen localized profiles; wired Perixx matches wired use, Anker does not; USB power renders correctly in both languages.
- No static mouse comparison pairs, unsupported numeric scores or live-offer structured claims.
- Run normalization before final functional proof. Required commands:
  - `npm test -- src/lib/selector/ratones.test.ts src/lib/selector/scoring.test.ts src/lib/productos.test.ts`
  - `npm test`
  - `npm run validate:productos`
  - `npm run validate:offers`
  - `npm run build`
  - `npm run validate:ratones-build`
  - `npm run validate:selector-build`
  - `git diff --check`
- Historical baseline: offer validation had 131 errors from stale empty registry; observe current baseline before attributing changes. Any other required failure means partial.
- Read back four rendered routes, reciprocal canonical/hreflang, images, search links and wired selector behavior. Human editorial acceptance remains pending before publication.
- Record self-verification, native risk assessment (RDD stays OFF), required independent verification, parent spot check, authored line count and local Conventional Commit. Do not mark complete while required checks fail.

## Progress and next action

- 2026-10-03, research phase (historical): actual Playwright price checks completed before source integration. Perixx registered image matches official USB-A gallery despite USB-C hero. Anker official dimensional fields conflict; corroborated metric dimensions are 120 × 62.8 × 74.8 mm. Perixx dimensions remain unknown. Unknown weights must not be fabricated.
- 2026-10-03, draft phase (historical): both bilingual profiles comprised 489 authored lines before mechanical/schema validation. The user selected a feature-branch chain; no PR or remote mutation is authorized.
- Integration is implemented locally. Both writer YAML files are unchanged. Schema accepts USB power; labels render correctly in ES/EN. Nine-mouse counts, exact search CTAs, unknown-weight regressions, article links and corroborated Anker dimensions are integrated.
- Offer baseline already ingested the two untracked YAML files: 132 products, 133 errors (132 missing ES/US audit entries plus stale registry). Final validation has the same 133 errors, including both new candidate audit entries. Historical 131 was from the preceding 130-product inventory, not a new baseline observation.
- USB prerequisite observed RED: `npm test -- src/lib/productos.test.ts`, 2 failed / 66 passed; GREEN: 68 passed. RED asserts old enum exclusion and untranslated USB label. The enum regression inspects the declaration; the production Astro build supplies runtime schema validation.
- Normalization: no code/prose formatter script or formatter config found; preserve existing style and the writer's YAML, check LF/trailing whitespace. The existing image optimizer runs first in `npm run build`; no image or other generated tracked-file changes appeared.
- The initial new build-validator assertion expected only HTML-escaped ampersands. Astro emitted the correct raw search URL; normalize `&amp;` before comparison. Rerun passed; no CTA implementation change was needed.

## Observed self-verification (2026-10-03)

| Command | Result |
|---|---|
| `npm test -- src/lib/selector/ratones.test.ts src/lib/selector/scoring.test.ts src/lib/productos.test.ts` | PASS: 402 tests, 3 files |
| `npm test` | PASS: 479 tests, 13 files |
| `npm run validate:productos` | PASS: 132 products, no warnings |
| `npm run validate:offers` | FAIL: 133 errors, ES 0/132 and US 0/132 audited |
| `npm run build` | PASS: 459 pages, image optimization and CSP hash generation included |
| `npm run validate:ratones-build` | PASS: 18 profiles, 2 indexable catalogs, no static pairs, reciprocal alternates; articles 2530/2567 words with 6 affiliate links and 5 FAQs each |
| `npm run validate:selector-build` | PASS: 2 pages, 132 eligible products |
| `git diff --check` | PASS |

- Four preview routes returned HTTP 200; canonical/hreflang reciprocate ES/EN, hero images load (Anker 300 px; Perixx 243 px), exact-model search CTAs carry the affiliate tag, and AAA/USB labels and no-hands-on methodology render correctly. Dist checks reject permanent observed prices, direct historical ASINs, current offer schema and invented ratings on the pair.
- Browser wired-use scenario in ES/EN (`tipo=raton&mano=derecha&formato=vertical&conexion=cable&prioridad=any`): Perixx appears second with confirmed USB wired operation; Anker is absent from the top three. Existing computed selector compatibility scores are not editorial product ratings.
- Mobile limitation: four new routes overflow at 390 px (document width 454 px), but not at 1440 px. Existing Trust EN profile reproduces the same 454 px width. Shared hero/layout repair is outside the authorized edit surfaces; no content was shortened to disguise it. Keep this issue pending for an explicitly scoped fix.
- Preview is bound to `127.0.0.1:4321`; background shell `sh_1013942b7001Tc83ENw8Api0fW`, log `/tmp/opencode/anker-perixx-preview.log`. Left running for the parent's spot check, not remotely exposed.
- Source/editorial pass: exact variants, source attribution and ES/EN parity checked; no medical outcomes, personal testing, US offer audit or recurring failure rate invented. No numeric mouse-price thresholds established. Publication and human editorial acceptance remain pending.
- Overall status after parent verification: **PARTIAL** because required offer validation fails and human publication acceptance remains pending. USB is DONE with proof and local commit; the pair remains open despite its preservation commit. Inherited mobile overflow is a separate scoped follow-up, not a candidate-caused blocker. RDD stays OFF; no native review was started. No pushes, PRs or deployment.

## Parent verification and local delivery

- 2026-10-03: Native read-only assessment returned high/unassessable because untracked inventory requires explicit scope. RDD remains global OFF; no lifecycle was started. The high verification path was applied: writer self-verification plus a fresh independent read-only verifier.
- Independent verification passed 402 focused tests, 132-product validation, mouse and selector build validators, whitespace checks and four-route readback. No candidate-caused blocking regression was identified. Offer audits remain required and incomplete; mobile overflow was independently reproduced in the unchanged Trust profile and is a separate inherited layout issue.
- Parent structurally read back the USB/schema/label/test diff and Perixx buyer copy; reran `npm run validate:ratones-build` and `git diff --check` successfully. Hardened the new validator to assert buyer-caveat presence before comparing its position, then reran both checks successfully.
- USB prerequisite committed locally as `bc69035` (`feat(catalog): represent USB-powered mice`): exactly 3 files, +14/-3 = 17 authored lines. Pair committed locally as `d777ca9` (`feat(catalog): add bilingual Anker and Perixx mouse profiles`): exactly 15 files, +744/-22 = 766 authored lines. Combined implementation commits: +758/-25 = 783, before this passive bookkeeping update. Pair work remains PARTIAL for mandatory offer audits and human publication acceptance; its commit preserves authorized work, not approval or publication. No remote operation is authorized.
- The parent's final functional mutation was only the buyer-caveat validator assertion, followed by passing mouse-build and whitespace checks; other final changes were documentation. Existing 479-test and 459-page proof remains applicable. This final bookkeeping changes only this task and the catalog-state document; runtime verification is N/A for passive evidence, so no new research, tests or build is required.

## Feature-branch-chain boundaries (one slicing pass)

1. `bc69035` — `feat(catalog): represent USB-powered mice`, prerequisite `MOUSE-USB-1`: exactly `src/content/config.ts`, `src/lib/productos.ts`, `src/lib/productos.test.ts`. Behavior and its RED/GREEN tests form one 17-line rollback boundary; no selector redesign or profiles in this boundary. Runtime schema proof: the successful Astro build. Remove the dependent pair first before rolling back USB support; never reset unrelated work.
2. `d777ca9` — `feat(catalog): add bilingual Anker and Perixx mouse profiles`, depends on #1; exactly both new YAML files, `src/lib/selector/ratones.test.ts`, `src/lib/selector/scoring.test.ts`, `scripts/validate-ratones-build.mjs`, `src/lib/tipos-raton.ts`, `src/pages/catalogo/[tipo]/index.astro`, both vertical-mouse MDX articles, `PRODUCTOS.md`, `docs/agent-context/project_ratones_catalog_state.md`, `docs/agent-context/project_content_plan.md`, `docs/agent-context/INDEX.md`, `.seo-engine/logs/changelog.md`, and this task document. This 766-line rollback boundary removes the pair and its integration/evidence while retaining the independent USB capability; subsequent bookkeeping must be reconciled separately. No rollback is executed here.

Dependency diagram: tracker (draft/no-merge, not created) → USB `bc69035` → 📍 bilingual pair `d777ca9`. Follow-up: mandatory offer audits, scoped inherited mobile-layout repair and human publication acceptance. Committed authored lines before bookkeeping: USB +14/-3 (17); pair +744/-22 (766); total +758/-25 (783), excluding unrelated state and generated artifacts. The earlier worker measurement of 775 was historical, before the parent's evidence and assertion additions. The pair alone is 489 lines; its coherent integration necessarily exceeds 400. Recommend `size:exception` for slice #2 rather than fragmenting the two-language editorial unit or dropping tests/docs. No PR or further slicing is authorized here.
