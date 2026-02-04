# Ressourcefy API Documentation for Frontend Developers

**Base URL**: `http://localhost:8000/api/` (development)  
**Base URL**: `https://api.ressourcefy.com/api/` (production)

---

## Quick Start & Configuration

### Base Configuration

All API requests should be made to the base URL with the following headers:

```javascript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Standard headers for authenticated requests
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${accessToken}` // Required for authenticated endpoints
};
```

### Authentication Setup

1. **Store tokens securely**:
   ```javascript
   // After login, store tokens
   localStorage.setItem('authToken', accessToken);
   localStorage.setItem('refreshToken', refreshToken);
   ```

2. **Create API client**:
   ```javascript
   class RessourcefyAPI {
     constructor() {
       this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
     }
     
     async request(endpoint, options = {}) {
       const token = localStorage.getItem('authToken');
       const url = `${this.baseURL}${endpoint}`;
       
       const config = {
         ...options,
         headers: {
           'Content-Type': 'application/json',
           ...(token && { 'Authorization': `Bearer ${token}` }),
           ...options.headers
         },
         credentials: 'include' // Important for cookies
       };
       
       const response = await fetch(url, config);
       
       if (!response.ok) {
         const error = await response.json();
         throw new Error(error.error?.message || error.detail || 'Request failed');
       }
       
       return await response.json();
     }
   }
   
   export default new RessourcefyAPI();
   ```

3. **Handle token refresh** (optional):
   ```javascript
   // Add token refresh logic if needed
   if (response.status === 401) {
     // Attempt refresh
     const refreshToken = localStorage.getItem('refreshToken');
     // Call refresh endpoint and retry request
   }
   ```

### Admin Endpoints Configuration

Admin endpoints require elevated permissions (`IsAdmin` or `IsSuperAdmin`). Ensure the authenticated user has the appropriate role:

```javascript
// Check user role before making admin requests
const user = JSON.parse(localStorage.getItem('user'));
if (!user || !['ADMIN', 'SUPERADMIN'].includes(user.role)) {
  throw new Error('Insufficient permissions');
}
```

### Error Handling

All endpoints follow a consistent error format:

```javascript
try {
  const data = await api.request('/admin/users/');
} catch (error) {
  // Handle error
  if (error.message.includes('permission')) {
    // Redirect to unauthorized page
  } else {
    // Show error message to user
  }
}
```

### CORS Configuration

For development, ensure your frontend is whitelisted in Django CORS settings. In production, configure allowed origins in `settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    "https://yourdomain.com",
    "https://www.yourdomain.com",
]
```

---

## Table of Contents

1. [Authentication](#authentication)
2. [Onboarding](#onboarding)
   - [Get Onboarding Status](#get-onboarding-status)
   - [Submit Profile](#submit-profile)
   - [Submit Interests](#submit-interests)
3. [User Management](#user-management)
   - [Get Current User](#get-current-user)
   - [Update Profile](#update-profile)
   - [Request Role Change](#request-role-change)
4. [Command Endpoints (Write Operations)](#command-endpoints)
   - [Create Resource](#create-resource)
   - [Update Resource](#update-resource)
   - [Delete Resource](#delete-resource)
   - [Create Comment](#create-comment)
   - [Vote on Comment](#vote-on-comment)
   - [Vote on Resource](#vote-on-resource)
   - [Create Resource Version](#create-resource-version)
   - [Access Resource](#access-resource)
   - [Complete Resource Progress](#complete-resource-progress)
   - [Create Checkout Session](#create-checkout-session)
5. [Query Endpoints (Read Operations)](#query-endpoints)
   - [Get Resource Feed](#get-resource-feed)
   - [Get Resource Detail](#get-resource-detail)
   - [Get Resource Comments](#get-resource-comments)
   - [Get Author Profile](#get-author-profile)
   - [Get User Progress](#get-user-progress)
   - [Get Resource Progress](#get-resource-progress)
   - [Get Resource Users Progress](#get-resource-users-progress)
   - [Get All Progress (Admin)](#get-all-progress-admin)
6. [Webhook Endpoints](#webhook-endpoints)
   - [Stripe Webhook](#stripe-webhook)
7. [Health Endpoints](#health-endpoints)
8. [Error Handling](#error-handling)
9. [Frontend Integration Examples](#frontend-integration-examples)
10. [HTTP Cookies & Middleware Support](#http-cookies--middleware-support)
11. [Admin Endpoints](#admin-endpoints)
    - [User Management](#admin-user-management)
      - [List Users](#list-users)
      - [Get User Details](#get-user-details)
      - [Update User](#update-user)
      - [Delete User](#delete-user)
      - [Change User Role](#change-user-role)
      - [Get User Activity History](#get-user-activity-history)
      - [Impersonate User](#impersonate-user)
      - [Reset User Password](#reset-user-password)
    - [Tag Management](#admin-tag-management)
      - [List Tags](#list-tags)
      - [Get Tag Details](#get-tag-details)
      - [Create Tag](#create-tag)
      - [Update Tag](#update-tag)
      - [Delete Tag](#delete-tag)
      - [Merge Tags](#merge-tags)
    - [Resource Management](#admin-resource-management)
      - [List Resources](#list-resources)
      - [Get Resource Details](#get-resource-details)
      - [Create Resource](#create-resource)
      - [Update Resource](#update-resource)
      - [Delete Resource](#delete-resource)
      - [Add Resource Version](#add-resource-version)
    - [Subscription Management](#admin-subscription-management)
      - [List Subscriptions](#list-subscriptions)
      - [Get Subscription Details](#get-subscription-details)
      - [Update Subscription](#update-subscription)
      - [Cancel Subscription](#cancel-subscription)
    - [Payment Management](#admin-payment-management)
      - [List Payments](#list-payments)
      - [Get Payment Details](#get-payment-details)
      - [Refund Payment](#refund-payment)
    - [Dashboard](#admin-dashboard)
      - [Get Dashboard Overview](#get-dashboard-overview)
      - [Get Dashboard Activity](#get-dashboard-activity)
      - [Get System Health](#get-system-health)

---

## Authentication

The Ressourcefy API uses **JWT (JSON Web Tokens)** for authentication. Users must register, verify their email, and then login to receive access tokens.

### Authentication Flow

1. **Register** → `POST /auth/register/`
2. **Verify Email** → `POST /auth/activate/` (with token from email)
3. **Login** → `POST /auth/login/` (receive JWT tokens + HTTP cookies)
4. **Complete Onboarding** → `POST /onboarding/profile/` → `POST /onboarding/interests/`
5. **Use API** → Include `Authorization: Bearer <access_token>` header or use cookies

### Token Types

- **Access Token**: Short-lived (15 minutes), used for API requests
- **Refresh Token**: Long-lived (7 days), used to obtain new access tokens

### Register User

**Endpoint**: `POST /auth/register/`  
**Authentication**: None (public endpoint)  
**Description**: Create a new user account

#### Request

**Headers**:
```http
Content-Type: application/json
```

**Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "username": "john_doe",
  "accepted_terms": true
}
```

**Field Descriptions**:
- `email` (string, required): Valid email address (will be normalized to lowercase)
- `password` (string, required): Minimum 8 characters
- `username` (string, required): 3-30 characters, unique
- `accepted_terms` (boolean, required): Must be `true`

#### Response

**Success (201 Created)**:
```json
{
  "status": "ok",
  "data": {
    "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "message": "Registration successful. Please check your email to activate your account."
  }
}
```

**Error (422 Unprocessable Entity)** - Email already exists:
```json
{
  "error": {
    "code": "email_already_used",
    "message": "Email user@example.com is already in use"
  }
}
```

**Error (400 Bad Request)** - Username taken:
```json
{
  "error": {
    "code": "invalid_action",
    "message": "Username john_doe is already taken"
  }
}
```

**Error (400 Bad Request)** - Terms not accepted:
```json
{
  "error": {
    "code": "invalid_action",
    "message": "You must accept the terms and conditions"
  }
}
```

#### cURL Example
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "username": "john_doe",
    "accepted_terms": true
  }'
```

#### JavaScript Example
```javascript
async function register(email, password, username) {
  const response = await fetch('http://localhost:8000/api/auth/register/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      password,
      username,
      accepted_terms: true
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message || 'Registration failed');
  }
  
  return await response.json();
}

// Usage
try {
  const result = await register('user@example.com', 'SecurePassword123!', 'john_doe');
  console.log('Registration successful. Check email for activation link.');
} catch (error) {
  console.error('Registration error:', error.message);
}
```

---

### Activate Account

**Endpoint**: `POST /auth/activate/`  
**Authentication**: None (token-based)  
**Description**: Verify email address and activate account

#### Request

**Headers**:
```http
Content-Type: application/json
```

**Body**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Field Descriptions**:
- `token` (string, required): Activation token from email (valid for 24 hours)

#### Response

**Success (200 OK)**:
```json
{
  "status": "ok",
  "data": {
    "message": "Account activated successfully. You can now log in."
  }
}
```

**Success (200 OK)** - Already activated:
```json
{
  "status": "ok",
  "data": {
    "message": "Account already activated"
  }
}
```

**Error (400 Bad Request)** - Invalid or expired token:
```json
{
  "error": {
    "code": "invalid_token",
    "message": "Invalid or expired activation token"
  }
}
```

#### cURL Example
```bash
curl -X POST http://localhost:8000/api/auth/activate/ \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

#### JavaScript Example
```javascript
async function activateAccount(token) {
  const response = await fetch('http://localhost:8000/api/auth/activate/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ token })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message || 'Activation failed');
  }
  
  return await response.json();
}

// Usage (extract token from URL query params)
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

if (token) {
  try {
    await activateAccount(token);
    console.log('Account activated! Redirecting to login...');
    window.location.href = '/login';
  } catch (error) {
    console.error('Activation error:', error.message);
  }
}
```

---

### Login

**Endpoint**: `POST /auth/login/`  
**Authentication**: None  
**Description**: Authenticate and receive JWT tokens

#### Request

**Headers**:
```http
Content-Type: application/json
```

**Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Field Descriptions**:
- `email` (string, required): User's email address
- `password` (string, required): User's password

#### Response

**Success (200 OK)**:
```json
{
  "status": "ok",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNjQwOTk1MjAwLCJpYXQiOjE2NDA5OTQzMDAsImp0aSI6ImFiY2RlZiIsInVzZXJfaWQiOjF9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTY0MTU5OTEwMCwiaWF0IjoxNjQwOTk0MzAwLCJqdGkiOiJ4eXoxMjMiLCJ1c2VyX2lkIjoxfQ...",
    "user": {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "email": "user@example.com",
      "username": "john_doe",
      "activated": true,
      "onboarding_step": "profile"
    }
  }
}
```

**HTTP Cookies Set** (for Next.js middleware):
The backend automatically sets the following HTTP cookies:
- `access_token` (HttpOnly, Secure in production, SameSite=Lax)
- `refresh_token` (HttpOnly, Secure in production, SameSite=Lax)
- `activated` (readable by JS, Secure in production, SameSite=Lax) - Value: `"true"` or `"false"`
- `onboarding_step` (readable by JS, Secure in production, SameSite=Lax) - Value: `"not_started"`, `"profile"`, `"interests"`, or `"completed"`

**Note**: Cookies are automatically set by the backend. The frontend does NOT need to manually set them. The middleware can read these cookies to determine user state.

**Error (401 Unauthorized)** - Wrong credentials:
```json
{
  "error": {
    "code": "invalid_credentials",
    "message": "Invalid email or password"
  }
}
```

**Error (403 Forbidden)** - Account not activated:
```json
{
  "error": {
    "code": "account_not_activated",
    "message": "Please activate your account via email before logging in"
  }
}
```

#### cURL Example
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

#### JavaScript Example
```javascript
async function login(email, password) {
  const response = await fetch('http://localhost:8000/api/auth/login/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include', // Important: Include cookies
    body: JSON.stringify({ email, password })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message || 'Login failed');
  }
  
  const data = await response.json();
  
  // Cookies are automatically set by backend
  // Optional: Store tokens in localStorage for API calls
  localStorage.setItem('authToken', data.data.access_token);
  localStorage.setItem('refreshToken', data.data.refresh_token);
  localStorage.setItem('user', JSON.stringify(data.data.user));
  
  // Middleware will read cookies and redirect based on onboarding_step
  // No need to manually redirect here - let middleware handle it
  return data.data;
}

// Usage
try {
  const userData = await login('user@example.com', 'SecurePassword123!');
  console.log('Logged in as:', userData.user.username);
  console.log('Onboarding step:', userData.user.onboarding_step);
  
  // Redirect to post-login handler (middleware will decide final destination)
  window.location.href = '/auth/post-login';
} catch (error) {
  console.error('Login error:', error.message);
}
```

---

### Logout

**Endpoint**: `POST /auth/logout/`  
**Authentication**: Optional (works even if token expired)  
**Description**: Logout and clear all HTTP cookies

#### Request

**Headers**:
```http
Content-Type: application/json
Authorization: Bearer <token>  (optional)
```

**Body**: Empty (no body required)

#### Response

**Success (200 OK)**:
```json
{
  "status": "ok",
  "data": {
    "message": "Logged out successfully"
  }
}
```

**HTTP Cookies Cleared**:
The backend automatically clears the following cookies:
- `access_token` (expired immediately)
- `refresh_token` (expired immediately)
- `activated` (expired immediately)
- `onboarding_step` (expired immediately)

#### cURL Example
```bash
curl -X POST http://localhost:8000/api/auth/logout/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -b "access_token=YOUR_TOKEN"
```

#### JavaScript Example
```javascript
async function logout() {
  const response = await fetch('http://localhost:8000/api/auth/logout/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    credentials: 'include' // Important: Include cookies
  });
  
  if (!response.ok) {
    throw new Error('Logout failed');
  }
  
  // Clear local storage
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  
  // Cookies are automatically cleared by backend
  // Redirect to login
  window.location.href = '/login';
}

// Usage
logout();
```

---

### Request Password Reset

**Endpoint**: `POST /auth/password-reset/`  
**Authentication**: None  
**Description**: Request a password reset link via email

#### Request

**Headers**:
```http
Content-Type: application/json
```

**Body**:
```json
{
  "email": "user@example.com"
}
```

**Field Descriptions**:
- `email` (string, required): Email address to send reset link to

#### Response

**Success (200 OK)**:
```json
{
  "status": "ok",
  "data": {
    "message": "If the email exists, a password reset link has been sent."
  }
}
```

**Note**: Always returns success to prevent email enumeration attacks.

#### cURL Example
```bash
curl -X POST http://localhost:8000/api/auth/password-reset/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

#### JavaScript Example
```javascript
async function requestPasswordReset(email) {
  const response = await fetch('http://localhost:8000/api/auth/password-reset/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email })
  });
  
  const data = await response.json();
  return data.data.message;
}

