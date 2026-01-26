# Ressourcefy - Architecture Phase 1

## Overview

This document describes the frontend architecture for Ressourcefy Phase 1. The architecture is designed to be scalable, maintainable, and follows strict separation of concerns.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (public)/          # Public routes (no auth required)
│   │   ├── page.tsx       # Landing page
│   │   ├── pricing/
│   │   ├── about/
│   │   └── contact/
│   ├── (auth)/            # Authentication routes
│   │   └── auth/
│   │       ├── login/
│   │       ├── register/
│   │       ├── forgot-password/
│   │       ├── reset-password/
│   │       └── activate/
│   ├── (onboarding)/      # Onboarding flow (protected)
│   │   └── onboarding/
│   │       ├── activation-required/
│   │       ├── profile/
│   │       ├── interests/
│   │       └── done/
│   ├── (app)/             # Application routes (protected)
│   │   └── app/
│   │       └── page.tsx   # Dashboard
│   ├── layout.tsx         # Root layout with providers
│   └── globals.css        # Design tokens
│
├── components/            # Reusable UI components
│   └── ui/               # shadcn/ui components
│
├── services/              # API services
│   └── api/
│       ├── client.ts      # Axios client
│       └── queries/       # TanStack Query hooks
│
├── providers/             # React providers
│   ├── query-provider.tsx
│   └── theme-provider.tsx
│
├── stores/               # Zustand stores (UI state only)
│   └── use-ui-store.ts
│
├── types/                # TypeScript types
│   └── index.ts
│
├── constants/            # Constants
│   ├── routes.ts
│   └── api.ts
│
└── utils/                # Utility functions
    └── cookies.ts
```

## User States

The application uses explicit user states to drive UX:

1. **unauthenticated** - Public pages only
2. **authenticated_not_activated** - Redirected to `/onboarding/activation-required`
3. **authenticated_activated** - Can access onboarding flow
4. **onboarding_in_progress** - Must complete onboarding
5. **fully_onboarded** - Full access to `/app`

## Access Control

Access control is handled by Next.js middleware (`src/middleware.ts`):

- **No API fetching** in middleware
- **No UI logic** in middleware
- **Cookie-based** authentication state detection
- **Automatic redirects** based on user state

### Middleware Rules

- Unauthenticated → `/auth/login` (if accessing protected routes)
- Authenticated but not activated → `/onboarding/activation-required`
- Activated but onboarding incomplete → `/onboarding/profile`
- Fully onboarded → `/app` (redirects onboarding routes)

## State Management

### TanStack Query (Server State)

- **All server data** fetched via TanStack Query
- User data, auth status, account state
- **Never stored in Zustand**
- Server is the single source of truth

### Zustand (UI State Only)

- Theme (light/dark/system)
- Modal open/close states
- Sidebar collapse state
- **No server data** in Zustand
- Client-side UI state only

## Design System

### Color Palette

- **Primary (60%)**: Navy Blue / Petroleum Blue
- **Secondary (30%)**: Off-white / Paper beige
- **Accent (10%)**: Matte gold / Mustard (CTA only)

### Typography

- Font: Inter (highly readable sans-serif)
- Supports light & dark mode
- Theme persistence via Zustand

## API Structure

### Client Setup

- Base URL from `NEXT_PUBLIC_API_BASE_URL`
- Cookie-based authentication (`withCredentials: true`)
- Error transformation to `ApiError` format

### Query Hooks

- `useUser()` - Get current user
- `useLogin()` - Login mutation
- `useLogout()` - Logout mutation

## Routes

### Public Routes
- `/` - Landing page
- `/pricing` - Pricing page
- `/about` - About page
- `/contact` - Contact page

### Auth Routes
- `/auth/login` - Sign in
- `/auth/register` - Sign up
- `/auth/forgot-password` - Password reset request
- `/auth/reset-password` - Password reset (with token)
- `/auth/activate` - Account activation (from email)

### Onboarding Routes
- `/onboarding/activation-required` - Activation pending
- `/onboarding/profile` - Step 1: Profile setup
- `/onboarding/interests` - Step 2: Interests selection
- `/onboarding/done` - Completion (redirects to app)

### App Routes
- `/app` - Dashboard (protected)

## Phase 2 TODOs

### Authentication
- [ ] Implement login form with validation
- [ ] Implement registration form
- [ ] Implement password reset flow
- [ ] Implement account activation logic
- [ ] Add error handling for auth errors (e.g., `account_not_activated`)

### Onboarding
- [ ] Implement profile form
- [ ] Implement interests selection
- [ ] Add progress indicator
- [ ] Implement onboarding completion logic

### UI Components
- [ ] Add public header/navigation
- [ ] Add public footer
- [ ] Add auth branding/logo
- [ ] Add app header/navigation
- [ ] Add sidebar component
- [ ] Add dashboard content

### API Integration
- [ ] Connect all API endpoints
- [ ] Add request interceptors for token refresh
- [ ] Add error boundaries
- [ ] Add loading states
- [ ] Add error states

### Design
- [ ] Implement hero section
- [ ] Implement pricing cards
- [ ] Implement contact form
- [ ] Add animations and transitions
- [ ] Polish dark mode

## Key Principles

1. **Server is single source of truth** - Never duplicate server data in client state
2. **Explicit user states** - No ambiguous transitions
3. **Separation of concerns** - Middleware = access control, Components = UI, Services = API
4. **Type safety** - Strict TypeScript, no `any`
5. **Maintainability** - Clear structure, explicit over clever

## Environment Variables

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

## Running the Project

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.
