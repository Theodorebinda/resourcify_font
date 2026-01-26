# Backend Alignment - Phase 2.1

## ✅ Completed Alignment

### Types Updated

1. **User Interface**
   - Added `username` field (required by backend)
   - Kept `onboarding_step` for server-driven state

2. **API Response Types**
   - `LoginResponse`: `{ access_token, refresh_token, user }`
   - `RegisterResponse`: `{ user_id, message }`
   - `ActivationResponse`: `{ message }`
   - `ApiResponse<T>`: Wrapper `{ status: "ok", data: T }`
   - `ApiErrorResponse`: Wrapper `{ error: ApiError }`

### Validation Schemas Updated

1. **Register Schema**
   - Changed `name` → `username` (3-30 chars, alphanumeric + underscore)
   - Added `accepted_terms` (boolean, must be true)
   - Password minimum 8 characters (matches backend)

2. **Login Schema**
   - Email + password (unchanged)

### API Client Updates

1. **Request Interceptor**
   - Automatically adds `Authorization: Bearer <token>` header
   - Reads token from `localStorage.getItem("access_token")`

2. **Response Interceptor**
   - Handles backend error format: `{ error: { code, message, details? } }`
   - Handles validation errors: `{ field_name: ["error message"] }`
   - Transforms to `ApiError` format

### Mutations Updated

1. **useLogin()**
   - Stores `access_token` and `refresh_token` in localStorage
   - Returns `LoginResponse` with tokens and user

2. **useRegister()**
   - Accepts `{ username, email, password, accepted_terms }`
   - Returns `RegisterResponse` with `user_id` and `message`

3. **useActivateAccount()**
   - Accepts `{ token }`
   - Returns `ActivationResponse` with `message`

4. **useResendActivation()**
   - Placeholder (backend doesn't have explicit endpoint)
   - Uses `/auth/activate` with `{ action: "resend" }`

5. **useLogout()**
   - Clears tokens from localStorage
   - Clears all TanStack Query cache

### Components Updated

1. **RegisterForm**
   - Uses `username` instead of `name`
   - Added `accepted_terms` checkbox
   - Handles field-specific validation errors from backend

2. **LoginForm**
   - Removed local `isSubmitting` state (uses `loginMutation.isPending`)
   - Handles `account_not_activated` error code
   - Handles `invalid_credentials` error code

3. **ActivationHandler**
   - Handles backend response format
   - Error codes: `invalid_token`, `expired_token`, `already_activated`

### Token Management

- **Storage**: `localStorage` for `access_token` and `refresh_token`
- **Auto-injection**: Request interceptor adds token to all API calls
- **Cleanup**: Logout clears tokens and query cache

## 🔄 Backend Contract Compliance

### Endpoints Used

| Endpoint | Method | Request | Response | Status |
|----------|--------|---------|----------|--------|
| `/auth/register/` | POST | `{ username, email, password, accepted_terms }` | `{ status: "ok", data: { user_id, message } }` | ✅ |
| `/auth/login/` | POST | `{ email, password }` | `{ status: "ok", data: { access_token, refresh_token, user } }` | ✅ |
| `/auth/activate/` | POST | `{ token }` | `{ status: "ok", data: { message } }` | ✅ |
| `/user/me/` | GET | - | `{ status: "ok", data: User }` | ✅ |

### Error Codes Handled

| Code | HTTP | Component | Action |
|------|------|-----------|--------|
| `email_already_used` | 422 | RegisterForm | Show field error |
| `invalid_action` | 400 | RegisterForm | Show field error |
| `invalid_credentials` | 401 | LoginForm | Show root error |
| `account_not_activated` | 403 | LoginForm | Redirect to activation |
| `invalid_token` | 400 | ActivationHandler | Show error + resend |
| `expired_token` | 400 | ActivationHandler | Show error + resend |
| `already_activated` | 200 | ActivationHandler | Show success + login link |

## 📝 Notes

1. **Resend Activation**: Backend doesn't have explicit endpoint. Current implementation uses placeholder that backend team should implement.

2. **Token Refresh**: Not implemented in Phase 2.1 (out of scope). Will be added in future phase.

3. **User Endpoint**: Assumes `/user/me/` returns full User object with `onboarding_step`. Backend should confirm this.

4. **Validation Errors**: Backend returns field-specific errors. Frontend handles both field-level and root-level errors.

## ✅ Testing Checklist

- [ ] Register with valid data → Success
- [ ] Register with existing email → Error `email_already_used`
- [ ] Register without accepting terms → Error `invalid_action`
- [ ] Login with valid credentials → Success + tokens stored
- [ ] Login with invalid credentials → Error `invalid_credentials`
- [ ] Login with unactivated account → Error `account_not_activated`
- [ ] Activate with valid token → Success
- [ ] Activate with invalid token → Error `invalid_token`
- [ ] Activate with expired token → Error `expired_token`
- [ ] Activate already activated account → Success message
