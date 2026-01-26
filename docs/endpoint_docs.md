# Ressourcefy API Documentation for Frontend Developers

**Base URL**: `http://localhost:8000/api/` (development)  
**Base URL**: `https://api.ressourcefy.com/api/` (production)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Command Endpoints (Write Operations)](#command-endpoints)
   - [Vote on Comment](#vote-on-comment)
   - [Create Resource Version](#create-resource-version)
   - [Access Resource](#access-resource)
   - [Create Checkout Session](#create-checkout-session)
3. [Query Endpoints (Read Operations)](#query-endpoints)
   - [Get Resource Feed](#get-resource-feed)
   - [Get Resource Detail](#get-resource-detail)
   - [Get Author Profile](#get-author-profile)
4. [Webhook Endpoints](#webhook-endpoints)
   - [Stripe Webhook](#stripe-webhook)
5. [Health Endpoints](#health-endpoints)
6. [Error Handling](#error-handling)
7. [Frontend Integration Examples](#frontend-integration-examples)

---

## Authentication

The Ressourcefy API uses **JWT (JSON Web Tokens)** for authentication. Users must register, verify their email, and then login to receive access tokens.

### Authentication Flow

1. **Register** → `POST /auth/register/`
2. **Verify Email** → `POST /auth/activate/` (with token from email)
3. **Login** → `POST /auth/login/` (receive JWT tokens)
4. **Use API** → Include `Authorization: Bearer <access_token>` header

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
      "username": "john_doe"
    }
  }
}
```

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
    body: JSON.stringify({ email, password })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message || 'Login failed');
  }
  
  const data = await response.json();
  
  // Store tokens
  localStorage.setItem('authToken', data.data.access_token);
  localStorage.setItem('refreshToken', data.data.refresh_token);
  localStorage.setItem('user', JSON.stringify(data.data.user));
  
  return data.data;
}

// Usage
try {
  const userData = await login('user@example.com', 'SecurePassword123!');
  console.log('Logged in as:', userData.user.username);
  window.location.href = '/dashboard';
} catch (error) {
  console.error('Login error:', error.message);
}
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

## Command Endpoints (Write Operations)

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

**Endpoint**: `POST /api/resources/<resource_id>/`  
**Authentication**: Required  
**Description**: Request access to a resource (checks permissions and returns access URL)

#### Request

**Headers**:
```http
Authorization: Bearer <token>
```

**URL Parameters**:
- `resource_id` (string, required): UUID of the resource in the URL path

**Body**: Empty (no body required)

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
curl -X POST http://localhost:8000/api/resources/8a7b5c3d-1234-5678-90ab-cdef12345678/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### JavaScript Fetch Example
```javascript
async function accessResource(resourceId) {
  const response = await fetch(`http://localhost:8000/api/resources/${resourceId}/`, {
    method: 'POST',
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
        "comment_count": 15
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
        "comment_count": 42
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
- `stats.comment_count`: Number of comments on this resource
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

**Last Updated**: 2026-01-25  
**API Version**: 1.0  
**Support**: For questions, contact the backend team or refer to `docs/all_features.md`
