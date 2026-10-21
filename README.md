# Spending Monitor App

## Scripts

| Command                 | What it does                                  |
| ----------------------- | --------------------------------------------- |
| `npm run dev`           | Start the dev server                          |
| `npm run build`         | Typecheck and build for production            |
| `npm run lint`          | Lint (fails on any warning)                   |
| `npm run typecheck`     | Typecheck app, tests, and e2e                 |
| `npm test`              | Unit/component tests in watch mode            |
| `npm run test:coverage` | Unit/component tests once, with coverage gate |
| `npm run test:e2e`      | Playwright tests against the production build |
| `npm run test:e2e:ui`   | Playwright in interactive UI mode             |

First-time e2e setup: `npx playwright install chromium`.

## API and mock data

The app talks to the spending API through typed React Query hooks:

- `src/api/queries.ts`: `useProfile`, `useSpendingSummary`,
  `useSpendingByCategory`, `useSpendingTrends`, `useTransactions`, `useGoals`,
  `useFilters`.
- `src/api/mutations.ts`: `useCreateGoal`, `useUpdateGoal`, `useDeleteGoal`.
- Every response is validated against the zod schemas in `src/api/schemas.ts`.

Until the real API exists, every request is answered by a mock running in the
browser (MSW, in `src/mocks/`), including in the deployed build. To control it:

| Variable            | Effect                                       |
| ------------------- | -------------------------------------------- |
| `VITE_ENABLE_MOCKS` | `"true"` (set in `.env`) serves the mock API |
| `VITE_API_BASE_URL` | Real API base URL; defaults to `/api`        |

How the mock behaves:

- **Transactions** are about 1,300 generated from a fixed seed over the last 25
  months, ending today. The same day always gives the same data.
- **Figures always agree.** Summary, categories, trends, goal progress and the
  profile total are all calculated from those transactions.
- **Errors follow the API contract.** Bad input returns 400, an unknown customer
  or goal 404, and a duplicate goal 409.
- **Goals are editable**, and changes are saved in the browser's localStorage so
  they survive a reload. Each visitor has their own copy. Run
  `localStorage.removeItem("moya-mock-db:v1:goals")` to reset.

Demo customer ID: `12345`.

## Testing

### Layers

- **Unit and component tests** (Vitest, jsdom, Testing Library) sit next to the
  code they test as `*.test.ts(x)`.
- **End-to-end tests** (Playwright) live in `e2e/` and run against the
  production build on a desktop and a mobile viewport. Use them for anything
  jsdom cannot do: layout, CSS, focus styles, scroll locking, colour contrast.

### Writing component tests

- Render with `renderWithProviders()` from `src/test/render.tsx`, not plain
  `render()`. It wraps the component in React Query (fresh client per test, no
  retries), the router (`route` option sets the URL) and a test i18n instance,
  and returns a ready `user` from `userEvent.setup()`.
- Query by role and label (`getByRole`, `getByLabelText`). Use `getByTestId`
  only for elements with no accessible role.
- Build test data with the factories in `src/test/factories.ts` and override
  only the fields the test cares about.
- Call `expectNoA11yViolations(container)` from `src/test/axe.ts` for any new
  page or interactive component.

### Network

All HTTP is mocked with MSW. Default handlers live in `src/mocks/handlers.ts`.
Override them in a single test with `server.use(...)`; overrides reset after
each test. A request with no handler **fails the test**.

### Translations

- Translation keys are type-checked against `src/i18n/locales/en.json`, so a
  typo is a compile error.
- In tests, a missing key throws instead of rendering the raw key.

### Quality gates

- **Pre-commit:** lint and format staged files, run only the tests related to
  them, typecheck.
- **CI (`.github/workflows/ci.yml`):** typecheck, lint, format, unit tests with
  an 80% coverage threshold, build, and Playwright e2e. The HTML coverage report
  and, on failure, the Playwright report are uploaded as artifacts.
