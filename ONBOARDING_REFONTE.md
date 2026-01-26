# Refonte Complète de l'Onboarding - Ressourcefy

**Auteur** : Expert Senior UX/Architecture (20+ ans SaaS)  
**Date** : 2026-01-25  
**Objectif** : Onboarding fluide, non-bloquant, auto-réparant, sans dépendance fragile aux cookies

---

## 📐 1. SCHÉMA DU FLOW ONBOARDING

### 1.1 Flow Principal (Happy Path)

```
┌─────────────────────────────────────────────────────────────────┐
│                    POINT D'ENTRÉE                                 │
│                    POST /auth/login/                             │
│                    ↓                                              │
│                    Réponse: { access_token, refresh_token, user }│
│                    ↓                                              │
│                    Cookies: access_token, refresh_token          │
│                    localStorage: user (activated, onboarding_step)│
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────────────┐
                    │  /auth/post-login│
                    │  (Page React)    │
                    └─────────────────┘
                              ↓
                    ┌─────────────────────────────────────┐
                    │  useUser() → GET /user/me/          │
                    │  Lecture: user.activated            │
                    │           user.onboarding_step       │
                    └─────────────────────────────────────┘
                              ↓
        ┌─────────────────────┴─────────────────────┐
        │                                           │
   ┌────▼────┐                              ┌─────▼─────┐
   │ !activated│                              │ activated │
   └────┬────┘                              └─────┬─────┘
        │                                           │
        │                                           │
   ┌────▼──────────────────────┐    ┌──────────────▼──────────────────┐
   │ /onboarding/activation-    │    │  Décision basée sur             │
   │   required/                │    │  user.onboarding_step          │
   │                            │    └──────────────┬──────────────────┘
   │  - Affiche message         │                   │
   │  - Bouton "Resend email"   │    ┌──────────────▼──────────────────┐
   │  - Pas de logique métier   │    │  Switch (onboarding_step)       │
   └────────────────────────────┘    └──────────────┬──────────────────┘
                                                     │
        ┌────────────────────────────────────────────┼────────────────────┐
        │                                            │                    │
   ┌────▼────┐                                 ┌────▼────┐        ┌────▼────┐
   │not_started│                                │ profile │        │interests│
   └────┬────┘                                 └────┬────┘        └────┬────┘
        │                                            │                  │
   ┌────▼────────────┐                        ┌─────▼──────┐    ┌─────▼──────┐
   │/onboarding/    │                        │/onboarding/│    │/onboarding/│
   │  start/        │                        │  profile/  │    │  interests/│
   └────┬────────────┘                        └─────┬──────┘    └─────┬──────┘
        │                                            │                  │
   ┌────▼────────────┐                        ┌─────▼──────┐    ┌─────▼──────┐
   │OnboardingStart  │                        │ProfileForm │    │InterestsForm│
   │Card             │                        │            │    │            │
   └────┬────────────┘                        └─────┬──────┘    └─────┬──────┘
        │                                            │                  │
   ┌────▼────────────┐                        ┌─────▼──────┐    ┌─────▼──────┐
   │POST /onboarding/│                        │POST /onboard│    │POST /onboard│
   │  start/         │                        │  ing/profile│    │  ing/interests│
   └────┬────────────┘                        └─────┬──────┘    └─────┬──────┘
        │                                            │                  │
        │                                            │                  │
        └────────────────────────────────────────────┼──────────────────┘
                                                     │
                                        ┌────────────▼────────────┐
                                        │  Backend valide & met   │
                                        │  à jour onboarding_step │
                                        └────────────┬────────────┘
                                                     │
                                        ┌────────────▼────────────┐
                                        │  Frontend:              │
                                        │  1. Invalide authKeys.user()│
                                        │  2. Refetch useUser()    │
                                        │  3. Lit nouveau step     │
                                        │  4. router.replace()     │
                                        └────────────┬────────────┘
                                                     │
                                        ┌────────────▼────────────┐
                                        │  onboarding_step ===     │
                                        │  "completed" ?          │
                                        └────────────┬────────────┘
                                                     │
                        ┌───────────────────────────┴───────────────────────────┐
                        │                                                       │
                   ┌────▼────┐                                           ┌────▼────┐
                   │   OUI   │                                           │   NON   │
                   └────┬────┘                                           └────┬────┘
                        │                                                     │
                   ┌────▼────────────┐                                  ┌─────▼──────┐
                   │ /user          │                                  │ Retour au  │
                   │ (Dashboard)    │                                  │ switch     │
                   └────────────────┘                                  └────────────┘
```

