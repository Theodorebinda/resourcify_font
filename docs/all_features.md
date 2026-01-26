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

**Tag**
```python
- name: CharField(50)
- slug: SlugField(unique)
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

Methods:
  get_onboarding_step() → Calculates current onboarding step based on profile/interests progress
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

### 5.2 Application Layer (`application/`)

**Structure**:
```
application/
├── dto/
│   └── commands.py      # Immutable command DTOs
├── policies/
│   ├── resource_policy.py
│   └── comment_policy.py
├── use_cases/
│   ├── vote_on_comment.py
│   ├── create_resource_version.py
│   ├── access_resource.py
│   ├── create_checkout_session.py
│   ├── handle_stripe_webhook.py
│   └── auth/
│       ├── register_user.py
│       ├── activate_user.py
│       ├── authenticate_user.py
│       ├── resend_activation.py
│       ├── request_password_reset.py
│       └── confirm_password_reset.py
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
POST /api/auth/login/            # Get JWT tokens (includes onboarding_step)
POST /api/auth/password-reset/   # Request reset link
POST /api/auth/password-reset/confirm/  # Confirm reset
```

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
    "username": "username",
    "activated": true,
    "onboarding_step": "not_started" | "profile" | "interests" | "completed",
    "createdAt": "2026-01-25T12:00:00Z"
  }
}
```

### 6.3 Health Endpoints

**Liveness**
```
GET /health/live/
Response: 200 OK (basic ping)
```

**Readiness**
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
│   │   │   └── email_service.py (Resend/Django email abstraction)
│   │   ├── management/commands/process_events.py
│   │   └── tests/
│   │
│   ├── users/
│   │   ├── models.py (User, Profile, UserInterest)
│   │   └── tests/
│   │
│   ├── resources/
│   │   ├── models.py (Resource, ResourceVersion)
│   │   ├── services/create_resource_version.py
│   │   └── tests/
│   │
│   ├── interactions/
│   │   ├── models.py (Comment, CommentVote)
│   │   ├── services/vote_comment.py
│   │   └── tests/
│   │
│   ├── monetization/
│   │   ├── models.py (Subscription, Payment, PaymentIntentRecord, WebhookEvent)
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
│   ├── application/
│   │   ├── dto/commands.py
│   │   ├── policies/
│   │   │   ├── resource_policy.py
│   │   │   └── comment_policy.py
│   │   ├── use_cases/
│   │   │   ├── vote_on_comment.py
│   │   │   ├── create_checkout_session.py
│   │   │   ├── handle_stripe_webhook.py
│   │   │   └── auth/
│   │   │       ├── register_user.py
│   │   │       ├── activate_user.py
│   │   │       ├── authenticate_user.py
│   │   │       ├── resend_activation.py
│   │   │       ├── request_password_reset.py
│   │   │       └── confirm_password_reset.py
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
│       │   └── health.py
│       ├── serializers/
│       │   ├── commands.py
│       │   ├── billing.py
│       │   └── read.py
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

## 17. Recent Updates (2026-01-25)

### Authentication & User Management
- ✅ Added `onboarding_step` field to User model with automatic calculation
- ✅ Created `/api/user/me/` endpoint for authenticated user details
- ✅ Added `/api/auth/resend-activation/` endpoint
- ✅ JWT authentication configured in REST_FRAMEWORK settings
- ✅ Login response now includes `onboarding_step` in user data

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

---

**End of Documentation**

*Last Updated: 2026-01-25*
*Version: 1.1*
*Maintainer: Development Team*
