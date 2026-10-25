# Notification API contract

Read [the overview](README.md) for base URLs and available-service boundaries.
All request examples use paths relative to `API_ORIGIN`. HTTP field names and
JSON properties below match the current implementation.

## Endpoint map

| Method | Path | Token / permission | Success |
| --- | --- | --- | --- |
| POST | `/api/rider-mobile/login` | Anonymous rider login | 200, mobile login response |
| PUT | `/api/rider-mobile/devices/{installationId}` | Current rider token | 204, no body |
| DELETE | `/api/rider-mobile/devices/{installationId}` | Current rider token | 204, no body |
| PUT | `/api/rider-mobile/language` | Current rider token | 200, replacement mobile login response |
| POST | `/api/rider-mobile/logout` | Current rider token | 204, no body |
| POST | `/api/Auth/login` | Anonymous staff login | 200, staff token response |
| POST | `/api/admin/riders/{riderId}/notifications` | Staff + `Notifications.Send` | 202, queued response |
| POST | `/api/admin/notifications/broadcasts` | Staff + `Notifications.Broadcast` | 202, queued response |
| GET | `/api/admin/notifications/{requestId}` | Staff + `Notifications.Read`, matching scope | 200, aggregate status |

For authenticated requests use `Authorization: Bearer <token>`. For JSON bodies
use `Content-Type: application/json`. Private routes return no-store responses.
Never decode a 204 response as JSON. No Firebase credential is an API parameter.

## Rider authentication

```http
POST /api/rider-mobile/login
Content-Type: application/json

{
  "iqamaNo": "2100000001",
  "language": "en"
}
```

The Iqama above is sample data. `iqamaNo` must contain exactly ten ASCII digits;
use a real eligible test rider. Language is optional, with supported values `ar`,
`en`, `bn`. Successful responses contain `accessToken`, `tokenType`,
`expiresAtUtc`, `language`, and `rider`. `rider.riderId` is the integer ID used in
staff send URLs; it is neither an Iqama nor a working ID. Invalid login/session
responses are 401; malformed input may produce 400.

The backend validates the signed `rider_id`, `sid`, token purpose and language,
then checks session expiry/revocation and rider eligibility. Clients must not
construct identities by editing JWT claims or adding rider IDs to device bodies.

## Register or update an installation

```http
PUT /api/rider-mobile/devices/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <RIDER_ACCESS_TOKEN>
Content-Type: application/json

{
  "firebaseInstallationId": "<FID_FROM_ONREGISTERED>",
  "platform": "android",
  "permission": "authorized",
  "appVersion": "1.0.0+1"
}
```

| Input | Required | Validation / semantics |
| --- | --- | --- |
| `installationId` path | Yes | Nonempty UUID generated and securely stored by the app |
| `firebaseInstallationId` | Yes | Nonblank FID; maximum 256 characters; server trims surrounding whitespace |
| `platform` | Yes | Exactly `android` |
| `permission` | Yes | Exactly `authorized` |
| `appVersion` | No | Nullable/omittable; maximum 64 characters |

Success is `204 No Content`. A malformed UUID can fail route matching with 404;
an all-zero UUID or invalid body is rejected with 400. Repeated PUT with the
same session/destination is safe. Ownership/session/FID changes replace the
binding; one active destination is not shared across multiple riders. A concurrent
registration conflict can return 409 and may be retried with current state.

Do not substitute the installation UUID, sender ID, VAPID public key or a legacy
registration-token example for the current FID-based destination.

## Unregister an installation

```http
DELETE /api/rider-mobile/devices/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <RIDER_ACCESS_TOKEN>
```

No request body; success is 204 even if the matching device is already absent.
The server matches installation, authenticated rider and current session. An older
session cannot unregister a newer owner's binding. Revoked/expired credentials
still fail authentication with 401; idempotent deletion does not bypass auth.

## Language replacement and logout

```http
PUT /api/rider-mobile/language
Authorization: Bearer <CURRENT_RIDER_TOKEN>
Content-Type: application/json

{ "language": "ar" }
```

