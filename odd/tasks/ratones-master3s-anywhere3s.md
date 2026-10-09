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
- [ ] MICE-01 — Add both bilingual profiles, inventory integration, source evidence and documentation; verify the complete work unit and commit it.
  - Route: delegated direct. Reading prepares editorial writing and multiple non-trivial files change; writers run serially.
  - Acceptance checks complete locally: four generated product routes, eleven mice, truthful receiver/edition caveats and complete EN parity. No files staged; public publication not verified or authorized. Checkbox remains unchecked until the parent records the local commit.
  - Test-first: update inventory expectations and observe a missing-profile RED before adding products; no artificial RED for prose.
  - Checks: focused mouse/scoring tests; full `npm test`; `npm run build`; `npm run validate:ratones-build`; `npm run validate:selector-build`; `npm run validate:productos`; `npm run validate:offers`; strict offer coverage reported separately; `git diff --check`.
  - Build-generated CSP changes must be inspected and handled without overwriting unrelated state.
  - Ordinary independent read-only verification complete after native risk assessment with RDD off; parent repeated the mouse test file (11 passed). Independent product/integration checks found no blocker; its partial verdict concerned only stale documentation synchronized here.
  - Rollback boundary: remove these two YAML profiles and revert their inventory/test/documentation edits, leaving pre-existing products and unrelated work intact.

## Delivery and evidence
- Strategy: user-selected `feature-branch-chain`, cached before commits; initial forecast approximately 380 authored changed lines was advisory. Feature-only authored count before this documentation synchronization: approximately 667 lines (+648/-19), including new files and excluding generated CSP. Both profiles remain one coherent work unit; future PR boundaries are not invented and remote delivery remains human-owned and unauthorized. No content was compressed to fit the advisory budget.
- Reviewed boundary: base `a40f14b`; RDD disabled/unmanaged.
- Commit: pending parent local work-unit commit; no commit identity exists yet. State: ready for local commit, not closed or published.
- Test-first evidence: initial inventory RED observed (6 expected failures, 332 passes); after drafting 337 passed and one erroneous test expected unknown USB data for Master instead of documented charging-only behavior. Parent corrected that expectation to `false` and asserted null standard dimensions without changing the sourced profile. Anywhere USB data remains null. Current focused GREEN: 338 passed.
- Functional verification observed: `npx vitest run src/lib/selector/ratones.test.ts src/lib/selector/scoring.test.ts` 338 passed; `npm test` 503 passed across 14 files; `npm run build` 463 pages, zero image conversions, unchanged CSP (17 hashes); `npm run validate:ratones-build` 22 profiles + 2 catalogs valid; `npm run validate:selector-build` 2 pages / 134 eligible products; `npm run validate:productos` 134 valid; `npm run validate:offers` integrity PASS; `git diff --check` PASS. All four new ES/EN routes locally generated; rendered text, localized headings, buyer caveats, source links and search/direct CTAs checked, not live publication claims.
- Commercial coverage: baseline integrity PASS for 132 products and strict coverage FAIL with 264 missing audits. Current `npm run validate:offers:coverage` FAIL with 268 missing audits (134 ES + 134 US), ES/US each 0/134 audited. This expected coverage gap is not a unit implementation failure or approval of offers.
- Risk: native assessment returned high/unassessable because of untracked files. High-tier ordinary independent checks complete: mouse tests 11 PASS, build validator 22 profiles + 2 catalogs PASS, diff-check PASS; standard Master box versus Bluetooth Edition and charging-only USB independently corroborated. No product/integration blocker; stale-document-only partial verdict addressed by this synchronization. RDD remains disabled/unmanaged.
- Parent spot check: `npx vitest run src/lib/selector/ratones.test.ts` 11 PASS.
- Writer continuity: serial premium writer exhausted quota after writes; resumed the same writer when the user reported restored quota. No parallel section writers.
- Engram mirror: full current task text and repository-relative locator synchronized under `odd/ratones-master3s-anywhere3s/tasks`, observation 242; parent will fill commit identity after the local commit and refresh the mirror.
- Next step: parent local work-unit commit and commit-identity documentation update. Human publication approval and all remote actions remain pending; no push, PR, merge or deployment authorized.
