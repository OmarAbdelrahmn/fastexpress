# Staff dashboard notification integration

Read [API contract](01-api-contract.md) for authoritative payloads and limits.
This document specifies suggested frontend behavior, not additional backend APIs.

## Required screens

1. Add a **Send notification** action to an existing rider details screen. Use its
   backend rider integer ID; display rider name and company before submission.
2. Add a broadcast composer for explicitly authorized staff. Show the authorized
   audience description and require a deliberate review/confirmation before submit.
3. Show request status after a successful 202, including an accessible status label
   and separate rider/device counters. A refresh must not send another notification.

Use your existing staff authentication/session mechanism. Do not add Firebase
Admin, a VAPID key, a device FID input or a service-account upload to these screens.

## Permissions and scope

The API permits `Master` globally. Other users require backend-configured grants.
There is no notification permission-discovery API. Use trusted capabilities already
provided by your application's session/bootstrap mechanism when available; decoded
role hints alone cannot establish server-side company grants. Handle API 403 even
when the button was visible. Never widen scope by adding a company selector/body field.

For globally authorized broadcasts say "All eligible riders". For a known company
grant name that company. If frontend scope information is unavailable, show
"Eligible riders in your authorized scope" and do not invent a recipient count.
Server authorization remains authoritative. Empty/unregistered audiences can finish
without any accepted device deliveries.

## Composer

| Control | UI behavior |
| --- | --- |
| English title/body | Required, visible character counters, 120/500 maximum |
| Arabic/Bengali title/body | Optional locale sections; validate both when enabled; Arabic fields RTL |
| Destination | Home / Profile / Performance report |
| Report year/month | Shown only for report; <= current Saudi month; serialize as strings |
| Expiry | Valid 60–604800 seconds, default 86400 |
| Review | Show target/scope, locale fallback, destination and expiry |
| Submit | Disable duplicate clicks; label progress "Queuing…" |

Omit unused locale objects completely rather than sending empty translations.
Preserve draft input on validation, permission, network and server errors. Explain
that message text can appear on a lock screen. Client validation helps users;
server validation still determines acceptance.

## Submission state machine

```text
draft -> validating -> submitting -> accepted(requestId) -> polling -> terminal
                         |
                         +-> outcome unknown -> retry SAME key + SAME payload
                         +-> 400/403/409 -> actionable error, draft retained
```

Create one idempotency key when the user confirms a logical send. Snapshot the
payload; all transport retries reuse that snapshot. Persist pending command state
using the existing account-scoped draft mechanism if refresh recovery is needed.
Clear/restrict that state on staff logout/account change. Do not store staff bearer
tokens alongside draft JSON. After acceptance persist the request ID for recovery.

If the network fails, say "Could not confirm whether the request was queued" and
offer **Check/retry this request** using the original command. Do not silently
generate a new key. Once a user edits an uncertain command, retain the old operation
separately: a new command can result in both messages being delivered.

The 202 toast must say **Notification queued**, not "Delivered". A replay can return
202/queued for a request that is already complete; always GET status afterwards.

## TypeScript transport example

Adapt this to the existing API/auth layer. It has no automatic POST retry; the
caller owns the immutable pending command and reuses its key on explicit retry.

