# Ressourcefy - Phase 1 Architecture

## ✅ Phase 1 Complete

L'architecture frontend Phase 1 est maintenant en place. Cette phase se concentre sur la structure, le routing, et les fondations sans implémenter la logique métier complète.

## 📁 Structure Créée

### Routes & Layouts

- **Public** (`(public)/`): `/`, `/pricing`, `/about`, `/contact`
- **Auth** (`(auth)/`): `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/activate`
- **Onboarding** (`(onboarding)/`): `/onboarding/activation-required`, `/onboarding/profile`, `/onboarding/interests`, `/onboarding/done`
- **App** (`(app)/`): `/app` (dashboard)

### Core Files

- `src/middleware.ts` - Contrôle d'accès uniquement
- `src/types/index.ts` - Types TypeScript pour états utilisateur
- `src/constants/routes.ts` - Constantes de routes
- `src/constants/api.ts` - Endpoints API (placeholders)
- `src/utils/cookies.ts` - Utilitaires cookies pour middleware
- `src/stores/use-ui-store.ts` - Store Zustand (UI state uniquement)
- `src/services/api/client.ts` - Client API Axios
- `src/services/api/queries/auth-queries.ts` - Hooks TanStack Query
- `src/providers/query-provider.tsx` - Provider TanStack Query
- `src/providers/theme-provider.tsx` - Provider Theme

### Design Tokens

- Palette de couleurs configurée dans `globals.css`:
  - Primary (60%): Navy Blue / Petroleum Blue
  - Secondary (30%): Off-white / Paper beige
  - Accent (10%): Matte gold / Mustard (CTA uniquement)
- Typography: Inter (sans-serif lisible)
- Support light & dark mode

## 🔐 États Utilisateur

L'application gère 5 états explicites:

1. **unauthenticated** → Pages publiques uniquement
2. **authenticated_not_activated** → Redirigé vers `/onboarding/activation-required`
3. **authenticated_activated** → Peut accéder au flow onboarding
4. **onboarding_in_progress** → Doit compléter l'onboarding
5. **fully_onboarded** → Accès complet à `/app`

## 🛡️ Middleware

Le middleware (`src/middleware.ts`) gère uniquement le contrôle d'accès:

- Détecte l'état d'authentification via cookies
- Détecte l'état d'activation du compte
- Détecte l'état de complétion de l'onboarding
- Redirige en conséquence

**Important**: Pas de logique API, pas de logique UI dans le middleware.

## 📦 State Management

### TanStack Query (Server State)
- Toutes les données serveur via TanStack Query
- User data, auth status, account state
- **Jamais stocké dans Zustand**
- Le serveur est la source unique de vérité

### Zustand (UI State Only)
- Theme (light/dark/system)
- États modals
- État sidebar
- **Aucune donnée serveur** dans Zustand

## 🎨 Design System

### Couleurs
- **Primary**: Navy Blue / Petroleum Blue (60%)
- **Secondary**: Off-white / Paper beige (30%)
- **Accent**: Matte gold / Mustard (10%, CTA uniquement)

### Typography
- Police: Inter
- Support light & dark mode
- Persistance du thème via Zustand

## 🚀 Prochaines Étapes (Phase 2)

### Authentication
- [ ] Implémenter les formulaires (login, register, etc.)
- [ ] Gérer les erreurs d'auth (ex: `account_not_activated`)
- [ ] Implémenter la logique d'activation

### Onboarding
- [ ] Formulaires de profil et intérêts
- [ ] Indicateur de progression
- [ ] Logique de complétion

### UI Components
- [ ] Headers/navigation pour chaque layout
- [ ] Sidebar pour l'app
- [ ] Contenu dashboard
- [ ] Composants shadcn wrappés localement

### API Integration
- [ ] Connecter tous les endpoints API
- [ ] Intercepteurs pour refresh token
- [ ] Error boundaries
- [ ] États de chargement/erreur

## 📝 Notes Importantes

1. **Pas de logique backend** - Frontend uniquement
2. **Pas de données serveur dans Zustand** - TanStack Query uniquement
3. **Middleware = contrôle d'accès uniquement** - Pas de logique métier
4. **Layouts = structure uniquement** - Pas de logique auth dans layouts
5. **États explicites** - Pas de transitions ambiguës

## 🔧 Configuration

### Variables d'environnement

Créer `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

### Dépendances

Toutes les dépendances nécessaires sont déjà installées:
- `@tanstack/react-query` - Server state
- `zustand` - UI state
- `axios` - API client
- `next` - Framework
- `tailwindcss` - Styling

## 📚 Documentation

Voir `ARCHITECTURE.md` pour plus de détails sur l'architecture complète.
