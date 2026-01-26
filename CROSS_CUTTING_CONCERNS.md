# Cross-Cutting Concerns Architecture

This document describes the four cross-cutting concerns implemented in Ressourcefy frontend.

## 1. Global Server Error Experience

### Overview
Provides a single, reusable mechanism to handle infrastructure-level failures (backend unavailable, network errors, timeouts, HTTP 5xx errors).

### Components

#### `SomethingWentWrong` Component
- **Location**: `src/components/error/something-went-wrong.tsx`
- **Purpose**: Reusable error display component
- **Features**:
  - Human-friendly messages (no technical details)
  - Retry action (optional)
  - Go back action
  - Works for unauthenticated users

#### Error Page
- **Location**: `src/app/error/page.tsx`
- **Purpose**: Dedicated fallback page for errors
- **Accessible via**: Direct navigation or middleware redirects

#### Error Boundary
- **Location**: `src/components/error/error-boundary.tsx`
- **Purpose**: Catches React component errors
- **Usage**: Wraps the application in root layout

#### `useServerError` Hook
- **Location**: `src/hooks/use-server-error.ts`
- **Purpose**: Detects infrastructure errors from TanStack Query
- **Distinguishes**: Infrastructure errors (5xx, network) vs business errors (4xx, validation)

### Key Rules
- ✅ Server errors derived from TanStack Query error state only
- ✅ Never stored in Zustand
- ✅ Usable by error boundaries, TanStack Query, and middleware
- ✅ No technical details exposed to users

### Usage Example

```tsx
// In a component using TanStack Query
const { data, error, refetch } = useQuery(...);
const serverError = useServerError(error, () => refetch());

if (serverError) {
  return <SomethingWentWrong onRetry={() => refetch()} />;
}
```

---

## 2. Server-Driven Onboarding

### Overview
The onboarding flow is entirely driven by the backend. The frontend reads `onboarding_step` from the server and never infers or guesses the step.

### Server Contract
The backend exposes:
```typescript
onboarding_step ∈ {
  "not_started",
  "profile",
  "interests",
  "completed"
}
```

### Implementation

#### Types
- **Location**: `src/types/index.ts`
- **Type**: `OnboardingStep`
- **User Interface**: Updated to include `onboarding_step: OnboardingStep`

#### TanStack Query Hook
- **Location**: `src/services/api/queries/onboarding-queries.ts`
- **Hook**: `useOnboardingStep()`
- **Purpose**: Fetches current onboarding step from server
- **Source of Truth**: Backend API endpoint

#### Onboarding Progress Component
- **Location**: `src/components/onboarding/onboarding-progress.tsx`
- **Purpose**: Displays progress based on server state
- **Features**:
  - Reflects current `onboarding_step` from server
  - Disables future steps
  - No free navigation
  - Data from TanStack Query (server state)

### Key Rules
- ✅ Frontend reads `onboarding_step` from server
- ✅ Frontend never infers or guesses the step
- ✅ All transitions validated by backend
- ✅ Skipping steps is forbidden
- ❌ No onboarding logic in localStorage
- ❌ No frontend-only step progression
- ❌ No Zustand as onboarding state

---

## 3. Middleware: Blocking Future Onboarding Steps

### Overview
The middleware prevents users from accessing onboarding steps they have not reached yet.

### Responsibilities

#### Reads Minimal Auth Payload
- `authenticated?` (token + userId)
- `is_active?` (activated)
- `onboarding_step?` (current step from server)

#### Enforces
- Correct onboarding step order
- Redirection to the correct step
- Blocks access to `/app` before onboarding is completed
- Blocks skipping onboarding steps via URL

### Implementation
- **Location**: `src/middleware.ts`
- **Utilities**: `src/utils/onboarding-routes.ts`

### Logic Flow

1. **Unauthenticated** → Redirect to `/auth/login`
2. **Not Activated** → Redirect to `/onboarding/activation-required`
3. **Onboarding Completed** → Allow `/app`, redirect onboarding routes to `/app`
4. **Onboarding In Progress** → 
   - Block `/app` access
   - Check if route matches current step
   - Redirect to correct step if accessing future step

