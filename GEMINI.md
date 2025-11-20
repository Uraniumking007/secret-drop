# Project Overview

This is a full-stack web application built with the T.A.N. stack (Tailwind, TanStack, tRPC) and Next.js. It is a multi-tenant, feature-rich application with a focus on secure secret sharing.

## Main Technologies

- **Framework:** [TanStack Start](https://tanstack.com/start/latest)
- **UI:** [React](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Routing:** [TanStack Router](https://tanstack.com/router/latest)
- **Data Fetching:** [TanStack Query](https://tanstack.com/query/latest)
- **State Management:** [TanStack Store](https://tanstack.com/store/latest)
- **API:** [tRPC](https://trpc.io/)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication:** [Better Auth](https://better-auth.dev/)
- **Deployment:** [Netlify](https://www.netlify.com/)

## Architecture

The application is a modern full-stack application with a React-based frontend and a tRPC-based API. It uses a PostgreSQL database with Drizzle ORM for database access. The application is designed to be multi-tenant, with support for organizations, teams, and role-based access control (RBAC). The core feature of the application is the ability to securely share secrets.

# Building and Running

## Prerequisites

- [Bun](https://bun.sh/)
- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)

## Installation

```bash
bun install
```

## Running the Application

To run the application in development mode, use the following command:

```bash
bun --bun run start
```

This will start the development server on `http://localhost:3000`.

## Building for Production

To build the application for production, use the following command:

```bash
bun --bun run build
```

## Testing

The project uses [Vitest](https://vitest.dev/) for testing. You can run the tests with:

```bash
bun --bun run test
```

# Development Conventions

## Linting and Formatting

This project uses [eslint](https://eslint.org/) and [prettier](https://prettier.io/) for linting and formatting. The following scripts are available:

- `bun --bun run lint`: Lints the code.
- `bun --bun run format`: Formats the code.
- `bun --bun run check`: Formats and lints the code.

## Database Migrations

The project uses [Drizzle Kit](https://orm.drizzle.team/kit/overview) for database migrations. The following scripts are available:

- `bun --bun run db:generate`: Generates a new migration based on schema changes.
- `bun --bun run db:migrate`: Applies pending migrations to the database.
- `bun --bun run db:push`: Pushes schema changes to the database without creating a migration file.
- `bun --bun run db:studio`: Starts the Drizzle Studio.

# Project Feature Plan - Secretdrop: Feature List & Monetization Tiers

This document outlines the complete feature set for Secretdrop, categorized by the plan tier they belong to. This structure is designed to clearly differentiate value between free (Individual) and paid (Team/Business) users.

---

## 1. Free Tier: "The Developer"

- **Target:** Individual developers, freelancers, and hobbyists.
- **Value:** Adoption, trust, and personal utility.

- **🔒 Personal Workspace:** A private dashboard for managing personally owned secrets.
- **🛡️ Standard End-to-End Encryption:** AES-256 client-side encryption for all drops.
- **⏱️ Time-Based Expiration:** Secrets auto-delete after set intervals (1 hour, 1 day, 7 days).
- **🔑 Password Protection:** Option to secure links with a secondary password.
- **👀 Basic View Limits:** Cap the number of times a link can be viewed (e.g., max 10 views).
- **📋 24-Hour Activity Log:** See who accessed your secret (IP/User Agent) for the last 24 hours only.
- **🌓 Dark/Light Mode:** Full access to the "Deepwater" theme.

---

## 2. Pro Team Tier: "The Collaborator"

- **Target:** Startups and agile teams.
- **Value:** Collaboration, centralization, and enhanced visibility.

- **🏢 Organization Workspaces:** Create shared workspaces (`Acme Inc`) distinct from personal accounts.
- **👥 Team Management:** Create sub-groups (`@frontend`, `@devops`) and assign members to them.
- **🎯 Scoped Sharing:** Share secrets directly with a specific Team (no link copy-pasting required).
- **🔥 Burn-on-Read:** Advanced expiration setting where the secret is physically deleted immediately after 1 view.
- **📜 30-Day Audit Trail:** Extended access history for all secrets to debug access issues or monitor security.
- **🚫 Instant Revocation:** Ability for Org Admins to delete a secret or revoke a user's access instantly across the whole organization.
- **👑 Role-Based Access Control (RBAC):** Assign `Owner`, `Admin`, and `Member` roles to control who can invite users or delete secrets.

---

## 3. Business Tier: "The Enterprise"

- **Target:** Scale-ups and corporations with compliance needs.
- **Value:** Governance, security compliance, and integration.

- **♾️ Permanent Compliance Logs:** Unlimited history of every access event (view, edit, delete) for compliance auditing.
- **🔐 Single Sign-On (SSO):** Enforce login via Google Workspace, Okta, or Azure AD.
- **🌐 IP Allow-listing:** Restrict access to secrets so they can only be decrypted when the user is on a corporate VPN or office IP.
- **♻️ Secret Recovery:** A "Trash Bin" feature allowing admins to restore accidentally deleted secrets for up to 30 days.
- **📢 SIEM Integration:** (Future) Webhooks to stream audit logs to external security tools like Splunk or Datadog.

---

## 4. Developer Experience (Add-ons)

_Can be included in Pro or billed separately._

- **💻 Secretdrop CLI:** Create and fetch secrets directly from the terminal (e.g., `secretdrop get DB_PASS`).
- **🤖 CI/CD Injection:** API tokens to securely inject secrets into GitHub Actions or Vercel deployments without storing them in plain text in the repo settings.

---

## Summary of Restrictions (The "Upsell" Drivers)

| Feature        | Free Tier     | Pro Team            | Business       |
| :------------- | :------------ | :------------------ | :------------- |
| **Workspaces** | Personal Only | Unlimited Orgs      | Unlimited Orgs |
| **Members**    | 1 (Self)      | Tiered (e.g., 5-20) | Unlimited      |
| **Audit Logs** | Last 24 Hours | 30 Days             | Permanent      |
| **Expiration** | Time-based    | Burn-on-Read + Time | All Options    |
| **SSO**        | No            | No                  | Yes            |
| **Support**    | Community     | Email               | Priority       |

# Standards

- implement proper error handling

### Tools Preference

- prefer web search for documentation
- use shell commands for git operations
- enable auto accept for safe operations