// Usage
const message = await requestPasswordReset('user@example.com');
console.log(message);
```

---

### Confirm Password Reset

**Endpoint**: `POST /auth/password-reset/confirm/`  
**Authentication**: None (token-based)  
**Description**: Set new password using reset token

#### Request

**Headers**:
```http
Content-Type: application/json
```

**Body**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "new_password": "NewSecurePassword456!"
}
```

**Field Descriptions**:
- `token` (string, required): Reset token from email (valid for 1 hour)
- `new_password` (string, required): Minimum 8 characters

#### Response

**Success (200 OK)**:
```json
{
  "status": "ok",
  "data": {
    "message": "Password reset successfully. You can now log in with your new password."
  }
}
```

**Error (400 Bad Request)** - Invalid or expired token:
```json
{
  "error": {
    "code": "invalid_reset_token",
    "message": "Invalid or expired password reset token"
  }
}
```

#### cURL Example
```bash
curl -X POST http://localhost:8000/api/auth/password-reset/confirm/ \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "new_password": "NewSecurePassword456!"
  }'
```

#### JavaScript Example
```javascript
async function confirmPasswordReset(token, newPassword) {
  const response = await fetch('http://localhost:8000/api/auth/password-reset/confirm/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      token,
      new_password: newPassword
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message || 'Password reset failed');
  }
  
  return await response.json();
}

// Usage
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

try {
  await confirmPasswordReset(token, 'NewSecurePassword456!');
  console.log('Password reset successful. Redirecting to login...');
  window.location.href = '/login';
} catch (error) {
  console.error('Reset error:', error.message);
}
```

---

## User Management

### Get Current User

**Endpoint**: `GET /user/me/`  
**Authentication**: Required  
**Description**: Get current authenticated user's information including profile data

#### Request

**Headers**:
```http
Authorization: Bearer <token>
```

#### Response

**Success (200 OK)**:
```json
{
  "status": "ok",
  "data": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "email": "user@example.com",
    "username": "john_doe",
    "bio": "Full-stack developer",
    "avatar_url": "https://example.com/avatar.jpg",
    "activated": true,
    "onboarding_step": "completed",
    "createdAt": "2026-01-25T12:00:00Z"
  }
}
```

**Field Descriptions**:
- `id`: User UUID
- `email`: User email address
- `username`: Username from Profile (null if Profile doesn't exist)
- `bio`: Biography from Profile (null if Profile doesn't exist)
- `avatar_url`: Avatar URL from Profile (null if Profile doesn't exist)
- `activated`: Email activation status
- `onboarding_step`: Current onboarding step (authoritative, server-driven)
- `createdAt`: Account creation timestamp

**Note**: 
- Profile fields (`username`, `bio`, `avatar_url`) are provided for UI pre-filling
- If Profile doesn't exist, these fields will be `null` (no error)
- This endpoint is **READ-ONLY** - it does not modify any data
- Profile modification after onboarding is handled by `PATCH /user/profile/`

**HTTP Cookies Synced**:
The backend automatically syncs the following cookies:
- `activated` (updated if changed)
- `onboarding_step` (updated if changed)

#### JavaScript Example
```javascript
async function getCurrentUser() {
  const response = await fetch('http://localhost:8000/api/user/me/', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    credentials: 'include'
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }
    throw new Error('Failed to fetch user');
  }
  
  const data = await response.json();
  return data.data;
}
```

---

### Update Profile

**Endpoint**: `PATCH /api/user/profile/`  
**Authentication**: Required  
**Description**: Update user profile information (username, bio, avatar_url)

#### Request

**Headers**:
```http
Content-Type: application/json
Authorization: Bearer <token>
```

**Body** (all fields optional):
```json
{
  "username": "new_username",
  "bio": "Updated bio text",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

**Field Descriptions**:
- `username` (string, optional): New username (must be unique, max 30 characters)
- `bio` (string, optional): Biography text
- `avatar_url` (string, optional): URL to user's avatar image (max 500 characters)

**Validation Rules**:
- **For regular users (USER role)**: Profile must be complete (username, and either bio or avatar_url)
- **For ADMIN/SUPERADMIN**: Profile must exist with at least username
- Username must be unique across all users
- Username cannot be empty if provided

#### Response

**Success (200 OK)**:
```json
{
  "status": "ok",
  "data": {
    "username": "new_username",
    "bio": "Updated bio text",
    "avatar_url": "https://example.com/avatar.jpg",
    "message": "Profile updated successfully"
  }
}
```

**Error (400 Bad Request)** - Username already taken:
```json
{
  "error": {
    "code": "invalid_action",
    "message": "Username 'new_username' is already taken"
  }
}
```

**Error (400 Bad Request)** - Profile incomplete for regular user:
```json
{
  "error": {
    "code": "invalid_action",
    "message": "Profile must be complete for regular users: username, bio or avatar_url required"
  }
}
```

**Error (400 Bad Request)** - Profile missing for ADMIN/SUPERADMIN:
```json
{
  "error": {
    "code": "invalid_action",
    "message": "Profile must exist for ADMIN/SUPERADMIN users"
  }
}
```

#### cURL Example
```bash
curl -X PATCH http://localhost:8000/api/user/profile/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "username": "new_username",
    "bio": "Updated bio",
    "avatar_url": "https://example.com/avatar.jpg"
  }'
```

#### JavaScript Example
```javascript
async function updateProfile(username, bio, avatarUrl) {
  const body = {};
  if (username) body.username = username;
  if (bio !== undefined) body.bio = bio;
  if (avatarUrl !== undefined) body.avatar_url = avatarUrl;
  
  const response = await fetch('http://localhost:8000/api/user/profile/', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify(body)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to update profile');
  }
  
  return await response.json();
}

// Usage
try {
  const result = await updateProfile('new_username', 'My bio', 'https://example.com/avatar.jpg');
  console.log('Profile updated:', result.data);
} catch (error) {
  console.error('Update error:', error.message);
}
```

---

### Request Role Change

**Endpoint**: `POST /api/user/request-role/`  
**Authentication**: Required  
**Description**: Request a role change to MODERATOR or CONTRIBUTOR. Requires a complete profile.

#### Request

**Headers**:
```http
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "requested_role": "MODERATOR",
  "reason": "I have experience moderating online communities and would like to help maintain quality content."
}
```

**Field Descriptions**:
- `requested_role` (string, required): Must be either `"MODERATOR"` or `"CONTRIBUTOR"`
- `reason` (string, optional): Optional reason for the role request (max 1000 characters)

**Validation Rules**:
- User must have a complete profile (username, and either bio or avatar_url)
- Only `MODERATOR` or `CONTRIBUTOR` roles can be requested
- User cannot request a role they already have
- User cannot have a pending request for the same role
- Regular users (USER role) can request role changes
- ADMIN and SUPERADMIN cannot use this endpoint (they already have elevated privileges)

#### Response

**Success (201 Created)**:
```json
{
  "status": "ok",
  "data": {
    "request_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "requested_role": "MODERATOR",
    "status": "pending",
    "message": "Role change request submitted successfully. Your request for MODERATOR is pending admin review."
  }
}
```

**Error (400 Bad Request)** - Profile incomplete:
```json
{
  "error": {
    "code": "invalid_action",
    "message": "Profile must be complete before requesting role change. Please ensure your profile has username, bio or avatar_url."
  }
}
```

**Error (400 Bad Request)** - Invalid role:
```json
{
  "error": {
    "code": "invalid_action",
    "message": "Only MODERATOR or CONTRIBUTOR roles can be requested. Got: ADMIN"
  }
}
```

**Error (400 Bad Request)** - Already has role:
```json
{
  "error": {
    "code": "invalid_action",
    "message": "User already has role MODERATOR"
  }
}
```

**Error (400 Bad Request)** - Pending request exists:
```json
{
  "error": {
    "code": "invalid_action",
    "message": "User already has a pending request for role MODERATOR"
  }
}
```

#### cURL Example
```bash
curl -X POST http://localhost:8000/api/user/request-role/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "requested_role": "MODERATOR",
    "reason": "I have experience moderating online communities."
  }'
```

#### JavaScript Example
```javascript
async function requestRole(requestedRole, reason) {
  const response = await fetch('http://localhost:8000/api/user/request-role/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify({
      requested_role: requestedRole, // "MODERATOR" or "CONTRIBUTOR"
      reason: reason || ''
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to submit role request');
  }
  
  return await response.json();
}

// Usage
try {
  const result = await requestRole(
    'MODERATOR',
    'I have experience moderating online communities.'
  );
  console.log('Role request submitted:', result.data);
  alert('Your role request has been submitted and is pending admin review.');
} catch (error) {
  console.error('Request error:', error.message);
  alert(`Error: ${error.message}`);
}
```

**Note**: 
- Role requests are reviewed by administrators
- Users will be notified when their request is approved or rejected
- Only one pending request per role is allowed at a time
- Complete your profile before requesting a role change

---

## Command Endpoints (Write Operations)

### Create Resource

**Endpoint**: `POST /api/resources/`  
**Authentication**: Required (IsContributor: CONTRIBUTOR, MODERATOR, ADMIN, SUPERADMIN)  
**Description**: Create a new resource. The authenticated user automatically becomes the author.

#### Request

**Headers**:
```http
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "title": "My Resource Title",
  "description": "Detailed description of the resource",
  "visibility": "public",
  "price_cents": null,
  "tag_ids": ["3fa85f64-5717-4562-b3fc-2c963f66afa6"],
  "file_url": "https://cdn.ressourcefy.com/files/resource-v1.pdf"
}
```

**Field Descriptions**:
- `title` (string, required): Resource title (max 200 characters)
- `description` (string, required): Resource description
- `visibility` (string, required): One of `public`, `premium`, or `private`
- `price_cents` (integer, optional): Price in cents (required if visibility is `premium`, must be null otherwise)
- `tag_ids` (array, optional): Array of tag UUIDs
- `file_url` (string, optional): URL for the first version of the resource

**Permissions**:
- ✅ CONTRIBUTOR, MODERATOR, ADMIN, SUPERADMIN can create resources
- ❌ USER role cannot create resources (read-only access)

#### Response

**Success (201 Created)**:
```json
{
  "status": "ok",
  "data": {
    "resource_id": "8a7b5c3d-1234-5678-90ab-cdef12345678",
    "title": "My Resource Title",
    "description": "Detailed description of the resource",
    "visibility": "public",
    "price_cents": null,
    "author_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "tags": ["3fa85f64-5717-4562-b3fc-2c963f66afa6"],
    "created_at": "2026-02-04T12:00:00Z"
  }
}
```

**Error (403 Forbidden)** - Insufficient permissions:
```json
{
  "detail": "You do not have permission to perform this action."
}
```

**Error (400 Bad Request)** - Premium resource without price:
```json
{
  "error": {
    "code": "invalid_action",
    "message": "Premium resources must have a price"
  }
}
```

**Error (400 Bad Request)** - Price on non-premium resource:
```json
{
  "error": {
    "code": "invalid_action",
    "message": "Only premium resources can have a price"
  }
}
```

**Error (400 Bad Request)** - Invalid tag:
```json
{
  "error": {
    "code": "invalid_action",
    "message": "One or more tags not found"
  }
}
```

#### cURL Example
```bash
curl -X POST http://localhost:8000/api/resources/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "My Resource Title",
    "description": "Detailed description",
    "visibility": "public",
    "tag_ids": ["3fa85f64-5717-4562-b3fc-2c963f66afa6"],
    "file_url": "https://cdn.ressourcefy.com/files/resource.pdf"
  }'
```

#### JavaScript Example
```javascript
async function createResource(title, description, visibility, priceCents = null, tagIds = [], fileUrl = null) {
  const body = {
    title,
    description,
    visibility
  };
  
  if (priceCents !== null) body.price_cents = priceCents;
  if (tagIds.length > 0) body.tag_ids = tagIds;
  if (fileUrl) body.file_url = fileUrl;
  
  const response = await fetch('http://localhost:8000/api/resources/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify(body)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || error.detail || 'Failed to create resource');
  }
  
  return await response.json();
}

// Usage
try {
  const result = await createResource(
    'My Resource Title',
    'Detailed description',
    'public',
    null,
    ['3fa85f64-5717-4562-b3fc-2c963f66afa6'],
    'https://cdn.ressourcefy.com/files/resource.pdf'
  );
  console.log('Resource created:', result.data.resource_id);
} catch (error) {
  console.error('Error:', error.message);
}
```

**Note**: 
- The authenticated user automatically becomes the author of the resource
- Regular users (USER role) cannot create resources - they can only read, vote, and comment
- To create resources, users must request CONTRIBUTOR or MODERATOR role via `/api/user/request-role/`

---

### Update Resource

**Endpoint**: `PATCH /api/resources/{resource_id}/`  
**Authentication**: Required  
**Description**: Update a resource. Only the resource author can update their own resource.

#### Request

**Headers**:
```http
Content-Type: application/json
Authorization: Bearer <token>
```

**URL Parameters**:
- `resource_id` (string, required): UUID of the resource to update

**Body** (all fields optional):
```json
{
  "title": "Updated Resource Title",
  "description": "Updated description",
  "visibility": "premium",
  "price_cents": 999,
  "tag_ids": ["3fa85f64-5717-4562-b3fc-2c963f66afa6"]
}
```

**Field Descriptions**:
- `title` (string, optional): Resource title (max 200 characters)
- `description` (string, optional): Resource description
- `visibility` (string, optional): One of `public`, `premium`, or `private`
- `price_cents` (integer, optional): Price in cents (required if visibility is `premium`, must be null otherwise)
- `tag_ids` (array, optional): Array of tag UUIDs

**Permissions**:
- ✅ Only the resource author can update their resource
- ❌ Other users cannot update resources they don't own

#### Response

**Success (200 OK)**:
```json
{
  "status": "ok",
  "data": {
    "resource_id": "8a7b5c3d-1234-5678-90ab-cdef12345678",
    "title": "Updated Resource Title",
    "description": "Updated description",
    "visibility": "premium",
    "price_cents": 999,
    "author_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "tags": ["3fa85f64-5717-4562-b3fc-2c963f66afa6"],
    "updated_at": "2026-02-04T14:30:00Z"
  }
}
```

**Error (403 Forbidden)** - Not the author:
```json
{
  "error": {
    "code": "access_denied",
    "message": "Only the resource author can update this resource"
  }
}
```

**Error (400 Bad Request)** - Premium resource without price:
```json
{
  "error": {
    "code": "invalid_action",
    "message": "Premium resources must have a price"
  }
}
```

**Error (400 Bad Request)** - Invalid tag:
```json
{
  "error": {
    "code": "invalid_action",
    "message": "One or more tags not found"
  }
}
```

#### cURL Example
```bash
curl -X PATCH http://localhost:8000/api/resources/8a7b5c3d-1234-5678-90ab-cdef12345678/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Updated Resource Title",
    "description": "Updated description",
    "visibility": "premium",
    "price_cents": 999
  }'