```typescript
type LocaleContent = { title: string; body: string };
type ActionData =
  | { type: "home" }
  | { type: "profile" }
  | { type: "performance_report"; year: string; month: string };

export type NotificationCommand = {
  content: { en: LocaleContent; ar?: LocaleContent; bn?: LocaleContent };
  data: ActionData;
  expiresInSeconds: number;
};
type Queued = { requestId: string; status: "queued" };
export type NotificationStatus = {
  requestId: string;
  status: string; // Keep unknown future values observable.
  audienceRiders: number;
  skippedNoDeviceRiders: number;
  totalDeliveries: number;
  pendingDeliveries: number;
  acceptedDeliveries: number;
  failedDeliveries: number;
  skippedDeliveries: number;
  expiredDeliveries: number;
  createdAtUtc: string;
  expiresAtUtc: string;
};
type PendingCommand = {
  key: string;
  riderId: number | null; // null = broadcast, not an arbitrary scope.
  bodyJson: string;
};

export function prepareCommand(
  riderId: number | null, body: NotificationCommand
): PendingCommand {
  return { key: crypto.randomUUID(), riderId, bodyJson: JSON.stringify(body) };
}

export class NotificationApiError extends Error {
  constructor(
    public status: number,
    public problem: unknown,
    public retryAfter: string | null
  ) { super(`Notification request failed (${status})`); }
}

async function request<T>(
  origin: string, token: string, path: string, init: RequestInit
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Accept", "application/json");
  if (init.body !== undefined) headers.set("Content-Type", "application/json");
  const response = await fetch(`${origin.replace(/\/+$/, "")}${path}`, {
    ...init, headers, cache: "no-store"
  });
  const text = await response.text();
  let body: unknown;
  try { body = text ? JSON.parse(text) : undefined; }
  catch { body = undefined; } // Do not display raw proxy HTML.
  if (!response.ok) {
    throw new NotificationApiError(
      response.status, body, response.headers.get("Retry-After")
    );
  }
  if (response.status !== 204 && body === undefined) {
    throw new Error("Unexpected notification API response");
  }
  return body as T; // Add runtime schema validation in the existing API layer.
}

export function submitCommand(
  origin: string, token: string, command: PendingCommand, signal?: AbortSignal
): Promise<Queued> {
  const path = command.riderId === null
    ? "/api/admin/notifications/broadcasts"
    : `/api/admin/riders/${command.riderId}/notifications`;
  return request(origin, token, path, {
    method: "POST", signal,
    headers: { "Idempotency-Key": command.key }, body: command.bodyJson
  });
}

export function getStatus(
  origin: string, token: string, id: string, signal?: AbortSignal
): Promise<NotificationStatus> {
  return request(origin, token,
    `/api/admin/notifications/${encodeURIComponent(id)}`, { method: "GET", signal });
}
```

Aborting a fetch does not cancel a server-side notification request. Use a bounded
request timeout, then treat a timed-out POST as uncertain. Never map AbortController
to a nonexistent notification-cancellation API.

## Status polling and display

- Start with GET immediately after 202. Suggested subsequent interval: 10 seconds
  for one visible request. This interval is a frontend choice, not a server SLA.
- All status/send calls share 30 requests/minute per actor. Use one shared polling
  coordinator, not a timer per row. With several visible requests lengthen intervals
  or offer manual refresh; there is no batch-status endpoint.
- Pause when the page is hidden; cancel stale requests on navigation/logout. On
  resume perform a fresh GET using the current staff session.
- Stop automatically on `completed` or `completed_with_errors`. On an unknown
  state show it safely and pause with manual refresh rather than assuming success.
- On 401 stop and follow staff session handling; on 403 stop with permission
  guidance. On 404 show "Unavailable, outside your scope, or no longer retained".
- On 429 honor Retry-After if available; otherwise use a conservative cooldown
  such as 60 seconds. On transient errors retain the last successful counters,
  indicate stale data and retry with bounded backoff.
- Counters grow during expansion. Do not show a fixed percentage from the first
  `totalDeliveries`, and do not create an overall completion estimate from it.

| Counter/state | Suggested label |
| --- | --- |
| `acceptedDeliveries` | Accepted by Firebase |
| `failedDeliveries` | Failed device deliveries |
| `expiredDeliveries` | Expired device deliveries |
| `skippedDeliveries` | Skipped device bindings |
| `skippedNoDeviceRiders` | Riders without an eligible registered device |
| `completed` with zero accepted | Finished; no accepted device deliveries |
| `completed_with_errors` | Finished with delivery errors |

Do not expose a **Retry failed** or **Cancel** button: neither API exists. A new
send with a new key is a separate message and can reach devices that already
accepted the first. Do not offer a notification history list backed solely by
remembered browser request IDs; the backend has no list endpoint.

## Browser integration details

The API must allow your frontend origin through its deployed CORS policy. A JSON
POST with Authorization and Idempotency-Key triggers a browser preflight. Do not
try `mode: "no-cors"`; fix the allowed origin on the backend.

Current CORS setup does not explicitly expose Location or Retry-After to browser
JavaScript. Construct the status URL from response JSON `requestId`; treat an
unreadable Retry-After as absent. If the frontend needs these headers, coordinate
explicit backend `WithExposedHeaders` configuration. This is not needed to use the
JSON request ID. The browser never sends Firebase Admin credentials.

## Automatic notifications

Changing a rider's language through the mobile language endpoint stages a
localized profile-update notification. Do not send a second staff message to
replicate this event. Daily reminders are backend configuration and default off;
there is no UI scheduling endpoint. Performance CRUD/import does not currently
publish report notifications automatically; an authorized staff member can send
a `performance_report` action manually for an existing period.
