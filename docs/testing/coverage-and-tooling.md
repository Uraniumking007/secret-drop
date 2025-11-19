<!-- Coverage targets and tooling updates -->
# Coverage Targets & Tooling Updates

## 1. Coverage Thresholds

| Area | File Pattern | Target |
| --- | --- | --- |
| Backend logic | `src/lib/**/*.ts`, `src/db/**/*.ts`, `src/routes/api*.tsx` | 90% statements / 85% branches |
| Frontend routes/components | `src/routes/**/*.tsx`, `src/components/**/*.tsx` | 85% statements / 80% branches |
| Developer experience (CLI) | `cli/src/**/*.ts` | 90% statements / 90% branches |
| Integration suites | `tests/integration/**/*.test.ts` | Scenario completeness tracked via checklist, no numeric gate |

- Enforce thresholds in Vitest config via `coverage.thresholds` block and fail CI when unmet.

## 2. Reporting & CI

- Update `vitest.config.ts` to output `lcov` and `text-summary`.
- CI workflow (Netlify/other pipeline) to add `bun test --coverage` job and upload artifacts to Codecov (or `lcov-report/` in Netlify build).
- Introduce `pnpm` alias? repo rule says use Bun; command: `bun test --coverage`.

## 3. Tooling Enhancements

- Shared test utilities packages:
  - `tests/shared/fixtures/` for DB/auth/crypto reused by backend and integration suites.
  - `tests/shared/render.tsx` for frontend wrappers (Router, QueryClient, Theme).
- Add MSW server bootstrap in `tests/frontend/setup.ts` and reference from Vitest `setupFiles`.
- Document `bunx` commands for generating shadcn components used in tests (mock stubs).

## 4. Maintenance

- Add `docs/testing/README.md` summarizing structure (linking to traceability + plans) – optional but recommended.
- Establish PR checklist item: “Touches feature? add/update tests per traceability matrix”.
- Schedule weekly coverage report in CI pipeline, failing if coverage regresses >2% vs main.

