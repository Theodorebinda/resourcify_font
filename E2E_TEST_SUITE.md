# E2E Test Suite - Complete Specification

## Overview

Complete end-to-end test suite for Ressourcefy validating the user lifecycle and middleware guards.

## Test Framework

- **Playwright** - Modern E2E testing
- **Real Routing** - Middleware enabled, no bypassing
- **Real Backend** - Actual API calls
- **Real Cookies** - Cookie-based auth

## Test Structure

```
e2e/
  ├── helpers/
  │   ├── auth-helpers.ts          # Authentication utilities
  │   └── route-helpers.ts         # Route navigation utilities
  ├── user-lifecycle.spec.ts       # Main lifecycle tests
  ├── middleware-redirects.spec.ts # Redirect validation tests
  └── README.md                    # Test documentation
```

## Test Scenarios

### ✅ Scenario 1: Login → Not Activated

**User Story**: As a user who just logged in, I should be redirected to activation-required if my account is not activated.

**Test Steps**:
1. Register new user
2. Login
3. Attempt to access `/app`
4. Assert: Redirected to `/onboarding/activation-required`
5. Attempt to access `/onboarding/profile`
6. Assert: Redirected to `/onboarding/activation-required`
7. Assert: Can access `/onboarding/activation-required`

**Status**: ✅ Fully implemented

### ⏸️ Scenario 2: Activation → Onboarding

**User Story**: As a user who just activated their account, I should be redirected to the onboarding profile step.

**Test Steps**:
1. Register and login
2. Activate account (requires token)
3. Navigate to any route
4. Assert: Redirected to `/onboarding/profile`
5. Attempt to access `/onboarding/interests`
6. Assert: Redirected to `/onboarding/profile`
7. Attempt to access `/app`
8. Assert: Redirected to `/onboarding/profile`

**Status**: ⏸️ Requires backend test setup for activation token

### ⏸️ Scenario 3: Onboarding Step Enforcement

**User Story**: As a user completing onboarding, I should not be able to skip steps.

**Test Steps**:
1. Complete profile step
2. Assert: Redirected to `/onboarding/interests`
3. Attempt to access `/onboarding/done` directly
4. Assert: Redirected to `/onboarding/interests`
5. Attempt to access `/app`
6. Assert: Redirected to `/onboarding/interests`

**Status**: ⏸️ Requires backend test setup for onboarding progression

### ⏸️ Scenario 4: Onboarding Completion

**User Story**: As a user who completed onboarding, I should be able to access the app.

**Test Steps**:
1. Complete all onboarding steps
2. Navigate to `/app`
3. Assert: Can access dashboard
4. Attempt to access `/onboarding/profile`
5. Assert: Redirected to `/app`

**Status**: ⏸️ Requires backend test setup for onboarding completion

### ✅ Scenario 5: Direct URL Access

**User Story**: As a user, I should be redirected to the correct route based on my state, even if I manually type a URL.

**Test Cases**:

| User State | Route Attempted | Expected Redirect | Status |
|------------|-----------------|-------------------|--------|
| VISITOR | `/app` | `/auth/login` | ✅ |
| VISITOR | `/onboarding/profile` | `/auth/login` | ✅ |
| AUTHENTICATED | `/app` | `/onboarding/activation-required` | ✅ |
| AUTHENTICATED | `/onboarding/profile` | `/onboarding/activation-required` | ✅ |
| ACTIVATED | `/onboarding/interests` | `/onboarding/profile` | ⏸️ |
| ACTIVATED | `/app` | `/onboarding/profile` | ⏸️ |
| ONBOARDING.profile | `/app` | `/onboarding/profile` | ⏸️ |
| ONBOARDING.interests | `/app` | `/onboarding/interests` | ⏸️ |
| APP_READY | `/onboarding/profile` | `/app` | ⏸️ |

**Status**: ✅ Partially implemented (VISITOR and AUTHENTICATED states)

## Test Helpers

### Auth Helpers

