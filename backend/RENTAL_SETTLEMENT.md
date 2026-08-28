# Rental lifecycle and seller earnings

Implemented 2026-08-28. This file supersedes the older 10% cancellation proposal: the current fee is **7% of the rental usage fee**.

## User flow

`/profile/rentals` has buyer and seller perspectives, backed by `/api/rentals` rather than buyer order-history projections.

| Action | Who / when | Accounting | Listing |
|---|---|---|---|
| Cancel rental | Buyer, strictly before start date at Nepal midnight | Retain 7% of rental fee; refund due = remaining 93% + 100% deposit + shipping | Release this reservation |
| Confirm returned | Owning seller, on/after start date, after physically receiving the garment | Full deposit refund due; seller gets rental fee less 20% commission as an internal available balance | Release this reservation |
| Thrift verified payment | Owning seller | 88% of thrift fee available; 12% commission | Existing sold-out lifecycle |

Return confirmation is irreversible. Cancellation is not available on the starting day, even before the booking's time of day. Rounding is HALF_UP to two NPR decimals. Shipping is excluded from commission and seller earnings; this implementation refunds it on pre-start cancellation. A future dispatched-shipping policy needs a separate fulfillment module.

Closing a rental does not cancel its paid parent order (which may contain other items). Per-item state is `ACTIVE` (including legacy null), `CANCELLED`, or `RETURNED`. Description/media are unchanged; availability only becomes AVAILABLE if no other paid open rental/thrift item references that listing. Archived/rejected listings remain moderated, not automatically republished.

## Money is not yet transferred automatically

**Refunds and seller payouts are not fully implemented.** `refundDueNpr` is an obligation, not a completed refund. Nonzero refunds remain `PENDING_PROVIDER`. Deposits continue to appear as held liabilities until an actual provider transfer can be reconciled. A returned toggle must never be interpreted as proof of payment.

Seller `/profile/earnings` uses verified, reconciled payment snapshots. It shows total earned, pending rental earnings, available balance, reserved withdrawals and withdrawn amount. Withdrawn is currently zero because no payout adapter is configured. Thrift credit is currently released at verified payment; releasing thrift proceeds only after handover is a future fulfillment change.

eSewa/Khalti withdrawal forms create `PENDING_PROVIDER_SETUP` requests and reserve internal balances; they do **not** send funds. Sellers can cancel pending requests to restore availability. The confirmation modal explicitly warns about this. Request UUID + seller unique constraint and per-seller database lock prevent retry duplicates/overspending. Wallet account numbers are masked in responses, and never included in notifications.

### Provider integration still required

- Khalti documents a sandbox partial-refund endpoint: [Refund API](https://docs.khalti.com/api/refund/). Use the provider's transaction_id obtained from server-side lookup, not a callback-supplied ID. Refund amounts are in paisa. Bank payments may also require a wallet mobile number.
- The existing Khalti payment field now retains pidx for lookup. An adapter must obtain and persist the distinct verified transaction ID before refunding. Historical records may have overwritten pidx and need reconciliation.
- eSewa public [ePay docs](https://developer.esewa.com.np/pages/Epay) document collection/status checks but did not provide a verified seller disbursement interface in this review. Obtain merchant-approved refund/disbursement endpoints and sandbox entitlements.
- A buyer refund API is not a seller payout API. Confirm provider-specific merchant payout support and credentials for both gateways before enabling actual withdrawals.
- Implement immutable transfer attempts, provider idempotency/reconciliation, timeout/unknown status recovery, and verified completion notifications. Release held deposits/reserved balances only after confirmed success; never automatically retry an ambiguous financial transfer.
- No outbound sandbox refund or payout was attempted in this change.

## API / storage

- GET `/api/rentals`: current user's buyer and seller rental rows, eligibility and refund state.
- POST `/api/rentals/{orderItemId}/cancel`, `/return`: ownership/date validation, locked/idempotent terminal transitions, notification outbox events.
- GET `/api/seller/earnings`: internal balance and transaction/withdrawal history.
- POST `/api/seller/earnings/withdrawals`: amount, gateway ESEWA/KHALTI, mobile account, requestKey UUID; validation and balance reservation.
- POST `/api/seller/earnings/withdrawals/{id}/cancel`: only the owner, only pending requests.
- GET `/api/admin/earnings/settlement`: admin-only deposits, refund obligations and withdrawal queue. Existing admin commission totals now replace cancelled rentals' 20% allocation with their 7% cancellation fee.
- Migration: `database/migrations/003_rental_settlement.sql`; apply once with backup if not using Hibernate development schema updates. Do not run after ddl-auto has already created these columns/table.

New money APIs require access JWT claims and active database users; admin reporting checks ADMIN in the service. Money is derived only from one successful payment per order with matching totals and complete fee/deposit/shipping/seller snapshots. Incomplete legacy or duplicate-payment orders require review and cannot be withdrawn/refunded automatically.

The current dashboard performs aggregation in memory; indexed/paginated ledger queries are needed for larger production datasets. A full accounting ledger, automated payout adapter, delivery disputes, rental extensions, production escrow/compliance and bank settlement are outside this implementation.

## Verification

Automated H2 tests cover ownership, start-date cutoff, 7% cancellation, deposit liabilities, seller net earnings, repeat and simultaneous cancellation, repeat and concurrent withdrawals, insufficient funds, legacy review, existing reservations, inactive users, access-vs-refresh JWTs and admin authorization. Notification calls in lifecycle tests are mocked; the existing notification integration suite separately exercises persistence and real WebSocket delivery.

The existing application-context smoke test loads local MySQL and uses the application's development schema-update configuration. Other financial integration tests use isolated H2 databases. No authenticated browser walkthrough or real provider refund/payout verification has been performed.


## Admin confirmation update

Admin Earnings now offers **Record completed refund** for valid pending rental refunds. This is an audited manual confirmation, not an automatic gateway transfer: the admin must first execute/verify the external refund and provide its reference and exact amount. POST `/api/admin/earnings/refunds/{id}/confirm` is admin-only and rejects unreturned rentals, mismatched amounts and reused references. Immutable `refund_receipts` records store the admin, item, amount, gateway, reference and timestamp; migration 004 adds the table.

On confirmation, `REFUNDED_MANUALLY` removes the obligation from held deposits/refunds due and sends one buyer notification explicitly attributed to the admin. Seller earnings stay unchanged by deposit refunds: 88% of verified thrift fees is available immediately; 80% of rental fees is pending until returned, then available. Seller/admin screens reload on notification changes. Legacy incomplete snapshots still require reconciliation; current listing prices are not used to invent historical earnings.
