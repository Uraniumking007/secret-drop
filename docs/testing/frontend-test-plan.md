<!-- Frontend Vitest + React Testing Library coverage plan -->
# Frontend Test Plan

All suites live under `tests/frontend/**` using Vitest + React Testing Library + MSW for network mocks. Suites ensure tier gating, navigation, and state stores behave consistently across light/dark themes.

## 1. Shell & Navigation

| Suite | Coverage | Notes |
| --- | --- | --- |
| `tests/frontend/root/app-shell.test.tsx` | `src/routes/__root.tsx`, theme loader, global providers. | Verify TanStack Router integration, theme persistence, query devtools toggling. |
| `tests/frontend/router/dashboard-navigation.test.tsx` | `src/routes/dashboard.tsx`, sidebar navigation (`src/components/dashboard/Sidebar.tsx`). | Assert active link states, tier badge visibility. |

## 2. Secrets UX

| Suite | Coverage | Notes |
| --- | --- | --- |
| `tests/frontend/secrets/create-form.test.tsx` | `src/routes/dashboard/secrets/create.tsx`, `src/components/secrets/SecretForm.tsx`. | Validate validation rules, expiration presets, password toggle. |
| `tests/frontend/secrets/share-drawer.test.tsx` | `src/components/secrets/SecretShareDrawer.tsx`. | Ensure scoped sharing controls appear per tier. |
| `tests/frontend/secrets/view-counter.test.tsx` | `src/components/secrets/ViewCounter.tsx`. | Simulate view increments, error states when limit reached. |
| `tests/frontend/secrets/burn-toggle.test.tsx` | `src/components/secrets/BurnOnReadToggle.tsx`. | Only Pro users see toggle; confirm tooltip copy for Free tier. |
| `tests/frontend/secrets/trash-table.test.tsx` | `src/components/secrets/SecretRecoveryTable.tsx`, `src/routes/dashboard/secrets/trash.tsx`. | Check restore/empty actions and confirmation dialogs. |

## 3. Dashboard Panels

| Suite | Coverage | Notes |
| --- | --- | --- |
| `tests/frontend/dashboard/activity-feed.test.tsx` | `src/components/dashboard/ActivityFeed.tsx`. | Render last 24h vs 30-day vs permanent columns depending on tier. |
| `tests/frontend/dashboard/personal-workspace.test.tsx` | `src/routes/dashboard/index.tsx`, `src/components/dashboard/OverviewCards.tsx`. | Ensure cards reflect secret counts, upcoming expirations. |
| `tests/frontend/dashboard/profile-card.test.tsx` | `src/routes/dashboard/profile.tsx`, `src/components/profile/ProfileCard.tsx`. | Assert user metadata, team invites. |

## 4. Settings & Admin

| Suite | Coverage | Notes |
| --- | --- | --- |
| `tests/frontend/settings/general.test.tsx` | `src/routes/dashboard/settings/index.tsx`, `src/components/settings/SettingsLayout.tsx`. | Snapshot navigation, tier-specific tabs. |
| `tests/frontend/settings/team-management.test.tsx` | `src/routes/dashboard/settings/team.tsx`, `src/components/teams/TeamMembersTable.tsx`. | Add/remove members, role dropdowns, API result handling. |
| `tests/frontend/settings/api-tokens.test.tsx` | `src/routes/dashboard/settings/api-tokens.tsx`, `src/components/settings/ApiTokensSettings.tsx`. | Token list, copy-to-clipboard, revoke flow. |
| `tests/frontend/settings/audit-log-panel.test.tsx` | `src/components/settings/AuditLogPanel.tsx`. | Pagination, tier-limited retention messaging. |
| `tests/frontend/settings/compliance-log.test.tsx` | `src/components/settings/ComplianceLogs.tsx`. | Business-only gating, empty states. |
| `tests/frontend/settings/ip-allowlist.test.tsx` | `src/routes/dashboard/settings/ip-allowlist.tsx`. | Form validation for CIDR, feedback toasts. |
| `tests/frontend/settings/billing-portal.test.tsx` | `src/components/settings/BillingPortal.tsx`. | Ensure Stripe portal link vs upgrade CTA for Free tier. |

## 5. Organizations & Teams

| Suite | Coverage | Notes |
| --- | --- | --- |
| `tests/frontend/organizations/workspace-flow.test.tsx` | `src/routes/organizations/index.tsx`, `src/components/teams/WorkspaceList.tsx`. | Create workspace wizard, slug validation. |
| `tests/frontend/organizations/role-gates.test.tsx` | `src/lib/rbac.ts` hooks, `src/routes/dashboard/settings.tsx`. | Ensure UI hides restricted actions. |

## 6. Auth Flows

| Suite | Coverage | Notes |
| --- | --- | --- |
| `tests/frontend/auth/login.test.tsx` | `src/routes/auth.login.tsx`. | Form validation, SSO button gating by tier. |
| `tests/frontend/auth/signup.test.tsx` | `src/routes/auth.signup.tsx`. | Plan selection, marketing copy toggles. |
| `tests/frontend/auth/verify-email.test.tsx` | `src/routes/auth.verify-email.tsx`. | Polling states, resend cooldown. |
| `tests/frontend/auth/sso-buttons.test.tsx` | `src/components/auth/SsoProviders.tsx`. | Ensure Business-only enforcement, fallback messaging. |

## 7. Presentation & Theme

| Suite | Coverage | Notes |
| --- | --- | --- |
| `tests/frontend/theme/theme-toggle.test.tsx` | `src/components/ThemeToggle.tsx`. | Light/dark toggles, keyboard shortcuts. |
| `tests/frontend/theme/server-prefers.test.tsx` | `src/lib/theme.tsx`. | SSR theme detection, localStorage fallbacks. |
| `tests/frontend/components/tier-badge.test.tsx` | `src/components/TierBadge.tsx`. | Badge states, tooltip copy. |

## Tooling

- Shared MSW handlers in `tests/frontend/mocks/handlers.ts`.
- Test utilities in `tests/frontend/utils/render.tsx` wrap Router providers, QueryClient, and Theme context.

> With this plan, every UI entry point tied to a tiered feature has a dedicated suite ensuring parity with backend enforcement.

