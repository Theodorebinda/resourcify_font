# Phase 2 - Full Execution Plan

## Overview

This document provides a complete execution plan for Phase 2 of Ressourcefy frontend implementation. Phase 2 focuses on implementing all user-facing features, forms, and UI components while maintaining strict architectural principles.

## Architecture Principles (Non-Negotiable)

1. **Frontend ONLY** - No backend logic, no database access, no ORM
2. **Server is Source of Truth** - All data via TanStack Query, never in Zustand
3. **UI State Only in Zustand** - Theme, modals, sidebar state
4. **Separation of Concerns** - Components = UI, Services = API, Stores = UI state
5. **TypeScript Strict** - No `any`, explicit types everywhere

## Implementation Checklist

### 1. Authentication Forms ✅ (Partially Complete)

- [x] Login form with validation
- [x] Register form with validation
- [ ] Forgot password form
- [ ] Reset password form
- [ ] Account activation page
- [ ] Resend activation email component

**Files Created:**
- `src/lib/validations/auth.ts`
- `src/components/features/auth/login-form.tsx`
- `src/components/features/auth/register-form.tsx`

**Next Steps:**
1. Create forgot-password form component
2. Create reset-password form component
3. Implement activation page with token handling
4. Add resend activation mutation

### 2. Onboarding Forms

- [ ] Profile form component
- [ ] Interests selection component (multi-select)
- [ ] Onboarding completion logic
- [ ] Progress indicator (already exists, needs integration)

**Required:**
- `src/components/features/onboarding/profile-form.tsx`
- `src/components/features/onboarding/interests-form.tsx`
- Update onboarding queries with mutations

### 3. API Integration

- [ ] Complete all mutation hooks in `auth-queries.ts`
- [ ] Create onboarding mutations in `onboarding-queries.ts`
- [ ] Add request interceptor for token refresh
- [ ] Add response interceptor for error handling
- [ ] Handle loading states consistently
- [ ] Handle error states with `useServerError` hook

**Required:**
- Update `src/services/api/client.ts` with interceptors
- Complete `src/services/api/queries/auth-queries.ts`
- Complete `src/services/api/queries/onboarding-queries.ts`

### 4. UI Components - Layouts

- [ ] Public header/navigation
- [ ] Public footer
- [ ] Auth layout branding/logo
- [ ] App header/navigation
- [ ] App sidebar (with Zustand state)
- [ ] Theme toggle component

**Required:**
- `src/components/layout/public-header.tsx`
- `src/components/layout/public-footer.tsx`
- `src/components/layout/app-header.tsx`
- `src/components/layout/app-sidebar.tsx`
- `src/components/ui/theme-toggle.tsx`

### 5. Dashboard & App Content

- [ ] Dashboard page with user data
- [ ] Loading states
- [ ] Error states using `SomethingWentWrong`
- [ ] Empty states

**Required:**
- Update `src/app/(app)/app/page.tsx`
- Use `useUser()` hook
- Handle loading/error states

### 6. Public Pages Content

- [ ] Landing page hero section
- [ ] Pricing cards component
- [ ] Contact form component
- [ ] About page content

**Required:**
- `src/components/features/public/hero-section.tsx`
- `src/components/features/public/pricing-cards.tsx`
- `src/components/features/public/contact-form.tsx`

### 7. Error Handling

- [x] Global error component (`SomethingWentWrong`)
- [x] Error boundary
- [x] Error page
- [x] `useServerError` hook
- [ ] Integrate error handling in all forms
- [ ] Handle `account_not_activated` error explicitly

### 8. Loading States

- [ ] Create loading skeleton components
- [ ] Add loading states to all queries
- [ ] Create loading spinner component

**Required:**
- `src/components/ui/loading-spinner.tsx`
- `src/components/ui/skeleton.tsx` (may already exist)

## File Structure to Create

```
src/
├── components/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── login-form.tsx ✅
│   │   │   ├── register-form.tsx ✅
│   │   │   ├── forgot-password-form.tsx
│   │   │   ├── reset-password-form.tsx
│   │   │   └── activation-handler.tsx
│   │   ├── onboarding/
│   │   │   ├── profile-form.tsx
│   │   │   ├── interests-form.tsx
│   │   │   └── onboarding-complete.tsx
│   │   └── public/
│   │       ├── hero-section.tsx
│   │       ├── pricing-cards.tsx
│   │       └── contact-form.tsx
│   ├── layout/
│   │   ├── public-header.tsx
│   │   ├── public-footer.tsx
│   │   ├── app-header.tsx
│   │   └── app-sidebar.tsx
│   └── ui/
│       ├── theme-toggle.tsx
│       └── loading-spinner.tsx
├── services/
│   └── api/
│       ├── client.ts (update with interceptors)
│       └── queries/
│           ├── auth-queries.ts (complete mutations)
│           └── onboarding-queries.ts (add mutations)
└── lib/
    └── validations/
        ├── auth.ts ✅
        └── onboarding.ts ✅
```

## Implementation Order

1. **Complete Authentication** (Priority 1)
   - Finish all auth forms
   - Complete auth mutations
   - Test error handling

2. **Complete Onboarding** (Priority 2)
   - Create onboarding forms
   - Complete onboarding mutations
   - Test server-driven flow

3. **UI Components** (Priority 3)
   - Layout components
   - Dashboard content
   - Public pages

4. **Polish & Integration** (Priority 4)
   - Loading states
   - Error states
   - Animations
   - Dark mode polish

## Testing Strategy

- Test all forms with validation
- Test error scenarios (network, 5xx, 4xx)
- Test onboarding step progression
- Test theme switching
- Test responsive design

## Key Implementation Notes

### Forms
- Always use `react-hook-form` with `zodResolver`
- Always use `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`
- Handle errors explicitly (no generic error messages)
- Show loading states during submission

### API Calls
- Always use TanStack Query hooks
- Never use `useEffect + fetch`
- Always handle loading, error, and success states
- Use `useServerError` hook for infrastructure errors

### State Management
- Server data → TanStack Query
- UI state → Zustand
- Form state → react-hook-form
- Never duplicate server data in Zustand

### Error Handling
- Business errors (4xx) → Show in form/UI
- Infrastructure errors (5xx, network) → Use `SomethingWentWrong`
- `account_not_activated` → Redirect to activation page

## Completion Criteria

Phase 2 is complete when:
- [ ] All authentication flows work end-to-end
- [ ] All onboarding flows work end-to-end
- [ ] All layouts have proper navigation
- [ ] Dashboard displays user data
- [ ] Public pages have content
- [ ] Error handling is consistent
- [ ] Loading states are consistent
- [ ] Theme system works everywhere
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Responsive design works

## Next Phase (Phase 3)

After Phase 2 completion:
- Advanced features
- Performance optimization
- Analytics integration
- Advanced error tracking
- A/B testing setup