```

#### JavaScript Example
```javascript
async function updateResource(resourceId, updates) {
  const body = {};
  if (updates.title) body.title = updates.title;
  if (updates.description) body.description = updates.description;
  if (updates.visibility) body.visibility = updates.visibility;
  if (updates.priceCents !== undefined) body.price_cents = updates.priceCents;
  if (updates.tagIds) body.tag_ids = updates.tagIds;
  
  const response = await fetch(`http://localhost:8000/api/resources/${resourceId}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify(body)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || error.detail || 'Failed to update resource');
  }
  
  return await response.json();
}

// Usage
try {
  const result = await updateResource('8a7b5c3d-1234-5678-90ab-cdef12345678', {
    title: 'Updated Title',
    description: 'Updated description',
    visibility: 'premium',
    priceCents: 999
  });
  console.log('Resource updated:', result.data.resource_id);
} catch (error) {
  console.error('Error:', error.message);
}
```

**Note**: 
- Only the resource author can update their resource
- All fields are optional - only provided fields will be updated
- Price validation: premium resources must have a price, non-premium resources cannot have a price
- All updates are logged via audit system

---

### Delete Resource

**Endpoint**: `DELETE /api/resources/{resource_id}/delete/`  
**Authentication**: Required  
**Description**: Delete a resource (soft delete). Only the resource author can delete their own resource.

#### Request

**Headers**:
```http
Authorization: Bearer <token>
```

**URL Parameters**:
- `resource_id` (string, required): UUID of the resource to delete

**Body**: Empty (no body required)

**Permissions**:
- ✅ Only the resource author can delete their resource
- ❌ Other users cannot delete resources they don't own

#### Response

**Success (200 OK)**:
```json
{
  "status": "ok",
  "data": {
    "resource_id": "8a7b5c3d-1234-5678-90ab-cdef12345678",
    "title": "My Resource Title",
    "message": "Resource deleted successfully"
  }
}
```

**Error (403 Forbidden)** - Not the author:
```json
{
  "error": {
    "code": "access_denied",
    "message": "Only the resource author can delete this resource"
  }
}
```

**Error (404 Not Found)** - Resource not found:
```json
{
  "error": {
    "code": "resource_not_found",
    "message": "Resource {resource_id} not found"
  }
}
```

#### cURL Example
```bash
curl -X DELETE http://localhost:8000/api/resources/8a7b5c3d-1234-5678-90ab-cdef12345678/delete/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### JavaScript Example
```javascript
async function deleteResource(resourceId) {
  const response = await fetch(`http://localhost:8000/api/resources/${resourceId}/delete/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || error.detail || 'Failed to delete resource');
  }
  
  return await response.json();
}

// Usage
try {
  const result = await deleteResource('8a7b5c3d-1234-5678-90ab-cdef12345678');
  console.log('Resource deleted:', result.data.message);
} catch (error) {
  console.error('Error:', error.message);
}
```

**Note**: 
- Only the resource author can delete their resource
- Deletion is soft delete - the resource is marked as deleted but not permanently removed
- All deletions are logged via audit system
- Deleted resources are not visible in public feeds but can be viewed by admins

---

### Create Comment

**Endpoint**: `POST /api/comments/`  
**Authentication**: Required (all authenticated users)  
**Description**: Add a comment to a resource. All authenticated users can comment on resources they have access to.

#### Request

**Headers**:
```http
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "resource_id": "8a7b5c3d-1234-5678-90ab-cdef12345678",
  "content": "This is a great resource! Very helpful."
}
```

**Field Descriptions**:
- `resource_id` (string, required): UUID of the resource to comment on
- `content` (string, required): Comment text (cannot be empty)

**Permissions**:
- ✅ All authenticated users can create comments
- ✅ User must have access to the resource (visibility check)
- ❌ Cannot comment on resources without access (premium without subscription, private, etc.)

#### Response

**Success (201 Created)**:
```json
{
  "status": "ok",
  "data": {
    "comment_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "resource_id": "8a7b5c3d-1234-5678-90ab-cdef12345678",
    "author_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "content": "This is a great resource! Very helpful.",
    "created_at": "2026-02-04T12:00:00Z"
  }
}
```

**Error (403 Forbidden)** - No access to resource:
```json
{
  "error": {
    "code": "access_denied",
    "message": "You do not have permission to comment on this resource"
  }
}
```

**Error (400 Bad Request)** - Empty content:
```json
{
  "error": {
    "code": "invalid_action",
    "message": "Comment content cannot be empty"
  }
}
```

**Error (400 Bad Request)** - Resource not found:
```json
{
  "error": {
    "code": "invalid_action",
    "message": "Resource {resource_id} not found"
  }
}
```

#### cURL Example
```bash
curl -X POST http://localhost:8000/api/comments/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "resource_id": "8a7b5c3d-1234-5678-90ab-cdef12345678",
    "content": "This is a great resource!"
  }'
```

#### JavaScript Example
```javascript
async function createComment(resourceId, content) {
  const response = await fetch('http://localhost:8000/api/comments/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify({
      resource_id: resourceId,
      content: content
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to create comment');
  }
  
  return await response.json();
}

// Usage
try {
  const result = await createComment(
    '8a7b5c3d-1234-5678-90ab-cdef12345678',
    'This is a great resource! Very helpful.'
  );
  console.log('Comment created:', result.data.comment_id);
} catch (error) {
  console.error('Error:', error.message);
}
```

**Note**: 
- All authenticated users can create comments
- Comments are automatically associated with the authenticated user
- Users can only comment on resources they have access to (based on visibility rules)
- **A user can create MULTIPLE comments on the same resource** - there is no limit
- **Comments are independent from votes** - voting on a resource does not affect your ability to comment, and commenting does not affect your ability to vote

---

### Vote on Comment

**Endpoint**: `POST /api/comments/vote/`  
**Authentication**: Required  
**Description**: Upvote or downvote a comment

#### Request

**Headers**:
```http
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "comment_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "vote_value": 1
}
```

**Field Descriptions**:
- `comment_id` (string, required): UUID of the comment to vote on
- `vote_value` (integer, required): `1` for upvote, `-1` for downvote

#### Response

**Success (200 OK)**:
```json
{
  "status": "ok",
  "data": {
    "vote_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "comment_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "value": 1
  }
}
```

**Error (403 Forbidden)** - Cannot vote on deleted comment:
```json
{
  "error": "Cannot vote on deleted content"
}
```

**Error (404 Not Found)** - Comment doesn't exist:
```json
{
  "error": "Comment not found"
}
```

#### cURL Example
```bash
curl -X POST http://localhost:8000/api/comments/vote/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "comment_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "vote_value": 1
  }'
```

#### JavaScript Fetch Example
```javascript
async function voteOnComment(commentId, value) {
  const response = await fetch('http://localhost:8000/api/comments/vote/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify({
      comment_id: commentId,
      vote_value: value  // 1 or -1
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to vote');
  }
  
  return await response.json();
}

// Usage
try {
  const result = await voteOnComment('3fa85f64-5717-4562-b3fc-2c963f66afa6', 1);
  console.log('Vote successful:', result.data);
} catch (error) {
  console.error('Vote failed:', error.message);
}
```

#### Axios Example
```javascript
import axios from 'axios';

async function voteOnComment(commentId, value) {
  try {
    const response = await axios.post('/api/comments/vote/', {
      comment_id: commentId,
      vote_value: value
    }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to vote');
  }
}
```

---

### Vote on Resource

**Endpoint**: `POST /api/resources/vote/`  
**Authentication**: Required (IsAuthenticated, IsOnboardingComplete)  
**Description**: Upvote or downvote a resource. All authenticated users with completed onboarding can vote on resources they have access to.

#### Request

**Headers**:
```http
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "resource_id": "8a7b5c3d-1234-5678-90ab-cdef12345678",
  "vote_value": 1
}
```

**Field Descriptions**:
- `resource_id` (string, required): UUID of the resource to vote on
- `vote_value` (integer, required): `1` for upvote, `-1` for downvote

**Permissions**:
- ✅ All authenticated users with completed onboarding can vote
- ✅ User must have access to the resource (visibility check)
- ❌ Cannot vote on resources without access (premium without subscription, private, etc.)
- ❌ Cannot vote on deleted resources

**Vote Behavior**:
- **Idempotent**: Voting with the same value multiple times has no effect
- **Toggle**: If you already voted, changing the vote value updates your vote
- **One vote per user**: Each user can only have one vote per resource

#### Response

**Success (200 OK)**:
```json
{
  "status": "ok",
  "data": {
    "vote_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "resource_id": "8a7b5c3d-1234-5678-90ab-cdef12345678",
    "value": 1
  }
}
```

**Error (404 Not Found)** - Resource doesn't exist:
```json
{
  "error": "Resource {resource_id} not found."
}
```

**Error (403 Forbidden)** - No access to resource:
```json
{
  "error": "You do not have permission to vote on this resource."
}
```

**Error (400 Bad Request)** - Invalid vote value:
```json
{
  "vote_value": ["Vote value must be +1 or -1."]
}
```

**Error (400 Bad Request)** - Resource deleted:
```json
{
  "error": "Cannot vote on a deleted resource."
}
```

**Error (401 Unauthorized)** - Not authenticated:
```json
{
  "detail": "Authentication credentials were not provided."
}
```

#### cURL Example
```bash
curl -X POST http://localhost:8000/api/resources/vote/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "resource_id": "8a7b5c3d-1234-5678-90ab-cdef12345678",
    "vote_value": 1
  }'
```

#### JavaScript Example
```javascript
async function voteOnResource(resourceId, value) {
  const response = await fetch('http://localhost:8000/api/resources/vote/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify({
      resource_id: resourceId,
      vote_value: value  // 1 for upvote, -1 for downvote
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || error.detail || 'Failed to vote');
  }
  
  return await response.json();
}

// Usage
try {
  const result = await voteOnResource(
    '8a7b5c3d-1234-5678-90ab-cdef12345678',
    1  // Upvote
  );
  console.log('Vote successful:', result.data);
} catch (error) {
  console.error('Vote failed:', error.message);
}
```

#### React Hook Example
```jsx
import { useState } from 'react';

function useResourceVote(resourceId) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const vote = async (value) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/resources/vote/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          resource_id: resourceId,
          vote_value: value
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.detail || 'Failed to vote');
      }
      
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return { vote, loading, error };
}

// Usage in component
function ResourceVoteButtons({ resourceId }) {
  const { vote, loading, error } = useResourceVote(resourceId);
  
  const handleUpvote = async () => {
    try {
      await vote(1);
      // Update UI to reflect new vote
    } catch (err) {
      // Error already set in hook
    }
  };
  
  const handleDownvote = async () => {
    try {
      await vote(-1);
      // Update UI to reflect new vote
    } catch (err) {
      // Error already set in hook
    }
  };
  
  return (
    <div>
      <button onClick={handleUpvote} disabled={loading}>
        👍 Upvote
      </button>
      <button onClick={handleDownvote} disabled={loading}>
        👎 Downvote
      </button>
      {error && <div className="error">{error}</div>}
    </div>
  );
}
```

**Important Notes**: 
- **A user can vote ONLY ONCE per resource** - enforced by unique database constraint
- Votes are idempotent: voting with the same value multiple times has no effect
- If you change your vote (e.g., from upvote to downvote), your previous vote is updated (not a new vote created)
- **Votes are completely independent from comments**:
  - Voting on a resource does NOT affect your ability to comment
  - Commenting on a resource does NOT affect your ability to vote
  - A user can vote on a resource AND comment multiple times on the same resource
  - These are two separate, independent actions
- All votes are logged via audit system
- User must have completed onboarding to vote
- Resource access is checked before allowing vote

---

### Create Resource Version

**Endpoint**: `POST /api/resources/versions/`  
**Authentication**: Required  
**Description**: Create a new version of a resource (for resource authors)

#### Request

**Headers**:
```http
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "resource_id": "8a7b5c3d-1234-5678-90ab-cdef12345678",
  "file_url": "https://cdn.ressourcefy.com/files/my-resource-v2.pdf"
}
```

**Field Descriptions**:
- `resource_id` (string, required): UUID of the resource
- `file_url` (string, required): Valid URL to the file (must be a valid URL format)

#### Response

**Success (201 Created)**:
```json
{
  "status": "ok",
  "data": {
    "version_number": 2,
    "file_url": "https://cdn.ressourcefy.com/files/my-resource-v2.pdf",
    "created_at": "2026-01-25T12:30:00Z"
  }
}
```

**Error (400 Bad Request)** - Invalid URL:
```json
{
  "file_url": ["Enter a valid URL."]
}
```

**Error (403 Forbidden)** - Not the resource author:
```json
{
  "error": "You do not have permission to create versions for this resource"
}
```

**Error (404 Not Found)** - Resource doesn't exist:
```json
{
  "error": "Resource not found"
}
```

#### cURL Example
```bash
curl -X POST http://localhost:8000/api/resources/versions/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "resource_id": "8a7b5c3d-1234-5678-90ab-cdef12345678",
    "file_url": "https://cdn.ressourcefy.com/files/my-resource-v2.pdf"
  }'
```

#### JavaScript Fetch Example
```javascript
async function createResourceVersion(resourceId, fileUrl) {
  const response = await fetch('http://localhost:8000/api/resources/versions/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify({
      resource_id: resourceId,
      file_url: fileUrl
    })
  });
  
  if (!response.ok) {
    throw new Error('Failed to create version');
  }
  
  return await response.json();
}

// Usage
const result = await createResourceVersion(
  '8a7b5c3d-1234-5678-90ab-cdef12345678',
  'https://cdn.ressourcefy.com/files/my-resource-v2.pdf'
);
console.log(`Version ${result.data.version_number} created`);
```

---

### Access Resource

**Endpoint**: `GET /api/resources/{resource_id}/access/`  
**Authentication**: Required (IsOnboardingComplete)  
**Description**: Request access to a resource (checks permissions and returns access URL)

#### Request

**Headers**:
```http
Authorization: Bearer <token>
```

**URL Parameters**:
- `resource_id` (string, required): UUID of the resource in the URL path

**Body**: Empty (no body required - GET request)

#### Response

**Success (200 OK)** - Access granted:
```json
{
  "status": "ok",
  "data": {
    "access_granted": true,
    "resource_id": "8a7b5c3d-1234-5678-90ab-cdef12345678",
    "latest_version": {
      "version_number": 2,
      "file_url": "https://cdn.ressourcefy.com/files/my-resource-v2.pdf"
    }
  }
}
```

**Error (403 Forbidden)** - Premium resource, no subscription:
```json
{
  "error": "This resource requires a premium subscription"
}
```

**Error (404 Not Found)**:
```json
{
  "error": "Resource not found"
}
```

#### cURL Example
```bash
curl http://localhost:8000/api/resources/8a7b5c3d-1234-5678-90ab-cdef12345678/access/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### JavaScript Fetch Example
```javascript
async function accessResource(resourceId) {
  const response = await fetch(`http://localhost:8000/api/resources/${resourceId}/access/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    if (response.status === 403) {
      // Show upgrade prompt
      throw new Error('Premium subscription required');
    }
    throw new Error(error.error || 'Access denied');
  }
  
  const data = await response.json();
  
  // Redirect to file or display inline
  if (data.data.access_granted) {
    window.location.href = data.data.latest_version.file_url;
  }
  
  return data;
}
```

**Note**: 
- Accessing a resource automatically creates/updates progress to `IN_PROGRESS` status
- Progress tracking is non-blocking - if it fails, access is still granted
- All progress changes are logged via audit system and emit outbox events

---

### Complete Resource Progress

**Endpoint**: `POST /api/resources/{resource_id}/complete/`  
**Authentication**: Required (IsAuthenticated, IsOnboardingComplete)  
**Description**: Mark a resource as completed for the authenticated user. This action is idempotent.

#### Request

**Headers**:
```http
Authorization: Bearer <token>
```

**URL Parameters**:
- `resource_id` (string, required): UUID of the resource to complete

**Body**: Empty (no body required)

**Permissions**:
- ✅ All authenticated users with completed onboarding can complete resources
- ✅ User must have access to the resource (visibility check)
- ❌ Cannot complete resources without access (premium without subscription, private, etc.)

#### Response

**Success (200 OK)**:
```json
{
  "status": "ok",
  "data": {
    "progress_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "user_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "resource_id": "8a7b5c3d-1234-5678-90ab-cdef12345678",
    "status": "COMPLETED",
    "started_at": "2026-02-04T12:00:00Z",
    "last_accessed_at": "2026-02-04T14:30:00Z",
    "completed_at": "2026-02-04T14:30:00Z"
  }
}
```

**Error (404 Not Found)** - Resource not found:
```json
{
  "error": {
    "code": "resource_not_found",
    "message": "Resource {resource_id} not found"
  }
}
```

**Error (403 Forbidden)** - No access to resource:
```json
{
  "error": {
    "code": "access_denied",
    "message": "You do not have permission to access this resource"
  }
}
```

#### cURL Example
```bash
curl -X POST http://localhost:8000/api/resources/8a7b5c3d-1234-5678-90ab-cdef12345678/complete/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### JavaScript Example
```javascript
async function completeResource(resourceId) {
  const response = await fetch(`http://localhost:8000/api/resources/${resourceId}/complete/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to complete resource');
  }
  
  return await response.json();
}

// Usage
try {
  const result = await completeResource('8a7b5c3d-1234-5678-90ab-cdef12345678');
  console.log('Resource completed:', result.data.status);
} catch (error) {
  console.error('Error:', error.message);
}
```

**Note**: 
- This endpoint is **idempotent**: calling it multiple times returns the same result without error
- If already completed, `completed_at` timestamp remains unchanged
- All completions are logged via audit system and emit outbox events
- User must have completed onboarding to use this endpoint

---

### Create Checkout Session

**Endpoint**: `POST /api/billing/checkout/`  
**Authentication**: Required  
**Description**: Create a Stripe Checkout session for subscription purchase

#### Request

**Headers**:
```http
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "price_id": "price_1234567890abcdef",
  "success_url": "https://yourdomain.com/payment/success?session_id={CHECKOUT_SESSION_ID}",
  "cancel_url": "https://yourdomain.com/payment/cancel"
}
```

**Field Descriptions**:
- `price_id` (string, required): Stripe Price ID (e.g., `price_1234...`)
- `success_url` (string, required): Full URL where user is redirected after successful payment
- `cancel_url` (string, required): Full URL where user is redirected if they cancel

#### Response

**Success (201 Created)**:
```json
{
  "status": "ok",
  "data": {
    "sessionId": "cs_test_a1b2c3d4e5f6g7h8i9j0"
  }
}
```

**Error (400 Bad Request)** - Invalid URL format:
```json
{
  "success_url": ["Enter a valid URL."]
}
```

#### cURL Example
```bash
curl -X POST http://localhost:8000/api/billing/checkout/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "price_id": "price_1234567890abcdef",
    "success_url": "https://yourdomain.com/payment/success",
    "cancel_url": "https://yourdomain.com/payment/cancel"
  }'
```

#### JavaScript Fetch Example with Stripe.js
```javascript
// Step 1: Create checkout session
async function createCheckoutSession() {
  const response = await fetch('http://localhost:8000/api/billing/checkout/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify({
      price_id: 'price_1234567890abcdef',  // Your Stripe Price ID
      success_url: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${window.location.origin}/payment/cancel`
    })
  });
  
  const data = await response.json();
  return data.data.sessionId;
}

// Step 2: Redirect to Stripe Checkout
async function initiateCheckout() {
  const sessionId = await createCheckoutSession();
  
  // Using Stripe.js (must include <script src="https://js.stripe.com/v3/"></script>)
  const stripe = Stripe('pk_test_YOUR_PUBLISHABLE_KEY');
  
  const { error } = await stripe.redirectToCheckout({
    sessionId: sessionId
  });
  
  if (error) {
    console.error('Stripe redirect error:', error);
  }
}

// Usage in your component
document.getElementById('subscribeButton').addEventListener('click', initiateCheckout);
```

#### React Example
```jsx
import React from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_YOUR_PUBLISHABLE_KEY');

function SubscribeButton() {
  const handleSubscribe = async () => {
    try {
      // Create checkout session
      const response = await fetch('/api/billing/checkout/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          price_id: 'price_1234567890abcdef',
          success_url: `${window.location.origin}/success`,
          cancel_url: `${window.location.origin}/cancel`
        })
      });
      
      const data = await response.json();
      
      // Redirect to Stripe
      const stripe = await stripePromise;
      await stripe.redirectToCheckout({
        sessionId: data.data.sessionId
      });
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };
  
  return (
    <button onClick={handleSubscribe}>
      Subscribe to Premium
    </button>
  );
}
```

---

## Query Endpoints (Read Operations)

### Get Resource Feed

**Endpoint**: `GET /api/feed/`  
**Authentication**: Optional (public endpoint, but authenticated users see personalized content)  
**Description**: Get a paginated list of resources with stats

#### Request

**Headers**:
```http
Authorization: Bearer <token>  (optional)
```

**Query Parameters**:
- `page` (integer, optional, default: 1): Page number
- `page_size` (integer, optional, default: 20): Number of items per page (max: 100)

**Example URLs**:
- `/api/feed/` - First page, 20 items
- `/api/feed/?page=2` - Second page, 20 items
- `/api/feed/?page=1&page_size=50` - First page, 50 items

#### Response

**Success (200 OK)**:
```json
{
  "data": [
    {
      "id": "8a7b5c3d-1234-5678-90ab-cdef12345678",
      "title": "Advanced Django Patterns",
      "author_name": "john_doe",
      "author_avatar": "https://cdn.ressourcefy.com/avatars/john.jpg",
      "tags": ["python", "django", "backend"],
      "stats": {
        "comment_count": 15,
        "upvotes": 23,
        "downvotes": 2,
        "total_votes": 25
      },
      "price_cents": null,
      "visibility": "public"
    },
    {
      "id": "9b8c6d4e-2345-6789-01bc-def123456789",
      "title": "React Best Practices 2026",
      "author_name": "jane_smith",
      "author_avatar": "https://cdn.ressourcefy.com/avatars/jane.jpg",
      "tags": ["react", "javascript", "frontend"],
      "stats": {
        "comment_count": 42,
        "upvotes": 156,
        "downvotes": 5,
        "total_votes": 161
      },
      "price_cents": 999,
      "visibility": "premium"
    }
  ]
}
```

**Field Descriptions**:
- `id`: Resource UUID
- `title`: Resource title
- `author_name`: Username of the author
- `author_avatar`: Avatar URL (null if no avatar)
- `tags`: Array of tag names
- `stats`: Resource statistics
  - `comment_count`: Number of comments on this resource
  - `upvotes`: Number of upvotes (+1)
  - `downvotes`: Number of downvotes (-1)
  - `total_votes`: Total number of votes
- `price_cents`: Price in cents (null for free resources)
- `visibility`: "public", "premium", or "private"

#### cURL Example
```bash
curl http://localhost:8000/api/feed/?page=1&page_size=10
```

#### JavaScript Fetch Example
```javascript
async function getResourceFeed(page = 1, pageSize = 20) {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString()
  });
  
  const response = await fetch(`http://localhost:8000/api/feed/?${params}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch resource feed');
  }
  
  const data = await response.json();
  return data.data;  // Array of resources
}

// Usage
const resources = await getResourceFeed(1, 20);
resources.forEach(resource => {
  console.log(`${resource.title} by ${resource.author_name}`);
});
```

#### React Hook Example
```jsx
import { useState, useEffect } from 'react';

function useResourceFeed(page = 1) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchFeed() {
      try {
        setLoading(true);
        const response = await fetch(`/api/feed/?page=${page}&page_size=20`);
        const data = await response.json();
        setResources(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchFeed();
  }, [page]);
  
  return { resources, loading, error };
}

// Usage in component
function ResourceList() {
  const [page, setPage] = useState(1);
  const { resources, loading, error } = useResourceFeed(page);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {resources.map(resource => (
        <div key={resource.id}>
          <h3>{resource.title}</h3>
          <p>by {resource.author_name}</p>
          <p>Tags: {resource.tags.join(', ')}</p>
          <p>Comments: {resource.stats.comment_count}</p>
          <p>Votes: 👍 {resource.stats.upvotes} 👎 {resource.stats.downvotes} (Total: {resource.stats.total_votes})</p>
        </div>
      ))}
      <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>
        Previous
      </button>
      <button onClick={() => setPage(p => p + 1)}>
        Next
      </button>
    </div>
  );
}
```

---

### Get Resource Detail

**Endpoint**: `GET /api/resources/<resource_id>/detail/`  
**Authentication**: Required  
**Description**: Get detailed information about a specific resource

#### Request

**Headers**:
```http
Authorization: Bearer <token>
```

**URL Parameters**:
- `resource_id` (string, required): UUID of the resource

#### Response

**Success (200 OK)**:
```json
{
  "data": {
    "id": "8a7b5c3d-1234-5678-90ab-cdef12345678",
    "title": "Advanced Django Patterns",
    "description": "A comprehensive guide to advanced Django patterns including...",
    "author_name": "john_doe",
    "author_avatar": "https://cdn.ressourcefy.com/avatars/john.jpg",
    "tags": ["python", "django", "backend"],
    "visibility": "public",
    "price_cents": null,
    "stats": {
      "comment_count": 15,
      "upvotes": 23,
      "downvotes": 2,
      "total_votes": 25
    },
    "versions": [
      {
        "version_number": 2,
        "file_url": "https://cdn.ressourcefy.com/files/django-patterns-v2.pdf",
        "created_at": "2026-01-20T10:30:00Z"
      },
      {
        "version_number": 1,
        "file_url": "https://cdn.ressourcefy.com/files/django-patterns-v1.pdf",
        "created_at": "2026-01-15T09:00:00Z"
      }
    ]
  }
}
```

**Field Descriptions**:
- `id`: Resource UUID
- `title`: Resource title
- `description`: Resource description
- `author_name`: Username of the author
- `author_avatar`: Avatar URL (null if no avatar)
- `tags`: Array of tag names
- `visibility`: "public", "premium", or "private"
- `price_cents`: Price in cents (null for free resources)
- `stats`: Resource statistics
  - `comment_count`: Number of comments on this resource
  - `upvotes`: Number of upvotes (+1)
  - `downvotes`: Number of downvotes (-1)
  - `total_votes`: Total number of votes
- `versions`: Array of version objects with version_number, file_url, and created_at

**Error (403 Forbidden)** - No access to premium resource:
```json
{
  "error": "You do not have permission to view this resource."
}
```

**Error (404 Not Found)**:
```json
{
  "error": "Resource not found."
}
```

#### cURL Example
```bash
curl http://localhost:8000/api/resources/8a7b5c3d-1234-5678-90ab-cdef12345678/detail/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### JavaScript Fetch Example
```javascript
async function getResourceDetail(resourceId) {
  const response = await fetch(
    `http://localhost:8000/api/resources/${resourceId}/detail/`,
    {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    }
  );
  
  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Premium subscription required');
    }
    throw new Error('Failed to fetch resource details');
  }
  
  const data = await response.json();
  return data.data;
}

