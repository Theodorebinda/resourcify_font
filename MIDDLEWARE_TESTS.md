# Middleware Test Suite Documentation

## Overview

This document describes the comprehensive test suite for the Next.js middleware that enforces route access control based on user state.

## Test Structure

The test suite is organized into 4 main user state categories:

### 1️⃣ Visitor (Unauthenticated)
- **Auth Context**: `null` (no auth cookie)
- **Allowed Routes**: Public routes, auth routes
- **Blocked Routes**: Activation, onboarding, app routes → redirect to `/auth/login`

### 2️⃣ Authenticated but NOT Activated
- **Auth Context**: `{ authenticated: true, is_active: false }`
- **Allowed Routes**: Activation routes, auth routes
- **Blocked Routes**: Onboarding, app routes → redirect to `/onboarding/activation-required`

### 3️⃣ Activated but NOT Onboarded
- **Auth Context**: `{ authenticated: true, is_active: true, onboarding_step: "not_started" | "profile" | "interests" }`
- **Allowed Routes**: Onboarding routes (based on current step)
- **Blocked Routes**: App routes → redirect to correct onboarding step

#### Step-Specific Rules:
- **`not_started`**: Can only access `/onboarding/profile`
- **`profile`**: Can access `/onboarding/profile` and `/onboarding/interests`
- **`interests`**: Can access `/onboarding/interests` and `/onboarding/done`

### 4️⃣ Fully Onboarded (APP_READY)
- **Auth Context**: `{ authenticated: true, is_active: true, onboarding_step: "completed" }`
- **Allowed Routes**: App routes, public routes
- **Blocked Routes**: Onboarding, activation routes → redirect to `/app`

## Test Principles

1. **Pure and Deterministic**: No side effects, no flakiness
2. **Explicit Expectations**: One assertion per behavior
3. **Table-Driven**: Uses `test.each` for similar test cases
4. **Documentation by Example**: Tests document access rules implicitly

## Running Tests

```bash
# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

## Test Coverage

The suite covers:
- ✅ All 4 user states
- ✅ All route categories (public, auth, activation, onboarding, app)
- ✅ Redirect behaviors for each state
- ✅ Access control rules
- ✅ Edge cases (missing onboarding_step, invalid routes)
- ✅ Route matching patterns (`/app/*`, `/onboarding/*`)

## Mocked Auth Context

Each test explicitly defines a mocked auth context:

```typescript
{
  authenticated: boolean,  // token + userId present
  is_active: boolean,      // activated flag
  onboarding_step: "not_started" | "profile" | "interests" | "completed"
}
```

The `getAuthCookie` function is mocked to return these values.

## Route Categories Tested

- **Public**: `/`, `/pricing`, `/about`, `/contact`
- **Auth**: `/auth/login`, `/auth/register`
- **Activation**: `/onboarding/activation-required`
- **Onboarding**: `/onboarding/profile`, `/onboarding/interests`, `/onboarding/done`
- **App**: `/app`, `/app/dashboard`, `/app/settings`

## Test Helpers

- `createRequest(pathname)`: Creates a NextRequest with given pathname
- `getRedirectLocation(response)`: Extracts redirect location from NextResponse
- `isRedirect(response)`: Checks if response is a redirect
- `allowsAccess(response)`: Checks if response allows access (no redirect)

## Expected Behavior Matrix

| User State | Public | Auth | Activation | Onboarding | App |
|------------|--------|------|------------|------------|-----|
| Visitor | ✅ | ✅ | ❌→/login | ❌→/login | ❌→/login |
| Auth (not active) | ✅ | ✅ | ✅ | ❌→activation | ❌→activation |
| Active (not_started) | ✅ | ✅ | ❌ | ✅(profile only) | ❌→profile |
| Active (profile) | ✅ | ✅ | ❌ | ✅(profile+interests) | ❌→profile |
| Active (interests) | ✅ | ✅ | ❌ | ✅(interests+done) | ❌→interests |
| Completed | ✅ | ✅ | ❌→/app | ❌→/app | ✅ |

## Maintenance

When modifying the middleware:
1. Update tests to reflect new behavior
2. Add new test cases for new routes or states
3. Ensure all edge cases are covered
4. Run tests before committing

Tests should fail loudly and clearly when rules change, preventing silent regressions.
