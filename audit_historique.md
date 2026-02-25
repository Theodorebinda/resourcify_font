# Integration Front - Audit Historique

## Politique officielle
- L'audit expose `INSERT`, `UPDATE`, `DELETE`.
- Chaque entree inclut:
  - `changed_by` (UUID utilisateur ou `system`)
  - `changed_at` (timestamp UTC)
  - `request_id` (UUID de corrélation)
- Les lectures restent filtrees par permissions (admin ou owner selon endpoint).

## Endpoints

### 1) Liste globale des audits (admin)
`GET /api/audit/`

Query params optionnels:
- `page` (defaut: `1`)
- `page_size` (defaut: `20`, max: `100`)
- `table_name`
- `operation` (`INSERT|UPDATE|DELETE`)
- `changed_by` (UUID user en string ou `system`)
- `request_id` (UUID)

Exemple:
```bash
curl -X GET "http://127.0.0.1:8000/api/audit/?operation=INSERT&page=1&page_size=20" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### 2) Historique d'une ligne
`GET /api/audit/{table_name}/{row_id}/`

Exemple:
```bash
curl -X GET "http://127.0.0.1:8000/api/audit/resources_resource/UUID_RESOURCE/?page=1&page_size=20" \
  -H "Authorization: Bearer <TOKEN>"
```

#### Cas courant: voir l'historique d'une ressource
Oui, pour une ressource on utilise:

`GET /api/audit/resources_resource/{resource_id}/`

Ce endpoint permet de consulter l'historique de la ligne `resources_resource` (operations `INSERT`, `UPDATE`, `DELETE`) avec pagination.

Chaque entree retourne notamment:
- `old_data`
- `new_data`
- `diff` (resume des champs modifies)
- `changed_by`
- `changed_at`
- `request_id`
- `reason`

Permissions:
- Admin: acces autorise
- Owner (auteur de la ressource): acces autorise
- Autres utilisateurs: refuse (`403`)

Important:
- Cet historique couvre la ligne `resources_resource` elle-meme.
- Les changements lies (ex: tags M2M, versions, commentaires) ne sont pas agreges automatiquement dans ce meme endpoint.

### 3) Detail d'une entree
`GET /api/audit/entry/{audit_id}/`

Exemple:
```bash
curl -X GET "http://127.0.0.1:8000/api/audit/entry/42/" \
  -H "Authorization: Bearer <TOKEN>"
```

### 4) Restaurer une version (admin)
`POST /api/audit/restore/`

Body:
```json
{
  "audit_id": 42,
  "reason": "Rollback after bad update"
}
```

Exemple:
```bash
curl -X POST "http://127.0.0.1:8000/api/audit/restore/" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"audit_id": 42, "reason": "Rollback after bad update"}'
```

## Semantique restore
- `UPDATE`: restauration de `old_data` via ORM.
- `DELETE`: recreation/restauration de `old_data` via ORM.
- `INSERT|CREATE|RESTORE`: non supporte, reponse `400` avec `unsupported_restore_operation`.

## Exemple reponse succes
```json
{
  "status": "ok",
  "data": {
    "audit_id": 42,
    "restored_table": "resources_resource",
    "restored_row_id": "2f3b3e9c-8d47-4e0f-a1c7-d0f25123efad",
    "operation": "UPDATE",
    "restored": true,
    "effect": "restored_previous_state"
  }
}
```

## Exemple fetch (frontend)
```js
async function fetchAllAudits(token, params = {}) {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    page_size: String(params.pageSize ?? 20),
    ...(params.tableName ? { table_name: params.tableName } : {}),
    ...(params.operation ? { operation: params.operation } : {}),
    ...(params.changedBy ? { changed_by: params.changedBy } : {}),
    ...(params.requestId ? { request_id: params.requestId } : {}),
  });

  const res = await fetch(`/api/audit/?${query.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Audit list failed: ${res.status}`);
  }
  return res.json();
}
```

## Reponses usuelles
- `200`: succes.
- `400`: table non supportee / snapshot invalide / operation restore non supportee / `request_id` invalide.
- `403`: permissions insuffisantes.
- `404`: entree d'audit introuvable ou non visible.

## Notes securite
- Les champs sensibles sont masques (`password`, `token`, `secret`, `access_token`, `refresh_token`).
- `GET /api/audit/` est admin-only.
- La restauration est reservee aux admins.