### Key Rules
- ✅ No UI logic
- ✅ No heavy data fetching
- ✅ No guessing or client-side fixes
- ✅ Redirects are deterministic and testable
- ✅ Reads `onboarding_step` from cookie (set by backend)

---

## 4. Theme System (Light / Dark / System)

### Overview
A global, persistent theme system that is completely independent from authentication.

### Theme Values
- `"light"`: Force light mode
- `"dark"`: Force dark mode
- `"system"`: Follow `prefers-color-scheme` and react to system changes

### Implementation

#### Zustand Store
- **Location**: `src/stores/use-ui-store.ts`
- **Persistence**: localStorage (via Zustand persist middleware)
- **Default**: `"system"`

#### Theme Provider
- **Location**: `src/providers/theme-provider.tsx`
- **Features**:
  - Applies theme to document root
  - Listens to system theme changes when `theme === "system"`
  - Reacts to `prefers-color-scheme` media query changes

### Critical Rule

**The theme is a LOCAL UI PREFERENCE.**

- ✅ It is NOT tied to authentication
- ✅ It is NOT stored on the backend
- ✅ It works for visitors and authenticated users alike
- ✅ Theme state is completely decoupled from auth state

This rule is documented in:
- `src/stores/use-ui-store.ts`
- `src/providers/theme-provider.tsx`

### Usage

```tsx
// In any component
const theme = useUIStore((state) => state.theme);
const setTheme = useUIStore((state) => state.setTheme);

// Change theme
setTheme("dark"); // or "light" or "system"
```

### Behavior

- **Default**: `"system"` (follows OS preference)
- **Persistence**: Survives page reloads (localStorage)
- **System Changes**: When `theme === "system"`, automatically reacts to OS theme changes
- **Works Everywhere**: Public pages, auth pages, onboarding, app

---

## Architecture Principles

### Separation of Concerns

1. **Infrastructure Errors** → `SomethingWentWrong` + Error Boundary
2. **Business State** → TanStack Query (server state)
3. **Onboarding Flow** → Server-driven via `onboarding_step`
4. **UI Preferences** → Zustand (theme, modals, sidebar)

### State Management Rules

- **TanStack Query**: All server data (user, onboarding_step, etc.)
- **Zustand**: UI state only (theme, modals, sidebar)
- **Never**: Store server data in Zustand
- **Never**: Store onboarding state in localStorage or Zustand

### Testability

- Middleware redirects are deterministic
- Onboarding step validation is server-driven
- Error handling is explicit and reusable
- Theme system is isolated and testable

### Scalability

- Error handling works across all routes
- Onboarding can be extended with new steps (server-driven)
- Theme system is independent and can be extended
- Middleware logic is clear and maintainable

---

## File Structure

```
src/
├── components/
│   ├── error/
│   │   ├── something-went-wrong.tsx    # Global error component
│   │   └── error-boundary.tsx          # React error boundary
│   └── onboarding/
│       └── onboarding-progress.tsx    # Server-driven progress
├── hooks/
│   └── use-server-error.ts            # TanStack Query error detection
├── services/
│   └── api/
│       └── queries/
│           └── onboarding-queries.ts   # Server-driven onboarding hook
├── stores/
│   └── use-ui-store.ts                # Theme (decoupled from auth)
├── providers/
│   └── theme-provider.tsx              # Theme application
├── utils/
│   └── onboarding-routes.ts           # Onboarding route utilities
├── middleware.ts                       # Access control + step blocking
└── app/
    └── error/
        └── page.tsx                    # Error fallback page
```

---

## Summary

✅ **Global Server Error**: Reusable, infrastructure-level error handling  
✅ **Server-Driven Onboarding**: Backend is source of truth, no frontend inference  
✅ **Middleware Blocking**: Prevents access to future steps, enforces order  
✅ **Theme System**: Completely decoupled from authentication, persistent, reactive

All four concerns are implemented with clear separation, testability, and scalability in mind.
