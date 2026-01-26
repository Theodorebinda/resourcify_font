# Audit de la Logique d'Onboarding - Ressourcefy

**Date**: 2026-01-25  
**Scope**: Analyse complète de la logique d'onboarding frontend

---

## 📋 Résumé Exécutif

### ✅ Points Forts
1. **Architecture server-driven** : Le backend est la source de vérité
2. **Séparation claire** : Activation vs démarrage onboarding
3. **Cache TanStack Query** : Utilisation cohérente du cache
4. **Validation côté backend** : Pas de logique métier dupliquée

### ⚠️ Problèmes Identifiés
1. **Duplication de sources de vérité** : `useUser()` et `useOnboardingStep()` peuvent être désynchronisés
2. **Utilisation excessive de `window.location.reload()`** : Mauvaise UX et perte d'état
3. **Gestion d'erreurs incohérente** : Certains formulaires refetch sans reload, d'autres reload
4. **Incohérence dans les invalidations de cache** : `useUser()` n'est pas invalidé après mutations onboarding
5. **Tags hardcodés** : Les tags d'intérêts sont mockés au lieu d'être récupérés depuis l'API
6. **Logique de redirection dupliquée** : `post-login` et `onboarding-flow` ont des logiques similaires

---

## 🔍 Analyse Détaillée

### 1. Sources de Vérité Multiples

#### Problème
Deux hooks différents récupèrent `onboarding_step` :
- `useUser()` → `user.onboarding_step` (depuis `/user/me/`)
- `useOnboardingStep()` → `onboarding_step` (depuis `/onboarding/status/`)

**Fichiers concernés**:
- `src/services/api/queries/auth-queries.ts` (ligne 79)
- `src/services/api/queries/onboarding-queries.ts` (ligne 28)

#### Impact
- Risque de désynchronisation
- Appels API redondants
- Cache potentiellement incohérent

#### Recommandation
**Option A (Recommandée)** : Utiliser uniquement `useUser()` partout
- `user.onboarding_step` est déjà disponible
- Un seul appel API
- Cache unifié

**Option B** : Synchroniser les deux caches
- Invalider `authKeys.user()` après chaque mutation onboarding
- Utiliser `useUser()` comme source principale

---

### 2. Utilisation Excessive de `window.location.reload()`

#### Problème
Plusieurs composants utilisent `window.location.reload()` après les mutations :
- `onboarding-start-card.tsx` (lignes 25, 33, 40)
- `profile-form.tsx` (ligne 82)
- `interests-form.tsx` (ligne 59)

#### Impact
- **Mauvaise UX** : Perte de l'état de scroll, animations interrompues
- **Performance** : Rechargement complet de la page
- **Perte d'état** : État React perdu, re-initialisation complète

#### Recommandation
**Remplacer par** :
1. Invalidation du cache TanStack Query
2. Redirection programmatique avec `router.replace()`
3. Utiliser `useUser()` pour détecter le changement d'état

**Exemple** :
```typescript
// Au lieu de :
await submitProfile.mutateAsync(...);
window.location.reload();

// Utiliser :
await submitProfile.mutateAsync(...);
await queryClient.invalidateQueries({ queryKey: authKeys.user() });
const updatedUser = await queryClient.fetchQuery(authKeys.user());
if (updatedUser.onboarding_step === "interests") {
  router.replace(ROUTES.ONBOARDING.INTERESTS);
}
```

---

### 3. Gestion d'Erreurs Incohérente

#### Problème
Les formulaires gèrent différemment l'erreur `invalid_onboarding_step` :

**Profile Form** (lignes 85-89) :
```typescript
if (apiError.code === "invalid_onboarding_step") {
  setErrorMessage("Étape expirée, redirection...");
  await refetchOnboarding();
  await refetch();
  return; // Pas de reload
}
```

**Interests Form** (lignes 62-65) :
```typescript
if (apiError.code === "invalid_onboarding_step") {
  setErrorMessage("Étape expirée, redirection...");
  await refetchOnboarding();
  return; // Pas de reload
}
```

**Start Card** (lignes 36-41) :
```typescript
if (apiError.code === "invalid_onboarding_step") {
  setErrorMessage("Étape expirée, redirection...");
  await refetch();
  window.location.reload(); // Reload !
}
```

#### Impact
- Comportement incohérent
- Expérience utilisateur confuse
- Code difficile à maintenir

#### Recommandation
**Standardiser** :
1. Créer un hook `useOnboardingErrorHandler()` pour gérer les erreurs
2. Toujours invalider `authKeys.user()` (pas seulement `onboardingKeys.step()`)
3. Rediriger programmatiquement au lieu de reload

---

### 4. Invalidation de Cache Incomplète

#### Problème
Les mutations onboarding n'invalident que `onboardingKeys.step()` :

**Fichiers concernés**:
- `src/services/api/queries/onboarding-queries.ts` (lignes 64, 90, 106)

