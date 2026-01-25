# E2E Test Plan - User Lifecycle

## Test Coverage Matrix

| Scenario | User State | Route Attempted | Expected Redirect | Status |
|----------|------------|-----------------|------------------|--------|
| 1.1 | VISITOR | `/app` | `/auth/login` | ✅ |
| 1.2 | VISITOR | `/onboarding/profile` | `/auth/login` | ✅ |
| 2.1 | AUTHENTICATED | `/app` | `/onboarding/activation-required` | ✅ |
| 2.2 | AUTHENTICATED | `/onboarding/profile` | `/onboarding/activation-required` | ✅ |
| 2.3 | AUTHENTICATED | `/onboarding/activation-required` | (no redirect) | ✅ |
| 3.1 | ACTIVATED | `/onboarding/interests` | `/onboarding/profile` | ⏸️ |
| 3.2 | ACTIVATED | `/app` | `/onboarding/profile` | ⏸️ |
| 3.3 | ACTIVATED | `/onboarding/profile` | (no redirect) | ⏸️ |
| 4.1 | ONBOARDING.profile | `/onboarding/interests` | (no redirect) | ⏸️ |
| 4.2 | ONBOARDING.profile | `/app` | `/onboarding/profile` | ⏸️ |
| 4.3 | ONBOARDING.interests | `/onboarding/done` | (no redirect) | ⏸️ |
| 4.4 | ONBOARDING.interests | `/app` | `/onboarding/interests` | ⏸️ |
| 5.1 | APP_READY | `/onboarding/profile` | `/app` | ⏸️ |
| 5.2 | APP_READY | `/app` | (no redirect) | ✅ |

**Legend:**
- ✅ Implemented and testable
- ⏸️ Requires backend test setup

## Test Implementation Status

### ✅ Fully Implemented

1. **VISITOR State Tests**
   - Cannot access protected routes
   - Redirected to login
   - Can access public routes

2. **AUTHENTICATED State Tests**
   - Cannot access app or onboarding
   - Redirected to activation-required
   - Can access auth routes

3. **Public Routes Tests**
   - All states can access public routes

4. **Auth Routes Tests**
   - VISITOR and AUTHENTICATED can access

### ⏸️ Requires Backend Test Setup

1. **ACTIVATED State Tests**
   - Need backend to create user with `activated=true`, `onboarding_step="not_started"`

2. **ONBOARDING State Tests**
   - Need backend to create user in specific onboarding step
   - Need API to progress through onboarding steps

3. **APP_READY State Tests**
   - Need backend to create user with `onboarding_step="completed"`

## Backend Test Setup Requirements

To enable all tests, backend needs:

1. **Test User Creation API**
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

2. **Test Activation Token Generation**
   ```typescript
   POST /test/users/{userId}/activation-token
   Returns: { token: string }
   ```

3. **Test Onboarding Progression**
   ```typescript
   POST /test/users/{userId}/progress-onboarding
   { step: "profile" | "interests" | "completed" }
   ```

## Test Execution Flow

### Current Flow (Partial)

```
1. Register user → Backend creates user (not activated)
2. Login → Get tokens, set cookies
3. Try to access /app → Middleware redirects to activation-required ✅
4. Try to access /onboarding/profile → Middleware redirects to activation-required ✅
```

### Full Flow (Requires Backend Setup)

```
1. Create user in specific state via test API
2. Set auth cookies
3. Navigate to route
4. Assert middleware redirect
5. Verify final state
```

## Next Steps

1. **Backend Test Utilities**
   - Create test API endpoints for user state manipulation
   - Or use test database fixtures

2. **Test Data Management**
   - Cleanup test users after tests
   - Isolated test data per test run

3. **CI/CD Integration**
   - Run E2E tests in CI pipeline
   - Test against staging environment

4. **Test Coverage**
   - Enable all skipped tests once backend setup is available
   - Add edge case tests
   - Add error scenario tests