Success returns a complete replacement mobile login response. Persist and use its
new `accessToken`; the old session is revoked. Active device bindings transfer
atomically to the replacement session. Queued deliveries for an older device
generation are skipped. Actual language changes stage a localized profile
notification in the same commit. Session expiry is not extended by this operation.

```http
POST /api/rider-mobile/logout
Authorization: Bearer <CURRENT_RIDER_TOKEN>
```

Success is 204. Logout independently revokes the session and deactivates its
devices. The mobile app should DELETE before logout while the old token is valid.

## Staff authentication and scope

```http
POST /api/Auth/login
Content-Type: application/json

{
  "userName": "<STAFF_USERNAME>",
  "password": "<STAFF_PASSWORD>"
}
```

Use `token` from the successful staff response, not the mobile `accessToken` field.
Staff and mobile credentials are separate authentication schemes.

`Master` has global notification access. `Admin` alone has no automatic grant.
Other staff need a trusted server configuration grant for their user ID, with
`Send`, `Broadcast` and an optional `CompanyId`. Null company explicitly grants
global scope. There is one grant per user. Scope is never accepted from the send
body. `Notifications.Read` admits send/broadcast grantees, then the service enforces
request scope; out-of-scope request IDs return 404. There is no capabilities API.

## Send to one rider

```http
POST /api/admin/riders/42/notifications
Authorization: Bearer <STAFF_TOKEN>
Idempotency-Key: 82472d7a-6985-4caf-a8b5-9872d1e948f7
Content-Type: application/json

{
  "content": {
    "en": { "title": "New update", "body": "Please check your app." },
    "ar": { "title": "تحديث جديد", "body": "يرجى مراجعة التطبيق." },
    "bn": { "title": "নতুন আপডেট", "body": "অনুগ্রহ করে অ্যাপটি দেখুন।" }
  },
  "data": { "type": "home" },
  "expiresInSeconds": 86400
}
```

```http
HTTP/1.1 202 Accepted
Location: /api/admin/notifications/9f30744b-28fe-4901-9060-c138bf5b5919
```

```json
{
  "requestId": "9f30744b-28fe-4901-9060-c138bf5b5919",
  "status": "queued"
}
```

The same queued-shaped response is returned on an idempotent replay, even if the
original request has already completed. Fetch status to learn its actual state.
The target must be eligible and within staff scope, otherwise 404. All eligible
registered devices for the target can receive the message. No device is not an
FCM error: status can complete with `skippedNoDeviceRiders = 1`.

## Broadcast

Use the same headers/body at `POST /api/admin/notifications/broadcasts`. Success
is the same 202 shape. Global broadcasts require global scope; company grants
restrict selection automatically. Do not send an audience/company override.

The server saves a maximum rider ID at request creation, then expands eligible
riders up to that bound in pages. This is not a strict creation-time membership
snapshot: eligibility is evaluated during expansion and rechecked before sending.
Riders with IDs above that bound are excluded. New devices after expansion do not
have to receive that existing broadcast. Do not claim an exact recipient count
before the status resource supplies it.

## Content, actions and idempotency

| Property | Rules |
| --- | --- |
| `content.en` | Required, both title and body nonblank |
| `content.ar`, `content.bn` | Optional; when supplied, both fields must be nonblank |
| Other locales | Rejected |
| Each title/body | Maximum 120 / 500 characters; strings are trimmed for canonical storage |
| `expiresInSeconds` | Integer 60–604800; default 86400 |
| `data` | Required; only the exact action shapes below |
| `Idempotency-Key` header | Required nonempty UUID for each staff command |

```json
{ "type": "home" }
```

```json
{ "type": "profile" }
```

```json
{ "type": "performance_report", "year": "2026", "month": "10" }
```

Report values are strings of digits; year >= 2000, month 1–12, no future month
in Saudi time (UTC+3). Home/profile accept no extra fields. URLs, executable
actions, private report data and caller-provided `notificationId` are rejected.
The backend injects `notificationId` in the outbound message. The receiver should
still handle unknown/invalid actions safely by opening home.