// Usage
const resource = await getResourceDetail('8a7b5c3d-1234-5678-90ab-cdef12345678');
console.log(`Latest version: ${resource.versions[0].version_number}`);
```

---

### Get Resource Comments

**Endpoint**: `GET /api/resources/{resource_id}/comments/`  
**Authentication**: Optional (public endpoint, but access to resource is required)  
**Description**: Get all comments for a specific resource with pagination. Only non-deleted comments are returned.

#### Request

**Headers**:
```http
Authorization: Bearer <token>  (optional)
```

**URL Parameters**:
- `resource_id` (string, required): UUID of the resource

**Query Parameters**:
- `page` (integer, optional, default: 1): Page number (minimum: 1)
- `page_size` (integer, optional, default: 20, max: 100): Number of comments per page

**Example URLs**:
- `/api/resources/8a7b5c3d-1234-5678-90ab-cdef12345678/comments/` - First page, 20 comments
- `/api/resources/8a7b5c3d-1234-5678-90ab-cdef12345678/comments/?page=2` - Second page, 20 comments
- `/api/resources/8a7b5c3d-1234-5678-90ab-cdef12345678/comments/?page=1&page_size=50` - First page, 50 comments

**Permissions**:
- ✅ Public endpoint (no authentication required)
- ✅ User must have access to the resource (visibility check)
- ❌ Cannot view comments on resources without access (premium without subscription, private, etc.)

#### Response

**Success (200 OK)**:
```json
{
  "data": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "content": "This is a great resource! Very helpful.",
      "author": {
        "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
        "username": "john_doe",
        "avatar_url": "https://example.com/avatar.jpg"
      },
      "stats": {
        "upvotes": 5,
        "downvotes": 1,
        "total_votes": 6
      },
      "created_at": "2026-02-04T12:00:00Z",
      "updated_at": "2026-02-04T12:00:00Z"
    },
    {
      "id": "4gb96g75-6828-5679-01cd-ef0123456789",
      "content": "I found this very useful for my project.",
      "author": {
        "id": "8d0f7780-8536-49ef-055c-f18fc2f01bf8",
        "username": "jane_smith",
        "avatar_url": null
      },
      "stats": {
        "upvotes": 3,
        "downvotes": 0,
        "total_votes": 3
      },
      "created_at": "2026-02-04T11:30:00Z",
      "updated_at": "2026-02-04T11:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_count": 45,
    "total_pages": 3,
    "has_next": true,
    "has_previous": false
  }
}
```

**Field Descriptions**:
- `data`: Array of comment objects
  - `id`: Comment UUID
  - `content`: Comment text content
  - `author`: Author information
    - `id`: Author user UUID
    - `username`: Author username (falls back to email if no profile)
    - `avatar_url`: Author avatar URL (null if no avatar)
  - `stats`: Comment voting statistics
    - `upvotes`: Number of upvotes (+1)
    - `downvotes`: Number of downvotes (-1)
    - `total_votes`: Total number of votes
  - `created_at`: ISO 8601 timestamp of comment creation
  - `updated_at`: ISO 8601 timestamp of last update
- `pagination`: Pagination metadata
  - `page`: Current page number
  - `page_size`: Number of items per page
  - `total_count`: Total number of comments
  - `total_pages`: Total number of pages
  - `has_next`: Whether there is a next page
  - `has_previous`: Whether there is a previous page

**Error (404 Not Found)** - Resource not found:
```json
{
  "error": "Resource {resource_id} not found."
}
```

**Error (403 Forbidden)** - No access to resource:
```json
{
  "error": "You do not have permission to view comments on this resource."
}
```

**Error (400 Bad Request)** - Invalid pagination:
```json
{
  "error": "Invalid pagination parameters. 'page' and 'page_size' must be integers."
}
```

#### cURL Example
```bash
# Get first page of comments
curl http://localhost:8000/api/resources/8a7b5c3d-1234-5678-90ab-cdef12345678/comments/

