# Middleware Test Suite

## Overview

This test suite validates the Next.js middleware access control and redirections for all user states and route categories.

## Test Structure

The tests are organized by user state:

1. **Visitor (Unauthenticated)** - No auth cookie
2. **Authenticated but NOT Activated** - Has token but `activated: false`
3. **Activated but NOT Onboarded** - Activated but `onboarding_step` is not "completed"
4. **Fully Onboarded** - `onboarding_step === "completed"`

## Running Tests

```bash
npm test
```

Or with coverage:

```bash
npm test -- --coverage
```

## Test Principles

- **Pure and deterministic**: No side effects, no flakiness
- **Explicit expectations**: One assertion per behavior
- **Table-driven**: Uses `test.each` for similar test cases
- **Documentation by example**: Tests document access rules implicitly

## Mocked Auth Context

Each test explicitly defines:

```typescript
{
  authenticated: boolean,  // token + userId present
  is_active: boolean,      // activated flag
  onboarding_step: "not_started" | "profile" | "interests" | "completed"
}
```

## Route Categories Tested

- **Public routes**: `/`, `/pricing`, `/about`, `/contact`
- **Auth routes**: `/auth/login`, `/auth/register`
- **Activation routes**: `/onboarding/activation-required`
- **Onboarding routes**: `/onboarding/profile`, `/onboarding/interests`
- **App routes**: `/app`, `/app/dashboard`, `/app/settings`

## Test Coverage

The suite covers:
- ✅ All user states
- ✅ All route categories
- ✅ Redirect behaviors
- ✅ Access control rules
- ✅ Edge cases (missing onboarding_step, invalid routes)
- ✅ Route matching patterns
