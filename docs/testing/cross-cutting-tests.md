<!-- Integration & security suite plan -->

# Cross-Cutting Integration & Security Tests

Focus: multi-step flows across backend, frontend, and developer tooling using Vitest with `@tanstack/router` test harness + supertest-alike HTTP layer. Suites stored in `tests/integration/**`.

## 1. Secret Lifecycle Flow

- **File:** `tests/integration/secret-lifecycle.test.ts`
- **Scenario:** User (Free → Pro upgrade) creates secret, sets expiration, shares to org, burn-on-read, verify audit log + recovery.
- **Coverage:** Exercises `src/routes/dashboard/secrets/create.tsx`, `src/lib/secret-utils.ts`, `src/lib/subscription.ts`, `src/lib/rbac.ts`, and DB migrations.

## 2. Scoped Team Sharing

- **File:** `tests/integration/team-sharing.test.ts`
- **Scenario:** Org Admin creates subgroup, shares secret with team, Member confirms access, non-member rejected.
- **Coverage:** `src/routes/dashboard/settings/team.tsx`, `src/components/secrets/SecretShareDrawer.tsx`, backend RBAC policies.

## 3. Incident Response & Revocation

- **File:** `tests/integration/revocation-audit.test.ts`
- **Scenario:** Admin revokes secret mid-session; clients attempt reuse; audit trail reflects revocation + compliance log entry.
- **Coverage:** `src/components/secrets/SecretActionsMenu.tsx`, `src/lib/secret-utils.ts`, logging stack.

## 4. Security Regression Pack

- **File:** `tests/integration/security-regression.test.ts`
- **Scenarios:** AES integrity tampering, IP allow-list enforcement, SSO enforcement fallback, API token misuse.
- **Coverage:** `src/lib/encryption.ts`, `src/lib/rbac.ts`, `src/lib/sso/providers.ts`, `src/lib/api-tokens.ts`.

## 5. Billing & Tier Upsell

- **File:** `tests/integration/billing-upgrade.test.ts`
- **Scenario:** User hits tier gate (audit logs >24h), upgrade via Stripe, unlock Pro features instantly.
- **Coverage:** `src/lib/stripe.ts`, `src/lib/subscription.ts`, `src/components/TierBadge.tsx`, router loaders.

## 6. Developer Workflow

- **File:** `tests/integration/cli-ci-workflow.test.ts`
- **Scenario:** CLI creates token → pipeline injects secret → dashboard logs show CI usage.
- **Coverage:** CLI package, API token backend, audit log UI.

> These suites rely on shared fixtures `tests/integration/fixtures/system.ts` (bootstraps app server) and `tests/integration/fixtures/user-sessions.ts`.