# Get second page with 50 comments per page
curl "http://localhost:8000/api/resources/8a7b5c3d-1234-5678-90ab-cdef12345678/comments/?page=2&page_size=50"

# With authentication (optional)
curl http://localhost:8000/api/resources/8a7b5c3d-1234-5678-90ab-cdef12345678/comments/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### JavaScript Example
```javascript
async function getResourceComments(resourceId, page = 1, pageSize = 20) {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString()
  });
  
  const headers = {};
  const token = localStorage.getItem('authToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(
    `http://localhost:8000/api/resources/${resourceId}/comments/?${params}`,
    { headers }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch comments');
  }
  
  return await response.json();
}

// Usage
try {
  const result = await getResourceComments(
    '8a7b5c3d-1234-5678-90ab-cdef12345678',
    1,
    20
  );
  
  console.log(`Total comments: ${result.pagination.total_count}`);
  console.log(`Page ${result.pagination.page} of ${result.pagination.total_pages}`);
  
  result.data.forEach(comment => {
    console.log(`${comment.author.username}: ${comment.content}`);
    console.log(`  Votes: ${comment.stats.upvotes} up, ${comment.stats.downvotes} down`);
  });
  
  // Check if there are more pages
  if (result.pagination.has_next) {
    console.log('Load more comments...');
  }
} catch (error) {
  console.error('Error:', error.message);
}
```

#### React Hook Example
```jsx
import { useState, useEffect } from 'react';

function useResourceComments(resourceId, page = 1, pageSize = 20) {
  const [comments, setComments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchComments() {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: page.toString(),
          page_size: pageSize.toString()
        });
        
        const headers = {};
        const token = localStorage.getItem('authToken');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(
          `/api/resources/${resourceId}/comments/?${params}`,
          { headers }
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch comments');
        }
        
        const data = await response.json();
        setComments(data.data);
        setPagination(data.pagination);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    if (resourceId) {
      fetchComments();
    }
  }, [resourceId, page, pageSize]);
  
  return { comments, pagination, loading, error };
}

// Usage in component
function ResourceComments({ resourceId }) {
  const [page, setPage] = useState(1);
  const { comments, pagination, loading, error } = useResourceComments(resourceId, page);
  
  if (loading) return <div>Loading comments...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h3>Comments ({pagination?.total_count || 0})</h3>
      
      {comments.map(comment => (
        <div key={comment.id} className="comment">
          <div className="comment-header">
            <img 
              src={comment.author.avatar_url || '/default-avatar.png'} 
              alt={comment.author.username}
            />
            <strong>{comment.author.username}</strong>
            <span>{new Date(comment.created_at).toLocaleDateString()}</span>
          </div>
          <p>{comment.content}</p>
          <div className="comment-stats">
            👍 {comment.stats.upvotes} 👎 {comment.stats.downvotes}
          </div>
        </div>
      ))}
      
      <div className="pagination">
        <button 
          onClick={() => setPage(p => p - 1)} 
          disabled={!pagination?.has_previous}
        >
          Previous
        </button>
        <span>Page {pagination?.page} of {pagination?.total_pages}</span>
        <button 
          onClick={() => setPage(p => p + 1)} 
          disabled={!pagination?.has_next}
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

**Note**: 
- Comments are ordered by creation date (newest first)
- Only non-deleted comments are returned
- Author information falls back to email if no profile exists
- Voting statistics are included for each comment
- The endpoint is public but respects resource visibility rules
- Pagination is 1-indexed (page 1 is the first page)

---

### Get User Progress

**Endpoint**: `GET /api/user/progress/`  
**Authentication**: Required (IsAuthenticated, IsOnboardingComplete)  
**Description**: Get paginated list of user's progress on resources with summary statistics.

#### Request

**Headers**:
```http
Authorization: Bearer <token>
```

**Query Parameters**:
- `page` (integer, optional, default: 1): Page number (minimum: 1)
- `page_size` (integer, optional, default: 20, max: 100): Number of items per page

**Example URLs**:
- `/api/user/progress/` - First page, 20 items
- `/api/user/progress/?page=2` - Second page, 20 items
- `/api/user/progress/?page=1&page_size=50` - First page, 50 items

#### Response

**Success (200 OK)**:
```json
{
  "status": "ok",
  "data": {
    "summary": {
      "total_resources": 15,
      "completed_count": 5,
      "in_progress_count": 8,
      "not_started_count": 2
    },
    "data": [
      {
        "progress_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "resource_id": "8a7b5c3d-1234-5678-90ab-cdef12345678",
        "resource_title": "Advanced Django Patterns",
        "author_name": "john_doe",
        "author_avatar": "https://example.com/avatar.jpg",
        "status": "COMPLETED",
        "started_at": "2026-02-04T10:00:00Z",
        "last_accessed_at": "2026-02-04T14:30:00Z",
        "completed_at": "2026-02-04T14:30:00Z"
      },
      {
        "progress_id": "4gb96g75-6828-5679-01cd-ef0123456789",
        "resource_id": "9b8c6d4e-2345-6789-01bc-def123456789",
        "resource_title": "React Best Practices",
        "author_name": "jane_smith",
        "author_avatar": null,
        "status": "IN_PROGRESS",
        "started_at": "2026-02-04T11:00:00Z",
        "last_accessed_at": "2026-02-04T13:00:00Z",
        "completed_at": null
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total_count": 15,
      "total_pages": 1,
      "has_next": false,
      "has_previous": false
    }
  }
}
```

**Field Descriptions**:
- `summary`: Aggregated statistics for user's progress
  - `total_resources`: Total number of resources with progress tracking
  - `completed_count`: Number of completed resources
  - `in_progress_count`: Number of resources in progress
  - `not_started_count`: Number of resources not started
- `data`: Array of progress items, ordered by `last_accessed_at` (most recent first)
  - `progress_id`: Progress entry UUID
  - `resource_id`: Resource UUID
  - `resource_title`: Resource title
  - `author_name`: Author username (falls back to email if no profile)
  - `author_avatar`: Author avatar URL (null if no avatar)
  - `status`: Progress status (`NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`)
  - `started_at`: When user first accessed the resource (null if not started)
  - `last_accessed_at`: Last time user accessed the resource (null if not started)
  - `completed_at`: When user marked resource as completed (null if not completed)
- `pagination`: Pagination metadata

#### cURL Example
```bash
curl http://localhost:8000/api/user/progress/?page=1&page_size=20 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### JavaScript Example
```javascript
async function getUserProgress(page = 1, pageSize = 20) {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString()
  });
  
  const response = await fetch(`http://localhost:8000/api/user/progress/?${params}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch user progress');
  }
  
  return await response.json();
}

// Usage
try {
  const result = await getUserProgress(1, 20);
  console.log(`Completed: ${result.data.summary.completed_count}`);
  console.log(`In Progress: ${result.data.summary.in_progress_count}`);
  
  result.data.data.forEach(progress => {
    console.log(`${progress.resource_title}: ${progress.status}`);
  });
} catch (error) {
  console.error('Error:', error.message);
}
```

**Note**: 
- Progress list is ordered by `last_accessed_at` (most recent first)
- Summary counts are computed from all user's progress entries
- Only resources the user has accessed or completed are included
- User must have completed onboarding to use this endpoint

---

### Get Resource Progress

**Endpoint**: `GET /api/resources/{resource_id}/progress/`  
**Authentication**: Required (IsAuthenticated)  
**Description**: Get current user's progress for a specific resource. Returns `NOT_STARTED` if no progress exists.

#### Request

**Headers**:
```http
Authorization: Bearer <token>
```

**URL Parameters**:
- `resource_id` (string, required): UUID of the resource

#### Response

**Success (200 OK)** - With progress:
```json
{
  "status": "ok",
  "data": {
    "progress_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "user_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "resource_id": "8a7b5c3d-1234-5678-90ab-cdef12345678",
    "status": "IN_PROGRESS",
    "started_at": "2026-02-04T12:00:00Z",
    "last_accessed_at": "2026-02-04T14:30:00Z",
    "completed_at": null
  }
}
```

**Success (200 OK)** - No progress (NOT_STARTED):
```json
{
  "status": "ok",
  "data": {
    "progress_id": null,
    "user_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "resource_id": "8a7b5c3d-1234-5678-90ab-cdef12345678",
    "status": "NOT_STARTED",
    "started_at": null,
    "last_accessed_at": null,
    "completed_at": null
  }
}
```

**Error (404 Not Found)** - Resource not found:
```json
{
  "error": {
    "code": "resource_not_found",
    "message": "Resource {resource_id} not found"
  }
}
```

**Error (403 Forbidden)** - No access to resource:
```json
{
  "error": {
    "code": "access_denied",
    "message": "You do not have permission to view progress for this resource"
  }
}
```

#### cURL Example
```bash
curl http://localhost:8000/api/resources/8a7b5c3d-1234-5678-90ab-cdef12345678/progress/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### JavaScript Example
```javascript
async function getResourceProgress(resourceId) {
  const response = await fetch(
    `http://localhost:8000/api/resources/${resourceId}/progress/`,
    {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch resource progress');
  }
  
  return await response.json();
}

// Usage
try {
  const result = await getResourceProgress('8a7b5c3d-1234-5678-90ab-cdef12345678');
  console.log(`Status: ${result.data.status}`);
  if (result.data.completed_at) {
    console.log(`Completed at: ${result.data.completed_at}`);
  }
} catch (error) {
  console.error('Error:', error.message);
}
```

**Note**: 
- Returns `NOT_STARTED` status if user has never accessed the resource
- Progress is automatically created when user accesses a resource via `/api/resources/{id}/access/`
- User must have access to the resource to view progress
- All progress changes are logged via audit system

---

### Get Resource Users Progress

**Endpoint**: `GET /api/resources/{resource_id}/users-progress/`  
**Authentication**: Required (IsAuthenticated, IsContributor)  
**Description**: Get paginated list of all users' progress on a specific resource. Only resource authors (CONTRIBUTOR, MODERATOR, ADMIN, SUPERADMIN) or admins can view this.

#### Request

**Headers**:
```http
Authorization: Bearer <token>
```

**URL Parameters**:
- `resource_id` (string, required): UUID of the resource

**Query Parameters**:
- `page` (integer, optional, default: 1): Page number
- `page_size` (integer, optional, default: 20, max: 100): Items per page

#### Response

**Success (200 OK)**:
```json
{
  "status": "ok",
  "data": {
    "resource_id": "8a7b5c3d-1234-5678-90ab-cdef12345678",
    "resource_title": "Advanced Django Patterns",
    "progress_entries": [
      {
        "id": "1a2b3c4d-5678-90ab-cdef-1234567890ab",
        "user_id": "2b3c4d5e-6789-01ab-cdef-2345678901bc",
        "user_email": "user@example.com",
        "username": "john_doe",
        "avatar_url": "https://cdn.ressourcefy.com/avatars/john.jpg",
        "status": "COMPLETED",
        "started_at": "2026-01-25T10:00:00Z",
        "last_accessed_at": "2026-01-25T15:30:00Z",
        "completed_at": "2026-01-25T15:30:00Z"
      },
      {
        "id": "3c4d5e6f-7890-12ab-cdef-3456789012cd",
        "user_id": "4d5e6f7a-8901-23ab-cdef-4567890123de",
        "user_email": "another@example.com",
        "username": "jane_smith",
        "avatar_url": null,
        "status": "IN_PROGRESS",
        "started_at": "2026-01-25T11:00:00Z",
        "last_accessed_at": "2026-01-25T14:00:00Z",
        "completed_at": null
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total_count": 45,
      "total_pages": 3,
      "has_next": true,
      "has_previous": false
    }
  }
}
```

**Error Responses**:

- **403 Forbidden** (Not author or admin):
```json
{
  "error": {
    "code": "access_denied",
    "message": "You do not have permission to view progress for this resource. Only the resource author or admins can view this."
  }
}
```

- **404 Not Found** (Resource not found):
```json
{
  "error": {
    "code": "resource_not_found",
    "message": "Resource {resource_id} not found"
  }
}
```

#### cURL Example

```bash
curl -X GET "https://api.ressourcefy.com/api/resources/8a7b5c3d-1234-5678-90ab-cdef12345678/users-progress/?page=1&page_size=20" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### JavaScript Example

```javascript
async function getResourceUsersProgress(resourceId, page = 1, pageSize = 20) {
  const response = await fetch(
    `https://api.ressourcefy.com/api/resources/${resourceId}/users-progress/?page=${page}&page_size=${pageSize}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }
  
  return await response.json();
}

// Usage
try {
  const result = await getResourceUsersProgress('8a7b5c3d-1234-5678-90ab-cdef12345678', 1, 20);
  console.log(`Total users: ${result.data.pagination.total_count}`);
  result.data.progress_entries.forEach(entry => {
    console.log(`${entry.user_email}: ${entry.status}`);
  });
} catch (error) {
  console.error('Error:', error.message);
}
```

**Note**: 
- Only resource authors (CONTRIBUTOR, MODERATOR, ADMIN, SUPERADMIN) can view progress on their resources
- ADMIN and SUPERADMIN can view progress on any resource
- Returns paginated list of all users who have progress on the resource
- Ordered by `last_accessed_at` (most recent first)

---

### Get All Progress (Admin)

**Endpoint**: `GET /api/admin/progress/`  
**Authentication**: Required (IsAuthenticated, IsAdmin)  
**Description**: Get paginated list of all progress entries across all resources. Only ADMIN and SUPERADMIN can access this endpoint.

#### Request

**Headers**:
```http
Authorization: Bearer <token>
```

**Query Parameters**:
- `resource_id` (UUID, optional): Filter by resource ID
- `user_id` (UUID, optional): Filter by user ID
- `page` (integer, optional, default: 1): Page number
- `page_size` (integer, optional, default: 20, max: 100): Items per page

#### Response

**Success (200 OK)**:
```json
{
  "status": "ok",
  "data": {
    "progress_entries": [
      {
        "id": "1a2b3c4d-5678-90ab-cdef-1234567890ab",
        "user_id": "2b3c4d5e-6789-01ab-cdef-2345678901bc",
        "user_email": "user@example.com",
        "username": "john_doe",
        "avatar_url": "https://cdn.ressourcefy.com/avatars/john.jpg",
        "resource_id": "8a7b5c3d-1234-5678-90ab-cdef12345678",
        "resource_title": "Advanced Django Patterns",
        "author_id": "5e6f7a8b-9012-34ab-cdef-5678901234ef",
        "author_email": "author@example.com",
        "status": "COMPLETED",
        "started_at": "2026-01-25T10:00:00Z",
        "last_accessed_at": "2026-01-25T15:30:00Z",
        "completed_at": "2026-01-25T15:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total_count": 150,
      "total_pages": 8,
      "has_next": true,
      "has_previous": false
    },
    "filters": {
      "resource_id": null,
      "user_id": null
    }
  }
}
```

**Error Responses**:

- **403 Forbidden** (Not admin):
```json
{
  "error": {
    "code": "access_denied",
    "message": "Only administrators can view all progress entries"
  }
}
```

- **404 Not Found** (Resource or user not found when filtering):
```json
{
  "error": {
    "code": "resource_not_found",
    "message": "Resource {resource_id} not found"
  }
}
```

#### cURL Example

```bash
# Get all progress entries
curl -X GET "https://api.ressourcefy.com/api/admin/progress/?page=1&page_size=20" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Filter by resource
curl -X GET "https://api.ressourcefy.com/api/admin/progress/?resource_id=8a7b5c3d-1234-5678-90ab-cdef12345678" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Filter by user
curl -X GET "https://api.ressourcefy.com/api/admin/progress/?user_id=2b3c4d5e-6789-01ab-cdef-2345678901bc" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### JavaScript Example

```javascript
async function getAllProgress(filters = {}, page = 1, pageSize = 20) {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
    ...(filters.resource_id && { resource_id: filters.resource_id }),
    ...(filters.user_id && { user_id: filters.user_id })
  });
  
  const response = await fetch(
    `https://api.ressourcefy.com/api/admin/progress/?${params}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }
  
  return await response.json();
}

// Usage
try {
  // Get all progress
  const allProgress = await getAllProgress({}, 1, 20);
  console.log(`Total entries: ${allProgress.data.pagination.total_count}`);
  
  // Filter by resource
  const resourceProgress = await getAllProgress({ resource_id: '8a7b5c3d-1234-5678-90ab-cdef12345678' });
  
  // Filter by user
  const userProgress = await getAllProgress({ user_id: '2b3c4d5e-6789-01ab-cdef-2345678901bc' });
} catch (error) {
  console.error('Error:', error.message);
}
```

**Note**: 
- Only ADMIN and SUPERADMIN can access this endpoint
- Supports optional filtering by `resource_id` and `user_id`
- Returns all progress entries across all resources
- Ordered by `last_accessed_at` (most recent first)
- Useful for admin dashboards and analytics

---

### Get Author Profile

**Endpoint**: `GET /api/authors/<user_id>/`  
**Authentication**: Optional  
**Description**: Get author profile with stats and recent resources

#### Request

**Headers**:
```http
Authorization: Bearer <token>  (optional)
```

**URL Parameters**:
- `user_id` (string, required): UUID of the user

#### Response

**Success (200 OK)**:
```json
{
  "data": {
    "id": "1a2b3c4d-5678-90ab-cdef-1234567890ab",
    "username": "john_doe",
    "bio": "Full-stack developer passionate about Django and React",
    "avatar_url": "https://cdn.ressourcefy.com/avatars/john.jpg",
    "stats": {
      "total_resources": 15,
      "total_views": 0
    },
    "recent_resources": [
      {
        "id": "8a7b5c3d-1234-5678-90ab-cdef12345678",
        "title": "Advanced Django Patterns",
        "created_at": "2026-01-15T09:00:00Z"
      },
      {
        "id": "9b8c6d4e-2345-6789-01bc-def123456789",
        "title": "Django REST Framework Guide",
        "created_at": "2026-01-10T14:30:00Z"
      }
    ]
  }
}
```

**Error (404 Not Found)**:
```json
{
  "error": "User not found."
}
```

#### JavaScript Fetch Example
```javascript
async function getAuthorProfile(userId) {
  const response = await fetch(`http://localhost:8000/api/authors/${userId}/`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch author profile');
  }
  
  const data = await response.json();
  return data.data;
}

// Usage
const author = await getAuthorProfile('1a2b3c4d-5678-90ab-cdef-1234567890ab');
console.log(`${author.username} has ${author.stats.total_resources} resources`);
```

---

## Webhook Endpoints

### Stripe Webhook

**Endpoint**: `POST /api/billing/webhook/`  
**Authentication**: None (verified via Stripe signature)  
**Description**: Receives webhook events from Stripe (for internal use only)

⚠️ **Note**: This endpoint is called by Stripe servers, not frontend applications.

#### Request

**Headers**:
```http
Content-Type: application/json
Stripe-Signature: t=1234567890,v1=abc123...
```

**Body**: Raw Stripe event payload

#### Response

**Success (200 OK)**:
```json
{
  "status": "received"
}
```

---

## Health Endpoints

### Liveness Check

**Endpoint**: `GET /health/live/`  
**Authentication**: None  
**Description**: Basic ping to check if the server is running

#### Response
```json
{
  "status": "ok"
}
```

### Readiness Check

**Endpoint**: `GET /health/ready/`  
**Authentication**: None  
**Description**: Check if the server is ready to handle requests (DB connection, outbox health)

#### Response

**Healthy (200 OK)**:
```json
{
  "status": "ok"
}
```

**Unhealthy (503 Service Unavailable)**:
```json
{
  "status": "unavailable"
}
```

---

## Error Handling

### Standard Error Response Format

All errors follow this structure:

```json
{
  "error": "Human-readable error message"
}
```

### HTTP Status Codes

| Code | Meaning | When to Expect |
|------|---------|----------------|
| 200 | OK | Successful GET/POST request |
| 201 | Created | Resource successfully created |
| 400 | Bad Request | Invalid input data (validation errors) |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Authenticated but lacks permission |
| 404 | Not Found | Resource doesn't exist |
| 422 | Unprocessable Entity | Business logic error (e.g., already voted) |
| 500 | Internal Server Error | Server-side error |
| 503 | Service Unavailable | Server is not ready (health check failed) |

### Validation Errors

Validation errors return field-specific messages:

```json
{
  "field_name": [
    "Error message 1",
    "Error message 2"
  ]
}
```

**Example**:
```json
{
  "vote_value": [
    "Ensure this value is either 1 or -1."
  ],
  "comment_id": [
    "This field is required."
  ]
}
```

---

## Frontend Integration Examples

### Complete React Integration

```jsx
// api.js - API client
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

class RessourcefyAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
  }
  
  getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }
  
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers
      }
    };
    
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }
    
    return await response.json();
  }
  
  // Resource Feed
  async getResourceFeed(page = 1, pageSize = 20) {
    const params = new URLSearchParams({ page, page_size: pageSize });
    const data = await this.request(`/feed/?${params}`);
    return data.data;
  }
  
  // Resource Detail
  async getResourceDetail(resourceId) {
    const data = await this.request(`/resources/${resourceId}/detail/`);
    return data.data;
  }
  
  // Vote on Comment
  async voteOnComment(commentId, value) {
    return await this.request('/comments/vote/', {
      method: 'POST',
      body: JSON.stringify({
        comment_id: commentId,
        vote_value: value
      })
    });
  }
  
  // Create Checkout Session
  async createCheckoutSession(priceId, successUrl, cancelUrl) {
    const data = await this.request('/billing/checkout/', {
      method: 'POST',
      body: JSON.stringify({
        price_id: priceId,
        success_url: successUrl,
        cancel_url: cancelUrl
      })
    });
    return data.data.sessionId;
  }
}

