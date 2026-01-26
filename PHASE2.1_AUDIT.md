# Phase 2.1 - Audit Report

## 1️⃣ Account Activation Flow Audit

### Current State

#### ✅ What Exists
- Activation Required page structure (`/onboarding/activation-required`)
- Activation page structure (`/auth/activate`)
- Middleware redirects for non-activated users
- Type definitions for activation status

#### ❌ What's Missing
- **Activation Required Page**: No resend email functionality
- **Activation Handler**: No token processing logic
- **Error States**: No explicit error handling for:
  - Invalid token
  - Expired token
  - Already activated
- **Success State**: No confirmation or redirect logic
- **API Mutations**: No activation/resend mutations

### Required User States

| State | Description | UX Location | Status |
|-------|-------------|-------------|--------|
| `AUTHENTICATED_NOT_ACTIVATED` | User logged in but not activated | `/onboarding/activation-required` | ⚠️ Partial |
| `ACTIVATION_REQUIRED` | Waiting for email activation | `/onboarding/activation-required` | ⚠️ Partial |
| `ACTIVATION_SUCCESS` | Token validated, account activated | `/auth/activate?token=...` | ❌ Missing |
| `ACTIVATION_ERROR` | Invalid/expired token | `/auth/activate?token=...` | ❌ Missing |

### Error Mapping Requirements

| Error Code | UX State | Component | Status |
|------------|----------|-----------|--------|
| `invalid_token` | Show error message | Activation page | ❌ Missing |
| `expired_token` | Show error + resend option | Activation page | ❌ Missing |
| `already_activated` | Redirect to login | Activation page | ❌ Missing |
| `account_not_activated` | Redirect to activation-required | Login form | ✅ Exists |
| `5xx/network` | SomethingWentWrong | All | ✅ Exists |

### UX Requirements Audit

#### Activation Required Page
- [x] Clear explanation
- [ ] Resend email button
- [ ] Loading state for resend
- [ ] Success message after resend
- [x] No access to app/onboarding (middleware handles)

#### Activation Success
- [ ] Clear confirmation message
- [ ] Automatic redirect to onboarding start
- [ ] Loading state during activation

#### Activation Error
- [ ] Invalid token message
- [ ] Expired token message with resend option
- [ ] Already activated message with login link

---

## 2️⃣ useUser() Hook Audit

### Current Implementation

```typescript
export function useUser() {
  return useQuery<User, ApiError>({
    queryKey: authKeys.user(),
    queryFn: async () => {
      const response = await apiClient.get<User>(API_ENDPOINTS.USER.ME);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
```

### Issues Found

1. ❌ **No derived flags** - Consumers must compute `isAuthenticated`, `isActivated`, etc.
2. ❌ **No error handling guidance** - Doesn't distinguish auth errors from infrastructure errors
3. ❌ **No loading state helpers** - Consumers must check `isLoading`, `isFetching`, etc.
4. ⚠️ **Old stores exist** - `useUserStore`, `useAuthStore` violate architecture (need cleanup)

### Required Contract

```typescript
interface UseUserReturn {
  // Raw data
  user: User | undefined;
  error: ApiError | null;
  
  // Loading states
  isLoading: boolean;
  isFetching: boolean;
  
  // Derived flags
  isAuthenticated: boolean;
  isActivated: boolean;
  isOnboardingComplete: boolean;
  
  // Utilities
  refetch: () => void;
}
```

### Responsibilities

✅ **Must Do:**
- Fetch user data via TanStack Query
- Expose authentication status
- Expose activation status
- Expose onboarding_step
- Provide derived flags
- Centralize user state queries

❌ **Must NOT Do:**
- Store data in Zustand
- Perform redirects
- Handle UI rendering
- Mutate user state directly

---

## 3️⃣ Design System Audit

### Color System

#### Current Implementation
- ✅ Primary: Navy Blue (210 40% 25%)
- ✅ Secondary: Paper Beige (45 20% 96%)
- ✅ Accent: Matte Gold (45 85% 55%)
- ✅ Dark mode variants defined

#### Issues Found

1. ⚠️ **Accent Usage**: Need to verify accent is only used for CTAs
2. ⚠️ **Contrast**: Need to verify WCAG compliance in dark mode
3. ✅ **60/30/10 Rule**: Colors are defined but usage needs validation

### Dark Mode Strategy

#### Current Implementation
- ✅ Theme provider exists
- ✅ Zustand store for theme
- ✅ System theme support
- ✅ Persistence via localStorage

#### Issues Found

1. ⚠️ **Old useTheme hook**: `src/hooks/use-theme.ts` exists but conflicts with Zustand store
2. ✅ **Documentation**: Theme decoupling is documented

### shadcn/ui Wrapping

#### Current State
- ✅ Components exist in `src/components/ui/`
- ⚠️ **Direct usage**: Some components may be used directly
- ⚠️ **No semantic wrappers**: No feature-specific wrappers

#### Required
- Wrap shadcn components in semantic feature components
- Document wrapping strategy
- Ensure no direct shadcn usage in features

---

## 4️⃣ Phase 2.1 Scope Validation

### ✅ Allowed in Phase 2.1
- [x] Login form
- [x] Register form
- [ ] Activation-required page (complete)
- [ ] Activation handler
- [ ] Resend activation email
- [ ] Error handling for activation

### ❌ Forbidden in Phase 2.1
- [x] Forgot/reset password
- [x] Onboarding forms
- [x] Dashboard features
- [x] Token refresh logic
- [x] Performance optimizations

---

## Action Items

### Immediate (Phase 2.1)
1. Formalize `useUser()` hook with derived flags
2. Implement activation mutations
3. Complete activation-required page
4. Implement activation handler with error states
5. Clean up old stores (`useUserStore`, `useAuthStore`)

### Post Phase 2.1
1. Validate accent color usage across app
2. Create semantic wrappers for shadcn components
3. Remove old `useTheme` hook if unused
4. Add contrast validation tests
