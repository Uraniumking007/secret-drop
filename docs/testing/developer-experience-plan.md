<!-- Developer Experience coverage strategy -->

# Developer Experience Test Plan

All suites live under `tests/developer-experience/**` and validate CLI + CI integrations end-to-end using Vitest + node test harness utilities.

## 1. CLI (`cli/src/index.ts`)

| Suite                                                  | Coverage                                            | Notes                                                                              |
| ------------------------------------------------------ | --------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `tests/developer-experience/cli/help.test.ts`          | `secretdrop --help` output, command list, examples. | Snapshot text, ensure instructions updated per feature tier.                       |
| `tests/developer-experience/cli/create-secret.test.ts` | `secretdrop create` command.                        | Mock API client, ensure encryption pipeline matches web, confirm expiration flags. |
| `tests/developer-experience/cli/get-secret.test.ts`    | `secretdrop get <token>` flow.                      | Validate burn-on-read semantics, password prompts (TTY mock).                      |
| `tests/developer-experience/cli/list-secrets.test.ts`  | Listing for personal vs org workspace.              | Enforce RBAC filtering and tier gating.                                            |
| `tests/developer-experience/cli/config.test.ts`        | Token persistence, environment overrides.           | Ensure `.secretdroprc` parsing, mask secrets in logs.                              |

### Fixtures

- `tests/developer-experience/fixtures/mock-api.ts` – intercept HTTP requests to `src/lib/api-tokens.ts` endpoints.
- `tests/developer-experience/fixtures/mock-terminal.ts` – simulate stdin/stdout for prompts.

## 2. CI/CD Injection

| Suite                                                  | Coverage                                 | Notes                                                         |
| ------------------------------------------------------ | ---------------------------------------- | ------------------------------------------------------------- |
| `tests/developer-experience/ci/github-actions.test.ts` | GitHub Actions usage example.            | Parse workflow snippet in `docs/`, ensure token scopes align. |
| `tests/developer-experience/ci/vercel-deploy.test.ts`  | Vercel env injection example.            | Validate TTLs and audit logs.                                 |
| `tests/developer-experience/ci/custom-runner.test.ts`  | Generic runner using API token env vars. | Simulate rate limit errors, ensure helpful messaging.         |

## 3. Documentation Validation

| Suite                                              | Coverage                                     | Notes                                                                   |
| -------------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------- |
| `tests/developer-experience/docs/snippets.test.ts` | Extract CLI/CI snippets from README or docs. | Ensure code samples compile (TypeScript) and CLI snippets stay updated. |

> These suites guarantee that automation consumers (CLI, CI, docs) receive the same guarantees as the dashboard UI.