export default new RessourcefyAPI();
```

### Vue.js Integration

```javascript
// plugins/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default {
  // Resource operations
  getResourceFeed(page = 1, pageSize = 20) {
    return api.get('/feed/', { params: { page, page_size: pageSize } });
  },
  
  getResourceDetail(resourceId) {
    return api.get(`/resources/${resourceId}/detail/`);
  },
  
  // Voting
  voteOnComment(commentId, value) {
    return api.post('/comments/vote/', {
      comment_id: commentId,
      vote_value: value
    });
  },
  
  // Billing
  createCheckoutSession(priceId, successUrl, cancelUrl) {
    return api.post('/billing/checkout/', {
      price_id: priceId,
      success_url: successUrl,
      cancel_url: cancelUrl
    });
  }
};
```

### Angular Service

```typescript
// services/ressourcefy-api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../environments/environment';

interface ApiResponse<T> {
  status?: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class RessourcefyApiService {
  private baseUrl = environment.apiUrl || 'http://localhost:8000/api';
  
  constructor(private http: HttpClient) {}
  
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  }
  
  getResourceFeed(page: number = 1, pageSize: number = 20): Observable<any[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());
    
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/feed/`, { params })
      .pipe(map(response => response.data));
  }
  
  getResourceDetail(resourceId: string): Observable<any> {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}/resources/${resourceId}/detail/`,
      { headers: this.getHeaders() }
    ).pipe(map(response => response.data));
  }
  
  voteOnComment(commentId: string, value: number): Observable<any> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/comments/vote/`,
      { comment_id: commentId, vote_value: value },
      { headers: this.getHeaders() }
    );
  }
  
  createCheckoutSession(priceId: string, successUrl: string, cancelUrl: string): Observable<string> {
    return this.http.post<ApiResponse<{ sessionId: string }>>(
      `${this.baseUrl}/billing/checkout/`,
      { price_id: priceId, success_url: successUrl, cancel_url: cancelUrl },
      { headers: this.getHeaders() }
    ).pipe(map(response => response.data.sessionId));
  }
}
```

---

## Testing with Postman

### Import Collection

You can import this collection to Postman:

```json
{
  "info": {
    "name": "Ressourcefy API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:8000/api"
    },
    {
      "key": "auth_token",
      "value": "YOUR_TOKEN_HERE"
    }
  ],
  "item": [
    {
      "name": "Get Resource Feed",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/feed/?page=1&page_size=20"
      }
    },
    {
      "name": "Vote on Comment",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/comments/vote/",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{auth_token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"comment_id\": \"3fa85f64-5717-4562-b3fc-2c963f66afa6\",\n  \"vote_value\": 1\n}"
        }
      }
    }
  ]
}
```

---

## HTTP Cookies & Middleware Support

The Ressourcefy backend sets HTTP cookies to support Next.js Edge Middleware for deterministic routing and access control.

### Cookies Set by Backend

| Cookie Name | Purpose | HttpOnly | Secure | SameSite | Accessible By |
|------------|---------|----------|--------|----------|---------------|
| `access_token` | JWT access token | ✅ Yes | ✅ (prod) | Lax | Backend only |
| `refresh_token` | JWT refresh token | ✅ Yes | ✅ (prod) | Lax | Backend only |
| `activated` | Account activation status | ❌ No | ✅ (prod) | Lax | JS/Middleware |
| `onboarding_step` | Onboarding progression | ❌ No | ✅ (prod) | Lax | JS/Middleware |

### Cookie Configuration

- **Secure**: `True` in production (HTTPS), `False` in development
- **HttpOnly**: `True` for tokens (security), `False` for state cookies (middleware access)
- **SameSite**: `Lax` (allows cross-origin requests with credentials)
- **Path**: `/` (accessible on entire domain)
- **Max-Age**: 7 days for `access_token`, 30 days for others

### When Cookies Are Set/Updated

1. **Login** (`POST /auth/login/`): Sets all 4 cookies
2. **Activation** (`POST /auth/activate/`): Updates `activated` and `onboarding_step`
3. **Profile Submission** (`POST /onboarding/profile/`): Updates `onboarding_step`
4. **Interests Submission** (`POST /onboarding/interests/`): Updates `onboarding_step`
5. **Get Current User** (`GET /user/me/`): Syncs `activated` and `onboarding_step`

### Middleware Integration

The Next.js middleware can read these cookies to:

1. **Detect Authentication**: Check for `access_token` cookie
2. **Check Activation**: Read `activated` cookie (`"true"` or `"false"`)
3. **Determine Onboarding State**: Read `onboarding_step` cookie
4. **Redirect Deterministically**:
   - No `access_token` → `/login`
   - `activated === "false"` → `/activation-required`
   - `onboarding_step === "profile"` → `/onboarding/profile`
   - `onboarding_step === "interests"` → `/onboarding/interests`
   - `onboarding_step === "completed"` → `/dashboard`

### Frontend Requirements

⚠️ **Important**: The frontend should:
- ✅ Use `credentials: 'include'` in fetch requests
- ✅ Let middleware handle routing decisions
- ✅ NOT store auth state in Zustand/Redux
- ✅ NOT manually redirect based on client state
- ✅ NOT infer onboarding state from profile completeness
- ✅ Rely on cookies as the single source of truth

