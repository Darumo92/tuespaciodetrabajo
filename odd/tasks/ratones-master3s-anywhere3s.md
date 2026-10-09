# MX Master 3S and MX Anywhere 3S catalog expansion

## Objective and rationale
Add two useful, source-supported Spanish/English mouse profiles selected using observed Spanish search demand rather than catalog variety alone. Keyword Surfer, Spain, consulted through Playwright on 2026-10-09: exact model queries MX Master 3S 4,400; MX Anywhere 3S 480; Keychron M6 260; ERGO M575S 0 estimated monthly searches. This is a sampled comparison, not an exhaustive market ranking or SEO difficulty assessment.

## Authorized scope and constraints
- Two new product YAML records with complete ES/EN editorial content and verified images.
- Update inventory-dependent tests, build validation, catalog introductions and product/context documentation.
- Preserve existing unrelated changes in backlinks/recovery context, OpenCode configuration and `.atl/`.
- Work locally on `feat/ratones-master3s-anywhere3s`, base `a40f14b`; no push, merge or publication.
- RDD is globally off. Ordinary verification applies; do not enable native review.
- No invented prices, ratings, hands-on experience, US offer validation or variant equivalence.
- Standard consumer Master 3S is distinct from the current Bluetooth Edition. Use a search CTA if the seller's contradictory SKU fields prevent confident direct attribution. Unsupported edition-specific dimensions remain null.
- Anywhere 3S supports Bolt but does not include its receiver. A charging port does not establish USB data support.

## Work unit
- [x] MICE-01 — Add both bilingual profiles, inventory integration, source evidence and documentation; verify the complete work unit and commit it.
  - Route: delegated direct. Reading prepares editorial writing and multiple non-trivial files change; writers run serially.
  - Acceptance checks complete locally: four generated product routes, eleven mice, truthful receiver/edition caveats and complete EN parity. Committed only the thirteen authorized feature paths; publication remains unauthorized.
  - Test-first: update inventory expectations and observe a missing-profile RED before adding products; no artificial RED for prose.
  - Checks: focused mouse/scoring tests; full `npm test`; `npm run build`; `npm run validate:ratones-build`; `npm run validate:selector-build`; `npm run validate:productos`; `npm run validate:offers`; strict offer coverage reported separately; `git diff --check`.
  - Build-generated CSP changes must be inspected and handled without overwriting unrelated state.
  - Ordinary independent read-only verification complete after native risk assessment with RDD off; parent repeated the mouse test file (11 passed). Independent product/integration checks found no blocker; its partial verdict concerned only stale documentation synchronized here.
  - Rollback boundary: remove these two YAML profiles and revert their inventory/test/documentation edits, leaving pre-existing products and unrelated work intact.
- [ ] MICE-02 — Audit the two new mice in ES/US, record only supported commercial evidence, synchronize buyer caveats where necessary, verify and commit the bounded audit.
  - User authorized only these two products, not the other 132 catalog products. Unknown evidence stays unaudited; unavailable requires genuine attempts across Amazon, official, distributor and retailer sources.
  - Route: delegated direct; external source research and structured registry writing belong to one bounded worker. No artificial RED for audit-only data; deterministic integrity and offer tests apply.
  - Allowed scope: the two product keys in `src/data/product-offers.json`, a dated two-product research ledger, necessary caveat/test synchronization and current task/catalog-state documentation.
  - Worker candidate: four public-source offers recorded in `docs/research/ratones-ofertas-2026-10-09.md` with actual UTC clock timestamps, independently corroborated 4/4. US regional SKU proof is separate from Amazon US/OneLink approval; Master search safeguard remains. Parent local audit commit pending, before the separate MICE-03 UI correction. Worker did not stage, commit or publish.
  - Checks: offer integrity, exact scoped coverage readback, product-offer and mouse tests, build and ratones/selector validators. Full coverage may remain FAIL for unrelated products; no fabricated PASS.
  - Visual proof already observed on ten route/viewport combinations (1440, 390 and ES 320px), correct images and visible keyboard focus; recheck any rendered surface changed by audited offer data.
  - Publication authorization: only this feature, excluding CodeGraph commits `a40f14b` and `139c22f` and all unrelated uncommitted work. Explicit authorization covers fetch and non-force push of main to configured `https://github.com/Darumo92/tuespaciodetrabajo.git` using existing Git authentication.
  - Delivery must isolate authorized commits from concurrent work; detect remote conflicts before updating main. Push remains conditional on final checks and complete supported evidence for the two-product scope.
- [ ] MICE-03 — Display each audited selector quote's seller, evidence link and per-offer check date in ES/EN; verify the changed cards and commit the correction before publication.
  - Route: delegated direct; the audited-price visual check exposed missing commercial attribution in the inherited renderer. This corrects the existing quote display, without changing ranking, affiliate destinations, or the unaudited catalog's behavior.
  - Scope: selector page offer projection, card template/client renderer, a small tested attribution formatter and selector build assertions. Do not add global styling or claim best prices or guaranteed stock.
  - Test-first: observe a deterministic missing-attribution RED; implement locale-aware currency/date and safe source-link rendering, then GREEN. Null offers must not display attribution.
  - Checks: focused attribution/offer/selector tests, full tests and build/validators, independent bounded readback, and real desktop/mobile screenshots for both locale selectors with keyboard source-link focus.
  - MICE-02 source audit independently corroborated 4/4: raw Product NewCondition envelopes plus exact nested offers/variants confirmed for Master ES and Anywhere US; Master US Factory New and Anywhere ES Comprar nuevo confirmed. Source audit does not close the missing seller/evidence/date display: commercial UI acceptance remains pending MICE-03.

