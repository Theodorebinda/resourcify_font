# Ressourcefy Backend - Complete Architecture Documentation

> **Purpose**: This document provides a complete reference for the Ressourcefy backend architecture, enabling reproduction of the entire system from scratch.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Principles](#architecture-principles)
4. [Domain Models](#domain-models)
5. [Application Layers](#application-layers)
6. [API Endpoints](#api-endpoints)
7. [Business Logic & Use Cases](#business-logic--use-cases)
8. [Payment Integration](#payment-integration)
9. [Async Processing](#async-processing)
10. [Observability](#observability)
11. [Setup & Deployment](#setup--deployment)
12. [Testing Strategy](#testing-strategy)

---

## 1. Project Overview

**Ressourcefy** is a Django-based SaaS platform for sharing and monetizing educational resources. The backend implements a strict layered architecture following Domain-Driven Design (DDD) principles.

### Core Features
- User management with profiles and interests
- Resource publishing with versioning
- Social interactions (comments, votes)
- Premium subscriptions via Stripe
- Transactional outbox for reliable event processing
- Optimized read models for high-traffic endpoints

---

## 2. Technology Stack

```
Core Framework: Django 6.0.1
API Layer: Django REST Framework 3.14.0
Payments: Stripe SDK 7.13.0
Database: PostgreSQL (recommended for production)
Logging: python-json-logger 3.2.1
```

### Key Dependencies
```
# requirements.txt
asgiref==3.11.0
Django==6.0.1
sqlparse==0.5.5
djangorestframework==3.14.0
stripe==7.13.0
python-json-logger==3.2.1
djangorestframework-simplejwt==5.3.1
itsdangerous==2.2.0
django-cors-headers==4.3.1
resend==2.1.0  # Optional: for production email sending
```

---

## 3. Architecture Principles

### Layered Architecture (Strict Separation)

```
┌──────────────────────────────────────┐
│  API Layer (DRF Views/Serializers)   │  ← HTTP Interface
├──────────────────────────────────────┤
│  Application Layer (Use Cases)       │  ← Business Orchestration
├──────────────────────────────────────┤
│  Domain Layer (Services/Policies)    │  ← Core Business Logic
├──────────────────────────────────────┤
│  Infrastructure (Models/DB)          │  ← Data Persistence
└──────────────────────────────────────┘
```

### Key Principles
1. **Write/Read Separation**: Separate models for commands vs queries
2. **Immutability**: Critical data (Payments, Versions) cannot be modified
3. **Transactionality**: Outbox pattern ensures reliable event delivery
4. **Testability**: Each layer is independently testable
5. **No ORM Leakage**: API layer never exposes Django models directly

---

## 4. Domain Models

### 4.1 Core App (`core/`)

**BaseModel** (Abstract)
```python
- id: UUID (primary key)
- created_at: DateTime
- updated_at: DateTime
```

**SoftDeleteModel** (Abstract)
```python
- deleted_at: DateTime (nullable)
Methods: delete(), restore()
Manager: SoftDeleteManager with .active(), .deleted()
```

**Tag** (extends SoftDeleteModel)
```python
- name: CharField(50)
- slug: SlugField(unique)
- deleted_at: DateTime (nullable) - from SoftDeleteModel

Managers:
  - objects: SoftDeleteManager (filters out soft-deleted by default)
  - all_objects: Manager (includes soft-deleted)

Methods:
  - delete() - Soft delete (sets deleted_at)
  - restore() - Restore soft-deleted tag
```

**OutboxEvent** (Critical for Reliability)
```python
- aggregate_type: CharField (e.g., "PAYMENT")
- aggregate_id: CharField
- event_type: CharField (e.g., "billing.payment_completed")
- payload: JSONField
- status: TextChoices (PENDING, PROCESSING, COMPLETED, FAILED)
- retry_count: PositiveIntegerField
- next_retry_at: DateTime
- processed_at: DateTime (nullable)
- error_message: TextField
```

### 4.2 Users App (`users/`)

**User** (extends AbstractBaseUser)
```python
- email: EmailField (unique, username)
- auth_provider: TextChoices (LOCAL, GOOGLE)
- is_staff: Boolean
- is_active: Boolean
- is_activated: Boolean (email verification flag)
- onboarding_step: TextChoices (NOT_STARTED, PROFILE, INTERESTS, COMPLETED)
- role: TextChoices (SUPERADMIN, ADMIN, MODERATOR, CONTRIBUTOR, USER)

Methods:
  get_onboarding_step() → Calculates current onboarding step based on profile/interests progress
  is_admin_role → Boolean property (ADMIN or SUPERADMIN)
  is_superadmin_role → Boolean property (SUPERADMIN only)
```

**Profile** (OneToOne with User)
```python
- username: CharField(50, unique)
- bio: TextField
- avatar_url: URLField (nullable)
```

**UserInterest** (Tags)
```python
- user: ForeignKey(User)
- tag: ForeignKey(Tag)
Constraint: Unique(user, tag)
```

### 4.3 Resources App (`resources/`)

**Resource**
```python
- title: CharField(200)
- description: TextField
- visibility: TextChoices (PUBLIC, PREMIUM, PRIVATE)
- price_cents: PositiveIntegerField (nullable)
- author: ForeignKey(User)
- tags: ManyToManyField(Tag)

QuerySet Methods:
  .published() → public resources
  .visible_for(user) → filtered by access
  .priced() → only paid resources
```

**ResourceVersion** (Immutable)
```python
- resource: ForeignKey(Resource)
- version_number: PositiveIntegerField
- file_url: URLField
Constraint: Unique(resource, version_number)
Immutability: file_url and version_number cannot be changed after creation
```

### 4.4 Interactions App (`interactions/`)

**Comment**
```python
- resource: ForeignKey(Resource)
- author: ForeignKey(User)
- content: TextField
- parent: ForeignKey('self', nullable) - for nested comments
```

**CommentVote**
```python
- comment: ForeignKey(Comment)
- user: ForeignKey(User)
- value: SmallIntegerField (choices: +1, -1)
Constraint: Unique(user, comment)
```

### 4.5 Monetization App (`monetization/`)

**Subscription**
```python
- user: ForeignKey(User)
- plan: TextChoices (FREE, PREMIUM)
- status: TextChoices (ACTIVE, CANCELED, EXPIRED)
- started_at: DateTime
- ends_at: DateTime (nullable)
```

**Payment** (Immutable)
```python
- user: ForeignKey(User)
- amount_cents: PositiveIntegerField
- currency: CharField(3, default='USD')
- provider_reference: CharField(100, unique)
- status: TextChoices (PENDING, COMPLETED, FAILED, REFUNDED)
Immutability: amount_cents and currency are immutable after creation
```

**PaymentIntentRecord** (Stripe Link)
```python
- user: ForeignKey(User)
- stripe_session_id: CharField(255, unique)
- status: TextChoices (CREATED, COMPLETED, EXPIRED)
- metadata: JSONField
```

**WebhookEvent** (Stripe Audit)
```python
- stripe_id: CharField(255, unique) - for idempotency
- event_type: CharField(100)
- payload: JSONField
- status: TextChoices (PENDING, PROCESSED, FAILED)
- processed_at: DateTime (nullable)
- error_message: TextField
```

### 4.6 Analytics App (`analytics/`)

**UserEvent** (High-Volume Tracking)
```python
- user: ForeignKey(User, nullable)
- event_type: CharField(100)
- event_data: JSONField
- session_id: CharField(100, nullable)
- ip_address: GenericIPAddressField (nullable)
- user_agent: CharField(500, nullable)
```

### 4.7 Audit App (`audit/`)

**AuditLog** (Change Tracking)
```python
- content_type: ForeignKey(ContentType, nullable) - Generic relation
- object_id: CharField(255) - Supports UUIDs
- content_object: GenericForeignKey - Points to any model instance
- entity_name: CharField(100) - Human-readable entity name
- action: TextChoices (CREATE, UPDATE, DELETE)
- actor: ForeignKey(User, nullable) - User who performed the action
- before_state: JSONField (nullable) - State before change
- after_state: JSONField (nullable) - State after change
- created_at: DateTime (auto_now_add)

Usage:
  Use core.services.audit.audit_change() helper function
  Never use AuditLog.objects.create() directly
```

---

## 5. Application Layers

### 5.1 Domain Services (`*/services/`)

**Purpose**: Encapsulate complex domain logic with transaction safety.

**Example: `resources/services/create_resource_version.py`**
```python
@transaction.atomic
def create_resource_version(resource: Resource, file_url: str) -> ResourceVersion:
    # Get lock on resource
    resource = Resource.objects.select_for_update().get(pk=resource.pk)
    
    # Get next version number
    latest = resource.versions.order_by('-version_number').first()
    next_version = (latest.version_number + 1) if latest else 1
    
    # Create version
    version = ResourceVersion.objects.create(
        resource=resource,
        version_number=next_version,
        file_url=file_url
    )
    return version
```

**Admin Domain Services**:

**Tag Management** (`core/services/admin_tags.py`):
```python
@transaction.atomic
def create_tag_admin(actor, name: str) -> Tag:
    """Creates a new tag with unique name validation and auto-slug generation."""
    # Validates uniqueness, creates tag, audits, emits event
    pass

@transaction.atomic
def update_tag_admin(actor, tag_id: str, name: str) -> Tag:
    """Updates tag name and slug, validates uniqueness."""
    pass

@transaction.atomic
def delete_tag_admin(actor, tag_id: str):
    """Soft deletes tag if in use, hard deletes if unused."""
    pass

@transaction.atomic
def merge_tags_admin(actor, source_tag_id: str, target_tag_id: str):
    """Merges source tag into target, moves all associations, soft deletes source."""
    pass
```

**Resource Management** (`resources/services/admin_resources.py`):
```python
@transaction.atomic
def create_resource_admin(actor, author_id: str, title: str, ...) -> Resource:
    """Admin creates resource for specified author."""
    pass

@transaction.atomic
def update_resource_admin(actor, resource_id: str, ...) -> Resource:
    """Admin updates resource properties."""
    pass

@transaction.atomic
def delete_resource_admin(actor, resource_id: str):
    """Admin soft deletes resource."""
    pass

@transaction.atomic
def add_resource_version_admin(actor, resource_id: str, file_url: str) -> ResourceVersion:
    """Admin adds version, bypasses author permission check."""
    pass
```

**User Management** (`users/services/admin_users.py`):
```python
@transaction.atomic
def impersonate_user_admin(actor, target_user_id: str) -> dict:
    """SUPERADMIN impersonates user, returns JWT tokens."""
    # Generates tokens, audits, emits event
    pass

@transaction.atomic
def reset_user_password_admin(actor, user_id: str):
    """Admin resets user password, sends email with new password."""
    pass

def get_user_activity(user_id: str, limit: int = 50) -> List[dict]:
    """Returns user activity history (audit logs + analytics)."""
    pass
```

**Subscription Management** (`monetization/services/admin_subscriptions.py`):
```python
@transaction.atomic
def update_subscription_admin(actor, subscription_id: str, ...) -> Subscription:
    """Admin updates subscription properties."""
    pass

@transaction.atomic
def cancel_subscription_admin(actor, subscription_id: str):
    """Admin cancels subscription, updates Stripe if needed."""
    pass

@transaction.atomic
def refund_payment_admin(actor, payment_id: str, amount_cents: Optional[int] = None):
    """Admin refunds payment (full or partial), processes via Stripe."""
    pass
```

**All admin services**:
- Wrapped in `@transaction.atomic` for data consistency
- Use `audit_change()` for audit logging
- Emit OutboxEvents for critical actions
- Validate business invariants
- Raise domain exceptions (NotFoundError, InvalidAction, etc.)

### 5.2 Application Layer (`application/`)

**Structure**:
```
application/
├── dto/
│   ├── commands.py           # Immutable command DTOs
│   └── admin_commands.py     # Admin-specific command DTOs
├── policies/
│   ├── resource_policy.py
│   ├── comment_policy.py
│   └── admin_policy.py       # Admin access policies
├── use_cases/
│   ├── vote_on_comment.py
│   ├── create_resource_version.py
│   ├── access_resource.py
│   ├── create_checkout_session.py
│   ├── handle_stripe_webhook.py
│   ├── auth/
│   │   ├── register_user.py
│   │   ├── activate_user.py
│   │   ├── authenticate_user.py
│   │   ├── resend_activation.py
│   │   ├── request_password_reset.py
│   │   └── confirm_password_reset.py
│   └── admin/
│       ├── manage_tags.py
│       ├── manage_resources.py
│       ├── manage_users_extended.py
│       └── manage_pricing.py
├── services/
│   └── stripe_service.py
└── exceptions.py
```

**DTOs (Data Transfer Objects)**
```python
# application/dto/commands.py
from dataclasses import dataclass

@dataclass(frozen=True)
class VoteOnCommentCommand:
    user: object
    comment_id: str
    vote_value: int  # +1 or -1

@dataclass(frozen=True)
class CreateCheckoutSessionCommand:
    user: object
    price_id: str
    success_url: str
    cancel_url: str
```

**Policies (Access Control)**
```python
# application/policies/resource_policy.py

def can_access_resource(user, resource) -> bool:
    if resource.visibility == 'public':
        return True
    if resource.visibility == 'private':
        return resource.author == user
    if resource.visibility == 'premium':
        return has_active_subscription(user)
    return False

def has_active_subscription(user) -> bool:
    return Subscription.objects.filter(
        user=user,
        status='active',
        plan='premium'
    ).exists()
```

**Use Cases (Orchestration)**
```python
# application/use_cases/vote_on_comment.py

class VoteOnComment:
    def execute(self, command: VoteOnCommentCommand):
        # Load entities
        comment = Comment.objects.get(pk=command.comment_id)
        
        # Check policy
        if not can_vote_on_comment(command.user, comment):
            raise AccessDenied("Cannot vote on this comment")
        
        # Execute domain service
        vote = vote_comment(
            user=command.user,
            comment=comment,
            value=command.vote_value
        )
        
        return vote
```

### 5.3 Read Models Layer (`read_models/`)

**Purpose**: Optimized queries for high-traffic read endpoints.

**Structure**:
```
read_models/
├── resources/
│   ├── resource_feed.py
│   └── resource_detail.py
└── users/
    └── author_profile.py
```

**Example: Resource Feed**
```python
# read_models/resources/resource_feed.py

def get_resource_feed(page=1, page_size=20) -> List[FeedItem]:
    offset = (page - 1) * page_size
    
    queryset = Resource.objects.published().select_related(
        'author', 'author__profile'
    ).prefetch_related(
        'tags'
    ).annotate(
        comment_count=Count('comments')
    ).order_by('-created_at')[offset:offset+page_size]
    
    results = []
    for res in queryset:
        results.append(FeedItem(
            id=str(res.id),
            title=res.title,
            author_name=res.author.profile.username,
            tags=[t.name for t in res.tags.all()],
            stats=FeedItemStats(comment_count=res.comment_count)
        ))
    
    return results
```

**Performance**:
- Feed query: 2 queries constant (Main + Tags prefetch)
- Detail query: 3 queries constant (Main + Tags + Versions)
- No N+1 problems

---

## 6. API Endpoints

### 6.1 Command Endpoints (Write)

**Vote on Comment**
```
POST /api/comments/vote/
Body: {
  "comment_id": "uuid",
  "vote_value": 1  // or -1
}
Response: {
  "status": "ok",
  "data": {"vote_id": "uuid", "value": 1}
}
```

**Create Resource Version**
```
POST /api/resources/versions/
Body: {
  "resource_id": "uuid",
  "file_url": "https://..."
}
Response: {
  "status": "ok",
  "data": {"version": 2, "url": "https://..."}
}
```

**Create Checkout Session**
```
POST /api/billing/checkout/
Body: {
  "price_id": "price_xxx",
  "success_url": "https://...",
  "cancel_url": "https://..."
}
Response: {
  "status": "ok",
  "data": {"sessionId": "cs_xxx"}
}
```

**Stripe Webhook**
```
POST /api/billing/webhook/
Headers: Stripe-Signature: xxx
Body: <raw Stripe payload>
Response: {"status": "received"}
```

**Authentication Endpoints**
```
POST /api/auth/register/        # Register new user
POST /api/auth/activate/        # Verify email (token from URL or body)
POST /api/auth/resend-activation/  # Resend activation email
POST /api/auth/login/            # Get JWT tokens (includes onboarding_step + HTTP cookies)
POST /api/auth/logout/           # Logout and clear HTTP cookies
POST /api/auth/password-reset/   # Request reset link
POST /api/auth/password-reset/confirm/  # Confirm reset
```

**Onboarding Endpoints**
```
GET  /api/onboarding/status/     # Get current onboarding state (read-only, no mutation)
POST /api/onboarding/start/      # Start onboarding (not_started → profile)
POST /api/onboarding/profile/    # Submit profile (profile → interests)
POST /api/onboarding/interests/  # Submit interests (interests → completed)
```

**Admin Endpoints** (Role-based access control)
```
GET    /api/admin/users/              # List all users (IsAdmin required)
GET    /api/admin/users/{id}/         # Get user details (IsAdmin required)
POST   /api/admin/users/              # Create user (IsAdmin required)
PATCH  /api/admin/users/{id}/        # Update user (IsAdmin required, role field protected)
DELETE /api/admin/users/{id}/        # Delete user (soft delete, IsAdmin required)
POST   /api/admin/users/{id}/set_role/  # Change user role (IsSuperAdmin only)
```

**Onboarding Flow** (strict step order, server-enforced):
```
not_started
  ↓ POST /onboarding/start/
profile
  ↓ POST /onboarding/profile/
interests
  ↓ POST /onboarding/interests/
completed
```

**Important Notes**:
- Each step transition is explicit and server-enforced
- `POST /onboarding/profile/` CANNOT be called until `POST /onboarding/start/` has been executed
- `POST /onboarding/interests/` CANNOT be called until `POST /onboarding/profile/` has been executed
- Steps cannot be skipped - attempting to call a step out of order returns `403 invalid_onboarding_step`

**Login Response Example**
```json
{
  "status": "ok",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "username",
      "activated": true,
      "onboarding_step": "not_started" | "profile" | "interests" | "completed"
    }
  }
}
```

### 6.2 Query Endpoints (Read)

**Resource Feed**
```
GET /api/feed/?page=1&page_size=20
Response: {
  "data": [
    {
      "id": "uuid",
      "title": "...",
      "author_name": "...",
      "tags": ["python", "django"],
      "stats": {"comment_count": 5}
    }
  ]
}
```

**Resource Detail**
```
GET /api/resources/{id}/detail/
Response: {
  "data": {
    "id": "uuid",
    "title": "...",
    "description": "...",
    "versions": [
      {"version_number": 1, "file_url": "..."}
    ]
  }
}
```

**Author Profile**
```
GET /api/authors/{user_id}/
Response: {
  "data": {
    "id": "uuid",
    "username": "...",
    "stats": {"total_resources": 10},
    "recent_resources": [...]
  }
}
```

**Current User**
```
GET /api/user/me/  # Requires JWT authentication
Response: {
  "status": "ok",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username" | null,
    "bio": "User biography" | null,
    "avatar_url": "https://..." | null,
    "activated": true,
    "onboarding_step": "not_started" | "profile" | "interests" | "completed",
    "createdAt": "2026-01-25T12:00:00Z"
  }
}

Note:
  - Profile fields (username, bio, avatar_url) are provided for UI pre-filling
  - These fields come from the Profile model (OneToOne with User)
  - If Profile doesn't exist, these fields will be null (no error)
  - Profile modification is handled exclusively by onboarding endpoints:
    * POST /onboarding/start/ (transitions not_started → profile)
    * POST /onboarding/profile/ (creates/updates Profile, transitions profile → interests)
  - This endpoint is READ-ONLY - it does not modify any data
```

### 6.3 Admin Endpoints

**User Management** (`/api/admin/users/`)
```
GET    /api/admin/users/                    # List all users (paginated, with filters)
GET    /api/admin/users/{id}/               # Get user details
POST   /api/admin/users/                    # Create new user
PATCH  /api/admin/users/{id}/               # Update user (role field protected)
DELETE /api/admin/users/{id}/               # Soft delete user
POST   /api/admin/users/{id}/set_role/      # Change user role (SUPERADMIN only)
GET    /api/admin/users/{id}/activity/       # Get user activity history
POST   /api/admin/users/{id}/impersonate/    # Impersonate user (SUPERADMIN only)
POST   /api/admin/users/{id}/reset_password/ # Reset user password (sends email)
```

**Query Parameters for List**:
- `role`: Filter by role (SUPERADMIN, ADMIN, MODERATOR, CONTRIBUTOR, USER)
- `activated`: Filter by activation status (`true`/`false`)
- `is_active`: Filter by active status (`true`/`false`)
- `search`: Search by email (case-insensitive)
- `page`: Page number
- `page_size`: Items per page

**Tag Management** (`/api/admin/tags/`)
```
GET    /api/admin/tags/              # List all tags (with search, includes soft-deleted)
GET    /api/admin/tags/{id}/         # Get tag details
POST   /api/admin/tags/              # Create tag (unique name, auto-slug)
PATCH  /api/admin/tags/{id}/         # Update tag (rename, slug auto-updated)
DELETE /api/admin/tags/{id}/        # Soft delete tag (if in use)
POST   /api/admin/tags/merge/        # Merge two tags (source → target)
```

**Resource Management** (`/api/admin/resources/`)
```
GET    /api/admin/resources/                # List all resources (advanced filters)
GET    /api/admin/resources/{id}/           # Get resource details (with versions)
POST   /api/admin/resources/                # Create resource for a user
PATCH  /api/admin/resources/{id}/          # Update resource (title, description, price, visibility, tags)
DELETE /api/admin/resources/{id}/          # Soft delete resource
POST   /api/admin/resources/{id}/versions/  # Add version (bypasses author check)
```

**Query Parameters for Resource List**:
- `author_id`: Filter by author UUID
- `visibility`: Filter by visibility (`public`, `premium`, `private`)
- `has_price`: Filter by price (`true`/`false`)
- `search`: Search by title (case-insensitive)
- `tag_ids`: Filter by tag IDs (multiple allowed)
- `include_deleted`: Include soft-deleted resources (`true`/`false`)

**Subscription Management** (`/api/admin/subscriptions/`)
```
GET    /api/admin/subscriptions/            # List all subscriptions (with filters)
GET    /api/admin/subscriptions/{id}/       # Get subscription details
PATCH  /api/admin/subscriptions/{id}/       # Update subscription (plan, status, ends_at)
POST   /api/admin/subscriptions/{id}/cancel/ # Cancel subscription
```

**Query Parameters for Subscription List**:
- `user_id`: Filter by user UUID
- `status`: Filter by status (`active`, `canceled`, `past_due`, etc.)
- `plan`: Filter by plan (`free`, `premium`, etc.)

**Payment Management** (`/api/admin/payments/`)
```
GET    /api/admin/payments/            # List all payments (with filters)
GET    /api/admin/payments/{id}/       # Get payment details
POST   /api/admin/payments/{id}/refund/ # Refund payment (full or partial)
```

**Query Parameters for Payment List**:
- `user_id`: Filter by user UUID
- `status`: Filter by status (`completed`, `pending`, `failed`, `refunded`)

**Dashboard** (`/api/admin/dashboard/`)
```
GET    /api/admin/dashboard/overview/      # Overview statistics (read-only)
GET    /api/admin/dashboard/activity/      # Recent activity feed (audit logs)
GET    /api/admin/dashboard/system-health/ # System health metrics (DB, Outbox)
```

**Permissions**:
- All operations require `IsAdmin` permission
- `set_role` and `impersonate` actions require `IsSuperAdmin` permission
- Role field cannot be modified via PATCH (use `set_role` action)
- All admin mutations are audited via AuditLog
- All critical actions emit OutboxEvents

**Response Format** (Standard):
```json
{
  "status": "ok",
  "data": {
    // Response data
  }
}
```

**Error Format**:
```json
{
  "error": {
    "code": "error_code",
    "message": "Human-readable error message"
  }
}
```

### 6.4 Health Endpoints

**Note**: Health endpoints are mentioned in the architecture but may not be implemented in the current version. They should be added for production deployment.

**Liveness** (Recommended)
```
GET /health/live/
Response: 200 OK (basic ping)
```

**Readiness** (Recommended)
```
GET /health/ready/
Response: 200 OK (checks DB + Outbox)
```

---

## 7. Business Logic & Use Cases

### 7.1 Voting Flow

```
User clicks "upvote"
    ↓
API: POST /api/comments/vote/
    ↓
Serializer validates input
    ↓
Use Case: VoteOnComment.execute()
    ↓
Policy: can_vote_on_comment() → checks soft delete
    ↓
Domain Service: vote_comment()
    ↓
    - get_or_create CommentVote
    - update vote.value
    - save()
    ↓
Return vote to API
    ↓
Serialize and return 200 OK
```

### 7.2 Payment Flow

```
User clicks "Subscribe"
    ↓
Frontend: POST /api/billing/checkout/
    ↓
Use Case: CreateCheckoutSession.execute()
    ↓
    - Call Stripe API (via StripeService)
    - Get session_id
    - Save PaymentIntentRecord (status=CREATED)
    - Return session_id
    ↓
Frontend redirects to Stripe Checkout
    ↓
User completes payment
    ↓
Stripe sends webhook
    ↓
API: POST /api/billing/webhook/
    ↓
Use Case: HandleStripeWebhook.execute()
    ↓
    - Verify signature
    - Check idempotency (WebhookEvent.stripe_id)
    - Save WebhookEvent (status=PENDING)
    - Process event in transaction:
        * Find PaymentIntentRecord
        * Create Payment (status=COMPLETED)
        * Update/Create Subscription (plan=PREMIUM)
        * Mark PaymentIntentRecord (status=COMPLETED)
        * Emit OutboxEvents
    - Mark WebhookEvent (status=PROCESSED)
    ↓
Outbox processor picks up events
    ↓
    - Send welcome email
    - Track analytics
```

---

## 8. Payment Integration

### 8.1 Stripe Configuration

**Environment Variables**
```python
# settings.py
STRIPE_SECRET_KEY = 'sk_test_xxx'
STRIPE_WEBHOOK_SECRET = 'whsec_xxx'
RESEND_API_KEY = None  # Optional: Set to 're_xxxxx' for production email
DEFAULT_FROM_EMAIL = 'no-reply@ressourcefy.dev'
```

### 8.2 Checkout Session Creation

**Service Wrapper** (`application/services/stripe_service.py`)
```python
import stripe

class StripeService:
    @staticmethod
    def create_checkout_session(user_email, price_id, success_url, cancel_url, metadata):
        stripe.api_key = settings.STRIPE_SECRET_KEY
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            customer_email=user_email,
            line_items=[{'price': price_id, 'quantity': 1}],
            mode='subscription',
            success_url=success_url,
            cancel_url=cancel_url,
            metadata=metadata
        )
        return session.id
```

### 8.3 Webhook Handling

**Idempotency Pattern**
```python
# Check if already processed
if WebhookEvent.objects.filter(stripe_id=event_id).exists():
    return  # Already processed

# Save event first
webhook = WebhookEvent.objects.create(
    stripe_id=event_id,
    event_type=event_type,
    payload=event_data,
    status='PENDING'
)

# Process in transaction
try:
    with transaction.atomic():
        process_event(event)
    webhook.status = 'PROCESSED'
except Exception as e:
    webhook.status = 'FAILED'
    webhook.error_message = str(e)
    
webhook.save()
```

---

## 9. Async Processing

### 9.1 Transactional Outbox Pattern

**Purpose**: Ensure events are never lost, even on crashes.

**Producer** (`core/outbox.py`)
```python
def emit_event(aggregate_type, aggregate_id, event_type, payload):
    return OutboxEvent.objects.create(
        aggregate_type=aggregate_type,
        aggregate_id=aggregate_id,
        event_type=event_type,
        payload=payload,
        status='PENDING',
        next_retry_at=timezone.now()
    )
```

**Usage in Use Case**
```python
with transaction.atomic():
    # Business logic
    payment = Payment.objects.create(...)
    subscription.status = 'ACTIVE'
    subscription.save()
    
    # Emit events (same transaction!)
    emit_event('PAYMENT', str(payment.id), 'billing.payment_completed', {...})
    emit_event('SUBSCRIPTION', str(sub.id), 'billing.subscription_activated', {...})
```

### 9.2 Outbox Processor

**Consumer** (`core/outbox.py`)
```python
def process_outbox(limit=10):
    with transaction.atomic():
        events = OutboxEvent.objects.select_for_update(skip_locked=True).filter(
            status='PENDING',
            next_retry_at__lte=timezone.now()
        )[:limit]
        
        for event in events:
            event.status = 'PROCESSING'
            event.save()
    
    # Process outside transaction
    for event in events:
        try:
            dispatch_event(event)
            event.status = 'COMPLETED'
        except Exception as e:
            event.retry_count += 1
            if event.retry_count >= 5:
                event.status = 'FAILED'
            else:
                event.status = 'PENDING'
                event.next_retry_at = timezone.now() + timedelta(seconds=2 ** event.retry_count)
        event.save()
```

**Management Command**
```bash
python manage.py process_events --loop --interval=5
```

### 9.3 Event Handlers

**Dispatcher** (`core/outbox.py`)
```python
def _dispatch_event(event):
    if event.event_type == 'billing.subscription_activated':
        send_welcome_email(event.payload)
    elif event.event_type == 'billing.payment_completed':
        track_payment_analytics(event.payload)
    elif event.event_type == 'user.registered':
        _send_activation_email(event.payload)
    elif event.event_type == 'user.password_reset_requested':
        _send_password_reset_email(event.payload)
    elif event.event_type == 'user.activated':
        _send_welcome_email(event.payload)
```

**Email Service** (`core/services/email_service.py`)
```python
def send_email(to: str, subject: str, message: str, html_message: str = None):
    """
    Sends email using configured backend.
    - If RESEND_API_KEY is set: Uses Resend API (production)
    - Otherwise: Uses Django send_mail or logger (development)
    """
```

**Email Configuration** (`settings.py`)
```python
# Resend Email Service (optional - for production)
RESEND_API_KEY = None  # Set to your Resend API key: "re_xxxxx"
DEFAULT_FROM_EMAIL = "no-reply@ressourcefy.dev"
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"  # Development
```

---

## 10. Observability

### 10.1 Structured Logging

**Configuration** (`settings.py`)
```python
LOGGING = {
    'version': 1,
    'formatters': {
        'json': {
            '()': 'pythonjsonlogger.jsonlogger.JsonFormatter',
            'format': '%(asctime)s %(name)s %(levelname)s %(message)s'
        }
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'json'
        }
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO'
    }
}
```

**Usage**
```python
import logging
logger = logging.getLogger(__name__)

logger.info('Payment processed', extra={
    'user_id': str(user.id),
    'payment_id': str(payment.id),
    'amount_cents': payment.amount_cents
})
```

### 10.2 Health Checks

**Implementation** (`api/views/health.py`)
```python
class LivenessView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        return Response({"status": "ok"})

class ReadinessView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        # Check DB
        try:
            connection.ensure_connection()
        except Exception:
            return Response({"status": "unavailable"}, status=503)
        
        # Check Outbox backlog
        stuck_count = OutboxEvent.objects.filter(
            status='PENDING',
            created_at__lt=timezone.now() - timedelta(minutes=10)
        ).count()
        
        if stuck_count > 100:
            return Response({"status": "degraded"}, status=503)
        
        return Response({"status": "ok"})
```

### 10.3 Key Metrics

**Metrics to Track**:
- `payment_success_total` - Counter
- `payment_failure_total` - Counter
- `webhook_processing_latency` - Histogram
- `outbox_pending_count` - Gauge
- `outbox_failed_count` - Gauge
- `read_query_latency_p95` - Histogram

---

## 11. Setup & Deployment

### 11.1 Local Development

**1. Clone and Setup**
```bash
cd /path/to/project
python -m venv .env
source .env/bin/activate
pip install -r requirements.txt
```

**2. Database Setup**
```bash
# PostgreSQL recommended
createdb ressourcefy_dev

# Update settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'ressourcefy_dev',
        'USER': 'postgres',
        'HOST': 'localhost',
        'PORT': '5432'
    }
}
```

**3. Migrations**
```bash
cd ressourcefy
python manage.py migrate
```

**4. Run Server**
```bash
python manage.py runserver
```

**5. Run Outbox Processor (separate terminal)**
```bash
python manage.py process_events --loop --interval=5
```

### 11.2 Production Deployment

**Environment Variables**
```
DJANGO_SECRET_KEY=xxx
DJANGO_DEBUG=False
DATABASE_URL=postgres://...
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
RESEND_API_KEY=re_xxxxx  # Optional: for production email sending
```

**Services Required**
1. Web server (Gunicorn/uWSGI)
2. Outbox processor (systemd/supervisor)
3. PostgreSQL database
4. Redis (future - for caching)

**Gunicorn Example**
```bash
gunicorn ressourcefy.wsgi:application \
  --workers 4 \
  --bind 0.0.0.0:8000 \
  --access-logfile - \
  --error-logfile -
```

**Systemd Service for Outbox**
```ini
[Unit]
Description=Ressourcefy Outbox Processor
After=network.target

[Service]
User=www-data
WorkingDirectory=/path/to/ressourcefy
ExecStart=/path/to/.env/bin/python manage.py process_events --loop
Restart=always

[Install]
WantedBy=multi-user.target
```

---

## 12. Testing Strategy

### 12.1 Test Categories

**Domain Services** (`*/tests/test_domain_services.py`)
- Concurrency safety (locking)
- Immutability enforcement
- Business rule validation

**Use Cases** (`application/tests/test_use_cases.py`)
- Access control policies
- Command validation
- Service orchestration

**API Layer** (`api/tests/test_views.py`)
- Input serialization
- HTTP status codes
- Exception mapping

**Read Models** (`read_models/tests/test_performance.py`)
- Query counts (assertNumQueries)
- N+1 detection
- Data correctness

**Billing** (`monetization/tests/test_billing.py`)
- Webhook idempotency
- Payment flow
- Subscription activation

**Outbox** (`core/tests/test_outbox.py`)
- Transactional integrity
- Retry logic
- Dead letter handling

### 12.2 Running Tests

**All Tests**
```bash
python manage.py test
```

**Specific App**
```bash
python manage.py test core
python manage.py test api.tests.test_views
```

**With Coverage**
```bash
coverage run --source='.' manage.py test
coverage report
```

### 12.3 Test Example

```python
from django.test import TestCase
from django.db import transaction

class OutboxTests(TestCase):
    def test_transactional_integrity_rollback(self):
        """Event should NOT persist if transaction rolls back."""
        try:
            with transaction.atomic():
                emit_event('TEST', '1', 'test.event', {})
                raise ValueError("Rollback")
        except ValueError:
            pass
        
        # Event should not exist
        self.assertFalse(
            OutboxEvent.objects.filter(event_type='test.event').exists()
        )
```

---

## 13. Operational Runbook

### 13.1 Common Issues

**Symptom: Payment succeeded but user has no access**

**Checks**:
```bash
# 1. Check PaymentIntentRecord
python manage.py shell
>>> from monetization.models import PaymentIntentRecord
>>> intent = PaymentIntentRecord.objects.get(stripe_session_id='cs_xxx')
>>> intent.status  # Should be 'completed'

# 2. Check Subscription
>>> from monetization.models import Subscription
>>> Subscription.objects.filter(user=intent.user, status='active').exists()

# 3. Check OutboxEvents
>>> from core.models import OutboxEvent
>>> OutboxEvent.objects.filter(
...     aggregate_type='SUBSCRIPTION',
...     aggregate_id=str(subscription.id),
...     status='FAILED'
... )
```

**Actions**:
- If OutboxEvent is stuck: Manually mark as PENDING and retry
- If Subscription is missing: Manual SQL insert (emergency only)

**Symptom: Outbox backlog growing**

**Checks**:
```bash
# Check pending count
python manage.py shell
>>> from core.models import OutboxEvent
>>> OutboxEvent.objects.filter(status='PENDING').count()

# Check failed events
>>> OutboxEvent.objects.filter(status='FAILED')
```

**Actions**:
- Review error_message in failed events
- Fix handler code if needed
- Reset failed events: `event.status = 'PENDING'; event.save()`
- Scale processor: Run multiple instances

**Symptom: Webhook failing intermittently**

**Checks**:
```bash
# Check WebhookEvent logs
>>> from monetization.models import WebhookEvent
>>> WebhookEvent.objects.filter(status='FAILED').order_by('-created_at')[:10]
```

**Actions**:
- Check Stripe signature configuration
- Review error messages
- Manually replay: Use Stripe Dashboard → Webhooks → Resend

---

## 14. File Structure Reference

```
back_ressourcefy/
├── requirements.txt
├── ressourcefy/
│   ├── manage.py
│   ├── ressourcefy/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   │
│   ├── core/
│   │   ├── models.py (BaseModel, SoftDelete, Tag, OutboxEvent)
│   │   ├── outbox.py (emit_event, process_outbox, email handlers)
│   │   ├── tokens.py (activation & password reset tokens)
│   │   ├── services/
│   │   │   ├── audit.py (audit_change helper)
│   │   │   ├── email_service.py (Resend/Django email abstraction)
│   │   │   └── admin_tags.py (admin tag domain services)
│   │   ├── management/commands/process_events.py
│   │   └── tests/
│   │
│   ├── users/
│   │   ├── models.py (User, Profile, UserInterest)
│   │   ├── services/
│   │   │   └── admin_users.py (admin user domain services)
│   │   └── tests/
│   │
│   ├── resources/
│   │   ├── models.py (Resource, ResourceVersion)
│   │   ├── services/
│   │   │   ├── create_resource_version.py
│   │   │   └── admin_resources.py (admin resource domain services)
│   │   └── tests/
│   │
│   ├── interactions/
│   │   ├── models.py (Comment, CommentVote)
│   │   ├── services/vote_comment.py
│   │   └── tests/
│   │
│   ├── monetization/
│   │   ├── models.py (Subscription, Payment, PaymentIntentRecord, WebhookEvent)
│   │   ├── services/
│   │   │   └── admin_subscriptions.py (admin subscription/payment domain services)
│   │   └── tests/
│   │
│   ├── analytics/
│   │   ├── models.py (UserEvent)
│   │   └── services/track_event.py
│   │
│   ├── audit/
│   │   ├── models.py (AuditLog)
│   │   └── services/
│   │
│   ├── admin_dashboard/
│   │   ├── apps.py
│   │   └── services/
│   │       └── dashboard_service.py (read-only aggregation)
│   │
│   ├── application/
│   │   ├── dto/
│   │   │   ├── commands.py
│   │   │   └── admin_commands.py (admin-specific command DTOs)
│   │   ├── policies/
│   │   │   ├── resource_policy.py
│   │   │   ├── comment_policy.py
│   │   │   └── admin_policy.py (admin access policies)
│   │   ├── use_cases/
│   │   │   ├── vote_on_comment.py
│   │   │   ├── create_checkout_session.py
│   │   │   ├── handle_stripe_webhook.py
│   │   │   ├── auth/
│   │   │   │   ├── register_user.py
│   │   │   │   ├── activate_user.py
│   │   │   │   ├── authenticate_user.py
│   │   │   │   ├── resend_activation.py
│   │   │   │   ├── request_password_reset.py
│   │   │   │   └── confirm_password_reset.py
│   │   │   └── admin/
│   │   │       ├── manage_tags.py
│   │   │       ├── manage_resources.py
│   │   │       ├── manage_users_extended.py
│   │   │       └── manage_pricing.py
│   │   ├── services/stripe_service.py
│   │   ├── exceptions.py
│   │   └── tests/
│   │
│   ├── read_models/
│   │   ├── resources/
│   │   │   ├── resource_feed.py
│   │   │   └── resource_detail.py
│   │   ├── users/author_profile.py
│   │   └── tests/test_performance.py
│   │
│   └── api/
│       ├── views/
│       │   ├── vote_comment.py
│       │   ├── billing.py
│       │   ├── user.py (CurrentUserView - /user/me/)
│       │   ├── auth.py (Register, Activate, Login, etc.)
│       │   ├── read/__init__.py
│       │   ├── health.py
│       │   ├── admin_views.py (AdminUserViewSet)
│       │   └── admin/
│       │       ├── tags.py (AdminTagViewSet)
│       │       ├── resources.py (AdminResourceViewSet)
│       │       ├── pricing.py (AdminSubscriptionViewSet, AdminPaymentViewSet)
│       │       └── dashboard.py (Dashboard views)
│       ├── serializers/
│       │   ├── commands.py
│       │   ├── billing.py
│       │   ├── read.py
│       │   └── admin/
│       │       ├── tags.py
│       │       ├── resources.py
│       │       └── pricing.py
│       ├── urls.py
│       ├── exception_handlers.py
│       └── tests/
│
└── docs/
    └── all_features.md (this file)
```

---

## 15. Future Enhancements

### Phase 9 (Not Implemented)
- **Caching Layer**: Redis for read model cache
- **Real-time Notifications**: WebSockets for comment updates
- **Search**: Elasticsearch for full-text search
- **File Storage**: S3 integration for resource files
- **Rate Limiting**: API throttling per user
- **GraphQL**: Alternative API interface

### Scalability Considerations
- **Database**: Read replicas for read_models
- **Outbox**: Multiple processor instances
- **API**: Horizontal scaling with load balancer
- **CDN**: Static file serving

---

## 16. Key Takeaways

### What Makes This Architecture Special

1. **Reliability**: Outbox pattern ensures no events are lost
2. **Testability**: Strict layering enables unit testing at every level
3. **Performance**: Separate read models prevent N+1 queries
4. **Safety**: Immutability prevents data corruption
5. **Observability**: JSON logs and health checks enable monitoring
6. **Idempotency**: Webhooks and outbox are safe to retry

### Critical Files to Understand

1. `core/models.py` - Foundation for all models
2. `core/outbox.py` - Reliability engine & event handlers
3. `core/services/email_service.py` - Email abstraction (Resend/Django)
4. `core/services/audit.py` - Audit logging helper
5. `users/models.py` - User model with onboarding_step
6. `application/use_cases/handle_stripe_webhook.py` - Payment flow
7. `api/views/user.py` - Current user endpoint
8. `api/exception_handlers.py` - Error translation
9. `read_models/resources/resource_feed.py` - Performance optimization

---

## 17. Roles & Permissions System

### 17.1 Role Hierarchy

The application implements a 5-tier role system:

```
SUPERADMIN (Highest)
    ↓
ADMIN
    ↓
MODERATOR
    ↓
CONTRIBUTOR
    ↓
USER (Default)
```

**Role Definitions**:
- **SUPERADMIN**: Full system access, can assign any role, manage all users
- **ADMIN**: Can manage users (except role assignment), access admin endpoints
- **MODERATOR**: Can moderate content, manage resources
- **CONTRIBUTOR**: Can create premium content, access contributor features
- **USER**: Standard user, can create resources, comment, vote

### 17.2 Permission Classes

**DRF Permissions** (`users/permissions.py`):
- `IsSuperAdmin`: SUPERADMIN role or Django superuser
- `IsAdmin`: ADMIN/SUPERADMIN roles or Django staff/superuser
- `IsModerator`: MODERATOR, ADMIN, or SUPERADMIN roles
- `IsContributor`: CONTRIBUTOR, MODERATOR, ADMIN, or SUPERADMIN roles
- `IsAuthenticatedAndRole`: Generic permission for custom role sets

### 17.3 Security Rules

**Role Modification Protection**:
1. **Never via public endpoints**: Role field cannot be modified via regular user endpoints
2. **Only via admin endpoints**: Role changes must go through `/api/admin/users/{id}/set_role/`
3. **SUPERADMIN only**: Only SUPERADMIN can assign ADMIN or SUPERADMIN roles
4. **Last superadmin protection**: Cannot demote the last SUPERADMIN (prevents lockout)
5. **Audit logging**: All role changes are logged via AuditLog

**API Protection**:
- `UserSerializer` automatically strips `role` from data if user is not admin
- Admin endpoints require `IsAdmin` permission
- `set_role` action requires `IsSuperAdmin` permission

**Django Admin Protection**:
- Role field visible in Django Admin
- Only SUPERADMIN can modify role field in Django Admin
- Role changes logged via audit system

### 17.4 Admin Endpoints

**User Management** (`/api/admin/users/`):
```python
# List users
GET /api/admin/users/
Response: {
  "count": 10,
  "results": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "role": "USER",
      "is_active": true,
      ...
    }
  ]
}

# Get user details
GET /api/admin/users/{id}/

# Update user
PATCH /api/admin/users/{id}/
Body: {
  "is_active": false,
  # "role" field is protected - only visible to admins, cannot be set via PATCH
}

# Change user role (SUPERADMIN only)
POST /api/admin/users/{id}/set_role/
Body: {
  "role": "ADMIN" | "MODERATOR" | "CONTRIBUTOR" | "USER" | "SUPERADMIN"
}
Response: {
  "status": "ok",
  "data": {
    "user_id": "uuid",
    "email": "user@example.com",
    "role": "ADMIN",
    "previous_role": "USER"
  }
}
```

### 17.5 Management Commands

**Create Superadmin**:
```bash
# Using environment variables
export SUPERADMIN_USERNAME=admin
export SUPERADMIN_EMAIL=admin@example.com
export SUPERADMIN_PASSWORD=secure-password
python manage.py create_superadmin

# Or with defaults
python manage.py create_superadmin
# Creates: username=superadmin, email=admin@example.com, password=change-me-now
```

### 17.6 Testing

**Test Suite** (`users/tests/test_roles.py`):
- ✅ User cannot modify own role via API
- ✅ User cannot access admin endpoints
- ✅ Admin can access admin endpoints but cannot use set_role
- ✅ Superadmin can change user roles
- ✅ Last superadmin cannot be demoted
- ✅ Admin cannot assign SUPERADMIN role
- ✅ Role properties work correctly
- ✅ UserSerializer protects role field

**Run Tests**:
```bash
python manage.py test users.tests.test_roles
```

### 17.7 Migration & Setup

**Initial Setup**:
```bash
# 1. Create migration
python manage.py makemigrations users

# 2. Apply migration
python manage.py migrate

# 3. Create initial superadmin
python manage.py create_superadmin

# 4. Run tests
python manage.py test users.tests.test_roles
```

**Backward Compatibility**:
- Existing users default to `role=USER`
- Django `is_staff` and `is_superuser` still work for backward compatibility
- `create_superuser` automatically sets `role=SUPERADMIN`

---

## 18. Recent Updates (2026-01-25)

### Authentication & User Management
- ✅ Added `onboarding_step` field to User model with automatic calculation
- ✅ Created `/api/user/me/` endpoint for authenticated user details
- ✅ Extended `/api/user/me/` to include profile fields (username, bio, avatar_url) for UI pre-filling
- ✅ Added `/api/auth/resend-activation/` endpoint
- ✅ Added `/api/auth/logout/` endpoint to clear HTTP cookies
- ✅ JWT authentication configured in REST_FRAMEWORK settings
- ✅ Login response now includes `onboarding_step` in user data
- ✅ HTTP cookies automatically set on login (access_token, refresh_token, activated, onboarding_step)

### Email Service
- ✅ Created email service abstraction (`core/services/email_service.py`)
- ✅ Resend integration for production email sending
- ✅ Automatic fallback to Django send_mail or logger in development
- ✅ All email handlers updated to use new service

### Audit System
- ✅ Fixed all AuditLog usage to use `audit_change()` helper function
- ✅ Updated use cases: register_user, activate_user, resend_activation, request_password_reset, confirm_password_reset
- ✅ AuditLog now uses GenericForeignKey pattern with content_type/object_id

### Token Handling
- ✅ Improved activation token validation with URL decoding support
- ✅ Token can be passed in URL query parameter or request body
- ✅ Handles double-encoded tokens automatically

### CORS Configuration
- ✅ Added django-cors-headers for cross-origin requests
- ✅ Configured allowed origins and credentials

### Roles & Permissions System
- ✅ Added `role` field to User model (SUPERADMIN, ADMIN, MODERATOR, CONTRIBUTOR, USER)
- ✅ Created DRF permission classes (IsSuperAdmin, IsAdmin, IsModerator, IsContributor)
- ✅ Implemented admin endpoints (`/api/admin/users/`) with role management
- ✅ Added `set_role` action (SUPERADMIN only) for secure role assignment
- ✅ Protected role field in UserSerializer (non-admins cannot modify)
- ✅ Enhanced Django Admin with role field and protection
- ✅ Created management command `create_superadmin` for initial setup
- ✅ Added comprehensive test suite for anti-privilege escalation
- ✅ All role changes logged via AuditLog system

### Extended Admin Capabilities (2026-01-25)
- ✅ **Tag Management**: Full CRUD operations with merge functionality
  - Create, update, delete tags (soft delete if in use)
  - Merge tags (moves all associations automatically)
  - Search and filter capabilities
  - All operations audited and emit outbox events

- ✅ **Resource Management**: Complete admin control over resources
  - Create resources for any user
  - Update title, description, price, visibility, tags
  - Soft delete and restore resources
  - Add versions (bypasses author permission check)
  - Advanced filtering (author, tags, visibility, price, search)
  - All operations audited and emit outbox events

- ✅ **Extended User Management**:
  - Get user activity history (audit logs + analytics)
  - Impersonate users (SUPERADMIN only, generates JWT tokens)
  - Reset user passwords (sends email with new password)
  - Enhanced filtering (role, activation status, search)
  - All operations audited and emit outbox events

- ✅ **Subscription & Payment Management**:
  - List and filter subscriptions (user, status, plan)
  - Update subscription properties (plan, status, ends_at)
  - Cancel subscriptions (updates Stripe if needed)
  - List and filter payments (user, status)
  - Refund payments (full or partial, processes via Stripe)
  - All operations audited and emit outbox events

- ✅ **Admin Dashboard** (read-only aggregation):
  - Overview statistics (users, resources, subscriptions, revenue)
  - Activity feed (recent audit logs)
  - System health metrics (DB status, Outbox backlog)
  - Optimized queries for performance

- ✅ **Architecture Compliance**:
  - All admin mutations pass through domain services
  - Strict DDD layered architecture maintained
  - Immutable DTOs for all admin commands
  - Transaction safety with `@transaction.atomic`
  - Comprehensive audit logging via `audit_change()`
  - Outbox events for all critical actions
  - Idempotent operations where applicable

- ✅ **Security Enhancements**:
  - SUPERADMIN cannot impersonate another SUPERADMIN
  - Last SUPERADMIN protected from demotion
  - All sensitive actions require appropriate permissions
  - Soft-deleted tags cannot be assigned or merged into
  - Admin password reset requires SUPERADMIN for SUPERADMIN targets

---

**End of Documentation**

*Last Updated: 2026-01-25*
*Version: 1.2*
*Maintainer: Development Team*