```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: onboardingKeys.step() });
  // ❌ Manque : authKeys.user()
}
```

#### Impact
- `useUser()` peut retourner des données obsolètes
- `post-login` peut rediriger vers la mauvaise page
- Désynchronisation entre les deux sources

#### Recommandation
**Invalider les deux caches** :
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: onboardingKeys.step() });
  queryClient.invalidateQueries({ queryKey: authKeys.user() });
}
```

---

### 5. Tags Hardcodés

#### Problème
Les tags d'intérêts sont hardcodés dans `interests-form.tsx` (lignes 17-24) :

```typescript
const TAGS = [
  { id: "frontend", label: "Frontend" },
  { id: "backend", label: "Backend" },
  // ...
];
```

#### Impact
- Impossible de gérer les tags dynamiquement
- Pas de synchronisation avec le backend
- Maintenance difficile

#### Recommandation
**Créer un endpoint et un hook** :
1. Endpoint backend : `GET /tags/` ou `GET /onboarding/tags/`
2. Hook : `useOnboardingTags()`
3. Charger les tags depuis l'API

---

### 6. Logique de Redirection Dupliquée

#### Problème
Deux endroits gèrent la redirection basée sur `onboarding_step` :

1. **`post-login/page.tsx`** (lignes 35-44) :
```typescript
if (user.onboarding_step === "not_started") {
  router.replace(ROUTES.ONBOARDING.START);
} else if (user.onboarding_step === "profile") {
  router.replace(ROUTES.ONBOARDING.PROFILE);
}
```

2. **`onboarding-flow.tsx`** (lignes 39-44) :
```typescript
if (onboardingStep === "profile") {
  return <OnboardingProfileForm />;
} else if (onboardingStep === "interests") {
  return <OnboardingInterestsForm />;
}
```

#### Impact
- Code dupliqué
- Risque d'incohérence
- Maintenance difficile

#### Recommandation
**Centraliser la logique** :
1. Créer un hook `useOnboardingRedirect()` qui retourne la route cible
2. Utiliser ce hook dans `post-login` et `onboarding-flow`
3. Ou supprimer `onboarding-flow` et utiliser uniquement les pages dédiées

---

### 7. Vérification d'Étape Redondante

#### Problème
Les formulaires vérifient l'étape **deux fois** :

**Profile Form** :
1. Ligne 67 : Vérification avant submit
2. Ligne 95 : Vérification pour le rendu

**Interests Form** :
1. Ligne 50 : Vérification avant submit
2. Ligne 71 : Vérification pour le rendu

#### Impact
- Code redondant
- Logique dupliquée

#### Recommandation
**Extraire dans un hook** :
```typescript
function useOnboardingStepGuard(expectedStep: OnboardingStep) {
  const { data: step } = useOnboardingStep();
  const isValid = step === expectedStep;
  
  if (!isValid && step) {
    // Rediriger vers la bonne étape
  }
  
  return { isValid, step };
}
```

---

### 8. Incohérence dans `onboarding-routes.ts`

#### Problème
Le fichier `onboarding-routes.ts` contient des utilitaires qui ne sont **jamais utilisés** :

- `ONBOARDING_STEP_TO_ROUTE` (ligne 12) : Utilise `ROUTES.ONBOARDING.ROOT` pour `not_started`, mais devrait être `ROUTES.ONBOARDING.START`
- `ROUTE_TO_ONBOARDING_STEP` (ligne 22) : Jamais utilisé
- `canAccessRoute()` (ligne 39) : Jamais utilisé
- `getNextStep()` (ligne 75) : Jamais utilisé

#### Impact
- Code mort
- Confusion potentielle
- Maintenance inutile

#### Recommandation
**Option A** : Supprimer le fichier s'il n'est pas utilisé  
**Option B** : Corriger et utiliser les utilitaires

---

### 9. `onboarding-progress.tsx` Utilise API_ENDPOINTS au lieu de ROUTES

#### Problème
Ligne 18 et 27-28 de `onboarding-progress.tsx` :
```typescript
import { API_ENDPOINTS } from "@/src/constants/api";
// ...
route: API_ENDPOINTS.ONBOARDING.PROFILE, // ❌ Devrait être ROUTES
```

#### Impact
- Incohérence : mélange routes frontend et endpoints backend
- Les routes affichées sont incorrectes (`/onboarding/profile/` au lieu de `/onboarding/profile/`)

#### Recommandation
**Corriger** :
```typescript
import { ROUTES } from "../../constants/routes";
// ...
route: ROUTES.ONBOARDING.PROFILE,
```

---

### 10. Manque de Synchronisation après Mutations

#### Problème
Après `POST /onboarding/profile/` ou `POST /onboarding/interests/`, le backend met à jour `onboarding_step`, mais :
- Le cache `useUser()` n'est pas invalidé
- `post-login` peut rediriger vers la mauvaise page
- Les composants peuvent afficher un état obsolète

#### Recommandation
**Invalider `authKeys.user()` après chaque mutation** :
```typescript
onSuccess: async () => {
  // Invalider les deux caches
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: onboardingKeys.step() }),
    queryClient.invalidateQueries({ queryKey: authKeys.user() }),
  ]);
}
```

---

## 🎯 Plan d'Action Priorisé

### 🔴 Priorité Haute (Blocants)

1. **Unifier les sources de vérité**
   - Utiliser uniquement `useUser()` partout
   - Supprimer `useOnboardingStep()` ou le rendre optionnel
   - Invalider `authKeys.user()` après chaque mutation onboarding

2. **Remplacer `window.location.reload()`**
   - Utiliser `router.replace()` avec invalidation de cache
   - Améliorer l'UX (pas de rechargement complet)

3. **Synchroniser les caches**
   - Invalider `authKeys.user()` dans toutes les mutations onboarding
   - S'assurer que `post-login` lit toujours les données à jour

### 🟡 Priorité Moyenne (Améliorations)

4. **Standardiser la gestion d'erreurs**
   - Créer `useOnboardingErrorHandler()`
   - Comportement cohérent partout

5. **Corriger `onboarding-progress.tsx`**
   - Utiliser `ROUTES` au lieu de `API_ENDPOINTS`

6. **Nettoyer le code mort**
   - Supprimer ou utiliser `onboarding-routes.ts`

### 🟢 Priorité Basse (Nice to Have)

7. **Charger les tags depuis l'API**
   - Créer `useOnboardingTags()`
   - Remplacer les tags hardcodés

8. **Centraliser la logique de redirection**
   - Créer `useOnboardingRedirect()`
   - Réduire la duplication

9. **Extraire les guards d'étape**
   - Créer `useOnboardingStepGuard()`
   - Réduire la duplication

---

## 📊 Métriques de Qualité

### Couverture
- ✅ Tous les fichiers onboarding analysés
- ✅ Tous les hooks TanStack Query vérifiés
- ✅ Toutes les pages onboarding examinées

### Cohérence
- ⚠️ 3 sources de vérité différentes (`useUser`, `useOnboardingStep`, cookies)
- ⚠️ 4 utilisations de `window.location.reload()`
- ⚠️ 2 logiques de redirection dupliquées

### Maintenabilité
- ✅ Architecture server-driven respectée
- ⚠️ Code dupliqué dans plusieurs endroits
- ⚠️ Fichiers utilitaires non utilisés

---

## 🔧 Corrections Recommandées (Code)

### Correction 1 : Unifier les sources de vérité

```typescript
// src/services/api/queries/onboarding-queries.ts

