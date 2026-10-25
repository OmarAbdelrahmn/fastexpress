# Notification acceptance and troubleshooting

Use [API contract](01-api-contract.md), [staff integration](02-staff-dashboard.md)
and [mobile integration](03-mobile-integration.md) together. These checks are a
release checklist, not a claim that live Firebase delivery has already been tested.

## Prerequisites

- Updated API deployed with notification controller routes.
- Hosted migration applied; done for `db33462` on 2026-10-22.
- Correct Firebase project and Android application configuration.
- Firebase Cloud Messaging API enabled and valid backend credentials.
- Persistent data-protection key ring readable/writable by the API; retain keys
  across releases. FID decryption must work after an application restart.
- `Notifications:Enabled=true` in the backend process configuration.
- Hangfire server running and consuming the default queue continuously.
- An eligible test rider, a notification-authorized staff user and an Android
  device with notification permission and the latest mobile build.

Hosting configuration belongs to [backend setup](../../mobile/backend-setup.md).
Do not introduce browser controls for editing credentials, keys or job schedules.

## First end-to-end test

1. Log in on Android; record the returned `rider.riderId` for the test operator.
2. Allow notification permission; confirm the backend PUT returns 204 and the
   safe registration success log appears. Do not capture bearer tokens/FIDs in
   screenshots or general logs.
3. Log into the staff dashboard with a `Master` or explicitly granted account.
4. Send a home notification to that exact rider ID with a new UUID key.
5. Verify 202, preserve requestId and start GET status polling.
6. Wait for worker polling (currently every minute), queue processing and device
   delivery. Do not fail the test merely because the first GET remains queued.
7. Verify acceptedDeliveries > 0, then separately verify the actual phone UI.
8. Repeat with the app foregrounded, backgrounded and normally terminated.
9. Tap profile and a valid existing report-period notification; confirm routing
   and authenticated report fetch. Unknown/invalid incoming action opens home.
10. Change rider language. Confirm replacement-token registration succeeds and
    a localized profile-change notification uses the preferred locale/fallback.
11. Log out, send another message, and confirm no new eligible delivery goes
    through that logged-out binding. Previously accepted tray messages may remain.

## Contract and failure matrix

| Scenario | Expected result |
| --- | --- |
| Same registration PUT twice | Both 204; one installation binding |
| Same FID transferred to another installation/rider | One active destination owner; old-generation deliveries skipped |
| Old session attempts DELETE after reassignment | Cannot delete newer owner's binding; auth may reject revoked session |
| Expired rider session | 401; current session handling, no retry loop |
| Admin without configured grant sends | 403 |
| Rider token calls staff endpoint | Authentication rejection; no send |
| Staff token calls mobile device endpoint | Authentication rejection; no mutation |
| Scoped staff targets another company | 404; no disclosure or scope expansion |
| Same scoped key/body submitted twice | Same requestId; no new logical notification |
| Same scoped key with changed body | 409; preserve original operation context |
| HTTP timeout after a POST | Outcome uncertain; retry original key/body, not a fresh send |
| English omitted, blank translation or unsupported locale | 400 |
| Invalid/future report action or extra data keys | 400 |
| Eligible rider has no registered device | 202 then completed with skippedNoDeviceRiders; zero accepted deliveries |
| Language changes during an old upload | Old completion discarded; replacement-token reconciliation |
| Permission revoked in Android settings | Resume detects it; backend DELETE; no repeated permission prompts |
| Device API 404/500 | Separate observable sync failure; valid login/reports remain usable |
| Dashboard tab hidden, navigation or logout | Stop/pause polling and discard stale results |
| Several status cards visible | Shared actor request budget respected; no per-card tight loops |
| Provider timeout/transient error | Durable backend retry before expiry; possible duplicates acknowledged |
| Provider Unregistered | Only the matching device generation deactivated |
| Credential/project mismatch | Operational error, backoff; never delete all device registrations |
| Expired request | No new sends past expiry; status/counters may update on next worker run |

## Diagnose by symptom

| Symptom | Check next |
| --- | --- |
| PUT 404 | Correct API origin/base, valid UUID URL, deployed routes |
| PUT 401 after language change | New token persisted/applied, old callback ignored |
| PUT 400 | FID nonblank <=256, android/authorized literals, appVersion <=64 |
| Browser CORS failure | Allowed frontend origin and preflight; not Firebase setup |
| Browser cannot read Location | Use JSON requestId; exposed response headers are not configured |
| Persistent queued/expanding | Hangfire host/default queue, DB work, application idle shutdown |
| Expansion finishes but deliveries stay pending | Sending enabled, worker activity, retries, provider logs |
| completed with skippedNoDeviceRiders | Same rider registered? Valid session/permission? Latest APK? |
| acceptedDeliveries >0, no visible alert | Android channel/permission, device restrictions, foreground banner, app state |
| completed_with_errors | Show counters; backend operator inspects safe job/provider logs |
| Failure after redeploy/restart | Persistent data-protection folder retained and accessible, DPAPI/certificate compatibility |
| Missing Arabic/Bengali text | Preferred language and supplied translation; missing locale uses English |
| Duplicate alert | Was there a fresh send key, repeated business event, or ambiguous provider acceptance? |

`/health` currently verifies local provider initialization, not a real FCM send,
remote permissions or display on a device. It can be healthy while sending is
disabled. A health response alone does not complete end-to-end verification.

## Automatic services and boundaries

| Service | Trigger | Frontend responsibility |
| --- | --- | --- |
| Device binding | Login/FID/resume/permission/session changes | Existing Flutter coordinator; see mobile guide |
| Staff one-rider message | Staff POST | Compose, retain idempotency state, show aggregate status |
| Staff broadcast | Authorized staff POST | Confirm scope; avoid invented creation-time counts |
| Profile/language message | Successful actual language change | Do not send a duplicate frontend message |
| Daily reminder | Optional backend Saudi-time schedule | No scheduler UI endpoint; configure on backend |
| Delivery retries/expiry | Worker and persisted request | Poll, show actual counters; do not create another send automatically |
| Registration/history cleanup | Backend daily job | Handle status 404 after retention; no browser cleanup call |

Performance CRUD/imports do not currently auto-publish report notifications. Manual
authorized report-action sends are supported. There is no inbox/unread/read-receipt
service, public broadcast topic, client-facing Hangfire control, cancel or retry API.

## Release evidence

Record environment, app/API version, test rider ID, request ID, timestamps,
HTTP status and observed counters/device behavior. Avoid private content, token,
FID and credential capture. Separate these facts explicitly:

1. API accepted a request (202).
2. Firebase accepted a device delivery (accepted counter).
3. Android displayed the notification (manual observation).
4. Tap routed correctly (manual observation).

Only the first two are represented by current backend responses. No read receipt
can be inferred from them. Run automated suites as appropriate; live mobile,
Firebase credentials and native SQL concurrency checks require their own evidence.
