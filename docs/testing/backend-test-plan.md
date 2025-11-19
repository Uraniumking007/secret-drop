<!-- Detailed Vitest backend coverage plan -->
# Backend Test Plan

All suites live under `tests/backend/**` and reuse existing Vitest configuration. Each suite lists its focus, dependencies, and notable scenarios. Shared fixtures (`tests/backend/fixtures/`) will supply Drizzle test DB, encryption keys, and auth tokens.

## 1. Secrets Core

| Suite | Coverage | Notes |
| --- | --- | --- |
| `tests/backend/secrets/crud.test.ts` | Create/read/update/delete secret flows using `src/lib/secret-utils.ts` with Drizzle models in `src/db/schema.ts`. | Mock `crypto.randomUUID`, ensure payload hashing + metadata persistence. |
| `tests/backend/secrets/expiration.test.ts` | Time-based expiration windows (1h/1d/7d) and scheduler hooks. | Freeze timers with Vitest, assert database flag transitions and UI payload data. |
| `tests/backend/secrets/password-protection.test.ts` | Secondary password hashing + verification pipeline. | Verify PBKDF2 iterations in `src/lib/encryption.ts`, rejection of invalid passwords. |
| `tests/backend/secrets/view-limits.test.ts` | View counters and enforcement per secret. | Simulate repeated views, ensure `maxViews` reached triggers deletion. |
| `tests/backend/secrets/burn-on-read.test.ts` | Pro-only burn-on-read deletes content immediately. | Validate logs and deletion order. |
| `tests/backend/secrets/revocation.test.ts` | Admin instant revocation + event emission. | Confirm revocation cascades to cache, background job stub. |
| `tests/backend/secrets/recovery.test.ts` | Business trash-bin restore up to 30 days. | Time-travel tests, confirm restored data retains metadata, audit logs updated. |

## 2. Cryptography & Security

| Suite | Coverage | Notes |
| --- | --- | --- |
| `tests/backend/lib/encryption.test.ts` | AES-256 encrypt/decrypt helpers, PBKDF2, random salt handling. | Compare against NIST vectors, ensure deterministic auth tag length. |
| `tests/backend/lib/two-factor.test.ts` | OTP generation/verification. | Ensure drift handling + backup codes hashed. |
| `tests/backend/security/ip-allowlist.test.ts` | IP allow-list enforcement in `src/lib/rbac.ts`. | Validate CIDR parsing and failure modes. |
| `tests/backend/security/siem-webhooks.test.ts` | Webhook payload formatting for SIEM integration. | Use snapshot tests for Splunk/Datadog payloads. |

## 3. RBAC, Auth, and Subscription

| Suite | Coverage | Notes |
| --- | --- | --- |
| `tests/backend/rbac/policies.test.ts` | Role enforcement for Owner/Admin/Member across workspaces. | Table-driven tests mapping tier to permissions. |
| `tests/backend/auth/session.test.ts` | Session bootstrap using `src/lib/auth.ts` and `better-auth` adapter. | Mock provider responses, ensure token refresh. |
| `tests/backend/subscription/tier-gates.test.ts` | Feature gating by subscription (`src/lib/subscription.ts`). | Ensure free vs pro vs business restrictions align to matrix. |

## 4. Organizations & Teams

| Suite | Coverage | Notes |
| --- | --- | --- |
| `tests/backend/orgs/workspace-crud.test.ts` | Create/update/delete org workspaces, slug uniqueness. | Include migration coverage for `better-auth_migrations`. |
| `tests/backend/rbac/team-management.test.ts` | Adding/removing members, subgroup assignments. | Assert notifications and audit entries. |
| `tests/backend/orgs/scoped-sharing.test.ts` | Scoped sharing pipeline for secrets. | Validate only team members receive decrypt instructions. |

## 5. Audit & Logging

| Suite | Coverage | Notes |
| --- | --- | --- |
| `tests/backend/logs/activity-window.test.ts` | 24-hour rolling logs for free tier. | Use synthetic events to verify TTL. |
| `tests/backend/logs/audit-retention.test.ts` | 30-day retention for Pro. | Check compaction job boundaries. |
| `tests/backend/logs/compliance-history.test.ts` | Permanent logs for Business tier. | Ensure append-only semantics + pagination. |

## 6. Integrations

| Suite | Coverage | Notes |
| --- | --- | --- |
| `tests/backend/api-tokens/token-creation.test.ts` | Token creation, hashing, and rate limits. | Reference `src/lib/api-tokens.ts`. |
| `tests/backend/api-tokens/usage-limits.test.ts` | Inject tokens into CI/CD contexts. | Validate scope enforcement + expiration. |
| `tests/backend/sso/providers.test.ts` | Google/Okta/Azure adapters in `src/lib/sso/providers.ts`. | Mock OAuth discovery endpoints. |
| `tests/backend/billing/stripe-webhook.test.ts` | Stripe webhook handlers (`src/lib/stripe.ts`). | Replay fixtures for subscription upgrades/downgrades. |

## Shared Fixtures & Utilities

- `tests/backend/fixtures/db.ts`: spins up in-memory SQLite via Drizzle migrations.
- `tests/backend/fixtures/auth.ts`: issues signed JWTs/OAuth responses.
- `tests/backend/fixtures/crypto.ts`: deterministic key material for reproducible assertions.

> Completing this plan unblocks frontend, developer-experience, and integration test steps.