### Example Middleware (Next.js)

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('access_token');
  const activated = request.cookies.get('activated');
  const onboardingStep = request.cookies.get('onboarding_step');
  
  // No token → login
  if (!accessToken) {
    if (request.nextUrl.pathname.startsWith('/auth/')) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Not activated → activation required
  if (activated?.value !== 'true') {
    if (request.nextUrl.pathname.startsWith('/auth/activate')) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/activation-required', request.url));
  }
  
  // Onboarding incomplete → redirect to onboarding
  if (onboardingStep?.value !== 'completed') {
    if (request.nextUrl.pathname.startsWith('/onboarding/')) {
      return NextResponse.next();
    }
    
    if (onboardingStep?.value === 'profile') {
      return NextResponse.redirect(new URL('/onboarding/profile', request.url));
    }
    if (onboardingStep?.value === 'interests') {
      return NextResponse.redirect(new URL('/onboarding/interests', request.url));
    }
  }
  
  // Dashboard access requires completed onboarding
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (onboardingStep?.value !== 'completed') {
      return NextResponse.redirect(new URL('/onboarding/profile', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

---

## Admin Endpoints

⚠️ **Admin endpoints require elevated permissions** (`IsAdmin` or `IsSuperAdmin`). Regular users cannot access these endpoints.

### List Users

**Endpoint**: `GET /api/admin/users/`  
**Authentication**: Required (IsAdmin)  
**Description**: List all users with pagination

#### Request

**Headers**:
```http
Authorization: Bearer <token>
```

**Query Parameters**:
- `page` (integer, optional, default: 1): Page number
- `page_size` (integer, optional, default: 20): Items per page

#### Response

**Success (200 OK)**:
```json
{
  "count": 100,
  "next": "http://localhost:8000/api/admin/users/?page=2",
  "previous": null,
  "results": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "email": "user@example.com",
      "username": "john_doe",
      "bio": "Full-stack developer",
      "avatar_url": "https://example.com/avatar.jpg",
      "has_profile": true,
      "role": "USER",
      "is_active": true,
      "is_staff": false,
      "is_superuser": false,
      "is_activated": true,
      "onboarding_step": "completed",
      "created_at": "2026-01-25T12:00:00Z",
      "updated_at": "2026-01-25T12:00:00Z"
    }
  ]
}
```

**Field Descriptions**:
- `id`: User UUID
- `email`: User email address
- `username`: Username from Profile (null if Profile doesn't exist)
- `bio`: Biography from Profile (null if Profile doesn't exist)
- `avatar_url`: Avatar URL from Profile (null if Profile doesn't exist)
- `has_profile`: Boolean indicating if user has a profile
- `role`: User role (SUPERADMIN, ADMIN, MODERATOR, CONTRIBUTOR, USER)
- `is_active`: Django's active flag
- `is_staff`: Django's staff flag
- `is_superuser`: Django's superuser flag
- `is_activated`: Email activation status
- `onboarding_step`: Current onboarding step
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp

**Error (403 Forbidden)** - Not admin:
```json
{
  "detail": "You do not have permission to perform this action."
}
```

---

### Get User Details

**Endpoint**: `GET /api/admin/users/{id}/`  
**Authentication**: Required (IsAdmin)  
**Description**: Get detailed information about a specific user

#### Request

**Headers**:
```http
Authorization: Bearer <token>
```

**URL Parameters**:
- `id` (string, required): User UUID

#### Response

**Success (200 OK)**:
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "user@example.com",
  "username": "john_doe",
  "bio": "Full-stack developer",
  "avatar_url": "https://example.com/avatar.jpg",
  "has_profile": true,
  "role": "USER",
  "is_active": true,
  "is_staff": false,
  "is_superuser": false,
  "is_activated": true,
  "onboarding_step": "completed",
  "created_at": "2026-01-25T12:00:00Z",
  "updated_at": "2026-01-25T12:00:00Z"
}
```

**Field Descriptions**:
- `id`: User UUID
- `email`: User email address
- `username`: Username from Profile (null if Profile doesn't exist)
- `bio`: Biography from Profile (null if Profile doesn't exist)
- `avatar_url`: Avatar URL from Profile (null if Profile doesn't exist)
- `has_profile`: Boolean indicating if user has a profile
- `role`: User role (SUPERADMIN, ADMIN, MODERATOR, CONTRIBUTOR, USER)
- `is_active`: Django's active flag
- `is_staff`: Django's staff flag
- `is_superuser`: Django's superuser flag
- `is_activated`: Email activation status
- `onboarding_step`: Current onboarding step
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp

---

### Update User

**Endpoint**: `PATCH /api/admin/users/{id}/`  
**Authentication**: Required (IsAdmin)  
**Description**: Update user information (role field is protected)

#### Request

**Headers**:
```http
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "is_active": false
}
```

**Note**: The `role` field cannot be modified via PATCH. Use the `set_role` action instead.

#### Response

**Success (200 OK)**:
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "user@example.com",
  "role": "USER",
  "is_active": false,
  "created_at": "2026-01-25T12:00:00Z"
}
```

---

### Delete User

**Endpoint**: `DELETE /api/admin/users/{id}/`  
**Authentication**: Required (IsAdmin)  
**Description**: Soft delete a user

#### Request

**Headers**:
```http
Authorization: Bearer <token>
```

#### Response

**Success (204 No Content)**: Empty response body

---

### Change User Role

**Endpoint**: `POST /api/admin/users/{id}/set_role/`  
**Authentication**: Required (IsSuperAdmin only)  
**Description**: Change a user's role. Only SUPERADMIN can use this endpoint.

#### Request

**Headers**:
```http
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "role": "ADMIN"
}
```

**Valid Roles**:
- `SUPERADMIN`
- `ADMIN`
- `MODERATOR`
- `CONTRIBUTOR`
- `USER`

#### Response

**Success (200 OK)**:
```json
{
  "status": "ok",
  "data": {
    "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "email": "user@example.com",
    "role": "ADMIN",
    "previous_role": "USER"
  }
}
```

**Error (403 Forbidden)** - Not superadmin:
```json
{
  "detail": "You do not have permission to perform this action."
}
```

**Error (400 Bad Request)** - Invalid role:
```json
{
  "error": {
    "code": "invalid_role",
    "message": "Invalid role. Must be one of: SUPERADMIN, ADMIN, MODERATOR, CONTRIBUTOR, USER"
  }
}
```

**Error (400 Bad Request)** - Last superadmin:
```json
{
  "error": {
    "code": "last_superadmin",
    "message": "Cannot demote the last superadmin. Create another superadmin first."
  }
}
```

#### JavaScript Example
```javascript
async function changeUserRole(userId, newRole) {
  const response = await fetch(`http://localhost:8000/api/admin/users/${userId}/set_role/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify({ role: newRole })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || error.detail || 'Failed to change role');
  }
  
  return await response.json();
}
```

**Security Notes**:
- Only SUPERADMIN can assign ADMIN or SUPERADMIN roles
- Regular admins cannot use this endpoint
- All role changes are logged via AuditLog
- Cannot demote the last SUPERADMIN (prevents lockout)

---

### Get User Activity History

**Endpoint**: `GET /api/admin/users/{id}/activity/`  
**Authentication**: Required (IsAdmin)  
**Description**: Get recent activity history for a specific user (audit logs + analytics)

#### Request

**Headers**:
```http
Authorization: Bearer <token>
```

**URL Parameters**:
- `id` (string, required): User UUID

**Query Parameters**:
- `limit` (integer, optional, default: 50, max: 100): Maximum number of activities to return

#### Response

**Success (200 OK)**:
```json
{
  "status": "ok",
  "data": {
    "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "activities": [
      {
        "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
        "timestamp": "2026-01-25T14:30:00Z",
        "action": "UPDATE",
        "entity_name": "Resource",
        "object_id": "8a7b5c3d-1234-5678-90ab-cdef12345678",
        "description": "Updated resource title"
      }
    ],
    "count": 1
  }
}
```

#### JavaScript Example
```javascript
async function getUserActivity(userId, limit = 50) {
  const response = await fetch(
    `http://localhost:8000/api/admin/users/${userId}/activity/?limit=${limit}`,
    {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch user activity');
  }
  
  return await response.json();
}
```

---

### Impersonate User

**Endpoint**: `POST /api/admin/users/{id}/impersonate/`  
**Authentication**: Required (IsSuperAdmin only)  
**Description**: Start an impersonation session for a user. Returns JWT tokens for the target user.

⚠️ **Security**: Only SUPERADMIN can use this endpoint. Cannot impersonate another SUPERADMIN.

#### Request

**Headers**:
```http
Content-Type: application/json
Authorization: Bearer <token>
```

**URL Parameters**:
- `id` (string, required): Target user UUID

**Body**: Empty (no body required)

#### Response

**Success (200 OK)**:
```json
{
  "status": "ok",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "email": "user@example.com",
      "username": "john_doe",
      "activated": true,
      "onboarding_step": "completed",
      "role": "USER"
    }
  }
}
```

**Error (403 Forbidden)** - Not superadmin:
```json
{
  "detail": "You do not have permission to perform this action."
}
```

**Error (400 Bad Request)** - Cannot impersonate superadmin:
```json
{
  "error": {
    "code": "invalid_action",
    "message": "Cannot impersonate another SUPERADMIN"
  }
}
```

#### JavaScript Example
```javascript
async function impersonateUser(userId) {
  const response = await fetch(
    `http://localhost:8000/api/admin/users/${userId}/impersonate/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || error.detail || 'Impersonation failed');
  }
  
  const data = await response.json();
  
  // Store impersonation tokens
  localStorage.setItem('impersonation_token', data.data.access_token);
  localStorage.setItem('impersonation_user', JSON.stringify(data.data.user));
  
  return data.data;
}
```

---

### Reset User Password

**Endpoint**: `POST /api/admin/users/{id}/reset_password/`  
**Authentication**: Required (IsAdmin)  
**Description**: Reset a user's password. A new password will be generated and sent via email.

#### Request

**Headers**:
```http
Content-Type: application/json
Authorization: Bearer <token>
```

**URL Parameters**:
- `id` (string, required): User UUID

**Body**: Empty (no body required)

#### Response

**Success (200 OK)**:
```json
{
  "status": "ok",
  "data": {
    "message": "Password reset email sent to user@example.com"
  }
}
```

**Error (400 Bad Request)** - Cannot reset superadmin password (unless actor is superadmin):
```json
{
  "error": {
    "code": "invalid_action",
    "message": "Only SUPERADMIN can reset another SUPERADMIN's password"
  }
}
```

#### JavaScript Example
```javascript
async function resetUserPassword(userId) {
  const response = await fetch(
    `http://localhost:8000/api/admin/users/${userId}/reset_password/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Password reset failed');
  }
  
  return await response.json();
}
```

---

## Admin Tag Management

### List Tags

**Endpoint**: `GET /api/admin/tags/`  
**Authentication**: Required (IsAdmin)  
**Description**: List all tags with optional search

#### Request

**Headers**:
```http
Authorization: Bearer <token>
```

**Query Parameters**:
- `search` (string, optional): Search tags by name (case-insensitive)
- `page` (integer, optional, default: 1): Page number
- `page_size` (integer, optional, default: 20): Items per page

#### Response

**Success (200 OK)**:
```json
{
  "count": 50,
  "next": "http://localhost:8000/api/admin/tags/?page=2",
  "previous": null,
  "results": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "name": "Python",
      "slug": "python",
      "created_at": "2026-01-25T12:00:00Z",
      "updated_at": "2026-01-25T12:00:00Z"
    }
  ]
}
```

#### JavaScript Example
```javascript
async function listTags(search = '', page = 1) {
  const params = new URLSearchParams({ page, page_size: 20 });
  if (search) params.append('search', search);
  
  const response = await fetch(
    `http://localhost:8000/api/admin/tags/?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    }
  );
  
  return await response.json();
}
```

---

### Get Tag Details

**Endpoint**: `GET /api/admin/tags/{id}/`  
**Authentication**: Required (IsAdmin)  
**Description**: Get detailed information about a specific tag

#### Request

**Headers**:
```http
Authorization: Bearer <token>
```

**URL Parameters**:
- `id` (string, required): Tag UUID

#### Response

**Success (200 OK)**:
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "Python",
  "slug": "python",
  "created_at": "2026-01-25T12:00:00Z",
  "updated_at": "2026-01-25T12:00:00Z"
}
```

---

### Create Tag

**Endpoint**: `POST /api/admin/tags/`  
**Authentication**: Required (IsAdmin)  
**Description**: Create a new tag. Name must be unique, slug is auto-generated.

#### Request

**Headers**:
```http
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "name": "Django"
}
```

**Field Descriptions**:
- `name` (string, required): Tag name (max 50 characters, will be slugified)

#### Response

**Success (201 Created)**:
```json
{
  "status": "ok",
  "data": {
    "tag_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "Django",
    "slug": "django"
  }
}
```

**Error (400 Bad Request)** - Tag already exists:
```json
{
  "error": {
    "code": "invalid_action",
    "message": "Tag with name 'Django' or slug 'django' already exists"
  }
}
```

#### JavaScript Example
```javascript
async function createTag(name) {
  const response = await fetch('http://localhost:8000/api/admin/tags/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify({ name })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Tag creation failed');
  }
  
  return await response.json();
}
```

---

### Update Tag

**Endpoint**: `PATCH /api/admin/tags/{id}/`  
**Authentication**: Required (IsAdmin)  
**Description**: Update a tag's name. Slug is automatically updated.

#### Request

**Headers**:
```http
Content-Type: application/json
Authorization: Bearer <token>
```

**URL Parameters**:
- `id` (string, required): Tag UUID

**Body**:
```json
{
  "name": "Django Framework"
}
```

#### Response

**Success (200 OK)**:
```json
{
  "status": "ok",
  "data": {
    "tag_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "Django Framework",
    "slug": "django-framework"
  }
}
```

---

### Delete Tag

**Endpoint**: `DELETE /api/admin/tags/{id}/`  
**Authentication**: Required (IsAdmin)  
**Description**: Soft delete a tag. If the tag is in use, it will be soft-deleted (not hard-deleted).

#### Request

**Headers**:
```http
Authorization: Bearer <token>
```

**URL Parameters**:
- `id` (string, required): Tag UUID

#### Response

**Success (200 OK)**:
```json
{
  "status": "ok",
  "data": {
    "message": "Tag deleted successfully"
  }
}
```

---

### Merge Tags

**Endpoint**: `POST /api/admin/tags/merge/`  
**Authentication**: Required (IsAdmin)  
**Description**: Merge a source tag into a target tag. All associations (resources, user interests) are moved to the target tag, and the source tag is soft-deleted.

#### Request

**Headers**:
```http
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "source_tag_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "target_tag_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7"
}
```

**Field Descriptions**:
- `source_tag_id` (string, required): UUID of tag to merge from
- `target_tag_id` (string, required): UUID of tag to merge into

#### Response

**Success (200 OK)**:
```json
{
  "status": "ok",
  "data": {
    "message": "Tags merged successfully",
    "source_tag_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "target_tag_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7"
  }
}
```

**Error (400 Bad Request)** - Cannot merge into soft-deleted tag:
```json
{
  "error": {
    "code": "invalid_action",
    "message": "Cannot merge into a soft-deleted target tag"
  }
}
```

#### JavaScript Example
```javascript
async function mergeTags(sourceTagId, targetTagId) {
  const response = await fetch('http://localhost:8000/api/admin/tags/merge/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify({
      source_tag_id: sourceTagId,
      target_tag_id: targetTagId
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Tag merge failed');
  }
  
  return await response.json();
}
```

---

## Admin Resource Management

### List Resources

**Endpoint**: `GET /api/admin/resources/`  
**Authentication**: Required (IsAdmin)  
**Description**: List all resources with advanced filters

#### Request

**Headers**:
```http
Authorization: Bearer <token>
```

**Query Parameters**:
- `author_id` (string, optional): Filter by author UUID
- `visibility` (string, optional): Filter by visibility (`public`, `premium`, `private`)
- `has_price` (boolean, optional): Filter by whether resource has a price (`true`/`false`)
- `search` (string, optional): Search by title (case-insensitive)
- `tag_ids` (array, optional): Filter by tag IDs (can specify multiple)
- `include_deleted` (boolean, optional, default: `false`): Include soft-deleted resources
- `page` (integer, optional, default: 1): Page number
- `page_size` (integer, optional, default: 20): Items per page

#### Response

**Success (200 OK)**:
```json
{
  "count": 100,
  "next": "http://localhost:8000/api/admin/resources/?page=2",
  "previous": null,
  "results": [
    {
      "id": "8a7b5c3d-1234-5678-90ab-cdef12345678",
      "title": "Advanced Django Patterns",
      "description": "A comprehensive guide...",
      "author_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "author_email": "author@example.com",
      "visibility": "public",
      "price_cents": null,
      "tags": [
        {
          "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          "name": "Python",
          "slug": "python"
        }
      ],
      "versions": [
        {
          "id": "9b8c6d4e-2345-6789-01bc-def123456789",
          "version_number": 2,
          "file_url": "https://cdn.ressourcefy.com/files/resource-v2.pdf",
          "created_at": "2026-01-20T10:30:00Z"
        }
      ],
      "created_at": "2026-01-15T09:00:00Z",
      "updated_at": "2026-01-20T10:30:00Z"
    }
  ]
}
```

#### JavaScript Example
```javascript
async function listResources(filters = {}) {
  const params = new URLSearchParams();
  if (filters.author_id) params.append('author_id', filters.author_id);
  if (filters.visibility) params.append('visibility', filters.visibility);
  if (filters.has_price !== undefined) params.append('has_price', filters.has_price);
  if (filters.search) params.append('search', filters.search);
  if (filters.tag_ids) {
    filters.tag_ids.forEach(id => params.append('tag_ids', id));
  }
  if (filters.include_deleted) params.append('include_deleted', 'true');
  params.append('page', filters.page || 1);
  params.append('page_size', filters.page_size || 20);
  
  const response = await fetch(
    `http://localhost:8000/api/admin/resources/?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    }
  );
  
  return await response.json();
}
```

---

### Get Resource Details

**Endpoint**: `GET /api/admin/resources/{id}/`  
**Authentication**: Required (IsAdmin)  
**Description**: Get detailed information about a specific resource, including all versions

#### Request

**Headers**:
```http
Authorization: Bearer <token>
```

**URL Parameters**:
- `id` (string, required): Resource UUID

#### Response

**Success (200 OK)**:
```json
{
  "id": "8a7b5c3d-1234-5678-90ab-cdef12345678",
  "title": "Advanced Django Patterns",
  "description": "A comprehensive guide...",
  "author_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "author_email": "author@example.com",
  "visibility": "public",
  "price_cents": null,
  "tags": [...],
  "versions": [...],
  "created_at": "2026-01-15T09:00:00Z",
  "updated_at": "2026-01-20T10:30:00Z"
}
```

---

### Create Resource

**Endpoint**: `POST /api/admin/resources/`  
**Authentication**: Required (IsAdmin)  
**Description**: Create a new resource for a specified user

#### Request

**Headers**:
```http
Content-Type: application/json
Authorization: Bearer <token>
```

**Body**:
```json
{
  "author_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "title": "New Resource Title",
  "description": "Resource description",
  "visibility": "public",
  "price_cents": 999,
  "tag_ids": ["3fa85f64-5717-4562-b3fc-2c963f66afa6"]
}
```

**Field Descriptions**:
- `author_id` (string, required): UUID of the user who will own this resource
- `title` (string, required): Resource title (max 200 characters)
- `description` (string, required): Resource description
- `visibility` (string, required): One of `public`, `premium`, `private`
- `price_cents` (integer, optional): Price in cents (null for free resources)
- `tag_ids` (array, optional): Array of tag UUIDs

#### Response

**Success (201 Created)**:
```json
{
  "status": "ok",
  "data": {
    "resource_id": "8a7b5c3d-1234-5678-90ab-cdef12345678",
    "title": "New Resource Title",
    "author_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  }
}
```

---

### Update Resource

**Endpoint**: `PATCH /api/admin/resources/{id}/`  
**Authentication**: Required (IsAdmin)  
**Description**: Update resource properties (title, description, price, visibility, tags)

#### Request

**Headers**:
```http
Content-Type: application/json
Authorization: Bearer <token>
```

**URL Parameters**:
- `id` (string, required): Resource UUID

**Body** (all fields optional):
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "visibility": "premium",
  "price_cents": 1999,
  "tag_ids": ["3fa85f64-5717-4562-b3fc-2c963f66afa6"]
}
```

#### Response

**Success (200 OK)**:
```json
{
  "status": "ok",
  "data": {
    "resource_id": "8a7b5c3d-1234-5678-90ab-cdef12345678",
    "title": "Updated Title",
    "updated_fields": ["title", "description", "visibility"]
  }
}
```

---

### Delete Resource

**Endpoint**: `DELETE /api/admin/resources/{id}/`  
**Authentication**: Required (IsAdmin)  
**Description**: Soft delete a resource

#### Request

**Headers**:
```http
Authorization: Bearer <token>
```

**URL Parameters**:
- `id` (string, required): Resource UUID

#### Response

**Success (200 OK)**:
```json
{
  "status": "ok",
  "data": {
    "message": "Resource deleted successfully"
  }
}
```

---

### Add Resource Version

**Endpoint**: `POST /api/admin/resources/{id}/versions/`  
**Authentication**: Required (IsAdmin)  
**Description**: Add a new version to a resource (bypasses author permission check)

#### Request

**Headers**:
```http
Content-Type: application/json
Authorization: Bearer <token>
```

**URL Parameters**:
- `id` (string, required): Resource UUID

**Body**:
```json
{
  "file_url": "https://cdn.ressourcefy.com/files/resource-v3.pdf"
}
```

**Field Descriptions**:
- `file_url` (string, required): Valid URL to the file

#### Response

**Success (201 Created)**:
```json
{
  "status": "ok",
  "data": {
    "resource_id": "8a7b5c3d-1234-5678-90ab-cdef12345678",
    "version_number": 3,
    "file_url": "https://cdn.ressourcefy.com/files/resource-v3.pdf"
  }
}
```

#### JavaScript Example
```javascript
async function addResourceVersion(resourceId, fileUrl) {
  const response = await fetch(
    `http://localhost:8000/api/admin/resources/${resourceId}/versions/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({ file_url: fileUrl })
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to add version');
  }
  
  return await response.json();
}
```

---

## Admin Subscription Management

### List Subscriptions

**Endpoint**: `GET /api/admin/subscriptions/`  
**Authentication**: Required (IsAdmin)  
**Description**: List all subscriptions with optional filters

#### Request

**Headers**:
```http
Authorization: Bearer <token>
```

**Query Parameters**:
- `user_id` (string, optional): Filter by user UUID
- `status` (string, optional): Filter by status (`active`, `canceled`, `past_due`, etc.)
- `plan` (string, optional): Filter by plan (`free`, `premium`, etc.)
- `page` (integer, optional, default: 1): Page number
- `page_size` (integer, optional, default: 20): Items per page

#### Response

**Success (200 OK)**:
```json
{
  "count": 50,
  "next": "http://localhost:8000/api/admin/subscriptions/?page=2",
  "previous": null,
  "results": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "user": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "user_email": "user@example.com",
      "plan": "premium",
      "status": "active",
      "started_at": "2026-01-01T00:00:00Z",
      "ends_at": null,
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-01-01T00:00:00Z"
    }
  ]
}
```

---

### Get Subscription Details

**Endpoint**: `GET /api/admin/subscriptions/{id}/`  
**Authentication**: Required (IsAdmin)  
**Description**: Get detailed information about a specific subscription

#### Request

**Headers**:
```http
Authorization: Bearer <token>
```

**URL Parameters**:
- `id` (string, required): Subscription UUID

#### Response

**Success (200 OK)**:
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "user": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "user_email": "user@example.com",
  "plan": "premium",
  "status": "active",
  "started_at": "2026-01-01T00:00:00Z",
  "ends_at": null,
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T00:00:00Z"
}
```

---

### Update Subscription

**Endpoint**: `PATCH /api/admin/subscriptions/{id}/`  
**Authentication**: Required (IsAdmin)  
**Description**: Update subscription properties (plan, status, ends_at)

#### Request

**Headers**:
```http
Content-Type: application/json
Authorization: Bearer <token>
```

**URL Parameters**:
- `id` (string, required): Subscription UUID

**Body** (all fields optional):
```json
{
  "plan": "premium",
  "status": "active",
  "ends_at": "2026-12-31T23:59:59Z"
}
```

**Field Descriptions**:
- `plan` (string, optional): Subscription plan (`free`, `premium`, etc.)
- `status` (string, optional): Subscription status (`active`, `canceled`, `past_due`, etc.)
- `ends_at` (string, optional): ISO 8601 datetime string for subscription end date (null for no end date)

#### Response

**Success (200 OK)**:
```json
{
  "status": "ok",
  "data": {
    "subscription_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "status": "active",
    "plan": "premium"
  }
}
```

---

### Cancel Subscription

**Endpoint**: `POST /api/admin/subscriptions/{id}/cancel/`  
**Authentication**: Required (IsAdmin)  
**Description**: Cancel a subscription. Sets status to `canceled` and updates `ends_at`.

#### Request

**Headers**:
```http
Authorization: Bearer <token>
```

**URL Parameters**:
- `id` (string, required): Subscription UUID

**Body**: Empty (no body required)

#### Response

**Success (200 OK)**:
```json
{
  "status": "ok",
  "data": {
    "message": "Subscription canceled successfully"
  }
}
```

**Error (400 Bad Request)** - Already canceled:
```json
{
  "error": {
    "code": "invalid_action",
    "message": "Subscription is already canceled"
  }
}
```

#### JavaScript Example
```javascript
async function cancelSubscription(subscriptionId) {
  const response = await fetch(
    `http://localhost:8000/api/admin/subscriptions/${subscriptionId}/cancel/`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to cancel subscription');
  }
  
  return await response.json();
}
```

---

## Admin Payment Management

### List Payments

**Endpoint**: `GET /api/admin/payments/`  
**Authentication**: Required (IsAdmin)  
**Description**: List all payments with optional filters

#### Request

**Headers**:
```http
Authorization: Bearer <token>
```

**Query Parameters**:
- `user_id` (string, optional): Filter by user UUID
- `status` (string, optional): Filter by status (`completed`, `pending`, `failed`, `refunded`)
- `page` (integer, optional, default: 1): Page number
- `page_size` (integer, optional, default: 20): Items per page

#### Response

**Success (200 OK)**:
```json
{
  "count": 100,
  "next": "http://localhost:8000/api/admin/payments/?page=2",
  "previous": null,
  "results": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "user_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "user_email": "user@example.com",
      "amount_cents": 999,
      "currency": "usd",
      "status": "completed",
      "provider_reference": "pi_1234567890",
      "created_at": "2026-01-25T12:00:00Z"
    }
  ]
}
```

---

### Get Payment Details

**Endpoint**: `GET /api/admin/payments/{id}/`  
**Authentication**: Required (IsAdmin)  
**Description**: Get detailed information about a specific payment

#### Request

**Headers**:
```http
Authorization: Bearer <token>
```

**URL Parameters**:
- `id` (string, required): Payment UUID

#### Response

**Success (200 OK)**:
```json
{
  "status": "ok",
  "data": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "user_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "user_email": "user@example.com",
    "amount_cents": 999,
    "currency": "usd",
    "status": "completed",
    "provider_reference": "pi_1234567890",
    "created_at": "2026-01-25T12:00:00Z",
    "updated_at": "2026-01-25T12:00:00Z"
  }
}
```

---

### Refund Payment

**Endpoint**: `POST /api/admin/payments/{id}/refund/`  
**Authentication**: Required (IsAdmin)  
**Description**: Refund a payment (full or partial). Processes refund via Stripe.

#### Request

**Headers**:
```http
Content-Type: application/json
Authorization: Bearer <token>
```

**URL Parameters**:
- `id` (string, required): Payment UUID

**Body** (optional):
```json
{
  "amount_cents": 500
}
```

**Field Descriptions**:
- `amount_cents` (integer, optional): Partial refund amount in cents. If omitted, full refund is processed.

#### Response

**Success (200 OK)**:
```json
{
  "status": "ok",
  "data": {
    "message": "Payment refunded successfully",
    "refund_amount_cents": 500
  }
}
```

**Error (400 Bad Request)** - Payment already refunded:
```json
{
  "error": {
    "code": "invalid_action",
    "message": "Payment is already refunded"
  }
}
```

**Error (400 Bad Request)** - Payment not completed:
```json
{
  "error": {
    "code": "invalid_action",
    "message": "Payment is not in a 'completed' state and cannot be refunded"
  }
}
```

#### JavaScript Example
```javascript
async function refundPayment(paymentId, amountCents = null) {
  const body = amountCents ? { amount_cents: amountCents } : {};
  
  const response = await fetch(
    `http://localhost:8000/api/admin/payments/${paymentId}/refund/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(body)
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Refund failed');
  }
  
  return await response.json();
}
```

---

## Admin Dashboard

### Get Dashboard Overview

**Endpoint**: `GET /api/admin/dashboard/overview/`  
**Authentication**: Required (IsAdmin)  
**Description**: Get overview statistics for the admin dashboard (read-only)

#### Request

**Headers**:
```http
Authorization: Bearer <token>
```

#### Response

**Success (200 OK)**:
```json
{
  "status": "ok",
  "data": {
    "total_users": 1000,
    "active_users": 850,
    "total_resources": 500,
    "public_resources": 400,
    "premium_resources": 100,
    "total_subscriptions": 200,
    "active_premium_subscriptions": 180,
    "total_revenue_usd": 50000.00
  }
}
```

#### JavaScript Example
```javascript
async function getDashboardOverview() {
  const response = await fetch(
    'http://localhost:8000/api/admin/dashboard/overview/',
    {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    }
  );
  
  return await response.json();
}
```

---

### Get Dashboard Activity

**Endpoint**: `GET /api/admin/dashboard/activity/`  
**Authentication**: Required (IsAdmin)  
**Description**: Get recent activity feed (audit logs)

#### Request

**Headers**:
```http
Authorization: Bearer <token>
```

**Query Parameters**:
- `limit` (integer, optional, default: 50, max: 100): Maximum number of activities to return

#### Response

**Success (200 OK)**:
```json
{
  "status": "ok",
  "data": {
    "activities": [
      {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "timestamp": "2026-01-25T14:30:00Z",
        "actor_email": "admin@example.com",
        "action": "UPDATE",
        "entity_name": "Resource",
        "object_id": "8a7b5c3d-1234-5678-90ab-cdef12345678",
        "description": "admin@example.com UPDATE Resource 8a7b5c3d-1234-5678-90ab-cdef12345678"
      }
    ],
    "count": 1
  }
}
```

---

### Get System Health

**Endpoint**: `GET /api/admin/dashboard/system-health/`  
**Authentication**: Required (IsAdmin)  
**Description**: Get system health metrics (database, outbox, etc.)

#### Request

**Headers**:
```http
Authorization: Bearer <token>
```

#### Response

**Success (200 OK)**:
```json
{
  "status": "ok",
  "data": {
    "db_status": "ok",
    "outbox_pending_events": 5,
    "outbox_failed_events": 0,
    "last_outbox_processed_at": "2026-01-25T14:30:00Z"
  }
}
```

---

**Last Updated**: 2026-01-25  
**API Version**: 1.2  
**Support**: For questions, contact the backend team or refer to `docs/all_features.md`
