# Flutter Android notification integration

See [API contract](01-api-contract.md) for complete requests and field limits.
This guide documents existing mobile wiring and requirements to preserve it.

## Current source map

Paths below are relative to `Express-Mobile`:

| File | Responsibility |
| --- | --- |
| `lib/data/api.dart` | Configurable mobile base URL, authenticated HTTP, PUT/DELETE device methods, 204 and API errors |
| `lib/notifications/device_registration.dart` | Secure installation UUID, serialized sync, retry timer, session generation and pre-logout delete |
| `lib/notifications/app_notifications.dart` | Firebase register/unregister, FID callbacks, permissions, incoming messages and destination parsing |
| `lib/state/rider_controller.dart` | Login/restoration, replacement sessions, expired-session handling and logout orchestration |
| `lib/main.dart` | Firebase startup, coordinator wiring, foreground banners and resume hooks |
| `lib/ui/shell.dart` | Navigation to home, profile or report after a tap |

`main.dart` constructs one `RiderApi`, `DeviceRegistration` and secure installation
store, then shares registration with the controller and Firebase notification
handler. Avoid independent registration timers in widgets or another HTTP client.

## Identity values

| Value | Source | Lifecycle |
| --- | --- | --- |
| Installation UUID | `SecureInstallationStore.getOrCreate()` | One per installation, retained across logouts |
| Firebase FID | `FirebaseMessaging.instance.onRegistered` | Can change; reconcile every callback |
| Rider token | Login/restored/replacement session | Changes on login/language replacement; removed on logout |
| App version | `PackageInfo` | Sent as `version+buildNumber` |

The store uses secure key `rider_push_installation_v1`, separate from session
storage. Never derive installation identity from Iqama, rider ID, IMEI or FID.
Secure-storage backup/restore policies must match the intended installation
lifecycle; do not erase this key as part of ordinary session logout.

## Startup, login and registration

1. Initialize Firebase with the app's Android project options. Failure should
   allow login/reports to work while showing/logging a separate push setup issue.
2. Install the background handler before message delivery handling starts. It
   initializes Firebase and does not fetch private reports or navigate the UI.
3. Subscribe to onRegistered/onUnregistered before calling register. Automatic
   Firebase messaging initialization is disabled until the signed-in flow.
4. Restore/login the rider and call `DeviceRegistration.setSession(currentToken)`.
   The controller already does this in `_apply`.
5. Request notification permission after sign-in. On resume read the current
   settings rather than repeatedly displaying the permission prompt.
6. Once Firebase supplies a FID, call `setRegistration(fid)`. The coordinator
   obtains the installation UUID and app version, then PUTs the backend device.
7. Treat only the successful backend operation as registration completion. The
   current coordinator logs `Push device registered with backend (204).`.

Firebase registration alone is insufficient: the backend must know the current
FID/session association. A successful backend 204 still does not prove Android
can display a notification; channel/device settings also matter.

## Resume, FID changes and permission revocation

- The app lifecycle resume hook calls the controller, Firebase notification
  coordinator and backend registration coordinator to reconcile state.
- Re-PUT the same installation when the FID changes. Do not generate another
  installation UUID just because a destination changed.
- A null registration means permission was revoked or Firebase unregistered.
  The coordinator DELETEs the backend binding using current credentials.
- The current Android contract sends `permission: "authorized"` only when
  registering. Do not PUT `denied`, `provisional` or `ios`; these are not accepted
  backend registration values. The receiver's permission interpretation remains
  separate from the exact wire value.
- Resume reconciliation must be idempotent and stay within 30 mutations/minute
  per session. Do not create a PUT loop from every widget rebuild.

## Session replacement and account switching

`PUT /api/rider-mobile/language` revokes the old session and returns a replacement
token. The controller suspends registration while this runs, saves/applies the
new session and resumes sync with the new token. Backend device transfer is
atomic with replacement; reconcile with a new-token PUT afterwards.

All asynchronous sync work captures token and a local generation. Before/after
secure storage, version lookup, HTTP and retry callbacks it must still belong to
the current generation/token. Discard old completion results and old 401 callbacks.
Serialize mutations so a late old-session DELETE cannot erase a new registration.
Never log tokens or FIDs for diagnosing these races.

## Logout

```text
capture old token
stop/cancel old registration retries and invalidate local generation
wait behind any in-flight registration operation
DELETE installation using the still-available old token (best effort)
POST /api/rider-mobile/logout using that token
clear local session, foreground messages and pending navigation
attempt Firebase unregister (best effort)
```

The controller already invokes `beforeLogout(token)` before the backend logout.
The backend independently revokes the session and deactivates devices. Retain the
installation UUID for the next login. If offline, clear local state anyway and
explain the offline result; immediate remote unbinding cannot be guaranteed.
Messages already accepted by Firebase/Android cannot be recalled by this API.

## Registration failures and retries

The current coordinator retries network/storage/transient errors and HTTP
409/429/5xx with exponential delays starting at 5 seconds, capped at 320 seconds.
It uses Retry-After when available. Resume resets the retry schedule. It does not
retry unchanged nontransient HTTP errors other than 409/429. A 401 is forwarded to
current-session handling only while that request still belongs to the current token.

Keep device sync errors separate from dashboard/report errors. Preserve a valid
login on 400/403/404/409/429/5xx; do not hide an unavailable route by pretending
registration succeeded. A device-route 404 warrants checking the deployed backend
version, API base and UUID formatting. A 401 can indicate genuine expiry or a
stale token following language replacement; apply generation guards first.

## Receiving and navigation

The backend sends a visible notification plus string-valued action data. Android
uses channel `rider_updates`, normal delivery priority, a stable notification tag
derived from the request ID, and TTL based on remaining request lifetime.

| App state | Handling |
| --- | --- |
| Foreground, signed in | Tappable in-app banner; avoid an additional local tray notification |
| Background | Android displays the visible notification; tap uses onMessageOpenedApp |
| Terminated normally | Initial message is recovered at launch; defer navigation until login/UI are ready |
| Signed out | Do not show stale foreground content; authenticate before private destination access |
| Unknown/invalid action | Open home safely |

Home/profile/report data shapes are in the contract. Report parsing validates
year/month and rejects future periods. Fetch report details with the current
authenticated API after navigating; payload data is never proof of rider access.

Provider retry after an ambiguous send can produce duplicates. Do not advertise
exactly-once delivery. The backend tag can replace tray entries but does not prove
foreground banner deduplication. If adding local duplicate suppression later,
scope it to the signed-in session and notification ID with bounded retention.

## Build and device verification

`RiderApi` defaults to `https://fastexpress.tryasp.net/api/rider-mobile` and supports
the compile-time `API_BASE_URL` setting. Use the exact mobile base path for your
deployment; the staff base is separate. Test the latest installed build, not an
older APK with Firebase-only registration. No Firebase Admin JSON or server
data-protection keys belong in Flutter assets or secure session storage.

Use [the acceptance checklist](04-acceptance-and-troubleshooting.md) to verify
204 registration, rider identity, staff send, foreground/background/tap behavior,
replacement language sessions, permission revocation and logout.