The rider's saved preferred language selects content, with English fallback.
Do not send confidential report values in lock-screen text.

Uniqueness is scoped by staff actor, authorized company scope, operation/target
and key. Same scoped key + same normalized content/data/TTL returns the original
ID. A different body returns 409. Preserve both key and immutable payload through
timeouts/retries. A deliberately new message uses a new key. Idempotency is bounded
by retained history, normally 90 days; it is not permanent global deduplication.

## Aggregate status

```http
GET /api/admin/notifications/9f30744b-28fe-4901-9060-c138bf5b5919
Authorization: Bearer <STAFF_TOKEN>
```

```json
{
  "requestId": "9f30744b-28fe-4901-9060-c138bf5b5919",
  "status": "completed",
  "audienceRiders": 1,
  "skippedNoDeviceRiders": 0,
  "totalDeliveries": 2,
  "pendingDeliveries": 0,
  "acceptedDeliveries": 2,
  "failedDeliveries": 0,
  "skippedDeliveries": 0,
  "expiredDeliveries": 0,
  "createdAtUtc": "2026-10-22T12:00:00Z",
  "expiresAtUtc": "2026-10-23T12:00:00Z"
}
```

| Current status | Meaning | Frontend behavior |
| --- | --- | --- |
| `queued` | Awaiting initial expansion | Keep request ID, poll |
| `expanding` | Audience page processing has begun | Poll; counts can grow |
| `processing` | Expansion complete with pending deliveries | Poll |
| `completed` | Expansion complete, no pending/failed/expired deliveries | Stop polling; inspect skipped counters |
| `completed_with_errors` | No pending work; some deliveries failed/expired | Stop polling; show aggregate outcomes |

These are the five states currently returned; the older design brief's generic
`failed` state is not currently emitted by this service. Unknown future states
must remain visible and must not be interpreted as success.

`audienceRiders` counts expanded rider rows. `skippedNoDeviceRiders` is a rider
count; delivery counters are device-attempt-work counts. One rider can have
multiple device deliveries. `skippedDeliveries` covers stale/ineligible bindings.
Accepted means accepted by Firebase, not displayed/read. `completed` can also
mean nobody had an eligible device. Early expiration before expansion can leave
zero recipients/deliveries; never infer successful reception from the status alone.

The two `*AtUtc` fields represent UTC. SQL-backed serialization may omit an
explicit timezone suffix; normalize these known UTC fields as UTC before local
display. Never reinterpret them as the browser's local wall-clock time.

## Errors and limits

Expected service failures use ProblemDetails, for example:

```json
{
  "status": 409,
  "title": "Notifications.Conflict",
  "detail": "The request conflicts with an existing registration or idempotency key. Retry registration with current session details.",
  "error": {
    "code": "Notifications.Conflict",
    "description": "The request conflicts with an existing registration or idempotency key. Retry registration with current session details."
  }
}
```

Model validation can instead include an `errors` dictionary. Authentication and
rate-limiting responses can be empty; proxy/hosting errors can be HTML. Branch on
HTTP status first, parse JSON defensively and never depend on one error shape.

| Result | Client action |
| --- | --- |
| 400 | Keep draft; show field/action error; correct input |
| 401 | Handle current-session expiry/wrong-token scheme; discard stale asynchronous callbacks |
| 403 | Show permission denial; do not retry unchanged |
| 404 | Check route/deployment/target/scope; do not clear a mobile login solely for this |
| 409 | Staff: resolve changed payload; device: reconcile and retry with current session |
| 429 | Cool down, honor Retry-After if present; do not assume the header exists |
| 5xx / network timeout | Registration: retry with current session; staff command: preserve original key/body |

Device endpoints: 30 requests/minute per mobile session. Staff notification
endpoints: 30 requests/minute per actor, shared across sends, broadcasts and status
polls. Anonymous fallback partitions use remote IP. Rate limits are in-process;
do not treat them as a distributed organization-wide quota.
