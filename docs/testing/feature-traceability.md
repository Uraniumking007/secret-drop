<!-- Traceability between feature tiers and code modules -->
# Feature → Module Traceability

Each Secretdrop feature maps to concrete modules so we can plan Vitest coverage confidently. The “Tests” column lists the future suite or file that will cover the functionality.

## Free Tier – “The Developer”

| Feature | Primary Modules | Planned Tests |
| --- | --- | --- |
| Personal workspace dashboard | `src/routes/dashboard/index.tsx`, `src/components/dashboard/*`, `src/lib/auth-client.ts` | `tests/frontend/dashboard/personal-workspace.test.tsx` (UI and routing), `tests/backend/auth/session.test.ts` |
| AES-256 client-side encryption | `src/lib/encryption.ts`, `src/lib/secret-utils.ts`, `src/lib/two-factor.ts` | `tests/backend/lib/encryption.test.ts`, `tests/backend/lib/secret-utils.test.ts` (round-trip + compliance vectors) |
| Time-based expiration (1h/1d/7d) | `src/lib/secret-utils.ts`, `src/routes/dashboard/secrets/create.tsx`, `src/components/secrets/SecretExpirationPicker.tsx` | `tests/backend/secrets/expiration.test.ts`, `tests/frontend/secrets/expiration-picker.test.tsx` |
| Password-protected links | `src/lib/secret-utils.ts`, `src/routes/dashboard/secrets/_secretId.tsx`, `src/components/secrets/SecretShareCard.tsx` | `tests/backend/secrets/password-protection.test.ts`, `tests/frontend/secrets/password-gate.test.tsx` |
| View limits (10 max) | `src/lib/secret-utils.ts`, `src/routes/dashboard/secrets/_secretId.tsx`, `src/components/secrets/ViewCounter.tsx` | `tests/backend/secrets/view-limits.test.ts`, `tests/frontend/secrets/view-counter.test.tsx` |
| 24-hour activity log | `src/components/dashboard/ActivityFeed.tsx`, `src/lib/secret-utils.ts`, `src/routes/dashboard/index.tsx` | `tests/backend/logs/activity-window.test.ts`, `tests/frontend/dashboard/activity-feed.test.tsx` |
| Dark/Light mode (`Deepwater` theme) | `src/components/ThemeToggle.tsx`, `src/lib/theme.tsx`, `src/routes/__root.tsx` | `tests/frontend/theme/theme-toggle.test.tsx`, `tests/frontend/theme/server-prefers.test.tsx` |

## Pro Team Tier – “The Collaborator”

| Feature | Primary Modules | Planned Tests |
| --- | --- | --- |
| Organization workspaces | `src/routes/dashboard/organizations/*.tsx`, `src/lib/rbac.ts`, `src/lib/subscription.ts`, `src/db/schema.ts` | `tests/backend/orgs/workspace-crud.test.ts`, `tests/frontend/organizations/workspace-flow.test.tsx` |
| Team management & sub-groups | `src/components/teams/TeamMembersTable.tsx`, `src/routes/dashboard/settings/team.tsx`, `src/lib/rbac.ts` | `tests/backend/rbac/team-management.test.ts`, `tests/frontend/settings/team-management.test.tsx` |
| Scoped sharing to team | `src/components/secrets/SecretShareDrawer.tsx`, `src/lib/rbac.ts`, `src/lib/secret-utils.ts` | `tests/backend/secrets/scoped-sharing.test.ts`, `tests/frontend/secrets/share-drawer.test.tsx` |
| Burn-on-read secrets | `src/lib/secret-utils.ts`, `src/routes/dashboard/secrets/_secretId.tsx`, `src/components/secrets/BurnOnReadToggle.tsx` | `tests/backend/secrets/burn-on-read.test.ts`, `tests/frontend/secrets/burn-toggle.test.tsx` |
| 30-day audit trail | `src/lib/secret-utils.ts`, `src/db/schema.ts` (audit table), `src/components/settings/AuditLogPanel.tsx` | `tests/backend/logs/audit-retention.test.ts`, `tests/frontend/settings/audit-log-panel.test.tsx` |
| Instant revocation | `src/lib/secret-utils.ts`, `src/lib/rbac.ts`, `src/components/secrets/SecretActionsMenu.tsx` | `tests/backend/secrets/revocation.test.ts`, `tests/frontend/secrets/actions-menu.test.tsx` |
| Role-based access control | `src/lib/rbac.ts`, `src/lib/auth.ts`, `src/routes/dashboard/settings/index.tsx` | `tests/backend/rbac/policies.test.ts`, `tests/frontend/settings/access-gates.test.tsx` |