### 1.2 Cas d'Erreurs Récupérables

```
┌─────────────────────────────────────────────────────────────────┐
│                    CAS 1: Étape Invalide                         │
│                    (invalid_onboarding_step)                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────────────┐
                    │  Backend 403     │
                    │  { code: "invalid_onboarding_step" }│
                    └─────────────────┘
                              ↓
                    ┌─────────────────────────────────────┐
                    │  Frontend:                          │
                    │  1. Catch error                     │
                    │  2. Invalide authKeys.user()        │
                    │  3. Refetch useUser()               │
                    │  4. router.replace(step_correct)    │
                    │  5. Pas d'erreur visible à l'user     │
                    └─────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                    CAS 2: État Incohérent                        │
│                    (User sur /onboarding/profile/                 │
│                     mais onboarding_step === "interests")        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────────────┐
                    │  Composant monte │
                    │  useUser() lit step│
                    └─────────────────┘
                              ↓
                    ┌─────────────────────────────────────┐
                    │  useEffect détecte incohérence:      │
                    │  if (user.onboarding_step !== "profile")│
                    │    → router.replace(step_correct)    │
                    │  Pas de message d'erreur             │
                    └─────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                    CAS 3: Refresh Page                           │
│                    (User refresh sur /onboarding/profile/)        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────────────┐
                    │  Page monte      │
                    │  useUser() refetch│
                    └─────────────────┘
                              ↓
                    ┌─────────────────────────────────────┐
                    │  useEffect:                          │
                    │  if (user.onboarding_step !== "profile")│
                    │    → router.replace(step_correct)    │
                    │  Sinon: affiche formulaire          │
                    └─────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                    CAS 4: Navigation Manuelle                     │
│                    (User tape /onboarding/interests/             │
│                     alors qu'il est à "profile")                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────────────┐
                    │  Page monte      │
                    │  useUser() lit step│
                    └─────────────────┘
                              ↓
                    ┌─────────────────────────────────────┐
                    │  useEffect:                          │
                    │  if (user.onboarding_step !== "interests")│
                    │    → router.replace(step_correct)    │
                    │  Pas de 404, pas d'erreur           │
                    └─────────────────────────────────────┘
```

### 1.3 Transitions d'État (Backend-Driven)

```
État Backend          →  Action Frontend              →  Nouvel État
─────────────────────────────────────────────────────────────────────
not_started           →  POST /onboarding/start/      →  profile
profile               →  POST /onboarding/profile/     →  interests
interests             →  POST /onboarding/interests/   →  completed
completed             →  (aucune action)              →  completed (stable)

Règles:
- Chaque transition est validée par le backend
- Le backend peut rejeter une transition (403 invalid_onboarding_step)
- Le frontend ne peut jamais "forcer" une transition
- Si une transition est rejetée, le frontend refetch et redirige
```

---

## 🏗️ 2. ARCHITECTURE FINALE

### 2.1 Rôles et Responsabilités

#### Backend (Django/DRF)

**Responsabilités**:
1. **Source unique de vérité** pour `onboarding_step`
2. **Validation stricte** des transitions d'état
3. **Retour d'état complet** dans `GET /user/me/`
4. **Rejet explicite** des transitions invalides (403)

**Endpoints critiques**:
```
GET  /user/me/                    → { user: { onboarding_step, activated, ... } }
POST /onboarding/start/           → Transition: not_started → profile
POST /onboarding/profile/         → Transition: profile → interests
POST /onboarding/interests/       → Transition: interests → completed
```

