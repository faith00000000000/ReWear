# Admin earnings reporting

## What is connected

GET /api/admin/earnings?type=all|thrift|rent&search=&page=0&size=20 drives the admin earnings cards, six-month chart, itemized allocations, filters, pagination and detail slip. Only verified SUCCESS payment records are considered. Authentication, active account and database ADMIN role are required; refresh tokens cannot access the endpoint.

The backend calculates amounts with BigDecimal and rounds each commission to two decimal places (HALF_UP). Thrift: 12% of merchandise fee; rent: 20% of rental usage fee. Seller share = fee minus commission. Deposits and shipping are excluded.

Example: thrift fee 1,000 gives platform 120 / seller 880. Rental fee 2,000 + deposit 3,000 gives platform 400 / seller 1,600, with the deposit excluded.

These are calculated allocations from recorded successful payments, NOT gateway split transfers, available withdrawals, recognized settled revenue or bank payouts. The seller's separate earnings page is not added in this task. Cancellation, extension and refund adjustments remain pending their lifecycle modules.

## New order snapshots

Order items now store feeAmountNpr, depositAmountNpr, shippingAmountNpr, commissionRate, sellerId and sellerName. Listing prices/deposit and seller identity are read on the backend at checkout; later listing edits/deletion cannot change the fee or seller snapshot.

Rental quantity preserves the CURRENT application's billing convention: max(1, end date minus start date). It does not introduce the proposed inclusive-date policy from the earlier plan. The cart subtotal now multiplies the daily rate by rentalDays and preserves decimal prices.

Order totals are computed from stored fee/deposit/shipping; the payment modal uses the server's total. Initiation rejects an amount different from the stored order total. Existing gateway request models use whole NPR, so fractional-NPR totals are explicitly rejected rather than silently truncated.

Shipping fee is currently the selected client quote, validated as nonnegative (pickup forces zero); authoritative destination/rate validation remains fulfillment-module work. Existing inventory/ownership/payment-attempt hardening also remains outside this reporting change.

## Existing sandbox data

- Legacy thrift: a strictly parseable recorded order-item price can be reported, clearly tagged LEGACY_THRIFT_SNAPSHOT; no current listing prices are substituted.
- Legacy rentals without separate fee/deposit snapshots are excluded into Needs review. Their old cart could charge only one daily rate, and a deposit must never be reclassified as rental income to hide that.
- Missing legacy seller identity stays explicitly unknown; it is not attributed to the listing's current owner.
- Duplicate successful payments for one order produce only one set of item allocations; extra collections are listed for review.
- Unconfirmed/cancelled paid orders, missing dates, unparseable amounts and non-reconciling totals are also reviewed, not silently counted.
- Verified collections includes all SUCCESS captures; commissionable fees exclude review cases. Non-commissionable charges covers the remainder on INCLUDED orders, not a global deposit balance.
- Metrics are all-time; the monthly chart covers the current Nepal month and previous five months. Stored payment completion timestamps are existing local backend timestamps. Run the backend in Asia/Kathmandu for consistent interpretation.
- Item search/type filters affect the paginated table, not the all-time summary/chart.

No old payment records are rewritten or real sandbox transactions initiated by this implementation.

## Setup and verification

Restart backend/frontend. Local Hibernate ddl-auto=update adds nullable snapshot columns. Review database/migrations/002_earnings_snapshots.sql for managed deployment; it is not automatically run by a migration framework.

Run:

```powershell
.\mvnw.cmd "-Dtest=EarningsIntegrationTest,NotificationIntegrationTest,PasswordResetServiceTest" test
```

Frontend: npm run build and targeted ESLint for the earnings page/API/types.

The tests use isolated H2, not the user's database or eSewa/Khalti network calls. Live sandbox checkout and disposable-MySQL verification are separate release checks. Reporting currently reads successful payments with batched order items and computes summaries in memory; use database aggregation/ledger projections before large-volume deployment.


## Rental and seller settlement update — 2026-08-28

Buyer/seller rental views, guarded cancellation/return, **7% rental cancellation fee** (supersedes the former 10% proposal), refund-due tracking, admin deposit reporting, seller earnings and pending withdrawal requests are implemented. Actual gateway refunds and seller payouts remain unimplemented; requests do not transfer money. See [rental settlement details](RENTAL_SETTLEMENT.md) for accounting policies, API details, limitations and verification.
