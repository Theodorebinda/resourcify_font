# Gestion des Tokens JWT - Documentation

## Vue d'ensemble

Le système utilise un **intercepteur Axios centralisé** qui injecte automatiquement le Bearer token dans **toutes les requêtes** API. Le token est stocké dans `localStorage` après la connexion et réutilisé automatiquement.

## Architecture

### 1. Stockage du Token

**Localisation** : `localStorage.getItem("access_token")`

**Quand est-il sauvegardé** :
- Après un login réussi (`useLogin()` mutation)
- Le token est extrait de la réponse backend et stocké immédiatement

**Format de la réponse backend** :
```json
{
  "status": "ok",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "username": "username",
      "activated": true,
      "onboarding_step": "not_started"
    }
  }
}
```

### 2. Intercepteur Axios

**Fichier** : `src/services/api/client.ts`

**Fonctionnement** :
```typescript
// Request Interceptor
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken(); // Lit depuis localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Caractéristiques** :
- ✅ S'exécute automatiquement pour **TOUTES** les requêtes via `apiClient`
- ✅ Vérifie `localStorage` à chaque requête
- ✅ Ajoute le header `Authorization: Bearer <token>` si le token existe
- ✅ Fonctionne côté client uniquement (vérifie `typeof window !== "undefined"`)

### 3. Utilisation dans les Requêtes

**Toutes les requêtes utilisent `apiClient`** :

```typescript
// Exemple : useUser()
const response = await apiClient.get<ApiResponse<User>>(API_ENDPOINTS.USER.ME);
// ↑ Le token est automatiquement injecté par l'intercepteur

// Exemple : useLogin()
const response = await apiClient.post<ApiResponse<LoginResponse>>(
  API_ENDPOINTS.AUTH.LOGIN,
  credentials
);
// ↑ Pas de token pour login (endpoint public)
// Mais après login, le token est sauvegardé et utilisé pour les requêtes suivantes
```

## Flux Complet

### 1. Connexion

```
1. User submit login form
2. apiClient.post("/auth/login/", { email, password })
   → Pas de token (endpoint public)
3. Backend retourne { access_token, refresh_token, user }
4. Frontend sauvegarde dans localStorage:
   - localStorage.setItem("access_token", token)
   - localStorage.setItem("refresh_token", refresh_token)
5. Token est maintenant disponible pour toutes les requêtes suivantes
```

### 2. Requêtes Authentifiées

```
1. Composant appelle useUser() ou autre hook
2. Hook utilise apiClient.get("/user/me")
3. Intercepteur s'exécute:
   - Lit localStorage.getItem("access_token")
   - Ajoute header: Authorization: Bearer <token>
4. Requête envoyée avec token
5. Backend valide le token et retourne les données
```

### 3. Déconnexion

```
1. User clique logout
2. useLogout() mutation s'exécute
3. localStorage.removeItem("access_token")
4. localStorage.removeItem("refresh_token")
5. Toutes les requêtes suivantes n'auront plus de token
6. Backend retournera 401 si token requis
```

## Garanties

### ✅ Ce qui est garanti

1. **Injection automatique** : Toutes les requêtes via `apiClient` ont automatiquement le token
2. **Pas de duplication** : Un seul endroit gère l'injection (l'intercepteur)
3. **Sécurité** : Token stocké dans `localStorage` (accessible uniquement côté client)
4. **Cohérence** : Même token utilisé pour toutes les requêtes d'une session

### ⚠️ Limitations actuelles

1. **Pas de refresh automatique** : Si le token expire (401), l'utilisateur doit se reconnecter
2. **Pas de retry avec refresh** : Les requêtes échouées avec 401 ne sont pas automatiquement retentées avec un nouveau token

## Vérification

### Comment vérifier que le token est injecté

1. **Ouvrir DevTools → Network**
2. **Faire une requête authentifiée** (ex: charger le dashboard)
3. **Vérifier l'onglet Headers de la requête**
4. **Chercher** : `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Comment vérifier que le token est sauvegardé

1. **Ouvrir DevTools → Application → Local Storage**
2. **Chercher** : `access_token`
3. **Valeur** : Le JWT token complet

## Code Source

### Intercepteur Principal

**Fichier** : `src/services/api/client.ts`

```typescript
// Fonction helper pour récupérer le token
function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

// Intercepteur de requête
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Sauvegarde après Login

**Fichier** : `src/services/api/queries/auth-queries.ts`

```typescript
// Dans useLogin() mutation
const loginData = response.data.data;

// Sauvegarde immédiate
localStorage.setItem("access_token", loginData.access_token);
localStorage.setItem("refresh_token", loginData.refresh_token);

// Token est maintenant disponible pour toutes les requêtes suivantes
```

## Règles Importantes

### ✅ À faire

- Utiliser **toujours** `apiClient` pour les requêtes API
- Le token est injecté automatiquement, **ne pas l'ajouter manuellement**
- Sauvegarder le token immédiatement après login

### ❌ À éviter

- Ne pas ajouter manuellement `Authorization` header dans les requêtes
- Ne pas utiliser `fetch()` directement (utiliser `apiClient`)
- Ne pas stocker le token ailleurs que `localStorage`

## Résumé

**Le système est fiable** :
- ✅ Intercepteur centralisé dans `apiClient`
- ✅ Token injecté automatiquement dans toutes les requêtes
- ✅ Token sauvegardé après login
- ✅ Token supprimé après logout
- ✅ Gestion d'erreur 401 (clear token)

**Toutes les requêtes via `apiClient` ont automatiquement le Bearer token** si l'utilisateur est connecté.