```typescript
// Register a test user
await registerTestUser(page, {
  email: "test@example.com",
  password: "Password123!",
  username: "testuser",
});

// Login and set auth state
await loginTestUser(page, email, password);

// Activate account
await activateTestUser(page, token);

// Clear all auth state
await clearAuthState(page);
```

### Route Helpers

```typescript
// Navigate and wait for load
await navigateToRoute(page, "/app");

// Assert current route
await expectCurrentRoute(page, "/auth/login");

// Assert redirect
await expectRedirect(page, "/app", "/auth/login");

// Assert route is accessible
await expectRouteAccessible(page, "/");

// Assert route is blocked
await expectRouteBlocked(page, "/app", "/auth/login");
```

## Running Tests

### Prerequisites

1. **Backend running**: `http://localhost:8000/api`
2. **Frontend running**: `http://localhost:3000`
3. **Playwright installed**: `npm install -D @playwright/test`

### Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run in UI mode (interactive)
npm run test:e2e:ui

# Run in debug mode
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

## Test Data

Tests generate unique users:
- Email: `test-{timestamp}-{random}@example.com`
- Username: `testuser_{timestamp}_{random}`
- Password: `TestPassword123!`

## Environment Variables

- `PLAYWRIGHT_TEST_BASE_URL` - Frontend URL (default: `http://localhost:3000`)
- `PLAYWRIGHT_API_BASE_URL` - Backend API URL (default: `http://localhost:8000/api`)

## Assertions

All tests use explicit assertions:

```typescript
// URL check
await expectCurrentRoute(page, "/expected/route");

// Redirect check
await expectRedirect(page, "/from", "/to");

// Access check
await expectRouteAccessible(page, "/route");

// Block check
await expectRouteBlocked(page, "/route", "/redirect-to");
```

## Constraints

### ✅ Allowed
- Real API calls
- Real cookie handling
- Real middleware execution
- Explicit URL checks

### ❌ Forbidden
- Mocking auth state
- Bypassing middleware
- Stubbing route guards
- Component-level assumptions
- Client-side state inference

## Backend Test Setup Requirements

To enable all tests, backend needs test utilities:

1. **Test User Creation**
   ```typescript
   POST /test/users/create
   {
     email: string;
     username: string;
     password: string;
     activated: boolean;
     onboarding_step: "not_started" | "profile" | "interests" | "completed";
   }
   ```

2. **Activation Token Generation**
   ```typescript
   POST /test/users/{userId}/activation-token
   Returns: { token: string }
   ```

3. **Onboarding Progression**
   ```typescript
   POST /test/users/{userId}/progress-onboarding
   { step: "profile" | "interests" | "completed" }
   ```

## Test Coverage

### Current Coverage

- ✅ VISITOR state (all routes)
- ✅ AUTHENTICATED state (all routes)
- ✅ Public routes (all states)
- ✅ Auth routes (VISITOR, AUTHENTICATED)

### Pending Coverage

- ⏸️ ACTIVATED state
- ⏸️ ONBOARDING.profile state
- ⏸️ ONBOARDING.interests state
- ⏸️ APP_READY state

## Test Execution

### Local Development

```bash
# Terminal 1: Start backend
cd ../ressourcefy_backend
python manage.py runserver

# Terminal 2: Start frontend
npm run dev

# Terminal 3: Run tests
npm run test:e2e
```

### CI/CD

Tests should run in CI pipeline:
1. Start backend in test mode
2. Start frontend
3. Run E2E tests
4. Generate report

## Test Reports

Playwright generates HTML reports:
- Location: `playwright-report/`
- View: `npm run test:e2e:report`

## Best Practices

1. **Isolation**: Each test creates unique users
2. **Cleanup**: Clear auth state between tests
3. **Explicit**: All assertions are explicit
4. **Readable**: Tests read like user stories
5. **Deterministic**: Same inputs → same outputs

## Next Steps

1. **Backend Test Utilities**: Create test API endpoints
2. **Enable Skipped Tests**: Once backend setup is available
3. **Add Edge Cases**: Error scenarios, network failures
4. **CI Integration**: Add to CI/CD pipeline
5. **Performance Tests**: Add load testing scenarios
