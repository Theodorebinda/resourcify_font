# E2E Tests - User Lifecycle

## Overview

End-to-end tests for Ressourcefy validate the complete user lifecycle from registration to app access. Tests use **real routing with middleware enabled** and **no mocking of frontend guards**.

## Test Framework

- **Playwright** - Modern E2E testing framework
- **Real Backend** - Tests interact with actual API
- **Real Middleware** - No bypassing of route guards
- **Real Cookies** - Actual cookie-based auth

## Test Scenarios

### 1. Login → Not Activated
- User logs in with unactivated account
- Assert: Redirected to `/onboarding/activation-required`
- Assert: Cannot access `/onboarding/*` or `/app/*`
- Assert: Can access activation-required page

### 2. Activation → Onboarding
- User activates account
- Assert: Redirected to `/onboarding/profile`
- Assert: Cannot access `/onboarding/interests` or `/app/*` directly
- Assert: Can access profile step

### 3. Onboarding Step Enforcement
- User completes profile step
- Assert: Redirected to `/onboarding/interests`
- Assert: Attempt to skip step is blocked
- Assert: Cannot access `/app/*` until onboarding complete

### 4. Onboarding Completion
- User completes interests step
- Assert: Redirected to `/app` (dashboard)
- Assert: Can access all `/app/*` routes
- Assert: Cannot access onboarding routes (redirected to app)

### 5. Direct URL Access
- VISITOR tries to access `/app` → redirected to `/auth/login`
- AUTHENTICATED tries to access `/app` → redirected to `/onboarding/activation-required`
- ACTIVATED tries to access `/onboarding/interests` → redirected to `/onboarding/profile`
- ACTIVATED tries to access `/app` → redirected to `/onboarding/profile`

## Running Tests

### Prerequisites

1. **Backend running**: API must be available at `http://localhost:8000/api`
2. **Frontend running**: App must be available at `http://localhost:3000`
3. **Test data**: Backend should support test user creation

### Run All Tests

```bash
npm run test:e2e
```

### Run Specific Test

```bash
npx playwright test e2e/user-lifecycle.spec.ts
```

### Run in UI Mode

```bash
npx playwright test --ui
```

### Run in Debug Mode

```bash
npx playwright test --debug
```

## Test Helpers

### Auth Helpers (`e2e/helpers/auth-helpers.ts`)

- `registerTestUser()` - Register a new test user
- `loginTestUser()` - Login and set auth cookies
- `activateTestUser()` - Activate user account
- `clearAuthState()` - Clear all auth state
- `generateTestUserEmail()` - Generate unique test email
- `generateTestUsername()` - Generate unique test username

### Route Helpers (`e2e/helpers/route-helpers.ts`)

- `navigateToRoute()` - Navigate and wait for load
- `expectCurrentRoute()` - Assert current URL
- `expectRedirect()` - Assert redirect from route A to route B
- `expectRouteAccessible()` - Assert route is accessible (no redirect)
- `expectRouteBlocked()` - Assert route is blocked (redirects)

## Test Data

Tests generate unique users for each test run:
- Email: `test-{timestamp}-{random}@example.com`
- Username: `testuser_{timestamp}_{random}`
- Password: `TestPassword123!`

## Environment Variables

- `PLAYWRIGHT_TEST_BASE_URL` - Frontend URL (default: `http://localhost:3000`)
- `PLAYWRIGHT_API_BASE_URL` - Backend API URL (default: from `src/constants/api.ts`)

## Test Structure

```
e2e/
  ├── helpers/
  │   ├── auth-helpers.ts      # Authentication helpers
  │   └── route-helpers.ts     # Route navigation helpers
  ├── user-lifecycle.spec.ts   # Main E2E test suite
  └── README.md                # This file
```

## Assertions

All tests use explicit assertions:
- ✅ URL checks: `expectCurrentRoute(page, "/expected/route")`
- ✅ Redirect checks: `expectRedirect(page, "/from", "/to")`
- ✅ No silent failures: All assertions are explicit
- ✅ Readable: Tests read like user stories

## Constraints

- ❌ No bypassing middleware
- ❌ No stubbing auth state
- ❌ No component-level assumptions
- ❌ No mocking of route guards

## Notes

Some tests are marked as `test.skip()` because they require:
- Backend test setup for specific user states
- Activation tokens from test setup
- API calls to progress through onboarding

These can be enabled once backend test utilities are available.