## Delivery and evidence
- Strategy: user-selected `feature-branch-chain`, cached before commits; initial forecast approximately 380 authored changed lines was advisory. Feature-only authored count before this documentation synchronization: approximately 667 lines (+648/-19), including new files and excluding generated CSP. Both profiles remain one coherent work unit; future PR boundaries are not invented and remote delivery remains human-owned and unauthorized. No content was compressed to fit the advisory budget.
- Reviewed boundary: base `a40f14b`; RDD disabled/unmanaged.
- Commit: `24b5221` (`feat(ratones): add demand-led Master 3S and Anywhere 3S profiles`), 13 files, +684/-19 = 703 authored changed lines. The committed tree exactly matched the verified staged tree; no commit-hook changes. State: locally complete, not published.
- Test-first evidence: initial inventory RED observed (6 expected failures, 332 passes); after drafting 337 passed and one erroneous test expected unknown USB data for Master instead of documented charging-only behavior. Parent corrected that expectation to `false` and asserted null standard dimensions without changing the sourced profile. Anywhere USB data remains null. Current focused GREEN: 338 passed.
- Functional verification observed: `npx vitest run src/lib/selector/ratones.test.ts src/lib/selector/scoring.test.ts` 338 passed; `npm test` 503 passed across 14 files; `npm run build` 463 pages, zero image conversions, unchanged CSP (17 hashes); `npm run validate:ratones-build` 22 profiles + 2 catalogs valid; `npm run validate:selector-build` 2 pages / 134 eligible products; `npm run validate:productos` 134 valid; `npm run validate:offers` integrity PASS; `git diff --check` PASS. All four new ES/EN routes locally generated; rendered text, localized headings, buyer caveats, source links and search/direct CTAs checked, not live publication claims.
- Commercial coverage before MICE-02: baseline integrity PASS for 132 products and strict coverage FAIL with 264 missing audits. MICE-01 `npm run validate:offers:coverage` FAIL with 268 missing audits (134 ES + 134 US), ES/US each 0/134 audited. This expected coverage gap is not a unit implementation failure or approval of offers.
- Risk: native assessment returned high/unassessable because of untracked files. High-tier ordinary independent checks complete: mouse tests 11 PASS, build validator 22 profiles + 2 catalogs PASS, diff-check PASS; standard Master box versus Bluetooth Edition and charging-only USB independently corroborated. No product/integration blocker; stale-document-only partial verdict addressed by this synchronization. RDD remains disabled/unmanaged.
- Parent spot check: `npx vitest run src/lib/selector/ratones.test.ts` 11 PASS.
- Writer continuity: serial premium writer exhausted quota after writes; resumed the same writer when the user reported restored quota. No parallel section writers.
- Engram mirror: maintained under `odd/ratones-master3s-anywhere3s/tasks`, observation 242; final commit evidence is synchronized before delivery.
- Next step: finish MICE-02, then isolate these feature commits on main and perform the explicitly authorized non-force push after final checks. Production deployment is not proven by push alone. Existing unrelated changes remain preserved outside this delivery.

## MICE-02 worker evidence (2026-10-09, commit pending)
- Focused exact command `npx vitest run src/lib/product-offers.test.ts src/lib/selector/ratones.test.ts`: 33 PASS; `npm test`: 504 PASS / 14 files. No artificial audit RED.
- `npm run validate:offers`: integrity PASS, ES 2/134, US 2/134; `npm run validate:offers:coverage`: expected FAIL, exactly 264 missing audits for the other 132 products. Not an all-catalog commercial PASS.
- Direct writer registry readback and actual helper execution (self-verification, not independent review): only the two mouse keys, exactly ES/US each, all four offers usable at actual clock `2026-10-09T19:34:04.104Z`. No converted prices, unavailable shortcuts or invented source attempts.
- `npm run build`: PASS, 463 pages, zero image conversions, 17 CSP hashes, no `public/_headers` diff. `npm run validate:productos`: 134 valid; `npm run validate:ratones-build`: 22 profiles + 2 catalogs valid; `npm run validate:selector-build`: 2 pages / 134 eligible; `git diff --check`: PASS.
- Source ledger: `docs/research/ratones-ofertas-2026-10-09.md`. Rendered surfaces to recheck: selector ES/EN results for either mouse (price/schema), both EN product caveats and Anywhere ES caveat. Prior MICE-01 visual proof does not establish this changed candidate.
- Following the independent 4/4 source corroboration, only mechanical source-label/evidence wording is corrected; original prices and checkedAt stay unchanged. Focused checks/build are repeated, not the prior 504-test full suite. MICE-02 stays unchecked until parent local data-unit commit, before MICE-03 UI attribution work; no worker staging, commit, remote action or publication. The original ten-route visual matrix passed but does not approve missing quote attribution; MICE-03 remains open. All pre-existing unrelated dirty paths preserved.
- Mechanical correction checks after the final source-label change: exact focused offer/mouse command 33 PASS; `npm run build` PASS (463 pages, zero image conversions, 17 CSP hashes, no `_headers` diff); `npm run validate:ratones-build` PASS (22 profiles + 2 catalogs); `npm run validate:offers` integrity PASS (ES 2/134, US 2/134, 264 pending); `git diff --check` PASS. Full-suite 504 PASS is prior evidence, not rerun here. MICE-02 independently audited 4/4 and ready for parent local commit; MICE-03 open, no commercial UI PASS. Only passive evidence synchronization followed these commands.
