# Ressourcefy - Architecture Frontend Complète

> **Documentation complète de l'architecture frontend**  
> Dernière mise à jour: 2026-01-28  
> Version: 1.0

---

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Stack technique et dépendances](#stack-technique-et-dépendances)
3. [Structure des dossiers](#structure-des-dossiers)
4. [Architecture et patterns](#architecture-et-patterns)
5. [Fonctionnalités complètes](#fonctionnalités-complètes)
6. [Gestion d'état](#gestion-détat)
7. [Routing (Next.js App Router)](#routing-nextjs-app-router)
8. [API et services](#api-et-services)
9. [Composants UI](#composants-ui)
10. [Hooks personnalisés](#hooks-personnalisés)
11. [Types TypeScript](#types-typescript)
12. [Constantes et configuration](#constantes-et-configuration)
13. [Utilitaires](#utilitaires)
14. [Conventions de nommage](#conventions-de-nommage)
15. [Règles et principes](#règles-et-principes)
16. [Flux de données](#flux-de-données)
17. [Gestion des erreurs](#gestion-des-erreurs)
18. [Performance et optimisation](#performance-et-optimisation)
19. [Tests](#tests)

---

## Vue d'ensemble

**Ressourcefy** est une plateforme SaaS de partage de ressources éducatives avec un frontend Next.js 15 (App Router) et un backend Django/DRF.

### Caractéristiques principales

- **Framework**: Next.js 15.5.10 avec App Router
- **Langage**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: TanStack Query (server) + Zustand (UI)
- **Formulaires**: React Hook Form + Zod
- **Animations**: Framer Motion
- **Authentification**: JWT via HTTP-only cookies
- **Architecture**: Frontend-only, backend externe (API)

### Principes fondamentaux

1. **Single Source of Truth**: Le backend est la seule source de vérité pour les données
2. **Séparation stricte des responsabilités**: Pas de logique métier dans les composants UI
3. **Type Safety**: TypeScript strict, aucun `any`
4. **Server-Driven**: L'état d'onboarding et l'authentification sont gérés par le backend
5. **Non-bloquant**: Aucun écran mort, auto-récupération des erreurs

---

## Stack technique et dépendances

### Dépendances principales

```json
{
  "next": "15.5.10",                    // Framework React avec App Router
  "react": "^19.0.0",                    // Bibliothèque UI
  "react-dom": "^19.0.0",                // Rendu React
  "@tanstack/react-query": "^5.90.16",   // Gestion d'état serveur
  "zustand": "^5.0.3",                   // Gestion d'état UI (global)
  "axios": "^1.7.9",                     // Client HTTP
  "react-hook-form": "^7.54.2",         // Gestion de formulaires
  "zod": "^3.24.1",                      // Validation de schémas
  "@hookform/resolvers": "^3.10.0",     // Intégration Zod avec RHF
  "framer-motion": "^12.29.2",          // Animations
  "lucide-react": "^0.474.0",            // Icônes
  "tailwindcss": "^3.4.1",               // Framework CSS
  "clsx": "^2.1.1",                      // Utilitaires de classes CSS
  "tailwind-merge": "^2.6.0"             // Fusion de classes Tailwind
}
```

### Dépendances UI (Radix UI)

```json
{
  "@radix-ui/react-avatar": "^1.1.2",
  "@radix-ui/react-checkbox": "^1.3.3",
  "@radix-ui/react-dialog": "^1.1.5",
  "@radix-ui/react-dropdown-menu": "^2.1.6",
  "@radix-ui/react-label": "^2.1.1",
  "@radix-ui/react-select": "^2.1.6",
  "@radix-ui/react-separator": "^1.1.1",
  "@radix-ui/react-slot": "^1.1.2",
  "@radix-ui/react-toast": "^1.2.5",
  "@radix-ui/react-tooltip": "^1.1.7"
}
```

### Dépendances de développement

```json
{
  "typescript": "^5",
  "eslint": "^9",
  "eslint-config-next": "15.5.10",
  "@playwright/test": "^1.58.0",         // Tests E2E
  "jest": "^29.7.0",                     // Tests unitaires
  "@types/node": "^20",
  "@types/react": "^19",
  "@types/react-dom": "^19"
}
```

---

## Structure des dossiers

### Structure complète

```
resourcify_font/
├── src/
│   ├── app/                          # Next.js App Router (routing uniquement)
│   │   ├── (public)/                 # Routes publiques (groupes de routes)
│   │   │   ├── layout.tsx            # Layout public avec header/footer
│   │   │   ├── page.tsx               # Page d'accueil (landing)
│   │   │   ├── blog/
│   │   │   │   └── page.tsx          # Page blog
│   │   │   ├── contact/
│   │   │   │   └── page.tsx          # Page contact
│   │   │   └── pricing/
│   │   │       └── page.tsx          # Redirection vers /#pricing
│   │   │
│   │   ├── (auth)/                   # Routes d'authentification
│   │   │   ├── layout.tsx            # Layout auth
│   │   │   └── auth/
│   │   │       ├── login/
│   │   │       │   └── page.tsx      # Page de connexion
│   │   │       ├── register/
│   │   │       │   └── page.tsx      # Page d'inscription
│   │   │       ├── activate/
│   │   │       │   └── page.tsx      # Activation de compte
│   │   │       ├── forgot-password/
│   │   │       │   └── page.tsx      # Mot de passe oublié
│   │   │       ├── reset-password/
│   │   │       │   └── page.tsx      # Réinitialisation mot de passe
│   │   │       └── post-login/
│   │   │           └── page.tsx      # Point d'entrée post-login
│   │   │
│   │   ├── (onboarding)/             # Routes d'onboarding
│   │   │   ├── layout.tsx            # Layout onboarding
│   │   │   └── onboarding/
│   │   │       ├── page.tsx          # Redirection vers step approprié
│   │   │       ├── start/
│   │   │       │   └── page.tsx      # Démarrage onboarding
│   │   │       ├── profile/
│   │   │       │   └── page.tsx      # Étape profil
│   │   │       ├── interests/
│   │   │       │   └── page.tsx      # Étape intérêts
│   │   │       ├── activation-required/
│   │   │       │   └── page.tsx      # Activation requise
│   │   │       └── done/
│   │   │           └── page.tsx      # Onboarding terminé
│   │   │
│   │   ├── (app)/                    # Routes application (protégées)
│   │   │   ├── layout.tsx            # Layout app avec sidebar
│   │   │   ├── app/
│   │   │   │   └── page.tsx          # Dashboard utilisateur
│   │   │   ├── user/
│   │   │   │   └── page.tsx          # Profil utilisateur
│   │   │   └── admin/                # Routes administration
│   │   │       ├── layout.tsx        # Layout admin avec sidebar
│   │   │       ├── dashboard/
│   │   │       │   └── page.tsx      # Dashboard admin
│   │   │       ├── users/
│   │   │       │   └── page.tsx      # Gestion utilisateurs
│   │   │       ├── tags/
│   │   │       │   └── page.tsx      # Gestion tags
│   │   │       ├── resources/
│   │   │       │   └── page.tsx      # Gestion ressources
│   │   │       ├── subscriptions/
│   │   │       │   └── page.tsx      # Gestion abonnements
│   │   │       └── payments/
│   │   │           └── page.tsx      # Gestion paiements
│   │   │
│   │   ├── api/                      # API Routes Next.js (BFF)
│   │   │   ├── auth/
│   │   │   │   └── session/
│   │   │   │       └── route.ts      # Établissement de session
│   │   │   └── proxy/
│   │   │       └── [...path]/
│   │   │           └── route.ts      # Proxy vers backend Django
│   │   │
│   │   ├── error/
│   │   │   └── page.tsx              # Page d'erreur globale
│   │   ├── not-found.tsx             # Page 404
│   │   ├── layout.tsx                # Layout racine avec providers
│   │   └── globals.css               # Styles globaux + design tokens
│   │
│   ├── components/                    # Composants React réutilisables
│   │   ├── ui/                       # Composants UI de base (shadcn/ui)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── select.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── form.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── label.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── tooltip.tsx
│   │   │   └── toaster.tsx
│   │   │
│   │   ├── features/                 # Composants spécifiques aux features
│   │   │   ├── auth/
│   │   │   │   ├── login-form.tsx
│   │   │   │   ├── register-form.tsx
│   │   │   │   ├── activation-handler.tsx
│   │   │   │   └── resend-activation.tsx
│   │   │   └── onboarding/
│   │   │       ├── onboarding-flow.tsx
│   │   │       ├── onboarding-start-card.tsx
│   │   │       ├── profile-form.tsx
│   │   │       └── interests-form.tsx
│   │   │
│   │   ├── landing/                 # Sections de la landing page
│   │   │   ├── hero-section.tsx
│   │   │   ├── features-section.tsx
│   │   │   ├── how-it-works-section.tsx
│   │   │   └── cta-section.tsx
│   │   │
│   │   ├── pricing/                 # Composants pricing
│   │   │   ├── pricing-hero.tsx
│   │   │   ├── pricing-cards.tsx
│   │   │   ├── features-comparison.tsx
│   │   │   └── pricing-faq.tsx
│   │   │
│   │   ├── contact/                 # Composants contact
│   │   │   ├── contact-form.tsx
│   │   │   └── contact-info.tsx
│   │   │
│   │   ├── shared/                  # Composants partagés
│   │   │   ├── public-header.tsx    # Header public avec navigation
│   │   │   ├── public-footer.tsx    # Footer public
│   │   │   ├── app-header.tsx       # Header application
│   │   │   ├── app-sidebar.tsx      # Sidebar application
│   │   │   └── theme-selector.tsx   # Sélecteur de thème
│   │   │
│   │   ├── error/                   # Gestion d'erreurs
│   │   │   ├── error-boundary.tsx
│   │   │   └── something-went-wrong.tsx
│   │   │
│   │   └── onboarding/
│   │       └── onboarding-progress.tsx
│   │
│   ├── services/                     # Services API
│   │   └── api/
│   │       ├── client.ts             # Client Axios avec proxy
│   │       └── queries/              # TanStack Query hooks
│   │           ├── index.ts          # Export centralisé
│   │           ├── auth-queries.ts   # Hooks authentification
│   │           ├── onboarding-queries.ts
│   │           ├── resources-queries.ts
│   │           ├── comments-queries.ts
│   │           ├── authors-queries.ts
│   │           ├── billing-queries.ts
│   │           ├── password-reset-queries.ts
│   │           └── admin-queries.ts  # Hooks administration
│   │
│   ├── hooks/                       # Hooks React personnalisés
│   │   ├── use-onboarding-guard.ts  # Guard d'onboarding
│   │   ├── use-server-error.ts      # Gestion erreurs serveur
│   │   ├── use-theme.ts             # Hook thème
│   │   ├── use-toast.ts             # Hook notifications toast
│   │   └── userUses.ts              # Hooks utilisateur (legacy)
│   │
│   ├── stores/                      # Stores Zustand (état UI)
│   │   ├── use-ui-store.ts          # Store UI (theme, sidebar, modals)
│   │   ├── useAuthStore.tsx         # Store auth (legacy, à migrer)
│   │   └── useStore.tsx              # Store général (legacy)
│   │
│   ├── providers/                    # Providers React
│   │   ├── query-provider.tsx        # TanStack Query Provider
│   │   └── theme-provider.tsx        # Theme Provider (next-themes)
│   │
│   ├── types/                       # Types TypeScript
│   │   └── index.ts                 # Types globaux
│   │
│   ├── constants/                    # Constantes
│   │   ├── routes.ts                # Routes de l'application
│   │   └── api.ts                   # Endpoints API
│   │
│   ├── utils/                       # Fonctions utilitaires
│   │   ├── cookies.ts               # Utilitaires cookies
│   │   ├── onboarding-routes.ts     # Logique routes onboarding
│   │   ├── route-guards.ts          # Guards de routes
│   │   └── user-state.ts            # Utilitaires état utilisateur
│   │
│   ├── lib/                         # Bibliothèques et helpers
│   │   ├── validations/             # Schémas de validation Zod
│   │   │   ├── auth.ts
│   │   │   └── onboarding.ts
│   │   └── utils.ts                 # Utilitaires généraux (legacy)
│   │
│   ├── libs/                        # Bibliothèques personnalisées
│   │   ├── useTheme/                # Logique thème (legacy)
│   │   └── utils.ts                 # Utilitaires (cn, etc.)
│   │
│   ├── middleware.ts                # Next.js Middleware (routing)
│   │
│   ├── styles/                      # Styles globaux
│   │   ├── globalStyle.ts
│   │   └── theme.ts
│   │
│   └── models/                      # Modèles de données (legacy)
│       ├── hello.ts
│       └── users.ts
│
├── components/                       # Composants à la racine (legacy)
│   └── ui/
│       ├── dropdown-menu.tsx
│       └── select.tsx
│
├── lib/                             # Utilitaires à la racine
│   └── utils.ts                     # Fonction cn() pour Tailwind
│
├── public/                          # Assets statiques
│   ├── images/
│   └── *.svg
│
├── docs/                            # Documentation
│   ├── all_features.md              # Documentation backend
│   ├── endpoint_docs.md             # Documentation API
│   └── auth_implementation_summary.md
│
├── e2e/                             # Tests E2E (Playwright)
│   ├── happy-path.spec.ts
│   ├── middleware-redirects.spec.ts
│   ├── user-lifecycle.spec.ts
│   └── helpers/
│
├── package.json                     # Dépendances et scripts
├── tsconfig.json                    # Configuration TypeScript
├── tailwind.config.ts               # Configuration Tailwind
├── next.config.ts                   # Configuration Next.js
├── eslint.config.mjs                # Configuration ESLint
├── jest.config.js                   # Configuration Jest
├── playwright.config.ts             # Configuration Playwright
└── README.md                         # Documentation projet
```

### Explication des dossiers

#### `src/app/` - Next.js App Router

**Rôle**: Routing uniquement, pas de logique métier

- **Groupes de routes** `(public)`, `(auth)`, `(onboarding)`, `(app)`: Organisation logique des routes
- **Layouts**: Définissent la structure de chaque groupe (header, footer, sidebar)
- **Pages**: Composants de page simples qui délèguent aux composants de `components/`
- **API Routes**: Routes Next.js qui servent de BFF (Backend For Frontend)

**Règles**:
- ❌ Pas de logique métier dans les pages
- ❌ Pas d'appels API directs
- ❌ Pas de composants complexes
- ✅ Délégation aux composants de `components/`
- ✅ Utilisation des hooks de `services/api/queries/`

#### `src/components/` - Composants React

**Organisation par responsabilité**:

- **`ui/`**: Composants UI de base réutilisables (shadcn/ui)
- **`features/`**: Composants spécifiques aux features (auth, onboarding)
- **`landing/`**: Sections de la landing page
- **`pricing/`**: Composants de la page pricing
- **`contact/`**: Composants de la page contact
- **`shared/`**: Composants partagés (headers, footers, sidebars)
- **`error/`**: Composants de gestion d'erreurs

**Règles**:
- Un composant = une responsabilité
- Maximum 250 lignes par composant
- Pas de logique métier dans les composants UI
- Props entièrement typées

#### `src/services/api/` - Services API

**Structure**:
- **`client.ts`**: Client Axios configuré avec proxy Next.js
- **`queries/`**: Hooks TanStack Query organisés par domaine

**Pattern**: Un fichier par domaine fonctionnel
- `auth-queries.ts`: Authentification
- `onboarding-queries.ts`: Onboarding
- `resources-queries.ts`: Ressources
- `admin-queries.ts`: Administration

#### `src/hooks/` - Hooks personnalisés

Hooks réutilisables pour la logique métier côté client:
- `use-onboarding-guard.ts`: Redirection automatique selon l'étape d'onboarding
- `use-toast.ts`: Gestion des notifications toast
- `use-theme.ts`: Gestion du thème

#### `src/stores/` - Stores Zustand

**Rôle**: État UI uniquement (pas de données serveur)

- `use-ui-store.ts`: Theme, sidebar, modals
- **Règle**: Pas de duplication des données serveur

#### `src/constants/` - Constantes

- `routes.ts`: Toutes les routes de l'application
- `api.ts`: Tous les endpoints API

#### `src/utils/` - Utilitaires

Fonctions pures et helpers:
- `onboarding-routes.ts`: Logique de routing onboarding
- `route-guards.ts`: Guards de routes
- `cookies.ts`: Manipulation des cookies

---

## Architecture et patterns

### Pattern: Server-Driven Onboarding

**Principe**: Le backend est la seule source de vérité pour `onboarding_step`

```typescript
// ❌ MAUVAIS: Inférer l'état côté client
const step = user.profile ? "interests" : "profile";

// ✅ BON: Lire depuis le backend
const { user } = useUser();
const step = user?.onboarding_step; // "not_started" | "profile" | "interests" | "completed"
```

**Flux**:
1. Backend expose `onboarding_step` via `GET /user/me/`
2. Frontend lit cette valeur via `useUser()`
3. `useOnboardingGuard()` redirige automatiquement si nécessaire
4. Après chaque mutation onboarding, invalidation de `authKeys.user()`

### Pattern: Proxy API (BFF)

**Architecture**: Toutes les requêtes passent par `/api/proxy/*`

```
Frontend Component
    ↓
TanStack Query Hook
    ↓
apiClient (Axios)
    ↓
/api/proxy/[...path]/route.ts (Next.js API Route)
    ↓
Backend Django API
```

**Avantages**:
- Tokens dans HTTP-only cookies (sécurité)
- Pas d'exposition des tokens côté client
- Centralisation de la gestion d'erreurs
- Support CORS simplifié

### Pattern: Separation of Concerns

```
┌─────────────────────────────────────┐
│  app/ (Routing)                      │  ← Routing uniquement
├─────────────────────────────────────┤
│  components/ (UI)                    │  ← Présentation
├─────────────────────────────────────┤
│  services/api/queries/ (Data)        │  ← Récupération données
├─────────────────────────────────────┤
│  hooks/ (Logic)                     │  ← Logique métier client
├─────────────────────────────────────┤
│  stores/ (UI State)                 │  ← État UI local
└─────────────────────────────────────┘
```

### Pattern: Query Keys Organization

**Structure hiérarchique**:

```typescript
// Auth
authKeys = {
  all: ["auth"],
  user: () => [...authKeys.all, "user"]
}

// Admin
adminKeys = {
  all: ["admin"],
  users: {
    all: [...adminKeys.all, "users"],
    list: (page, pageSize) => [...adminKeys.users.all, "list", page, pageSize],
    detail: (id) => [...adminKeys.users.all, "detail", id]
  }
}
```

**Avantages**:
- Invalidation ciblée: `queryClient.invalidateQueries({ queryKey: adminKeys.users.all })`
- Organisation claire par domaine
- Évite les collisions de clés

---

## Fonctionnalités complètes

Cette section détaille toutes les fonctionnalités implémentées dans l'application frontend Ressourcefy, organisées par domaine fonctionnel.

### 1. Authentification et gestion de compte

#### 1.1 Connexion (`/auth/login`)
- **Composant**: `components/features/auth/login-form.tsx`
- **Hook**: `useLogin()` dans `services/api/queries/auth-queries.ts`
- **Fonctionnalités**:
  - Formulaire de connexion avec email et mot de passe
  - Validation côté client avec Zod
  - Gestion des erreurs spécifiques (compte non activé, identifiants invalides)
  - Redirection automatique après connexion selon l'état d'onboarding
  - Support du bouton "Renvoyer l'email d'activation" si le compte n'est pas activé
- **Flux**:
  1. L'utilisateur saisit ses identifiants
  2. Appel à `POST /auth/login/` via le proxy
  3. Le backend définit les cookies HTTP-only (access_token, refresh_token, activated, onboarding_step)
  4. Appel à `/api/auth/session` pour établir la session
  5. Redirection vers `/auth/post-login` qui redirige selon `onboarding_step`

#### 1.2 Inscription (`/auth/register`)
- **Composant**: `components/features/auth/register-form.tsx`
- **Hook**: `useRegister()` dans `services/api/queries/auth-queries.ts`
- **Fonctionnalités**:
  - Formulaire d'inscription avec email et mot de passe
  - Validation des mots de passe (confirmation, force)
  - Envoi automatique d'email d'activation après inscription
  - Redirection vers la page d'activation requise
- **Flux**:
  1. L'utilisateur remplit le formulaire
  2. Appel à `POST /auth/register/`
  3. Redirection vers `/onboarding/activation-required/`

#### 1.3 Activation de compte (`/auth/activate`)
- **Composant**: `components/features/auth/activation-handler.tsx`
- **Hook**: `useActivateAccount()` dans `services/api/queries/auth-queries.ts`
- **Fonctionnalités**:
  - Activation automatique via token dans l'URL (`?token=...`)
  - Gestion des tokens expirés ou invalides
  - Redirection automatique après activation réussie
  - Protection contre les appels multiples (useRef)
- **Flux**:
  1. L'utilisateur clique sur le lien dans l'email
  2. Le token est extrait de l'URL
  3. Appel à `POST /auth/activate/` avec le token
  4. Redirection vers l'onboarding approprié

#### 1.4 Renvoi d'email d'activation
- **Composant**: `components/features/auth/resend-activation.tsx`
- **Hook**: `useResendActivation()` dans `services/api/queries/auth-queries.ts`
- **Fonctionnalités**:
  - Bouton pour renvoyer l'email d'activation
  - Affichage conditionnel si le compte n'est pas activé
  - Feedback utilisateur (toast) après envoi

#### 1.5 Mot de passe oublié (`/auth/forgot-password`)
- **Composant**: Page dédiée avec formulaire
- **Hook**: `useRequestPasswordReset()` dans `services/api/queries/password-reset-queries.ts`
- **Fonctionnalités**:
  - Demande de réinitialisation par email
  - Envoi d'email avec lien de réinitialisation

#### 1.6 Réinitialisation de mot de passe (`/auth/reset-password`)
- **Composant**: Page dédiée avec formulaire
- **Hook**: `useConfirmPasswordReset()` dans `services/api/queries/password-reset-queries.ts`
- **Fonctionnalités**:
  - Réinitialisation avec token depuis l'email
  - Validation des nouveaux mots de passe
  - Confirmation de réinitialisation réussie

#### 1.7 Déconnexion
- **Hook**: `useLogout()` dans `services/api/queries/auth-queries.ts`
- **Fonctionnalités**:
  - Déconnexion avec suppression des cookies
  - Redirection vers la page d'accueil
  - Invalidation du cache TanStack Query

### 2. Onboarding

Le processus d'onboarding est **server-driven** : le backend expose `onboarding_step` qui détermine l'étape actuelle.

#### 2.1 Démarrage de l'onboarding (`/onboarding/start`)
- **Composant**: `components/features/onboarding/onboarding-start-card.tsx`
- **Hook**: `useStartOnboarding()` dans `services/api/queries/onboarding-queries.ts`
- **Fonctionnalités**:
  - Carte de bienvenue pour démarrer l'onboarding
  - Appel à `POST /onboarding/start/` pour initialiser le processus
  - Redirection automatique vers l'étape suivante

#### 2.2 Étape profil (`/onboarding/profile`)
- **Composant**: `components/features/onboarding/profile-form.tsx`
- **Hook**: `useSubmitOnboardingProfile()` dans `services/api/queries/onboarding-queries.ts`
- **Fonctionnalités**:
  - Formulaire pour compléter le profil (username, bio, avatar_url)
  - Validation avec Zod
  - Upload d'avatar (URL)
  - Redirection automatique vers l'étape des intérêts après soumission
- **Guard**: `useOnboardingGuard("profile")` redirige si l'utilisateur n'est pas à cette étape

#### 2.3 Étape intérêts (`/onboarding/interests`)
- **Composant**: `components/features/onboarding/interests-form.tsx`
- **Hook**: `useSubmitOnboardingInterests()` dans `services/api/queries/onboarding-queries.ts`
- **Hook Tags**: `useTags()` dans `services/api/queries/tags-queries.ts`
- **Fonctionnalités**:
  - Sélection multiple de tags d'intérêts
  - Récupération dynamique des tags depuis `GET /tags/`
  - Affichage avec loading skeletons
  - Validation (minimum 1 tag sélectionné)
  - Redirection vers `/onboarding/done` après soumission
- **Guard**: `useOnboardingGuard("interests")` redirige si l'utilisateur n'est pas à cette étape

#### 2.4 Activation requise (`/onboarding/activation-required`)
- **Composant**: Page dédiée
- **Fonctionnalités**:
  - Message informatif expliquant qu'un email d'activation a été envoyé
  - Bouton pour renvoyer l'email d'activation
  - Redirection automatique si le compte est déjà activé

#### 2.5 Onboarding terminé (`/onboarding/done`)
- **Composant**: `components/features/onboarding/onboarding-flow.tsx`
- **Fonctionnalités**:
  - Message de félicitations
  - Redirection automatique vers `/app` (dashboard)

#### 2.6 Gestion du flux d'onboarding
- **Composant**: `components/features/onboarding/onboarding-flow.tsx`
- **Hook**: `useOnboardingStep()` dans `services/api/queries/onboarding-queries.ts`
- **Fonctionnalités**:
  - Indicateur de progression visuel
  - Navigation automatique selon `user.onboarding_step`
  - Protection des routes avec `useOnboardingGuard()`

### 3. Application principale (Dashboard)

#### 3.1 Dashboard utilisateur (`/app`)
- **Composant**: `app/(app)/app/page.tsx`
- **Fonctionnalités**:
  - Message de bienvenue personnalisé avec le nom d'utilisateur
  - Sélecteur de thème dans le header
  - Formulaire de création de ressource (si rôle autorisé)
  - Liste des ressources publiques avec pagination
  - Affichage des statistiques (commentaires, votes) pour chaque ressource
- **Accès**: Tous les utilisateurs authentifiés et complètement onboardés

#### 3.2 Création de ressource
- **Composant**: `components/features/resources/create-resource-form.tsx`
- **Hook**: `useCreateResource()` dans `services/api/queries/resources-queries.ts`
- **Fonctionnalités**:
  - Formulaire style X/Twitter pour créer une ressource
  - Champs: titre, description, visibilité (public/premium/private), prix, URL de fichier, tags
  - Sélection multiple de tags depuis la liste publique
  - Validation avec gestion d'erreurs
  - Création automatique de la première version de la ressource
  - Accessible uniquement aux rôles: SUPERADMIN, ADMIN, MODERATOR, CONTRIBUTOR
- **Endpoint**: `POST /resources/` (l'utilisateur authentifié devient automatiquement l'auteur)

#### 3.3 Liste des ressources
- **Composant**: `components/features/resources/resource-list.tsx`
- **Hook**: `useResourceFeed()` dans `services/api/queries/resources-queries.ts`
- **Fonctionnalités**:
  - Affichage paginé des ressources publiques
  - Cartes de ressources avec:
    - Informations auteur (nom, avatar)
    - Titre et description
    - Tags associés
    - Statistiques (commentaires, upvotes, downvotes, total votes)
    - Badges de visibilité (premium, private)
    - Prix si applicable
  - Navigation vers la page de détail au clic
  - États de chargement (skeletons) et d'erreur

### 4. Gestion des ressources

#### 4.1 Page de ressources utilisateur (`/app/resources`)
- **Composant**: `app/(app)/app/resources/page.tsx`
- **Fonctionnalités**:
  - **Deux onglets**:
    - **"Mes ressources"**: Affiche uniquement les ressources créées par l'utilisateur connecté
    - **"Ressources suivies"**: Affiche les ressources que l'utilisateur suit (avec progression)
  - Persistance de la sélection d'onglet dans localStorage
  - **Accès différencié**:
    - **USER**: Voit uniquement l'onglet "Ressources suivies" (pas d'onglets visibles)
    - **Autres rôles**: Voient les deux onglets et peuvent basculer
- **Hooks utilisés**:
  - `useUserResources()` pour les ressources de l'utilisateur
  - `useUserProgress()` pour les ressources suivies avec progression
- **Affichage**:
  - Cartes de ressources avec toutes les métadonnées
  - Pour les ressources suivies: statut de progression (NOT_STARTED, IN_PROGRESS, COMPLETED)
  - Statistiques de progression (total, complétés, en cours, non démarrés)

#### 4.2 Détail d'une ressource (`/app/resources/[id]`)
- **Composant**: `app/(app)/app/resources/[id]/page.tsx`
- **Hooks utilisés**:
  - `useResourceDetail()` pour les détails de la ressource
  - `useResourceComments()` pour les commentaires paginés
  - `useCreateComment()` pour créer un commentaire
  - `useVoteOnComment()` pour voter sur un commentaire
  - `useVoteOnResource()` pour voter sur la ressource
  - `useAccessResource()` pour initialiser le suivi de progression
  - `useResourceProgress()` pour afficher la progression de l'utilisateur
- **Fonctionnalités**:
  - **Affichage de la ressource**:
    - Titre, description, auteur, tags
    - Visibilité et prix
    - Versions disponibles avec liens de téléchargement
    - Statistiques de votes (upvotes, downvotes, total)
    - Boutons de vote interactifs (upvote/downvote)
  - **Commentaires**:
    - Liste paginée des commentaires
    - Formulaire de création de commentaire
    - Affichage de chaque commentaire avec:
      - Auteur (nom, avatar)
      - Contenu
      - Date de création (formatée)
      - Statistiques de votes
      - Boutons de vote interactifs
    - Pagination avec navigation
  - **Suivi de progression**:
    - Appel automatique à `/resources/{id}/access/` lors du chargement
    - Affichage du statut de progression (IN_PROGRESS, COMPLETED)
    - Bouton pour marquer comme complété
  - **États**:
    - Loading avec skeletons
    - Erreur avec message explicite
    - Not found si la ressource n'existe pas

#### 4.3 Vote sur ressource
- **Hook**: `useVoteOnResource()` dans `services/api/queries/resources-queries.ts`
- **Fonctionnalités**:
  - Vote positif (upvote) ou négatif (downvote)
  - Mise à jour optimiste de l'UI
  - Invalidation du cache pour rafraîchir les données
  - Gestion des erreurs avec toast
- **Endpoint**: `POST /resources/vote/`

#### 4.4 Vote sur commentaire
- **Hook**: `useVoteOnComment()` dans `services/api/queries/comments-queries.ts`
- **Fonctionnalités**:
  - Vote positif ou négatif sur un commentaire
  - Mise à jour immédiate des statistiques
  - Invalidation du cache des commentaires
- **Endpoint**: `POST /comments/vote/`

#### 4.5 Création de commentaire
- **Hook**: `useCreateComment()` dans `services/api/queries/comments-queries.ts`
- **Fonctionnalités**:
  - Formulaire de création avec validation
  - Soumission avec gestion d'erreurs
  - Rafraîchissement automatique de la liste des commentaires
  - Réinitialisation du formulaire après succès
- **Endpoint**: `POST /comments/`

### 5. Suivi de progression (Progress Tracking)

#### 5.1 Progression utilisateur
- **Hook**: `useUserProgress()` dans `services/api/queries/progress-queries.ts`
- **Fonctionnalités**:
  - Liste paginée de toutes les ressources suivies par l'utilisateur
  - Statistiques globales (total, complétés, en cours, non démarrés)
  - Informations par ressource:
    - Titre et auteur
    - Statut (NOT_STARTED, IN_PROGRESS, COMPLETED)
    - Dates (début, dernier accès, complétion)
- **Endpoint**: `GET /user/progress/`

#### 5.2 Progression d'une ressource spécifique
- **Hook**: `useResourceProgress()` dans `services/api/queries/progress-queries.ts`
- **Fonctionnalités**:
  - Récupération du statut de progression pour une ressource donnée
  - Affichage dans la page de détail de la ressource
- **Endpoint**: `GET /resources/{id}/progress/`

#### 5.3 Marquer une ressource comme complétée
- **Hook**: `useCompleteResourceProgress()` dans `services/api/queries/progress-queries.ts`
- **Fonctionnalités**:
  - Marquer une ressource comme complétée
  - Mise à jour automatique du statut à COMPLETED
  - Invalidation du cache pour rafraîchir l'UI
- **Endpoint**: `POST /resources/{id}/complete/`

#### 5.4 Accès à une ressource (initialisation du suivi)
- **Hook**: `useAccessResource()` dans `services/api/queries/resources-queries.ts`
- **Fonctionnalités**:
  - Appel automatique lors de l'affichage d'une ressource
  - Création automatique d'un suivi avec statut IN_PROGRESS
  - Non-bloquant (erreurs ignorées silencieusement)
- **Endpoint**: `GET /resources/{id}/access/`

#### 5.5 Progression de tous les utilisateurs sur une ressource (pour auteurs/admins)
- **Hook**: `useResourceUsersProgress()` dans `services/api/queries/progress-queries.ts`
- **Fonctionnalités**:
  - Liste paginée de tous les utilisateurs qui suivent une ressource
  - Statistiques par utilisateur:
    - Email, username, avatar
    - Statut de progression
    - Dates (début, dernier accès, complétion)
  - Statistiques globales (total, complétés, en cours, non démarrés)
  - Accessible aux auteurs de la ressource et aux admins
- **Endpoint**: `GET /resources/{id}/users-progress/`

### 6. Profil et paramètres utilisateur

#### 6.1 Page de profil (`/app/profile`)
- **Composant**: `app/(app)/app/profile/page.tsx`
- **Hook**: `useUser()` dans `services/api/queries/auth-queries.ts`
- **Fonctionnalités**:
  - Affichage des informations utilisateur:
    - Email, username, bio, avatar
    - Rôle
    - Statut d'activation
    - Étape d'onboarding
    - Dates de création et mise à jour
  - États de chargement et d'erreur
  - Navigation depuis le menu utilisateur dans la sidebar

#### 6.2 Page de paramètres (`/app/settings`)
- **Composant**: `app/(app)/app/settings/page.tsx`
- **Hooks**:
  - `useUser()` pour les données utilisateur
  - `useUpdateProfile()` pour mettre à jour le profil
  - `useRequestRole()` pour demander un changement de rôle
- **Fonctionnalités**:
  - **Section Apparence**:
    - Sélecteur de thème (light/dark/system)
  - **Section Notifications**:
    - Paramètres de notifications (à venir)
  - **Section Sécurité**:
    - Changement de mot de passe (à venir)
  - **Section Compte**:
    - Mise à jour du profil (username, bio, avatar)
    - Demande de changement de rôle (MODERATOR, CONTRIBUTOR)
  - Navigation depuis le menu utilisateur dans la sidebar

#### 6.3 Mise à jour du profil
- **Hook**: `useUpdateProfile()` dans `services/api/queries/auth-queries.ts`
- **Fonctionnalités**:
  - Mise à jour du username, bio, avatar_url
  - Validation avec gestion d'erreurs
  - Rafraîchissement automatique des données utilisateur
- **Endpoint**: `PATCH /user/profile/`

#### 6.4 Demande de changement de rôle
- **Hook**: `useRequestRole()` dans `services/api/queries/auth-queries.ts`
- **Fonctionnalités**:
  - Demande de changement vers MODERATOR ou CONTRIBUTOR
  - Validation et feedback utilisateur
- **Endpoint**: `POST /user/request-role/`

### 7. Administration

L'interface d'administration est accessible uniquement aux rôles **ADMIN** et **SUPERADMIN**. Le menu d'administration est intégré dans la sidebar principale comme sous-menu.

#### 7.1 Dashboard admin (`/admin/dashboard`)
- **Composant**: `app/(app)/admin/dashboard/page.tsx`
- **Hooks**:
  - `useDashboardOverview()` pour les statistiques globales
  - `useDashboardActivity()` pour l'activité récente
  - `useSystemHealth()` pour l'état du système
- **Fonctionnalités**:
  - Vue d'ensemble des statistiques (utilisateurs, ressources, abonnements, paiements)
  - Activité récente du système
  - État de santé du système
- **Endpoint**: `GET /admin/dashboard/overview/`

#### 7.2 Gestion des utilisateurs (`/admin/users`)
- **Composant**: `app/(app)/admin/users/page.tsx`
- **Hooks**:
  - `useAdminUsers()` pour la liste paginée avec recherche
  - `useSetUserRole()` pour modifier le rôle d'un utilisateur
  - `useDeleteAdminUser()` pour supprimer un utilisateur
  - `useResetUserPassword()` pour réinitialiser le mot de passe
- **Fonctionnalités**:
  - **Liste des utilisateurs**:
    - Affichage paginé (20 par page)
    - Recherche en temps réel avec debounce (500ms)
    - Colonnes: email, username, rôle, statut d'activation, dates
  - **Actions sur un utilisateur**:
    - Modification du rôle (SUPERADMIN uniquement)
    - Suppression (avec confirmation)
    - Réinitialisation du mot de passe
  - **Dialogue de modification de rôle**:
    - Sélection du nouveau rôle via Select
    - Confirmation avant modification
  - États de chargement (skeletons) et d'erreur
- **Endpoints**:
  - `GET /admin/users/` (avec recherche et pagination)
  - `POST /admin/users/{id}/set_role/`
  - `DELETE /admin/users/{id}/`
  - `POST /admin/users/{id}/reset_password/`

#### 7.3 Gestion des tags (`/admin/tags`)
- **Composant**: `app/(app)/admin/tags/page.tsx`
- **Hooks**:
  - `useAdminTags()` pour la liste avec recherche
  - `useCreateTag()` pour créer un tag
  - `useUpdateTag()` pour modifier un tag
  - `useDeleteTag()` pour supprimer un tag
  - `useMergeTags()` pour fusionner deux tags
- **Fonctionnalités**:
  - **Liste des tags**:
    - Affichage paginé avec recherche
    - Colonnes: nom, slug, dates de création/modification
  - **CRUD complet**:
    - Création via dialogue
    - Modification via dialogue
    - Suppression avec confirmation
  - **Fusion de tags**:
    - Sélection du tag source et du tag cible via Select
    - Validation (tags différents)
    - Résumé de la fusion avant confirmation
    - Fusion de toutes les ressources associées
  - États de chargement et d'erreur
- **Endpoints**:
  - `GET /admin/tags/`
  - `POST /admin/tags/`
  - `PATCH /admin/tags/{id}/`
  - `DELETE /admin/tags/{id}/`
  - `POST /admin/tags/merge/`

#### 7.4 Gestion des ressources (`/admin/resources`)
- **Composant**: `app/(app)/admin/resources/page.tsx`
- **Hooks**:
  - `useResourceFeed()` pour la liste des ressources publiques
  - `useResourceUsersProgress()` pour les suivis d'une ressource
  - `useDeleteAdminResource()` pour supprimer une ressource
- **Fonctionnalités**:
  - **Liste des ressources**:
    - Affichage de toutes les ressources publiques
    - Informations: titre, auteur, visibilité, prix, tags, statistiques
    - Lien vers la page de détail
  - **Suivi des utilisateurs par ressource**:
    - Bouton "Suivis" pour chaque ressource
    - Section expandable avec:
      - Statistiques (total utilisateurs, complétés, en cours, non démarrés)
      - Liste paginée des utilisateurs avec leur progression
      - Informations par utilisateur (email, username, avatar, statut, dates)
    - Pagination des utilisateurs (10 par page)
  - **Actions**:
    - Suppression de ressource (avec confirmation)
    - Navigation vers le détail
  - États de chargement et d'erreur
- **Endpoints**:
  - `GET /feed/` (liste publique)
  - `GET /resources/{id}/users-progress/` (suivis)
  - `DELETE /admin/resources/{id}/`

#### 7.5 Gestion des abonnements (`/admin/subscriptions`)
- **Composant**: `app/(app)/admin/subscriptions/page.tsx`
- **Hooks**:
  - `useAdminSubscriptions()` pour la liste avec filtres
  - `useUpdateAdminSubscription()` pour modifier un abonnement
  - `useCancelAdminSubscription()` pour annuler un abonnement
- **Fonctionnalités**:
  - Liste paginée des abonnements
  - Filtres par statut, plan, etc.
  - Modification et annulation d'abonnements
- **Endpoints**:
  - `GET /admin/subscriptions/`
  - `PATCH /admin/subscriptions/{id}/`
  - `POST /admin/subscriptions/{id}/cancel/`

#### 7.6 Gestion des paiements (`/admin/payments`)
- **Composant**: `app/(app)/admin/payments/page.tsx`
- **Hooks**:
  - `useAdminPayments()` pour la liste avec filtres
  - `useRefundPayment()` pour rembourser un paiement
- **Fonctionnalités**:
  - Liste paginée des paiements
  - Filtres par statut, méthode, etc.
  - Remboursement de paiements
- **Endpoints**:
  - `GET /admin/payments/`
  - `POST /admin/payments/{id}/refund/`

### 8. Pages publiques

#### 8.1 Page d'accueil (`/`)
- **Composant**: `app/(public)/page.tsx`
- **Sections**:
  - **Hero Section**: Présentation de l'application avec CTA principal
  - **Features Section**: Fonctionnalités principales avec navigation
  - **How It Works Section**: Processus d'utilisation
  - **Pricing Section**: Section tarification intégrée (id="pricing")
  - **CTA Section**: Appel à l'action final
- **Navigation**:
  - Header fixe qui apparaît au scroll (>400px) avec animation Framer Motion
  - Navigation vers les sections (accueil, fonctionnalités, tarif, blog, contact)
  - Sélecteur de thème

#### 8.2 Page blog (`/blog`)
- **Composant**: `app/(public)/blog/page.tsx`
- **Fonctionnalités**:
  - Page blog (contenu à venir)

#### 8.3 Page contact (`/contact`)
- **Composant**: `app/(public)/contact/page.tsx`
- **Composants**:
  - `components/contact/contact-form.tsx`: Formulaire de contact
  - `components/contact/contact-info.tsx`: Informations de contact
- **Fonctionnalités**:
  - Formulaire de contact avec validation
  - Informations de contact (email, adresse, etc.)

#### 8.4 Page pricing (`/pricing`)
- **Composant**: `app/(public)/pricing/page.tsx`
- **Fonctionnalités**:
  - Redirection vers `/#pricing` (section pricing dans l'accueil)
  - Les composants pricing sont intégrés dans la page d'accueil:
    - `PricingHero`: En-tête de la section
    - `PricingCards`: Cartes des plans tarifaires
    - `FeaturesComparison`: Comparaison des fonctionnalités
    - `PricingFaq`: FAQ sur les tarifs

### 9. Navigation et layout

#### 9.1 Sidebar application (`AppSidebar`)
- **Composant**: `components/shared/app-sidebar.tsx`
- **Fonctionnalités**:
  - **Navigation principale**:
    - Accueil (`/app`)
    - Ressources (`/app/resources`)
    - Profil (`/app/profile`)
    - Paramètres (`/app/settings`)
  - **Menu Administration** (visible uniquement pour ADMIN/SUPERADMIN):
    - Sous-menu expandable avec:
      - Dashboard admin
      - Utilisateurs
      - Tags
      - Ressources
      - Abonnements
      - Paiements
  - **Menu utilisateur** (dropdown):
    - Profil
    - Paramètres
    - Déconnexion
  - **Style X/Twitter**:
    - Icônes grandes et visibles
    - Labels visibles
    - Items arrondis
    - Bouton "Publier" pour créer une ressource
  - **Responsive**: Masquée sur mobile, visible sur desktop

#### 9.2 Layout application (`(app)/layout.tsx`)
- **Composant**: `app/(app)/layout.tsx`
- **Fonctionnalités**:
  - **Layout 3 colonnes** (style X/Twitter):
    - **Colonne gauche**: Sidebar fixe
    - **Colonne centrale**: Contenu principal avec scroll
    - **Colonne droite**: Suggestions (masquée sur mobile)
  - **Contraintes**:
    - `max-w-7xl mx-auto` pour toute la largeur
    - Fond uniforme (`bg-background`) pour toutes les colonnes
    - Scrollbars cachées (`scrollbar-hide`)
  - **Provider**: `SidebarProvider` pour la gestion de l'état de la sidebar

#### 9.3 Header public (`PublicHeader`)
- **Composant**: `components/shared/public-header.tsx`
- **Fonctionnalités**:
  - **Deux headers**:
    - Header normal (visible en flux normal)
    - Header fixe (overlay) qui apparaît au scroll (>400px)
  - **Animation**: Framer Motion pour l'apparition du header fixe
  - **Navigation**: Liens vers accueil, fonctionnalités, tarif, blog, contact
  - **Sélecteur de thème**: Intégré dans le header

#### 9.4 Footer public (`PublicFooter`)
- **Composant**: `components/shared/public-footer.tsx`
- **Fonctionnalités**:
  - Liens vers les pages importantes
  - Informations légales
  - Liens sociaux

### 10. Thème et personnalisation

#### 10.1 Système de thème
- **Provider**: `providers/theme-provider.tsx` (next-themes)
- **Hook**: `useTheme()` dans `hooks/use-theme.ts`
- **Fonctionnalités**:
  - Support de 3 modes: `light`, `dark`, `system`
  - Persistance dans localStorage
  - Application automatique au chargement
  - Sélecteur de thème dans le header et la sidebar

#### 10.2 Sélecteur de thème
- **Composant**: `components/shared/theme-selector.tsx`
- **Fonctionnalités**:
  - Dropdown avec 3 options (light, dark, system)
  - Icônes pour chaque mode
  - Mise à jour immédiate du thème

### 11. Gestion des erreurs

#### 11.1 Error Boundary
- **Composant**: `components/error/error-boundary.tsx`
- **Fonctionnalités**:
  - Capture des erreurs React non gérées
  - Affichage d'une page d'erreur avec possibilité de réessayer

#### 11.2 Page d'erreur générique
- **Composant**: `components/error/something-went-wrong.tsx`
- **Fonctionnalités**:
  - Message d'erreur générique
  - Bouton pour réessayer ou retourner à l'accueil

#### 11.3 Gestion des erreurs API
- **Hook**: `useServerError()` dans `hooks/use-server-error.ts`
- **Fonctionnalités**:
  - Détection des erreurs serveur (500, 502, etc.)
  - Affichage conditionnel de messages d'erreur
  - Gestion des erreurs spécifiques (compte non activé, etc.)

### 12. Notifications (Toast)

#### 12.1 Système de toast
- **Hook**: `useToast()` dans `hooks/use-toast.ts`
- **Composant**: `components/ui/toaster.tsx`
- **Fonctionnalités**:
  - Notifications toast pour les actions utilisateur
  - Variantes: default, destructive, success
  - Auto-dismiss configurable
  - Position configurable

### 13. Middleware et routing

#### 13.1 Middleware Next.js (`middleware.ts`)
- **Fichier**: `src/middleware.ts`
- **Fonctionnalités**:
  - **Contrôle d'accès basé sur les cookies**:
    - Vérification de `access_token` (authentification)
    - Vérification de `activated` (activation de compte)
    - Vérification de `onboarding_step` (onboarding)
  - **Redirections automatiques**:
    - Non authentifié → `/auth/login`
    - Non activé → `/onboarding/activation-required`
    - Onboarding incomplet → étape appropriée
    - Complètement onboardé → `/app`
  - **Protection des routes**:
    - Routes admin → vérification du rôle
    - Routes publiques → accessibles sans authentification
  - **Règles**:
    - Pas d'appels API dans le middleware
    - Lecture des cookies uniquement
    - Redirections uniquement

#### 13.2 Guards de routes
- **Fichier**: `utils/route-guards.ts`
- **Fonction**: `canAccessRoute(userState, route)`
- **Fonctionnalités**:
  - Vérification si un état utilisateur peut accéder à une route
  - Utilisé par le middleware et les composants

### 14. API Proxy (BFF)

#### 14.1 Proxy API (`/api/proxy/[...path]`)
- **Fichier**: `app/api/proxy/[...path]/route.ts`
- **Fonctionnalités**:
  - **Backend For Frontend (BFF)**:
    - Toutes les requêtes passent par ce proxy
    - Lecture de `access_token` depuis HTTP-only cookie
    - Ajout automatique du header `Authorization: Bearer ${token}`
  - **Gestion des erreurs**:
    - 401 → Déconnexion automatique
    - Transmission des erreurs au frontend
  - **Endpoints publics**:
    - `/auth/login`, `/auth/register`, `/auth/activate`, etc.
    - `/tags/` (liste publique)
    - `/health/live`, `/health/ready`
  - **Support des méthodes**: GET, POST, PATCH, DELETE
  - **Transmission des cookies**: Backend → Frontend

### 15. Hooks TanStack Query disponibles

#### 15.1 Authentification (`auth-queries.ts`)
- `useUser()`: Récupérer l'utilisateur actuel
- `useLogin()`: Connexion
- `useRegister()`: Inscription
- `useLogout()`: Déconnexion
- `useActivateAccount()`: Activation de compte
- `useResendActivation()`: Renvoyer l'email d'activation
- `useUpdateProfile()`: Mettre à jour le profil
- `useRequestRole()`: Demander un changement de rôle

#### 15.2 Onboarding (`onboarding-queries.ts`)
- `useOnboardingStep()`: Récupérer l'étape d'onboarding
- `useStartOnboarding()`: Démarrer l'onboarding
- `useSubmitOnboardingProfile()`: Soumettre le profil
- `useSubmitOnboardingInterests()`: Soumettre les intérêts

#### 15.3 Ressources (`resources-queries.ts`)
- `useResourceFeed()`: Liste paginée des ressources publiques
- `useUserResources()`: Ressources créées par l'utilisateur
- `useResourceDetail()`: Détails d'une ressource
- `useCreateResource()`: Créer une ressource
- `useUpdateResource()`: Mettre à jour une ressource
- `useDeleteResource()`: Supprimer une ressource
- `useAccessResource()`: Accéder à une ressource (initialise le suivi)
- `useVoteOnResource()`: Voter sur une ressource
- `useCreateResourceVersion()`: Créer une version de ressource

#### 15.4 Commentaires (`comments-queries.ts`)
- `useResourceComments()`: Liste paginée des commentaires d'une ressource
- `useCreateComment()`: Créer un commentaire
- `useVoteOnComment()`: Voter sur un commentaire

#### 15.5 Progression (`progress-queries.ts`)
- `useUserProgress()`: Liste de progression de l'utilisateur
- `useResourceProgress()`: Progression pour une ressource spécifique
- `useCompleteResourceProgress()`: Marquer une ressource comme complétée
- `useResourceUsersProgress()`: Tous les utilisateurs qui suivent une ressource
- `useAdminProgress()`: Toutes les progressions (admin uniquement)

#### 15.6 Tags (`tags-queries.ts`)
- `useTags()`: Liste publique des tags

#### 15.7 Administration (`admin-queries.ts`)
- **Utilisateurs**:
  - `useAdminUsers()`: Liste avec recherche
  - `useAdminUserDetail()`: Détails d'un utilisateur
  - `useSetUserRole()`: Modifier le rôle
  - `useDeleteAdminUser()`: Supprimer un utilisateur
  - `useResetUserPassword()`: Réinitialiser le mot de passe
- **Tags**:
  - `useAdminTags()`: Liste avec recherche
  - `useCreateTag()`: Créer un tag
  - `useUpdateTag()`: Modifier un tag
  - `useDeleteTag()`: Supprimer un tag
  - `useMergeTags()`: Fusionner deux tags
- **Ressources**:
  - `useAdminResources()`: Liste avec filtres
  - `useCreateAdminResource()`: Créer une ressource
  - `useUpdateAdminResource()`: Modifier une ressource
  - `useDeleteAdminResource()`: Supprimer une ressource
- **Abonnements**:
  - `useAdminSubscriptions()`: Liste avec filtres
  - `useUpdateAdminSubscription()`: Modifier un abonnement
  - `useCancelAdminSubscription()`: Annuler un abonnement
- **Paiements**:
  - `useAdminPayments()`: Liste avec filtres
  - `useRefundPayment()`: Rembourser un paiement
- **Dashboard**:
  - `useDashboardOverview()`: Statistiques globales
  - `useDashboardActivity()`: Activité récente
  - `useSystemHealth()`: État du système

#### 15.8 Autres
- `useRequestPasswordReset()`: Demander une réinitialisation de mot de passe
- `useConfirmPasswordReset()`: Confirmer la réinitialisation
- `useCreateCheckoutSession()`: Créer une session Stripe
- `useAuthorProfile()`: Profil d'un auteur

### 16. Rôles et permissions

#### 16.1 Rôles disponibles
- **USER**: Utilisateur standard
  - Peut voir et suivre des ressources
  - Ne peut pas créer de ressources
  - Accès limité à `/app/resources` (onglet "Ressources suivies" uniquement)
- **CONTRIBUTOR**: Contributeur
  - Peut créer des ressources
  - Peut voir ses propres ressources et celles qu'il suit
  - Accès complet à `/app/resources`
- **MODERATOR**: Modérateur
  - Tous les droits de CONTRIBUTOR
  - Peut modérer les ressources
- **ADMIN**: Administrateur
  - Tous les droits de MODERATOR
  - Accès à l'interface d'administration
  - Peut gérer les utilisateurs, tags, ressources, abonnements, paiements
- **SUPERADMIN**: Super administrateur
  - Tous les droits d'ADMIN
  - Peut modifier les rôles des utilisateurs
  - Accès complet à toutes les fonctionnalités

#### 16.2 Contrôle d'accès
- **Middleware**: Vérification des rôles pour les routes admin
- **Layouts**: Vérification dans `AdminLayout` pour rediriger les non-admins
- **Composants**: Vérification conditionnelle pour afficher/masquer des fonctionnalités
- **API**: Le backend valide également les permissions

---

## Gestion d'état

### TanStack Query (Server State)

**Rôle**: Gestion de toutes les données serveur

**Principes**:
- ✅ Cache automatique
- ✅ Refetch automatique
- ✅ Optimistic updates
- ✅ Gestion des états (loading, error, success)
- ❌ Pas de duplication dans Zustand

**Exemple**:

```typescript
// Hook de query
export function useUser() {
  return useQuery<User, ApiError>({
    queryKey: authKeys.user(),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<User>>(API_ENDPOINTS.USER.ME);
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}

// Hook de mutation
export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation<LoginResponse, ApiError, { email: string; password: string }>({
    mutationFn: async (credentials) => {
      // ... appel API
    },
    onSuccess: (data) => {
      // Mise à jour du cache
      queryClient.setQueryData(authKeys.user(), data.user);
    },
  });
}
```

**Invalidation après mutations**:

```typescript
// Après soumission profil onboarding
onSuccess: async () => {
  await queryClient.invalidateQueries({ queryKey: authKeys.user() });
}
```

### Zustand (UI State)

**Rôle**: État UI local uniquement

**Store UI** (`use-ui-store.ts`):

```typescript
interface UIState {
  // Theme (préférence locale)
  theme: "light" | "dark" | "system";
  setTheme: (theme: Theme) => void;
  
  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  
  // Modals
  modals: { [key: string]: boolean };
  openModal: (key: string) => void;
  closeModal: (key: string) => void;
}
```

**Règles**:
- ✅ Theme, sidebar, modals
- ✅ Préférences UI locales
- ❌ Pas de données utilisateur
- ❌ Pas de données serveur

**Persistance**: localStorage pour theme et sidebar state

---

## Routing (Next.js App Router)

### Structure des routes

#### Routes publiques (`(public)/`)

```
/                           → Landing page
/blog                       → Page blog
/contact                    → Page contact
/pricing                    → Redirection vers /#pricing
```

**Layout**: `PublicHeader` + `PublicFooter` + `ThemeSelector`

#### Routes d'authentification (`(auth)/`)

```
/auth/login                 → Connexion
/auth/register              → Inscription
/auth/activate              → Activation compte
/auth/forgot-password       → Mot de passe oublié
/auth/reset-password        → Réinitialisation
/auth/post-login            → Point d'entrée post-login
```

**Layout**: Layout minimal, centré

#### Routes d'onboarding (`(onboarding)/`)

```
/onboarding                 → Redirection vers step approprié
/onboarding/start           → Démarrage onboarding
/onboarding/profile         → Étape profil
/onboarding/interests       → Étape intérêts
/onboarding/activation-required → Activation requise
/onboarding/done            → Onboarding terminé
```

**Layout**: Layout onboarding avec progress indicator

**Guard**: `useOnboardingGuard()` redirige automatiquement si mauvais step

#### Routes application (`(app)/`)

```
/app                        → Dashboard utilisateur
/user                       → Profil utilisateur
/admin                      → Dashboard admin
/admin/dashboard            → Vue d'ensemble admin
/admin/users                → Gestion utilisateurs
/admin/tags                 → Gestion tags
/admin/resources            → Gestion ressources
/admin/subscriptions        → Gestion abonnements
/admin/payments             → Gestion paiements
```

**Layout**: `AppSidebar` + navigation

### Middleware (`src/middleware.ts`)

**Rôle**: Contrôle d'accès basé sur les cookies

**Logique**:
1. Vérifie présence de `access_token` cookie
2. Vérifie `activated` cookie
3. Vérifie `onboarding_step` cookie
4. Redirige vers la route appropriée

**Règles**:
- ❌ Pas d'appels API dans le middleware
- ❌ Pas de logique UI
- ✅ Lecture des cookies uniquement
- ✅ Redirections automatiques

---

## API et services

### Client API (`services/api/client.ts`)

**Configuration**:
- Base URL: vide (utilisation du proxy)
- Proxy: `/api/proxy/${endpoint}/`
- Credentials: `withCredentials: true` (cookies)
- Headers: `Content-Type: application/json`

**Intercepteurs**:
- **Request**: Conversion des endpoints en routes proxy
- **Response**: Normalisation des erreurs en `ApiError`

**Exemple**:

```typescript
// Appel: apiClient.get("/user/me/")
// → Proxy: /api/proxy/user/me/
// → Backend: http://localhost:8000/api/user/me/
```

### Proxy API (`app/api/proxy/[...path]/route.ts`)

**Rôle**: BFF (Backend For Frontend)

**Fonctionnalités**:
- Lecture de `access_token` depuis HTTP-only cookie
- Ajout automatique du header `Authorization: Bearer ${token}`
- Gestion des erreurs 401 (déconnexion)
- Support des méthodes: GET, POST, PATCH, DELETE
- Transmission des cookies backend → frontend

**Endpoints publics** (pas de token requis):
- `/auth/login`
- `/auth/register`
- `/auth/activate`
- `/auth/password-reset`
- `/health/live`
- `/health/ready`

### Queries TanStack Query

#### Organisation

Un fichier par domaine fonctionnel:

```
queries/
├── auth-queries.ts          # useUser, useLogin, useLogout, etc.
├── onboarding-queries.ts    # useStartOnboarding, useSubmitProfile, etc.
├── resources-queries.ts     # useResourceFeed, useResourceDetail, etc.
├── comments-queries.ts      # useVoteOnComment
├── authors-queries.ts       # useAuthorProfile
├── billing-queries.ts       # useCreateCheckoutSession
├── password-reset-queries.ts # useRequestPasswordReset, etc.
└── admin-queries.ts         # Tous les hooks admin
```

#### Pattern de query

```typescript
export function useResourceFeed(page: number = 1, pageSize: number = 20) {
  return useQuery<ResourceFeedItem[], ApiError>({
    queryKey: resourceKeys.feed(page, pageSize),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      const response = await apiClient.get<{ data: ResourceFeedItem[] }>(
        `${API_ENDPOINTS.RESOURCES.FEED}?${params}`
      );
      return response.data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
```

#### Pattern de mutation

```typescript
export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation<CreateTagResponse, ApiError, CreateTagPayload>({
    mutationFn: async (payload) => {
      const response = await apiClient.post<ApiResponse<CreateTagResponse>>(
        API_ENDPOINTS.ADMIN.TAGS.CREATE,
        payload
      );
      return response.data.data;
    },
    onSuccess: () => {
      // Invalidation du cache
      queryClient.invalidateQueries({ queryKey: adminKeys.tags.all });
    },
  });
}
```

### Endpoints API disponibles

#### Authentification
- `POST /auth/login/` - Connexion
- `POST /auth/register/` - Inscription
- `POST /auth/activate/` - Activation
- `POST /auth/resend-activation/` - Renvoyer activation
- `POST /auth/logout/` - Déconnexion
- `POST /auth/password-reset/` - Demander réinitialisation
- `POST /auth/password-reset/confirm/` - Confirmer réinitialisation

#### Utilisateur
- `GET /user/me/` - Utilisateur actuel

#### Onboarding
- `GET /onboarding/status/` - Statut onboarding
- `POST /onboarding/start/` - Démarrer onboarding
- `POST /onboarding/profile/` - Soumettre profil
- `POST /onboarding/interests/` - Soumettre intérêts

#### Ressources
- `GET /feed/` - Feed de ressources (paginated)
- `GET /resources/{id}/detail/` - Détails ressource
- `POST /resources/{id}/` - Demander accès
- `POST /resources/versions/` - Créer version

#### Commentaires
- `POST /comments/vote/` - Voter sur commentaire

#### Auteurs
- `GET /authors/{user_id}/` - Profil auteur

#### Billing
- `POST /billing/checkout/` - Créer session Stripe

#### Administration (toutes les routes admin)
- Voir `src/constants/api.ts` pour la liste complète

---

## Composants UI

### Composants de base (`components/ui/`)

**Source**: shadcn/ui (Radix UI + Tailwind)

**Composants disponibles**:
- `Button` - Boutons avec variants
- `Card` - Cartes avec header/content/footer
- `Input` - Champs de saisie
- `Dialog` - Modales
- `Select` - Sélecteurs
- `DropdownMenu` - Menus déroulants
- `Toast` - Notifications
- `Form` - Formulaires (React Hook Form)
- `Avatar` - Avatars
- `Badge` - Badges
- `Checkbox` - Cases à cocher
- `Label` - Labels
- `Separator` - Séparateurs
- `Sheet` - Panneaux latéraux
- `Sidebar` - Sidebars
- `Skeleton` - Placeholders de chargement
- `Tooltip` - Infobulles

**Pattern d'utilisation**:

```typescript
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Titre</CardTitle>
  </CardHeader>
  <CardContent>
    <Button variant="default">Action</Button>
  </CardContent>
</Card>
```

### Composants features (`components/features/`)

**Organisation**: Un dossier par feature

**Auth**:
- `login-form.tsx`: Formulaire de connexion avec gestion d'erreurs
- `register-form.tsx`: Formulaire d'inscription
- `activation-handler.tsx`: Gestion de l'activation de compte
- `resend-activation.tsx`: Renvoi d'email d'activation

**Onboarding**:
- `onboarding-start-card.tsx`: Carte de démarrage
- `profile-form.tsx`: Formulaire de profil
- `interests-form.tsx`: Sélection d'intérêts

**Pattern**: Composants qui utilisent les hooks de `services/api/queries/`

### Composants shared (`components/shared/`)

**Headers**:
- `public-header.tsx`: Header public avec navigation et header fixe au scroll
- `app-header.tsx`: Header application

**Footers**:
- `public-footer.tsx`: Footer public

**Navigation**:
- `app-sidebar.tsx`: Sidebar application avec navigation

**Theme**:
- `theme-selector.tsx`: Sélecteur de thème (system/light/dark)

---

## Hooks personnalisés

### `useOnboardingGuard(expectedStep)`

**Rôle**: Redirige automatiquement si l'utilisateur n'est pas à la bonne étape

```typescript
export function useOnboardingGuard(expectedStep: OnboardingStep) {
  const router = useRouter();
  const { user, isLoading } = useUser();
  
  useEffect(() => {
    if (isLoading) return;
    
    if (user?.onboarding_step && user.onboarding_step !== expectedStep) {
      const correctRoute = getRouteForStep(user.onboarding_step);
      router.replace(correctRoute);
    }
  }, [user, isLoading, expectedStep, router]);
  
  return {
    isValid: user?.onboarding_step === expectedStep,
    isLoading,
    user,
  };
}
```

**Usage**:

```typescript
function ProfilePage() {
  const { isValid, isLoading } = useOnboardingGuard("profile");
  
  if (isLoading) return <Loading />;
  if (!isValid) return null; // Redirection en cours
  
  return <ProfileForm />;
}
```

### `useToast()`

**Rôle**: Gestion des notifications toast

```typescript
const { toast } = useToast();

toast({
  title: "Succès",
  description: "Opération réussie",
});

toast({
  title: "Erreur",
  description: "Une erreur est survenue",
  variant: "destructive",
});
```

### `useTheme()`

**Rôle**: Gestion du thème (light/dark/system)

```typescript
const { theme, setTheme } = useTheme();
```

---

## Types TypeScript

### Types principaux (`types/index.ts`)

```typescript
// États utilisateur
export type UserState =
  | "unauthenticated"
  | "authenticated_not_activated"
  | "authenticated_activated"
  | "onboarding_in_progress"
  | "fully_onboarded";

// Étape d'onboarding (source de vérité: backend)
export type OnboardingStep =
  | "not_started"
  | "profile"
  | "interests"
  | "completed";

// Utilisateur
export interface User {
  id: string;
  email: string;
  username: string;
  bio?: string;
  avatar_url?: string;
  activated: boolean;
  onboarding_step: OnboardingStep;
  role?: "SUPERADMIN" | "ADMIN" | "MODERATOR" | "CONTRIBUTOR" | "USER";
  createdAt?: string;
}

// Erreur API
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Réponse API
export interface ApiResponse<T> {
  status: "ok";
  data: T;
}
```

**Règles**:
- ✅ Tous les types sont explicites
- ✅ Pas de `any`
- ✅ Types pour toutes les réponses API
- ✅ Types pour tous les props de composants

---

## Constantes et configuration

### Routes (`constants/routes.ts`)

```typescript
export const ROUTES = {
  HOME: "/",
  FEATURES: "/#features",
  PRICING: "/#pricing",
  BLOG: "/blog",
  CONTACT: "/contact",
  
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    // ...
  },
  
  ONBOARDING: {
    START: "/onboarding/start/",
    PROFILE: "/onboarding/profile/",
    // ...
  },
  
  APP: {
    DASHBOARD: "/app",
    USER: "/user",
  },
  
  ADMIN: {
    ROOT: "/admin",
    DASHBOARD: "/admin/dashboard",
    USERS: "/admin/users",
    // ...
  },
} as const;
```

**Usage**: Centralisation de toutes les routes pour éviter les hardcodings

### API Endpoints (`constants/api.ts`)

```typescript
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login/",
    REGISTER: "/auth/register/",
    // ...
  },
  
  RESOURCES: {
    FEED: "/feed/",
    DETAIL: (id: string) => `/resources/${id}/detail/`,
    ACCESS: (id: string) => `/resources/${id}/`,
  },
  
  ADMIN: {
    USERS: {
      LIST: "/admin/users/",
      DETAIL: (id: string) => `/admin/users/${id}/`,
      // ...
    },
    // ...
  },
} as const;
```

**Pattern**: Fonctions pour les endpoints dynamiques

---

## Utilitaires

### `utils/onboarding-routes.ts`

**Fonction**: `getRouteForStep(step: OnboardingStep): string`

Mappe une étape d'onboarding vers sa route correspondante.

### `utils/route-guards.ts`

**Fonction**: `canAccessRoute(userState: UserState, route: string): boolean`

Vérifie si un état utilisateur peut accéder à une route.

### `libs/utils.ts`

**Fonction**: `cn(...classes: ClassValue[]): string`

Fusionne les classes Tailwind CSS (utilise `clsx` + `tailwind-merge`).

---

## Conventions de nommage

### Fichiers

- **Composants**: `kebab-case.tsx` (ex: `login-form.tsx`)
- **Hooks**: `kebab-case.ts` avec préfixe `use-` (ex: `use-onboarding-guard.ts`)
- **Services**: `kebab-case.ts` (ex: `auth-queries.ts`)
- **Types**: `kebab-case.ts` (ex: `index.ts`)
- **Utilitaires**: `kebab-case.ts` (ex: `onboarding-routes.ts`)

### Dossiers

- **camelCase** pour les dossiers (ex: `components/features/auth/`)

### Composants

- **PascalCase** pour les noms de composants (ex: `LoginForm`)

### Hooks

- **camelCase** avec préfixe `use` (ex: `useUser`, `useOnboardingGuard`)

### Variables et fonctions

- **camelCase** (ex: `userData`, `handleSubmit`)

### Constantes

- **UPPER_SNAKE_CASE** (ex: `API_BASE_URL`, `ROUTES`)

---

## Règles et principes

### Règles immuables

1. **Pas de logique métier dans les composants UI**
   - Les composants sont purement présentationnels
   - La logique est dans les hooks ou services

2. **Pas de données serveur dans Zustand**
   - TanStack Query gère toutes les données serveur
   - Zustand uniquement pour l'état UI (theme, sidebar, modals)

3. **Backend = Single Source of Truth**
   - L'état d'onboarding vient du backend
   - Pas d'inférence côté client

4. **Pas de rechargement de page**
   - Utilisation de `router.replace()` au lieu de `window.location.reload()`
   - Navigation fluide avec Next.js

5. **Cookies HTTP-only uniquement**
   - Tokens dans HTTP-only cookies
   - Pas de stockage de tokens dans localStorage (sauf pour compatibilité legacy)

6. **TypeScript strict**
   - Pas de `any`
   - Types explicites partout
   - Validation des props

### Principes de conception

1. **Separation of Concerns**
   - Routing ≠ UI ≠ Data ≠ Logic

2. **Composabilité**
   - Composants réutilisables et composables
   - Pas de duplication

3. **Explicite > Implicite**
   - Code clair et explicite
   - Pas de "magie" cachée

4. **Maintenabilité > Performance prématurée**
   - Code lisible d'abord
   - Optimisation seulement si nécessaire

---

## Flux de données

### Flux d'authentification

```
1. User submit login form
   ↓
2. useLogin() mutation
   ↓
3. POST /auth/login/ (via proxy)
   ↓
4. Backend sets HTTP cookies (access_token, refresh_token, activated, onboarding_step)
   ↓
5. Frontend calls /api/auth/session to establish session
   ↓
6. queryClient.setQueryData(authKeys.user(), userData)
   ↓
7. Redirect to /auth/post-login
   ↓
8. post-login page reads user.onboarding_step
   ↓
9. Redirect to appropriate route (getRouteForStep())
```

### Flux d'onboarding

```
1. User on /onboarding/profile
   ↓
2. useOnboardingGuard("profile") checks user.onboarding_step
   ↓
3. If step !== "profile", redirect to correct route
   ↓
4. User submits profile form
   ↓
5. useSubmitOnboardingProfile() mutation
   ↓
6. POST /onboarding/profile/
   ↓
7. Backend updates onboarding_step to "interests"
   ↓
8. queryClient.invalidateQueries({ queryKey: authKeys.user() })
   ↓
9. useUser() refetches automatically
   ↓
10. useOnboardingGuard detects step change
   ↓
11. Redirect to /onboarding/interests
```

### Flux de données admin

```
1. Admin navigates to /admin/users
   ↓
2. Layout checks user.role (ADMIN/SUPERADMIN)
   ↓
3. If not admin, redirect to /app
   ↓
4. useAdminUsers(page, pageSize) query
   ↓
5. GET /admin/users/?page=1&page_size=20 (via proxy)
   ↓
6. Backend validates IsAdmin permission
   ↓
7. Returns paginated user list
   ↓
8. Component displays data
   ↓
9. Admin performs action (e.g., set role)
   ↓
10. useSetUserRole() mutation
   ↓
11. POST /admin/users/{id}/set_role/
   ↓
12. Backend validates IsSuperAdmin permission
   ↓
13. Updates user role
   ↓
14. queryClient.invalidateQueries({ queryKey: adminKeys.users.all })
   ↓
15. List refetches automatically
```

---

## Gestion des erreurs

### Format d'erreur standardisé

```typescript
interface ApiError {
  code: string;                    // Code d'erreur (ex: "account_not_activated")
  message: string;                  // Message lisible
  details?: Record<string, unknown>; // Détails supplémentaires
}
```

### Gestion dans les composants

```typescript
const { mutate, error, isError } = useLogin();

// Affichage conditionnel
{isError && (
  <div className="text-destructive">
    {error.message}
  </div>
)}

// Gestion spécifique par code
if (error.code === "account_not_activated") {
  // Afficher bouton "Renvoyer activation"
}
```

### Error Boundary

Composant `ErrorBoundary` pour capturer les erreurs React non gérées.

---

## Performance et optimisation

### TanStack Query Cache

**Stale Time**: Temps avant qu'une query soit considérée comme stale

```typescript
staleTime: 5 * 60 * 1000, // 5 minutes pour useUser()
staleTime: 2 * 60 * 1000, // 2 minutes pour useResourceFeed()
```

**Cache Time**: Temps de rétention dans le cache après inactivité

### Optimistic Updates

Mise à jour optimiste du cache avant confirmation serveur:

```typescript
onMutate: async (newData) => {
  await queryClient.cancelQueries({ queryKey: resourceKeys.all });
  const previous = queryClient.getQueryData(resourceKeys.all);
  queryClient.setQueryData(resourceKeys.all, (old) => [...old, newData]);
  return { previous };
},
onError: (err, newData, context) => {
  queryClient.setQueryData(resourceKeys.all, context.previous);
},
```

### Code Splitting

Next.js App Router fait automatiquement le code splitting par route.

### Lazy Loading

```typescript
const AdminDashboard = dynamic(() => import("@/app/(app)/admin/dashboard/page"), {
  loading: () => <Skeleton />,
});
```

---

## Tests

### Tests unitaires (Jest)

**Structure**: `src/__tests__/`

**Exemples**:
- `middleware.test.ts`: Tests du middleware Next.js

### Tests E2E (Playwright)

**Structure**: `e2e/`

**Fichiers**:
- `happy-path.spec.ts`: Parcours utilisateur complet
- `middleware-redirects.spec.ts`: Tests de redirections
- `user-lifecycle.spec.ts`: Cycle de vie utilisateur

**Commandes**:
```bash
npm run test:e2e          # Exécuter tous les tests E2E
npm run test:e2e:ui       # Interface graphique
npm run test:e2e:debug    # Mode debug
```

---

## Configuration

### Variables d'environnement

```env
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api
NEXT_PUBLIC_API_LOGS=true  # Optionnel: logs des requêtes API
```

### TypeScript (`tsconfig.json`)

- Strict mode activé
- Path aliases: `@/*` → `src/*`

### Tailwind (`tailwind.config.ts`)

- Design tokens personnalisés
- Support dark mode
- Animations via `tailwindcss-animate`

### Next.js (`next.config.ts`)

- Configuration App Router
- Optimisations de build

---

## Scripts disponibles

```bash
npm run dev          # Développement avec Turbopack
npm run build        # Build de production
npm run start        # Serveur de production
npm run lint         # Linter ESLint
npm run test         # Tests Jest
npm run test:e2e     # Tests Playwright
```

---

## Points d'attention

### ⚠️ Legacy Code

Certains fichiers sont marqués comme "legacy" et doivent être migrés:
- `stores/useAuthStore.tsx` → Utiliser `useUser()` de TanStack Query
- `stores/useStore.tsx` → Migrer vers `use-ui-store.ts`
- `hooks/userUses.ts` → Remplacer par les hooks de `services/api/queries/`
- `models/` → Types dans `types/index.ts`

### ⚠️ Duplication de composants

Certains composants existent à la fois dans `components/` et `src/components/`:
- `components/ui/select.tsx` et `src/components/ui/select.tsx`
- À nettoyer progressivement

### ✅ Bonnes pratiques actuelles

- Architecture claire et séparée
- Types TypeScript stricts
- TanStack Query pour toutes les données serveur
- Zustand uniquement pour l'état UI
- Composants réutilisables et composables

---

## Évolutions futures

### Phase 2 (À venir)

- [ ] Migration complète du legacy code
- [ ] Tests unitaires complets
- [ ] Optimisations de performance
- [ ] Internationalisation (i18n)
- [ ] Accessibilité (a11y) améliorée
- [ ] Storybook pour les composants UI

---

## Ressources

- **Documentation Next.js**: https://nextjs.org/docs
- **TanStack Query**: https://tanstack.com/query
- **Zustand**: https://zustand-demo.pmnd.rs/
- **shadcn/ui**: https://ui.shadcn.com/
- **Radix UI**: https://www.radix-ui.com/
- **Tailwind CSS**: https://tailwindcss.com/

---

**Dernière mise à jour**: 2026-02-02  
**Version du document**: 2.0  
**Mainteneur**: Équipe de développement Ressourcefy

---

## Résumé des fonctionnalités par catégorie

### ✅ Fonctionnalités implémentées

#### Authentification
- ✅ Connexion avec gestion d'erreurs
- ✅ Inscription avec validation
- ✅ Activation de compte via email
- ✅ Renvoi d'email d'activation
- ✅ Mot de passe oublié
- ✅ Réinitialisation de mot de passe
- ✅ Déconnexion

#### Onboarding
- ✅ Démarrage de l'onboarding
- ✅ Étape profil (username, bio, avatar)
- ✅ Étape intérêts (sélection de tags)
- ✅ Activation requise
- ✅ Onboarding terminé
- ✅ Navigation automatique selon l'étape

#### Ressources
- ✅ Création de ressources (rôles autorisés)
- ✅ Liste des ressources publiques
- ✅ Détail d'une ressource
- ✅ Commentaires sur les ressources
- ✅ Vote sur les ressources et commentaires
- ✅ Liste des ressources de l'utilisateur
- ✅ Liste des ressources suivies
- ✅ Versions de ressources

#### Progression
- ✅ Suivi automatique lors de l'accès à une ressource
- ✅ Affichage de la progression utilisateur
- ✅ Marquer une ressource comme complétée
- ✅ Statistiques de progression
- ✅ Suivi de tous les utilisateurs (auteurs/admins)

#### Administration
- ✅ Dashboard admin avec statistiques
- ✅ Gestion des utilisateurs (CRUD, changement de rôle)
- ✅ Gestion des tags (CRUD, fusion)
- ✅ Gestion des ressources (liste, suivis, suppression)
- ✅ Gestion des abonnements
- ✅ Gestion des paiements

#### Profil et paramètres
- ✅ Page de profil utilisateur
- ✅ Page de paramètres
- ✅ Mise à jour du profil
- ✅ Demande de changement de rôle
- ✅ Sélecteur de thème

#### Pages publiques
- ✅ Page d'accueil avec sections (hero, features, pricing, CTA)
- ✅ Page blog
- ✅ Page contact avec formulaire
- ✅ Navigation avec header fixe au scroll

#### UI/UX
- ✅ Layout 3 colonnes style X/Twitter
- ✅ Sidebar avec navigation et menu admin
- ✅ Header public avec animation au scroll
- ✅ Footer public
- ✅ Système de thème (light/dark/system)
- ✅ Notifications toast
- ✅ Gestion des erreurs avec Error Boundary
- ✅ États de chargement (skeletons)
- ✅ Scrollbars cachées

### 🔄 Fonctionnalités en cours / À venir

- ⏳ Upload de fichiers pour les ressources
- ⏳ Notifications en temps réel
- ⏳ Recherche avancée de ressources
- ⏳ Filtres et tri des ressources
- ⏳ Système de favoris
- ⏳ Partage de ressources
- ⏳ Export de données
- ⏳ Analytics avancés pour les admins