**Contrat de réponse**:
```typescript
// GET /user/me/
{
  status: "ok",
  data: {
    id: "uuid",
    email: "string",
    username: "string",
    activated: boolean,
    onboarding_step: "not_started" | "profile" | "interests" | "completed",
    bio?: string,
    avatar_url?: string
  }
}

// POST /onboarding/*/
// Succès: 200 OK
// Erreur: 403 { error: { code: "invalid_onboarding_step", message: "..." } }
```

#### Frontend (Next.js)

**Responsabilités**:
1. **Orchestration UX** uniquement (pas de logique métier)
2. **Lecture de l'état** depuis `useUser()` (GET /user/me/)
3. **Redirection automatique** en cas d'incohérence
4. **Pas de stockage d'état métier** (ni cookies, ni localStorage pour onboarding_step)

**Hooks TanStack Query**:
```typescript
// Source unique de vérité
useUser() → GET /user/me/ → { user.onboarding_step, user.activated }

// Mutations (invalident useUser après succès)
useStartOnboarding()
useSubmitOnboardingProfile()
useSubmitOnboardingInterests()
```

#### Cookies

**Contenu strict**:
```typescript
// ✅ AUTORISÉ
{
  access_token: "jwt_token",    // httpOnly, Secure
  refresh_token: "jwt_token"    // httpOnly, Secure
}

// ❌ INTERDIT
{
  activated: "true",            // ❌ Ne jamais stocker
  onboarding_step: "profile",  // ❌ Ne jamais stocker
  user_id: "uuid"              // ❌ Ne jamais stocker
}
```

**Raison**: Les cookies sont lus par le middleware Next.js qui ne peut pas faire d'appels API. Le middleware ne peut vérifier que la présence d'un token, pas l'état métier.

#### Cache TanStack Query

**Structure**:
```typescript
// Cache principal
authKeys.user() → User (inclut onboarding_step)

// Cache secondaire (optionnel, pour optimisation)
onboardingKeys.step() → OnboardingStep (dérivé de useUser)

// Règle: authKeys.user() est la source de vérité
// onboardingKeys.step() est un cache dérivé, jamais utilisé seul
```

**Invalidation**:
```typescript
// Après chaque mutation onboarding
onSuccess: async () => {
  await queryClient.invalidateQueries({ queryKey: authKeys.user() });
  // Optionnel: invalider aussi onboardingKeys.step()
}
```

### 2.2 Flux de Données

```
┌─────────────┐
│   Backend   │
│   (Django)  │
└──────┬──────┘
       │
       │ GET /user/me/
       │ Response: { user: { onboarding_step: "profile" } }
       │
       ▼
┌─────────────────────────────────────┐
│  TanStack Query Cache               │
│  authKeys.user() → User             │
│  (staleTime: 5min)                  │
└──────┬───────────────────────────────┘
       │
       │ useUser() lit depuis cache
       │
       ▼
┌─────────────────────────────────────┐
│  Composants React                    │
│  - post-login/page.tsx               │
│  - onboarding-start-card.tsx        │
│  - profile-form.tsx                  │
│  - interests-form.tsx                │
└──────┬───────────────────────────────┘
       │
       │ Décision de redirection
       │ basée sur user.onboarding_step
       │
       ▼
┌─────────────────────────────────────┐
│  router.replace(route_correcte)      │
└─────────────────────────────────────┘
```

### 2.3 Middleware Next.js

**Rôle minimal**:
```typescript
// Vérifie uniquement la présence d'un token
if (hasToken) {
  return NextResponse.next(); // Laisse les composants gérer
} else {
  return NextResponse.redirect("/auth/login");
}
```

**Ne fait PAS**:
- ❌ Lire `onboarding_step` depuis les cookies
- ❌ Rediriger selon l'état d'onboarding
- ❌ Faire des appels API

**Raison**: Le middleware ne peut pas faire d'appels API de manière fiable. Les redirections basées sur l'état métier sont gérées par les composants React qui peuvent utiliser `useUser()`.