export function useSubmitOnboardingProfile() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, OnboardingProfilePayload>({
    mutationFn: async (payload) => {
      await apiClient.post<ApiResponse<{ message?: string }>>(
        API_ENDPOINTS.ONBOARDING.PROFILE,
        payload
      );
    },
    onSuccess: async () => {
      // Invalider les deux caches
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: onboardingKeys.step() }),
        queryClient.invalidateQueries({ queryKey: authKeys.user() }),
      ]);
    },
  });
}
```

### Correction 2 : Remplacer reload par redirection

```typescript
// src/components/features/onboarding/profile-form.tsx

const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  // ...
  try {
    await submitProfile.mutateAsync({...});
    
    // Invalider et récupérer les données à jour
    await queryClient.invalidateQueries({ queryKey: authKeys.user() });
    const updatedUser = await queryClient.fetchQuery(authKeys.user());
    
    // Rediriger selon le nouvel état
    if (updatedUser?.onboarding_step === "interests") {
      router.replace(ROUTES.ONBOARDING.INTERESTS);
    }
  } catch (error) {
    // ...
  }
};
```

### Correction 3 : Utiliser uniquement useUser()

```typescript
// src/app/(auth)/auth/post-login/page.tsx

export default function PostLoginPage() {
  const router = useRouter();
  const { user, isLoading } = useUser(); // ✅ Un seul hook

  useEffect(() => {
    if (isLoading) return;
    
    if (user && !user.activated) {
      router.replace(ROUTES.ONBOARDING.ACTIVATION_REQUIRED);
      return;
    }

    if (user?.onboarding_step) {
      const route = getOnboardingRoute(user.onboarding_step);
      router.replace(route);
    }
  }, [user, isLoading, router]);
}
```

---

## ✅ Checklist de Validation

- [ ] `useUser()` est la source unique de vérité pour `onboarding_step`
- [ ] Tous les `window.location.reload()` sont remplacés par `router.replace()`
- [ ] `authKeys.user()` est invalidé après chaque mutation onboarding
- [ ] La gestion d'erreurs est standardisée
- [ ] `onboarding-progress.tsx` utilise `ROUTES` au lieu de `API_ENDPOINTS`
- [ ] Le code mort est supprimé ou utilisé
- [ ] Les tags sont chargés depuis l'API (si applicable)
- [ ] La logique de redirection est centralisée

---

**Fin de l'audit**
