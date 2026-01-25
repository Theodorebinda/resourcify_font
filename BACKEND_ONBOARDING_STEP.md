# Backend - Spécification `onboarding_step`

## Vue d'ensemble

Le champ `onboarding_step` est la **source de vérité** pour l'état d'onboarding de l'utilisateur. Le frontend **lit** cette valeur et **ne l'infère jamais**.

## Valeurs possibles

```typescript
onboarding_step ∈ {
  "not_started",  // Compte activé mais onboarding pas commencé
  "profile",      // Étape 1 : Profil en cours
  "interests",    // Étape 2 : Intérêts en cours
  "completed"     // Onboarding terminé, accès app autorisé
}
```

## Endpoints où `onboarding_step` doit être envoyé

### 1. `GET /user/me` (Obligatoire)

**Réponse attendue** :
```json
{
  "status": "ok",
  "data": {
    "id": "user-id",
    "email": "user@example.com",
    "username": "username",
    "activated": true,
    "onboarding_step": "not_started" | "profile" | "interests" | "completed",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

**Important** :
- `onboarding_step` est **obligatoire** dans la réponse
- Ne peut pas être `null` ou `undefined`
- Doit être une des 4 valeurs valides

### 2. `POST /auth/login/` (Recommandé)

**Réponse attendue** :
```json
{
  "status": "ok",
  "data": {
    "access_token": "jwt-token",
    "refresh_token": "refresh-token",
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "username": "username",
      "activated": true,
      "onboarding_step": "not_started" | "profile" | "interests" | "completed"
    }
  }
}
```

**Note** :
- Si `onboarding_step` n'est pas inclus dans la réponse login, le frontend utilise `"not_started"` par défaut
- Il sera mis à jour lors de l'appel suivant à `/user/me`

### 3. Cookies (Recommandé pour le middleware)

Le backend **peut** définir un cookie `onboarding_step` pour que le middleware Next.js puisse lire l'état sans appeler l'API.

**Cookie à définir** :
```
Set-Cookie: onboarding_step=not_started; Path=/; HttpOnly; SameSite=Lax
```

**Valeurs possibles** :
- `not_started`
- `profile`
- `interests`
- `completed`

**Note** : Si le cookie n'est pas défini, le frontend le définit via `/api/auth/set-cookies` après avoir récupéré les données utilisateur.

## Mise à jour de `onboarding_step`

### Quand mettre à jour

Le backend doit mettre à jour `onboarding_step` quand :

1. **Compte activé** → `onboarding_step = "not_started"`
2. **Profil complété** → `onboarding_step = "profile"`
3. **Intérêts complétés** → `onboarding_step = "interests"`
4. **Onboarding terminé** → `onboarding_step = "completed"`

### Endpoints de mise à jour (à implémenter côté backend)

Le frontend s'attend à ce que ces endpoints mettent à jour `onboarding_step` :

- `POST /onboarding/profile` → Met à jour à `"profile"`
- `POST /onboarding/interests` → Met à jour à `"interests"`
- `POST /onboarding/complete` → Met à jour à `"completed"`

**Réponse attendue** :
```json
{
  "status": "ok",
  "data": {
    "message": "Profile updated",
    "onboarding_step": "profile"  // Nouvelle valeur
  }
}
```

## Comportement du frontend

### Lecture

Le frontend lit `onboarding_step` depuis :
1. **Cookies** (pour le middleware - lecture rapide)
2. **API `/user/me`** (source de vérité principale)
3. **Réponse login** (optionnel, utilisé si disponible)

### Utilisation

1. **Middleware** : Utilise `onboarding_step` depuis les cookies pour rediriger l'utilisateur
2. **Composants** : Utilisent `onboarding_step` depuis `useUser()` pour afficher l'état
3. **Navigation** : Le middleware bloque l'accès aux routes selon `onboarding_step`

### Mapping vers états utilisateur

Le frontend mappe `onboarding_step` vers des états utilisateur :

| `onboarding_step` | État utilisateur | Routes accessibles |
|-------------------|------------------|-------------------|
| `not_started` | `ACTIVATED` | `/onboarding/profile` |
| `profile` | `ONBOARDING.profile` | `/onboarding/profile`, `/onboarding/interests` |
| `interests` | `ONBOARDING.interests` | `/onboarding/interests`, `/onboarding/done` |
| `completed` | `APP_READY` | `/app/*` |

## Règles importantes

### ✅ À faire

- Toujours inclure `onboarding_step` dans `/user/me`
- Utiliser exactement les 4 valeurs définies
- Mettre à jour `onboarding_step` après chaque étape d'onboarding
- Définir le cookie `onboarding_step` si possible (pour performance middleware)

### ❌ À éviter

- Ne jamais laisser `onboarding_step` à `null` ou `undefined`
- Ne pas utiliser d'autres valeurs que les 4 définies
- Ne pas permettre au frontend de deviner ou inférer la valeur
- Ne pas permettre de sauter des étapes (le backend doit valider l'ordre)

## Exemple de flux complet

```
1. Inscription → onboarding_step = null (pas encore activé)
2. Activation → onboarding_step = "not_started"
3. Compléter profil → onboarding_step = "profile"
4. Compléter intérêts → onboarding_step = "interests"
5. Finaliser → onboarding_step = "completed"
```

À chaque étape, le backend doit :
- Mettre à jour `onboarding_step` en base de données
- Retourner la nouvelle valeur dans les réponses API
- Optionnellement : définir le cookie `onboarding_step`

## Validation côté backend

Le backend doit valider que :
- Les transitions sont dans l'ordre : `not_started` → `profile` → `interests` → `completed`
- On ne peut pas passer de `not_started` directement à `interests`
- On ne peut pas revenir en arrière (sauf cas exceptionnel géré par le backend)

## Résumé pour le backend

**Obligatoire** :
- ✅ Inclure `onboarding_step` dans `GET /user/me`
- ✅ Utiliser exactement les 4 valeurs : `"not_started"`, `"profile"`, `"interests"`, `"completed"`
- ✅ Mettre à jour `onboarding_step` après chaque étape d'onboarding

**Recommandé** :
- ✅ Inclure `onboarding_step` dans `POST /auth/login/`
- ✅ Définir le cookie `onboarding_step` dans les réponses

**Interdit** :
- ❌ Retourner `null` ou `undefined` pour `onboarding_step`
- ❌ Utiliser d'autres valeurs que les 4 définies
- ❌ Permettre de sauter des étapes sans validation
