# Notification module

## Implemented

Persistent per-user inbox, owner-scoped REST APIs, authenticated STOMP/WebSocket delivery, unread count and mark-one/read-all operations. Customer/mobile navbar, admin dropdown and /notifications share NotificationProvider.

Existing payment, listing moderation, donation, report and account moderation services publish notifications. Shipping, rental return/extension, refund and payout triggers remain for their future modules; they are not simulated.

## Architecture

Business transaction -> notification + inbox state + delivery outbox -> scheduled dispatcher -> private WebSocket queue -> shared frontend state and REST inbox refresh.

Notification records are created in the business transaction, not by the socket worker. A transaction rollback creates no inbox item. The dispatcher retries transport failures; duplicate deliveries are safe because clients compare revisions. Offline users recover from MySQL on reconnect.

User-row/inbox-row locks serialize recipient updates. The unread count is a stored, transactional counter (not browser arithmetic). Mark-all accepts a sequence watermark; newer notifications stay unread. The inbox revision prevents stale network responses from restoring obsolete badge counts.

Single backend instance only: Spring's simple broker is in memory. Use shared broker routing and multi-worker outbox claiming before scaling to multiple application nodes.

## Setup

- Backend dependency: spring-boot-starter-websocket (Boot-managed version).
- Frontend dependency: @stomp/stompjs.
- New tables: notifications, notification_inbox_state, notification_outbox.
- Current local Hibernate ddl-auto=update creates the tables on backend restart.
- A reviewed MySQL creation script is in database/migrations/001_notifications.sql. It is not automatically executed by a migration runner and was not applied to the user's database.
- NEXT_PUBLIC_API_URL must point to the Spring backend; it is also converted to ws/wss for the socket URL.
- app.frontend-url must match the frontend origin. Existing localhost:3000/3001 origins are accepted.
- app.notifications.dispatch-delay-ms defaults to 1000.
- No gateway credentials or production database were used by the notification integration tests.

## Contracts

- GET /api/notifications?cursor=<sequence>&size=20&unreadOnly=false
- GET /api/notifications/unread-count
- PATCH /api/notifications/{id}/read
- PATCH /api/notifications/read-all with JSON { "throughSequence": 12 }
- WebSocket endpoint: /ws/notifications
- STOMP CONNECT Authorization header: Bearer <access token>
- Subscribe: /user/queue/notifications

Responses carry unreadCount, revision and watermark. Page responses additionally carry items and nextCursor. Socket INBOX_CHANGED events include eventId plus the latest state for that event. Clients refresh the inbox after an event.

The handshake is public because browser WebSockets cannot attach an arbitrary HTTP Authorization header. STOMP authentication validates the access token, user ID and active account. Refresh tokens are not accepted. All client SEND messages and subscriptions outside the personal queue are denied. Outbound messages recheck identity/expiry/account status; a scheduler closes expired/banned sessions. No token appears in URLs.

Design reference: [Spring token-based STOMP authentication](https://docs.spring.io/spring-framework/reference/web/websocket/stomp/authentication-token-based.html).

## Adding a business trigger

Inject NotificationService into a transactional business service. Call notifyUser with the recipient ID from trusted records, a stable event key, NotificationType, title/message and a local href. Use notifyAdmins for moderation intake. Never let browsers choose arbitrary recipients or publish socket messages.

Use stable keys for idempotent events such as successful payment. Emit status-change events only when the state actually changes. Do not include private report notes, tokens, OTPs or gateway payloads.

Account-ban notifications are persisted but not streamed to a banned session. They are visible if access is restored. Critical email integration is a follow-up.

## Verification

Run from backend:

```powershell
.\mvnw.cmd "-Dtest=NotificationIntegrationTest,PasswordResetServiceTest" test
```

NotificationIntegrationTest uses isolated H2 and real HTTP/WebSocket connections. Covers persistence/deduplication, read-all watermark, owner isolation, pagination, rollback, access versus refresh tokens, foreign subscription rejection, two-session live unread/read-all broadcasts, and concurrent creation.

Verified this run: 6 notification tests + 1 existing password-reset test passed. Frontend production build passed (32 generated pages); targeted ESLint on new notification files passed.
Existing build blockers were corrected without changing transaction logic: admin ARCHIVED badge, an impossible ADMIN comparison on activity-role data, and missing Suspense boundaries on rent/browse/signup/verify-otp/OAuth callback pages.

Frontend checks: npm run build; targeted ESLint on new notification files. Full-repository lint was not run; only the new notification files are claimed lint-clean.

## Remaining release checks

- Test against a disposable MySQL instance; H2 does not prove every MySQL locking/deployment behavior.
- Manually verify authenticated browser badge disappearance and reconnect on two devices with the actual application running.
- Review existing broader admin/ownership security separately; this module does not fix the project's permitAll admin routes.
- Add operational monitoring, outbox retention/backoff, rate limiting and multi-node support before production scale.
- Add future lifecycle triggers only when the corresponding modules exist.
- Review npm audit warnings; dependency install also reconciled the existing cross-env lockfile mismatch to package.json's ^7.0.3.