## Business Tier – “The Enterprise”

| Feature | Primary Modules | Planned Tests |
| --- | --- | --- |
| Permanent compliance logs | `src/db/schema.ts`, `src/lib/secret-utils.ts`, `src/components/settings/ComplianceLogs.tsx` | `tests/backend/logs/compliance-history.test.ts`, `tests/frontend/settings/compliance-log.test.tsx` |
| SSO enforcement (Google/Okta/Azure) | `src/lib/sso/providers.ts`, `src/routes/auth.login.tsx`, `src/lib/auth.ts` | `tests/backend/sso/providers.test.ts`, `tests/frontend/auth/sso-buttons.test.tsx` |
| IP allow-listing | `src/lib/rbac.ts`, `src/lib/utils.ts`, `src/routes/dashboard/settings/ip-allowlist.tsx` | `tests/backend/security/ip-allowlist.test.ts`, `tests/frontend/settings/ip-allowlist.test.tsx` |
| Secret recovery / trash bin | `src/lib/secret-utils.ts`, `src/routes/dashboard/secrets/trash.tsx`, `src/components/secrets/SecretRecoveryTable.tsx` | `tests/backend/secrets/recovery.test.ts`, `tests/frontend/secrets/trash-table.test.tsx` |
| SIEM integration webhooks | `src/lib/secret-utils.ts`, `src/lib/stripe.ts`, `src/lib/utils.ts`, `src/routes/api.trpc.$.tsx` | `tests/backend/integrations/siem-webhooks.test.ts`, `tests/backend/trpc/log-stream.test.ts` |

## Developer Experience Add-ons

| Feature | Primary Modules | Planned Tests |
| --- | --- | --- |
| Secretdrop CLI | `cli/src/index.ts`, `src/lib/api-tokens.ts`, `src/lib/auth-client.ts` | `tests/developer-experience/cli.test.ts`, `tests/backend/api-tokens/usage-limits.test.ts` |
| CI/CD secret injection | `src/lib/api-tokens.ts`, `src/lib/subscription.ts`, `src/components/settings/ApiTokensSettings.tsx`, `src/routes/dashboard/settings/api-tokens.tsx` | `tests/backend/api-tokens/token-creation.test.ts`, `tests/frontend/settings/api-tokens.test.tsx`, `tests/integration/ci-token-injection.test.ts` |

## Monetization & Tier Enforcement

| Control | Primary Modules | Planned Tests |
| --- | --- | --- |
| Tier gating | `src/lib/subscription.ts`, `src/lib/rbac.ts`, `src/components/TierBadge.tsx`, `src/routes/dashboard/settings.tsx` | `tests/backend/subscription/tier-gates.test.ts`, `tests/frontend/settings/tier-badge-flow.test.tsx` |
| Billing/Stripe integration | `src/lib/stripe.ts`, `src/routes/dashboard/settings/billing.tsx`, `src/components/settings/BillingPortal.tsx` | `tests/backend/billing/stripe-webhook.test.ts`, `tests/frontend/settings/billing-portal.test.tsx` |

> The table will guide creation of detailed suite specs in subsequent steps of the plan.

