# Notifications: frontend integration handoff

Verified against the current backend and the separate `Express-Mobile` source on
2026-10-22. These documents describe implemented behavior; proposed future APIs
are explicitly excluded. Examples contain placeholders, never live credentials.

## Read by responsibility

| Document | Audience | Contents |
| --- | --- | --- |
| [API contract](01-api-contract.md) | All frontend developers | Routes, authentication, JSON, validation, counters and errors |
| [Staff dashboard integration](02-staff-dashboard.md) | Web frontend | Compose, broadcast, permissions, idempotency, polling and TypeScript client |
| [Mobile integration](03-mobile-integration.md) | Flutter developers | FID sync, installation identity, session changes, permissions and tap handling |
| [Acceptance and troubleshooting](04-acceptance-and-troubleshooting.md) | Frontend, mobile, QA and operations | End-to-end checks, failure scenarios, diagnosis and service boundaries |

## Addresses

Configured mobile API: `https://fastexpress.tryasp.net/api/rider-mobile`.
Use `https://fastexpress.tryasp.net` as the example **API origin** for staff calls.
These values come from source configuration, not a live endpoint verification.
Use your deployment's origin when it differs.

```text
API_ORIGIN   = https://fastexpress.tryasp.net
MOBILE_BASE  = API_ORIGIN + /api/rider-mobile
STAFF_BASE   = API_ORIGIN + /api/admin
```

Do not append `/api/admin` to `MOBILE_BASE`. Do not append `/api/rider-mobile`
again when using `RiderApi`, whose configured base already contains that path.

## What is available

- Android installation registration and unregistration under rider authentication.
- Staff send-to-one, scoped broadcast and per-request aggregate status.
- Localized content: Arabic, English and Bengali; English fallback.
- Home, profile and performance-report tap destinations.
- Durable database-backed processing, idempotency, retries and expiration.
- A backend language/profile-change notification and an optional daily reminder.

## What is not available

There are no notification-list/history, unread-count, mark-read, receipt,
cancel-request, manual-retry, device-list, template-management, permission-discovery
or reminder-configuration endpoints. Do not build UI that assumes these APIs exist.
There is no staff web push receiver, client topic subscription or iOS registration
contract in this feature. The staff dashboard queues Android rider notifications.
The aggregate status resource does not expose individual provider errors/devices.

## Deployment and ownership

The notification migration was applied to hosted database `db33462` on
2026-10-22 and the four tables/indexes were verified. Database readiness alone
does not prove that the updated API is deployed or Firebase credentials work.

The current mobile source contains `DeviceRegistration`, `RiderApi.registerDevice`
and `unregisterDevice`, controller lifecycle hooks and Firebase event wiring.
Verify the installed build includes this code; do not add a second coordinator.

Firebase Admin JSON, persistent data-protection keys, server environment variables
and Hangfire scheduling belong to backend hosting. Never request them from a
frontend user or embed them in the dashboard/mobile bundle. See
[backend setup](../../mobile/backend-setup.md) for deployment configuration.

## Source of truth

Backend paths, relative to the solution root:

- `Express Service/Controllers/PushDevicesController.cs`
- `Express Service/Controllers/NotificationsController.cs`
- `Express Service/NotificationDependencies.cs`
- `Application/Contracts/Notifications/NotificationContracts.cs`
- `Application/Service/Notifications/NotificationRules.cs`
- `Application/Service/Notifications/NotificationService.cs`
- `Application/Service/Notifications/NotificationJob.cs`

Mobile paths are relative to the separate `Express-Mobile` repository. Its current
workspace location is `C:/Users/omarf/OneDrive/Documents/ChatGPT/Express-Mobile`.
