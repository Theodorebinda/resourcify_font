# Middleware Guards Implementation

## Overview

The middleware has been formalized into a deterministic state machine that enforces route access based on explicit user states.

## Architecture

### 1. State Derivation (`src/utils/user-state.ts`)

**Function**: `getUserState(authCookie: AuthCookie | null): UserState`

Derives user state from minimal cookie payload:
- `VISITOR` - No auth cookie
- `AUTHENTICATED` - Has token but `activated = false`
- `ACTIVATED` - `activated = true`, `onboarding_step = "not_started"`
- `ONBOARDING.profile` - `onboarding_step = "profile"`
- `ONBOARDING.interests` - `onboarding_step = "interests"`
- `APP_READY` - `onboarding_step = "completed"`

**Properties:**
- ✅ Deterministic: same input → same output
- ✅ No side effects
- ✅ Pure function

### 2. Route Guards (`src/utils/route-guards.ts`)

**Function**: `canAccessRoute(userState: UserState, route: string): boolean`

Maps routes to allowed states:
- Public routes → All states
- Auth routes → VISITOR, AUTHENTICATED
- Activation routes → AUTHENTICATED
- Onboarding routes → Specific states
- App routes → APP_READY

**Function**: `getRedirectRouteForState(userState: UserState): string`

Determines redirect target for each state:
- `VISITOR` → `/auth/login`
- `AUTHENTICATED` → `/onboarding/activation-required`
- `ACTIVATED` → `/onboarding/profile`
- `ONBOARDING.profile` → `/onboarding/profile`
- `ONBOARDING.interests` → `/onboarding/interests`
- `APP_READY` → `/app`

**Properties:**
- ✅ Explicit mapping for every route
- ✅ Deterministic redirects
- ✅ No client-side logic

### 3. Middleware Execution (`src/middleware.ts`)

**Flow:**
1. Check if route is protected
2. Get user state from cookies
3. Check if state can access route
4. Allow or redirect

**Properties:**
- ✅ Single responsibility: access control only
- ✅ No API calls
- ✅ No UI logic
- ✅ Deterministic: same request → same response

## Route → State Matrix

| Route | VISITOR | AUTH | ACTIVATED | ONBOARD.profile | ONBOARD.interests | APP_READY |
|-------|---------|------|-----------|-----------------|-------------------|-----------|
| `/` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/auth/login` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/onboarding/activation-required` | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/onboarding/profile` | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| `/onboarding/interests` | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| `/app` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

## Guard Examples

### Example 1: VISITOR accessing /app
```
Input: VISITOR + /app
Step 1: isProtectedRoute("/app") → true
Step 2: getUserState(null) → VISITOR
Step 3: canAccessRoute(VISITOR, "/app") → false
Step 4: getRedirectRouteForState(VISITOR) → "/auth/login"
Output: Redirect to /auth/login
```

### Example 2: AUTHENTICATED accessing /app
```
Input: AUTHENTICATED + /app
Step 1: isProtectedRoute("/app") → true
Step 2: getUserState({token, activated: false}) → AUTHENTICATED
Step 3: canAccessRoute(AUTHENTICATED, "/app") → false
Step 4: getRedirectRouteForState(AUTHENTICATED) → "/onboarding/activation-required"
Output: Redirect to /onboarding/activation-required
```

### Example 3: ACTIVATED accessing /onboarding/interests
```
Input: ACTIVATED + /onboarding/interests
Step 1: isProtectedRoute("/onboarding/interests") → true
Step 2: getUserState({activated: true, onboardingStep: "not_started"}) → ACTIVATED
Step 3: canAccessRoute(ACTIVATED, "/onboarding/interests") → false
Step 4: getRedirectRouteForState(ACTIVATED) → "/onboarding/profile"
Output: Redirect to /onboarding/profile
```

### Example 4: APP_READY accessing /onboarding/profile
```
Input: APP_READY + /onboarding/profile
Step 1: isProtectedRoute("/onboarding/profile") → true
Step 2: getUserState({activated: true, onboardingStep: "completed"}) → APP_READY
Step 3: canAccessRoute(APP_READY, "/onboarding/profile") → false
Step 4: getRedirectRouteForState(APP_READY) → "/app"
Output: Redirect to /app
```

## Determinism Guarantees

1. **State Derivation**: Same cookie data → same state
2. **Access Check**: Same state + route → same result
3. **Redirect**: Same state → same redirect route
4. **No Randomness**: No `Math.random()`, no timestamps
5. **No Side Effects**: No mutations, no API calls
6. **No Client Logic**: Runs on edge, no browser APIs

## Enforcement

### ✅ Allowed
- Middleware redirects
- Server-driven state
- Cookie-based auth
- Deterministic guards

### ❌ Forbidden
- Redirects in React components
- Zustand auth state
- Client-side state inference
- `useEffect` redirects
- Conditional rendering based on guessed state

## Testing Strategy

### Unit Tests
- Test `getUserState()` with all cookie combinations
- Test `canAccessRoute()` with all state + route combinations
- Test `getRedirectRouteForState()` for all states

### Integration Tests
- Test middleware with mocked cookies
- Test all state transitions
- Test illegal route access attempts

### Edge Cases
- Missing cookies
- Invalid onboarding_step values
- Unknown routes
- Cookie parsing errors

## Benefits

1. **Predictable**: Same inputs always produce same outputs
2. **Testable**: Pure functions, easy to test
3. **Maintainable**: Clear separation of concerns
4. **Secure**: Server-driven, no client-side bypass
5. **Explicit**: Every route has explicit allowed states
6. **Documented**: State machine is formal and documented