---

## 🎨 3. STRATÉGIE UX DÉTAILLÉE

### 3.1 Étape 1: Démarrage Onboarding (`/onboarding/start/`)

**État attendu**: `onboarding_step === "not_started"`

**Comportement**:
1. **Montage du composant**:
   ```typescript
   const { user, isLoading } = useUser();
   
   useEffect(() => {
     if (isLoading) return;
     
     // Auto-réparation: si l'état est incohérent, rediriger
     if (user?.onboarding_step !== "not_started") {
       router.replace(getRouteForStep(user.onboarding_step));
       return;
     }
   }, [user, isLoading]);
   ```

2. **Affichage**:
   - Si `isLoading`: Spinner minimal
   - Si `user.onboarding_step === "not_started"`: Bouton "Commencer"
   - Sinon: Redirection silencieuse (pas d'erreur visible)

3. **Action utilisateur**:
   ```typescript
   const handleStart = async () => {
     try {
       await startOnboarding.mutateAsync();
       // Mutation invalide authKeys.user()
       // Refetch automatique de useUser()
       const updatedUser = await queryClient.fetchQuery(authKeys.user());
       router.replace(getRouteForStep(updatedUser.onboarding_step));
     } catch (error) {
       if (error.code === "invalid_onboarding_step") {
         // Auto-réparation: refetch et rediriger
         await queryClient.invalidateQueries({ queryKey: authKeys.user() });
         const user = await queryClient.fetchQuery(authKeys.user());
         router.replace(getRouteForStep(user.onboarding_step));
       } else {
         // Erreur réseau: afficher message générique
         setErrorMessage("Impossible de démarrer. Réessaie dans un instant.");
       }
     }
   };
   ```

**Règles UX**:
- ✅ Pas de message d'erreur si l'état est récupérable
- ✅ Redirection silencieuse en cas d'incohérence
- ✅ Pas de `window.location.reload()`

### 3.2 Étape 2: Formulaire Profil (`/onboarding/profile/`)

**État attendu**: `onboarding_step === "profile"`

**Comportement**:
1. **Montage du composant**:
   ```typescript
   const { user, isLoading } = useUser();
   
   useEffect(() => {
     if (isLoading) return;
     
     // Auto-réparation: si l'état est incohérent, rediriger
     if (user?.onboarding_step !== "profile") {
       router.replace(getRouteForStep(user.onboarding_step));
       return;
     }
     
     // Pré-remplir le formulaire avec les données utilisateur
     if (user) {
       setFormState({
         username: user.username ?? "",
         bio: user.bio ?? "",
         avatar_url: user.avatar_url ?? "",
       });
     }
   }, [user, isLoading]);
   ```

2. **Affichage**:
   - Si `isLoading`: Spinner minimal
   - Si `user.onboarding_step !== "profile"`: Redirection silencieuse
   - Sinon: Formulaire pré-rempli

3. **Soumission**:
   ```typescript
   const handleSubmit = async (event: React.FormEvent) => {
     event.preventDefault();
     
     // Vérification pré-submit (optimiste)
     if (user?.onboarding_step !== "profile") {
       // État a changé entre le montage et la soumission
       await queryClient.invalidateQueries({ queryKey: authKeys.user() });
       const updatedUser = await queryClient.fetchQuery(authKeys.user());
       router.replace(getRouteForStep(updatedUser.onboarding_step));
       return;
     }
     
     try {
       await submitProfile.mutateAsync(formData);
       
       // Mutation invalide authKeys.user()
       // Refetch automatique
       const updatedUser = await queryClient.fetchQuery(authKeys.user());
       
       // Redirection vers l'étape suivante
       router.replace(getRouteForStep(updatedUser.onboarding_step));
     } catch (error) {
       if (error.code === "invalid_onboarding_step") {
         // Auto-réparation
         await queryClient.invalidateQueries({ queryKey: authKeys.user() });
         const updatedUser = await queryClient.fetchQuery(authKeys.user());
         router.replace(getRouteForStep(updatedUser.onboarding_step));
       } else {
         // Erreur réseau ou validation
         setErrorMessage("Impossible d'enregistrer. Réessaie dans un instant.");
       }
     }
   };
   ```

**Règles UX**:
- ✅ Formulaire toujours pré-rempli avec les données du backend
- ✅ Pas de validation côté frontend (backend valide)
- ✅ Redirection automatique après succès
- ✅ Auto-réparation silencieuse en cas d'erreur récupérable

### 3.3 Étape 3: Sélection Intérêts (`/onboarding/interests/`)

**État attendu**: `onboarding_step === "interests"`

**Comportement**: Identique à l'étape profil, mais pour les intérêts.

**Spécificités**:
- Tags chargés depuis l'API (à implémenter: `GET /tags/` ou `GET /onboarding/tags/`)
- Sélection multiple
- Validation minimale: au moins un tag sélectionné

### 3.4 Sortie Onboarding (`onboarding_step === "completed"`)

**Comportement**:
1. **Détection dans `post-login`**:
   ```typescript
   if (user?.onboarding_step === "completed") {
     router.replace(ROUTES.APP.USER);
   }
   ```

2. **Détection dans les pages onboarding**:
   ```typescript
   useEffect(() => {
     if (user?.onboarding_step === "completed") {
       router.replace(ROUTES.APP.USER);
     }
   }, [user]);
   ```

**Règles UX**:
- ✅ Redirection immédiate vers `/user`
- ✅ Pas de page "onboarding terminé" (sauf si requis par le design)

### 3.5 Gestion des Retours Arrière et Refresh

**Scénario 1: User clique "Retour" dans le navigateur**
```
User sur /onboarding/interests/
↓
Clic "Retour"
↓
Navigation vers /onboarding/profile/
↓
Composant monte
↓
useUser() lit onboarding_step === "interests"
↓
useEffect détecte incohérence
↓
router.replace("/onboarding/interests/")
↓
User reste sur la bonne page (pas de blocage)
```

**Scénario 2: User refresh la page**
```
User sur /onboarding/profile/
↓
Refresh (F5)
↓
Page remonte
↓
useUser() refetch automatique
↓
Si onboarding_step a changé (ex: "interests")
↓
useEffect détecte changement
↓
router.replace("/onboarding/interests/")
↓
User voit la bonne étape (pas d'écran mort)
```

**Règles UX**:
- ✅ Aucun écran ne bloque l'utilisateur
- ✅ Toute incohérence est corrigée automatiquement
- ✅ Pas de message d'erreur si l'état est récupérable

---

## 🚫 4. RÈGLES IMMUTABLES

### 4.1 Règles sur les Cookies

**RÈGLE #1**: Les cookies ne contiennent QUE des tokens
```
✅ AUTORISÉ:
- access_token (httpOnly, Secure)
- refresh_token (httpOnly, Secure)

❌ INTERDIT:
- activated
- onboarding_step
- user_id
- Toute autre donnée métier
```

**Raison**: Le middleware ne peut pas faire d'appels API. Les cookies ne doivent contenir que ce qui est nécessaire pour l'authentification de base.

**RÈGLE #2**: Les cookies ne sont JAMAIS la source de vérité pour l'état métier
```
❌ Ne jamais faire:
if (cookie.onboarding_step === "profile") { ... }

✅ Toujours faire:
const { user } = useUser();
if (user.onboarding_step === "profile") { ... }
```

### 4.2 Règles sur les Sources de Vérité

**RÈGLE #3**: `useUser()` est la SEULE source de vérité pour `onboarding_step`
```
❌ Ne jamais utiliser:
- useOnboardingStep() seul (sauf pour optimisation)
- localStorage.getItem("onboarding_step")
- cookie.onboarding_step

✅ Toujours utiliser:
const { user } = useUser();
const step = user.onboarding_step;
```

**RÈGLE #4**: Le backend est la source de vérité absolue
```
✅ Le frontend lit toujours depuis l'API
✅ Le frontend ne devine jamais l'état
✅ Le frontend ne force jamais une transition
```

### 4.3 Règles sur les Redirections

**RÈGLE #5**: Jamais de `window.location.reload()`
```
❌ Ne jamais faire:
window.location.reload();

✅ Toujours faire:
await queryClient.invalidateQueries({ queryKey: authKeys.user() });
const user = await queryClient.fetchQuery(authKeys.user());
router.replace(getRouteForStep(user.onboarding_step));
```

**RÈGLE #6**: Toute incohérence d'état déclenche une redirection automatique
```
✅ Pattern obligatoire dans chaque composant onboarding:
useEffect(() => {
  if (isLoading) return;
  if (user?.onboarding_step !== expectedStep) {
    router.replace(getRouteForStep(user.onboarding_step));
  }
}, [user, isLoading]);
```

### 4.4 Règles sur les Mutations

**RÈGLE #7**: Toute mutation onboarding invalide `authKeys.user()`
```
✅ Pattern obligatoire:
onSuccess: async () => {
  await queryClient.invalidateQueries({ queryKey: authKeys.user() });
}
```

**RÈGLE #8**: Après une mutation, toujours refetch et rediriger
```
✅ Pattern obligatoire:
try {
  await mutation.mutateAsync(data);
  const updatedUser = await queryClient.fetchQuery(authKeys.user());
  router.replace(getRouteForStep(updatedUser.onboarding_step));
} catch (error) {
  if (error.code === "invalid_onboarding_step") {
    // Auto-réparation
    await queryClient.invalidateQueries({ queryKey: authKeys.user() });
    const user = await queryClient.fetchQuery(authKeys.user());
    router.replace(getRouteForStep(user.onboarding_step));
  }
}
```

### 4.5 Règles sur la Gestion d'Erreurs

**RÈGLE #9**: Pas d'erreur visible si l'état est récupérable
```
❌ Ne jamais faire:
if (error.code === "invalid_onboarding_step") {
  setErrorMessage("Erreur: étape invalide");
}

✅ Toujours faire:
if (error.code === "invalid_onboarding_step") {
  // Auto-réparation silencieuse
  await queryClient.invalidateQueries({ queryKey: authKeys.user() });
  const user = await queryClient.fetchQuery(authKeys.user());
  router.replace(getRouteForStep(user.onboarding_step));
}
```

**RÈGLE #10**: Les erreurs réseau sont les seules affichées à l'utilisateur
```
✅ Afficher uniquement:
- Erreurs réseau (timeout, 500, etc.)
- Erreurs de validation (400) avec message backend

❌ Ne jamais afficher:
- invalid_onboarding_step (auto-réparé)
- État incohérent (auto-réparé)
```

### 4.6 Règles sur le Middleware

**RÈGLE #11**: Le middleware ne gère QUE l'authentification de base
```
✅ Le middleware fait:
- Vérifier la présence d'un token
- Rediriger vers /auth/login si pas de token

❌ Le middleware ne fait PAS:
- Lire onboarding_step
- Rediriger selon l'état d'onboarding
- Faire des appels API
```

### 4.7 Règles sur le Cache

**RÈGLE #12**: `authKeys.user()` est le cache principal
```
✅ Utiliser authKeys.user() partout
✅ Invalider authKeys.user() après chaque mutation onboarding
✅ Utiliser onboardingKeys.step() uniquement pour optimisation (optionnel)
```

---

## ✅ 5. CHECKLIST "PROD-READY ONBOARDING"

### 5.1 Tests Fonctionnels Obligatoires

#### Tests Unitaires
- [ ] `useUser()` retourne les bonnes données depuis l'API
- [ ] `useStartOnboarding()` invalide `authKeys.user()` après succès
- [ ] `useSubmitOnboardingProfile()` invalide `authKeys.user()` après succès
- [ ] `useSubmitOnboardingInterests()` invalide `authKeys.user()` après succès
- [ ] `getRouteForStep()` retourne la bonne route pour chaque step

#### Tests d'Intégration
- [ ] Flow complet: login → start → profile → interests → completed
- [ ] Refresh page sur chaque étape: l'état est préservé
- [ ] Navigation manuelle vers une étape incorrecte: redirection automatique
- [ ] Retour navigateur: redirection vers la bonne étape
- [ ] Erreur `invalid_onboarding_step`: auto-réparation silencieuse

#### Tests E2E (Playwright)
- [ ] **Happy Path**: Register → Login → Start → Profile → Interests → Dashboard
- [ ] **Refresh Test**: User refresh sur `/onboarding/profile/` → reste sur profile
- [ ] **Navigation Test**: User tape `/onboarding/interests/` alors qu'il est à "profile" → redirigé vers profile
- [ ] **Error Recovery**: Backend retourne 403 → frontend refetch et redirige
- [ ] **Concurrent Tabs**: User ouvre deux onglets, complète onboarding dans un → l'autre se met à jour

### 5.2 Monitoring Production

#### Métriques à Surveiller
- [ ] **Taux de complétion onboarding**: % d'utilisateurs qui atteignent "completed"
- [ ] **Temps moyen par étape**: profile → interests → completed
- [ ] **Taux d'abandon par étape**: Où les users quittent-ils ?
- [ ] **Erreurs 403 invalid_onboarding_step**: Fréquence et patterns
- [ ] **Erreurs réseau**: Timeout, 500, etc.

#### Alertes à Configurer
- [ ] **Taux d'abandon > 50%** sur une étape spécifique
- [ ] **Erreurs 403 > 5%** des requêtes onboarding
- [ ] **Temps moyen > 10min** pour compléter l'onboarding
- [ ] **Erreurs réseau > 1%** des requêtes

### 5.3 Code Review Checklist

#### Avant de Merge
- [ ] Aucun `window.location.reload()` dans le code onboarding
- [ ] Toutes les mutations invalident `authKeys.user()`
- [ ] Tous les composants onboarding vérifient l'état au montage
- [ ] Aucun cookie métier (activated, onboarding_step) n'est défini
- [ ] `useUser()` est utilisé partout (pas `useOnboardingStep()` seul)
- [ ] Les erreurs `invalid_onboarding_step` sont auto-réparées
- [ ] Pas de logique métier dupliquée côté frontend

#### Vérifications Automatiques (Linter/CI)
- [ ] Pas de `localStorage.setItem("onboarding_step")`
- [ ] Pas de `cookie.set("onboarding_step")`
- [ ] Pas de `window.location.reload()`
- [ ] Toutes les mutations ont `onSuccess` avec invalidation

### 5.4 Documentation Obligatoire

- [ ] **README_ONBOARDING.md**: Flow complet, règles immutables
- [ ] **API_CONTRACT.md**: Contrat backend (endpoints, réponses, erreurs)
- [ ] **TROUBLESHOOTING.md**: Guide de debug pour les problèmes courants
- [ ] **CHANGELOG.md**: Historique des changements d'onboarding

### 5.5 Ce qui ne doit JAMAIS être modifié sans revue

#### Architecture
- ❌ **Changer la source de vérité**: `useUser()` doit rester la source unique
- ❌ **Ajouter des cookies métier**: Seuls les tokens sont autorisés
- ❌ **Modifier le middleware pour gérer l'onboarding**: Le middleware reste minimal
- ❌ **Dupliquer la logique métier**: Le backend reste maître

#### UX
- ❌ **Ajouter des `window.location.reload()`**: Toujours utiliser `router.replace()`
- ❌ **Afficher des erreurs pour `invalid_onboarding_step`**: Auto-réparation silencieuse
- ❌ **Bloquer l'utilisateur**: Toute incohérence doit être auto-réparée

#### Performance
- ❌ **Réduire le `staleTime` de `useUser()` en dessous de 1 minute**: Risque de surcharge API
- ❌ **Supprimer le cache TanStack Query**: Le cache est essentiel pour la fluidité

---

## 🔧 6. IMPLÉMENTATION RECOMMANDÉE

### 6.1 Hook Centralisé: `useOnboardingGuard()`

```typescript
/**
 * Hook de garde pour les pages onboarding
 * Vérifie l'état et redirige automatiquement si incohérent
 */
export function useOnboardingGuard(expectedStep: OnboardingStep) {
  const router = useRouter();
  const { user, isLoading } = useUser();
  
  useEffect(() => {
    if (isLoading) return;
    
    if (user?.onboarding_step && user.onboarding_step !== expectedStep) {
      // Auto-réparation: redirection silencieuse
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
// Dans profile-form.tsx
export function OnboardingProfileForm() {
  const { isValid, isLoading, user } = useOnboardingGuard("profile");
  
  if (isLoading) return <Spinner />;
  if (!isValid) return null; // Redirection en cours
  
  // Rendre le formulaire
}
```

### 6.2 Hook Centralisé: `useOnboardingMutation()`

```typescript
/**
 * Hook wrapper pour les mutations onboarding
 * Gère automatiquement l'invalidation et la redirection
 */
export function useOnboardingMutation<T>(
  mutationFn: (data: T) => Promise<void>,
  options?: { onSuccess?: () => void }
) {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      // Invalider le cache
      await queryClient.invalidateQueries({ queryKey: authKeys.user() });
      
      // Refetch et rediriger
      const updatedUser = await queryClient.fetchQuery(authKeys.user());
      if (updatedUser?.onboarding_step) {
        router.replace(getRouteForStep(updatedUser.onboarding_step));
      }
      
      options?.onSuccess?.();
    },
    onError: async (error: ApiError) => {
      if (error.code === "invalid_onboarding_step") {
        // Auto-réparation
        await queryClient.invalidateQueries({ queryKey: authKeys.user() });
        const user = await queryClient.fetchQuery(authKeys.user());
        if (user?.onboarding_step) {
          router.replace(getRouteForStep(user.onboarding_step));
        }
      }
      throw error; // Re-throw pour gestion dans le composant
    },
  });
}
```

### 6.3 Fonction Utilitaire: `getRouteForStep()`

```typescript
/**
 * Mappe un onboarding_step à sa route frontend
 * Source unique de vérité pour les routes
 */
export function getRouteForStep(step: OnboardingStep | undefined): string {
  if (!step) return ROUTES.AUTH.LOGIN;
  
  switch (step) {
    case "not_started":
      return ROUTES.ONBOARDING.START;
    case "profile":
      return ROUTES.ONBOARDING.PROFILE;
    case "interests":
      return ROUTES.ONBOARDING.INTERESTS;
    case "completed":
      return ROUTES.APP.USER;
    default:
      return ROUTES.AUTH.LOGIN;
  }
}
```

---

## 📊 7. MÉTRIQUES DE SUCCÈS

### 7.1 Métriques UX
- **Taux de complétion**: > 80% des utilisateurs activés complètent l'onboarding
- **Temps moyen**: < 5 minutes pour compléter l'onboarding
- **Taux d'abandon**: < 20% sur chaque étape
- **Erreurs visibles**: < 1% des sessions (seulement erreurs réseau)

### 7.2 Métriques Techniques
- **Erreurs 403 invalid_onboarding_step**: < 0.1% des requêtes
- **Temps de réponse API**: < 200ms pour GET /user/me/
- **Taux de cache hit**: > 80% pour useUser()
- **Redirections automatiques**: 100% des incohérences sont corrigées

---

## 🎯 CONCLUSION

Cette architecture garantit:
1. ✅ **Fluidité**: Pas de reload, transitions fluides
2. ✅ **Robustesse**: Auto-réparation des incohérences
3. ✅ **Simplicité**: Une seule source de vérité
4. ✅ **Maintenabilité**: Règles claires, code prévisible
5. ✅ **Scalabilité**: Prêt pour des millions d'utilisateurs

**Le secret**: Le frontend orchestre l'UX, le backend gère la logique métier, et les cookies ne contiennent que les tokens.

---

**Fin du document**
