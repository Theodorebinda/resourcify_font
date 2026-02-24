# Intégration Front - Historique d'audit

## Politique officielle
- L'audit expose uniquement les opérations `UPDATE` et `DELETE`.
- Les opérations `INSERT`, `CREATE` et `RESTORE` ne sont pas visibles dans les endpoints de lecture.
- La restauration API est autorisée seulement pour des entrées `UPDATE` ou `DELETE`.

## Endpoints

### 1) Liste globale des audits (admin)
`GET /api/audit/`

Query params optionnels:
- `page` (défaut: `1`)
- `page_size` (défaut: `20`, max: `100`)
- `table_name`
- `operation` (`UPDATE|DELETE`)
- `changed_by` (UUID user en string)
- `request_id` (UUID)

Exemple:
```bash
curl -X GET "http://127.0.0.1:8000/api/audit/?page=1&page_size=20&operation=UPDATE" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### 2) Historique d'une ligne
`GET /api/audit/{table_name}/{row_id}/`

Exemple:
```bash
curl -X GET "http://127.0.0.1:8000/api/audit/resources_resource/UUID_RESOURCE/?page=1&page_size=20" \
  -H "Authorization: Bearer <TOKEN>"
```

### 3) Détail d'une entrée
`GET /api/audit/entry/{audit_id}/`

Si l'entrée ciblée n'est pas en `UPDATE/DELETE`, l'API répond `404`.

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

## Sémantique restore
- `UPDATE`: restauration de `old_data` via ORM.
- `DELETE`: recréation/restauration de `old_data` via ORM.
- `INSERT|CREATE|RESTORE`: non supporté, réponse `400` avec code `unsupported_restore_operation`.

Exemple de réponse succès:
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

Exemple d'erreur opération non supportée:
```json
{
  "error": {
    "code": "unsupported_restore_operation",
    "message": "Restore is allowed only for UPDATE and DELETE entries."
  }
}
```

## Exemple fetch (frontend)

### Liste globale (admin)
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

### Historique d'une ligne
```js
async function fetchAuditHistory(tableName, rowId, token, page = 1, pageSize = 20) {
  const res = await fetch(
    `/api/audit/${encodeURIComponent(tableName)}/${encodeURIComponent(rowId)}/?page=${page}&page_size=${pageSize}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!res.ok) {
    throw new Error(`Audit history failed: ${res.status}`);
  }

  return res.json();
}
```

### Détail entrée
```js
async function fetchAuditEntry(auditId, token) {
  const res = await fetch(`/api/audit/entry/${auditId}/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Audit entry failed: ${res.status}`);
  }

  return res.json();
}
```

### Restore (admin)
```js
async function restoreFromAudit(auditId, token, reason = "") {
  const res = await fetch(`/api/audit/restore/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ audit_id: auditId, reason }),
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(payload?.error?.code ?? `Audit restore failed: ${res.status}`);
  }

  return res.json();
}
```

## Réponses usuelles
- `200`: succès.
- `400`: table non supportée / snapshot invalide / opération restore non supportée / `request_id` invalide.
- `403`: permissions insuffisantes.
- `404`: entrée d'audit introuvable ou non visible.

## Notes sécurité
- Les champs sensibles sont masqués (`password`, `token`, `secret`, `access_token`, `refresh_token`).
- `GET /api/audit/` est admin-only.
- La lecture d'un historique de ligne est restreinte au propriétaire de la ligne ou admin.
- La restauration est réservée aux admins.
