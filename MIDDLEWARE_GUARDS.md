# Middleware Guards - Formal Specification

## User State Machine

### States

| State | Description | Server Data |
|-------|-------------|-------------|
| `VISITOR` | Not authenticated | No auth cookie |
| `AUTHENTICATED` | Authenticated but not activated | `token` + `userId`, `activated = false` |
| `ACTIVATED` | Activated but onboarding not started | `activated = true`, `onboarding_step = "not_started"` |
| `ONBOARDING.profile` | Onboarding step 1 (profile) | `activated = true`, `onboarding_step = "profile"` |
| `ONBOARDING.interests` | Onboarding step 2 (interests) | `activated = true`, `onboarding_step = "interests"` |
| `APP_READY` | Fully onboarded | `activated = true`, `onboarding_step = "completed"` |

### State Transitions

```
VISITOR
  ↓ (login)
AUTHENTICATED
  ↓ (activate account)
ACTIVATED
  ↓ (start onboarding)
ONBOARDING.profile
  ↓ (complete profile)
ONBOARDING.interests
  ↓ (complete interests)
APP_READY
```

**Rules:**
- Transitions are server-driven (backend validates)
- Frontend never infers or guesses state
- Skipping steps is forbidden
- Middleware enforces correct order

## Route → Allowed States Mapping

### Public Routes
**Accessible to all states**

| Route | Allowed States |
|-------|----------------|
| `/` | All |
| `/pricing` | All |
| `/about` | All |
| `/contact` | All |
| `/error` | All |

### Auth Routes
**Accessible to VISITOR and AUTHENTICATED**

| Route | Allowed States |
|-------|----------------|
| `/auth/login` | VISITOR, AUTHENTICATED |
| `/auth/register` | VISITOR, AUTHENTICATED |
| `/auth/forgot-password` | VISITOR, AUTHENTICATED |
| `/auth/reset-password` | VISITOR, AUTHENTICATED |
| `/auth/activate` | VISITOR, AUTHENTICATED |

### Activation Routes
**Accessible to AUTHENTICATED only**

| Route | Allowed States |
|-------|----------------|
| `/onboarding/activation-required` | AUTHENTICATED |

### Onboarding Routes
**Accessible to specific states**

| Route | Allowed States |
|-------|----------------|
| `/onboarding/profile` | ACTIVATED, ONBOARDING.profile |
| `/onboarding/interests` | ONBOARDING.profile, ONBOARDING.interests |
| `/onboarding/done` | ONBOARDING.interests |

### App Routes
**Accessible to APP_READY only**

| Route | Allowed States |
|-------|----------------|
| `/app` | APP_READY |
| `/app/*` | APP_READY |

## Guard Logic

### Deterministic Rules

1. **State Derivation**
   - Input: `AuthCookie | null`
   - Output: `UserState`
   - Same input → same output (no randomness, no side effects)

2. **Access Check**
   - Input: `UserState` + `route`
   - Output: `boolean`
   - Same inputs → same output

3. **Redirect Decision**
   - Input: `UserState`
   - Output: `route`
   - Same state → same redirect route

### Guard Implementation

```typescript
// Step 1: Derive user state from cookies
const userState = getUserState(authCookie);

// Step 2: Check if state can access route
if (canAccessRoute(userState, pathname)) {
  return NextResponse.next(); // Allow
}

// Step 3: Redirect to correct route for state
const redirectRoute = getRedirectRouteForState(userState);
return NextResponse.redirect(redirectRoute);
```

## Redirect Rules

| User State | Redirect Target |
|------------|----------------|
| `VISITOR` | `/auth/login` |
| `AUTHENTICATED` | `/onboarding/activation-required` |
| `ACTIVATED` | `/onboarding/profile` |
| `ONBOARDING.profile` | `/onboarding/profile` |
| `ONBOARDING.interests` | `/onboarding/interests` |
| `APP_READY` | `/app` |

## Forbidden Patterns

### ❌ Redirects in React Components
```typescript
// FORBIDDEN
function Dashboard() {
  const { user } = useUser();
  if (!user) {
    router.push('/login'); // NO!
  }
}
```

### ❌ Zustand-based Auth Logic
```typescript
// FORBIDDEN
const useAuthStore = create((set) => ({
  isAuthenticated: false,
  checkAuth: () => { /* NO! */ }
}));
```

### ❌ Client-side State Inference
```typescript
// FORBIDDEN
function Component() {
  const hasToken = localStorage.getItem('token');
  const isOnboarded = hasToken && hasProfile; // NO! Server is source of truth
}
```

## Testing

### Test Cases

1. **VISITOR accessing protected route**
   - Input: `VISITOR` + `/app`
   - Expected: Redirect to `/auth/login`

2. **AUTHENTICATED accessing app**
   - Input: `AUTHENTICATED` + `/app`
   - Expected: Redirect to `/onboarding/activation-required`

3. **ACTIVATED accessing interests**
   - Input: `ACTIVATED` + `/onboarding/interests`
   - Expected: Redirect to `/onboarding/profile`

4. **ONBOARDING.profile accessing app**
   - Input: `ONBOARDING.profile` + `/app`
   - Expected: Redirect to `/onboarding/profile`

5. **APP_READY accessing onboarding**
   - Input: `APP_READY` + `/onboarding/profile`
   - Expected: Redirect to `/app`

## Implementation Files

- `src/utils/user-state.ts` - State derivation
- `src/utils/route-guards.ts` - Route → state mapping
- `src/middleware.ts` - Guard execution
- `src/utils/cookies.ts` - Cookie parsing (minimal payload)

## Key Principles

1. **Deterministic**: Same inputs → same outputs
2. **Server-driven**: State comes from cookies (backend sets)
3. **Explicit**: Every route has explicit allowed states
4. **Predictable**: Redirects are deterministic
5. **No side effects**: Pure functions only
6. **No client logic**: Middleware runs on edge
