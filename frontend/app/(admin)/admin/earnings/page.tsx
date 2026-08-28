"use client";

import { useState, useEffect } from "react";
import AdminSettlementPanel from "@/components/AdminSettlementPanel";
import { fetchAdminEarnings } from "@/lib/api/earnings";
import type { EarningsDashboard, EarningsTransaction as Transaction } from "@/lib/types/earnings";
import Image from "next/image";
import {
  Wallet,
  TrendingUp,
  Tag,
  Clock,
  Search,
  PieChart as PieIcon,
  BarChart2,
  Receipt,
  Eye,
  XCircle,
} from "lucide-react";

type TransactionType = "thrift" | "rent";

export default function EarningsPage() {
  const [data, setData] = useState<EarningsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [typeFilter, setTypeFilter] = useState<"all" | TransactionType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true); setError(null);
      try {
        const result = await fetchAdminEarnings(typeFilter, searchQuery, page, controller.signal);
        if (!controller.signal.aborted) setData(result);
      } catch {
        if (!controller.signal.aborted) setError("Could not load earnings. Check your admin session and retry.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 200);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [typeFilter, searchQuery, page, refreshKey]);

  useEffect(() => {
    const refresh = () => setRefreshKey(key => key + 1);
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setSelectedTxn(null); };
    window.addEventListener("focus", refresh);
    window.addEventListener("keydown", escape);
    return () => { window.removeEventListener("focus", refresh); window.removeEventListener("keydown", escape); };
  }, []);

  if (!data) return <div className="p-8" role="status">{error ?? "Loading verified payment earnings…"}{error && <button onClick={() => setRefreshKey(key => key + 1)} className="ml-3 underline">Retry</button>}</div>;

  const transactions = data.transactions;
  const filteredTransactions = transactions;
  const metrics = { ...data.metrics, totalThriftGMV: data.metrics.thriftGMV, totalRentGMV: data.metrics.rentGMV };
  const monthlyEarnings = data.monthly;

  return (
    <div className="flex flex-col gap-8 max-w-[1400px]">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-amber-200 bg-amber-50 p-3 text-xs">
        <p>Verified sandbox payments · calculated commission allocations, not transferred payouts. Deposits/shipping are excluded. Cancelled rentals retain a 7% fee instead of 20% commission. Refunds and withdrawals remain pending until provider processing is integrated.</p>
        <button disabled={loading} onClick={() => setRefreshKey(key => key + 1)} className="font-bold underline">{loading ? "Refreshing…" : "Refresh"}</button>
      </div>
      {error && <p role="alert" className="text-sm text-red-700">{error} Previously loaded figures are shown.</p>}
      {data.reviewCount > 0 && <details className="border border-amber-400 bg-amber-50 p-4 text-sm">
        <summary className="cursor-pointer font-semibold">{data.reviewCount} successful payment(s) need review and are excluded from commission totals</summary>
        <ul className="mt-3 space-y-2">{data.reviewIssues.map(issue => <li key={issue.reference}>{issue.reference} · Order #{issue.orderId}: {issue.reason}</li>)}</ul>
      </details>}
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-2 border-[#1C1C1C]/15 pb-4">
        <div>
          <h1
            className="text-2xl sm:text-3xl text-[#1C1C1C] flex items-center gap-2"
            style={{ fontFamily: "Georgia, serif" }}
          >
            <Wallet size={28} className="text-[#A33214]" />
            Earnings & Commission Breakdown
          </h1>
          <p className="text-xs uppercase tracking-[0.1em] text-[#1C1C1C]/60 mt-1">
            Revenue tracking across 12% Thrift Commission & 20% Rental
            Commission
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-[#1C1C1C] text-[#FDF6EC] font-bold text-xs uppercase tracking-wider">
            Calculated Commission: Rs {metrics.totalCommission.toLocaleString()}
          </div>
        </div>
      </div>

      <AdminSettlementPanel refreshKey={refreshKey} />
      {/* Metric Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Platform Earnings */}
        <div className="border-2 border-[#1C1C1C]/15 bg-white/60 p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-[0.14em] text-[#1C1C1C]/60 font-semibold">
              Platform Commission Allocation
            </span>
            <TrendingUp size={18} className="text-[#A33214]" />
          </div>
          <p
            className="text-2xl sm:text-3xl text-[#A33214] mt-2 font-bold"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Rs {metrics.totalCommission.toLocaleString()}
          </p>
          <p className="text-[10px] uppercase tracking-[0.08em] text-[#1C1C1C]/50 mt-1">
            From Rs {metrics.totalGMV.toLocaleString()} total Volume
          </p>
        </div>

        {/* Card 2: Thrift Commission (12%) */}
        <div className="border-2 border-[#1C1C1C]/15 bg-white/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-[0.14em] text-[#1C1C1C]/60 font-semibold flex items-center gap-1.5">
              <Tag size={14} className="text-[#1C1C1C]" />
              Thrift Sales (12%)
            </span>
          </div>
          <p
            className="text-2xl text-[#1C1C1C] mt-2 font-bold"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Rs {metrics.thriftCommission.toLocaleString()}
          </p>
          <p className="text-[10px] uppercase tracking-[0.08em] text-[#1C1C1C]/50 mt-1">
            GMV: Rs {metrics.totalThriftGMV.toLocaleString()}
          </p>
        </div>

        {/* Card 3: Rent Commission (20%) */}
        <div className="border-2 border-[#1C1C1C]/15 bg-white/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-[0.14em] text-[#1C1C1C]/60 font-semibold flex items-center gap-1.5">
              <Clock size={14} className="text-[#A33214]" />
              Rentals (20%)
            </span>
          </div>
          <p
            className="text-2xl text-[#1C1C1C] mt-2 font-bold"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Rs {metrics.rentCommission.toLocaleString()}
          </p>
          <p className="text-[10px] uppercase tracking-[0.08em] text-[#1C1C1C]/50 mt-1">
            GMV: Rs {metrics.totalRentGMV.toLocaleString()}
          </p>
        </div>

        {/* Card 4: Average Take Rate */}
        <div className="border-2 border-[#1C1C1C]/15 bg-white/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-[0.14em] text-[#1C1C1C]/60 font-semibold">
              Effective Take Rate
            </span>
            <Receipt size={18} className="text-[#1C1C1C]/60" />
          </div>
          <p
            className="text-2xl text-[#1C1C1C] mt-2 font-bold"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {metrics.totalGMV > 0
              ? ((metrics.totalCommission / metrics.totalGMV) * 100).toFixed(1)
              : "0"}
            %
          </p>
          <p className="text-[10px] uppercase tracking-[0.08em] text-[#1C1C1C]/50 mt-1">
            Blended Commission Yield
          </p>
        </div>
      </section>

      {/* Visual Analytics Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Bar Chart: Monthly Growth */}
        <div className="lg:col-span-3 border-2 border-[#1C1C1C]/15 bg-white/60 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#1C1C1C]/10 pb-3 mb-4">
            <h2
              className="text-base text-[#1C1C1C] flex items-center gap-2"
              style={{ fontFamily: "Georgia, serif" }}
            >
              <BarChart2 size={18} className="text-[#A33214]" />
              Monthly Calculated Commission (NPR)
            </h2>
            <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-[#1C1C1C] inline-block" /> Thrift
                (12%)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-[#A33214] inline-block" /> Rent
                (20%)
              </span>
            </div>
          </div>

          {/* SVG Bar Chart */}
          <div className="h-48 w-full flex items-end justify-between gap-3 pt-6 px-2">
            {monthlyEarnings.map((item) => {
              const maxVal = Math.max(1, ...monthlyEarnings.flatMap(row => [row.thriftComm, row.rentComm]));
              const thriftHeight = (item.thriftComm / maxVal) * 100;
              const rentHeight = (item.rentComm / maxVal) * 100;

              return (
                <div
                  key={item.month}
                  className="flex-1 flex flex-col items-center h-full justify-end group relative"
                >
                  {/* Hover tooltip */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1C1C1C] text-[#FDF6EC] text-[10px] p-1.5 rounded-xs pointer-events-none whitespace-nowrap z-10">
                    Rs {(item.thriftComm + item.rentComm).toLocaleString()}
                  </div>

                  <div className="w-full max-w-[36px] flex items-end gap-1 h-full">
                    <div
                      style={{ height: `${thriftHeight}%` }}
                      className="w-1/2 bg-[#1C1C1C] transition-all hover:opacity-80"
                      title={`Thrift: Rs ${item.thriftComm}`}
                    />
                    <div
                      style={{ height: `${rentHeight}%` }}
                      className="w-1/2 bg-[#A33214] transition-all hover:opacity-80"
                      title={`Rent: Rs ${item.rentComm}`}
                    />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-[#1C1C1C]/60 mt-2">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Donut / Proportion Card */}
        <div className="lg:col-span-2 border-2 border-[#1C1C1C]/15 bg-white/60 p-5 flex flex-col justify-between">
          <div className="border-b border-[#1C1C1C]/10 pb-3 mb-4">
            <h2
              className="text-base text-[#1C1C1C] flex items-center gap-2"
              style={{ fontFamily: "Georgia, serif" }}
            >
              <PieIcon size={18} className="text-[#A33214]" />
              Commission Distribution
            </h2>
          </div>

          <div className="flex flex-col items-center justify-center py-2 space-y-4">
            {/* Custom SVG Donut */}
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke="#1C1C1C"
                  strokeWidth="4"
                  strokeDasharray={`${
                    metrics.totalCommission > 0
                      ? (metrics.thriftCommission / metrics.totalCommission) *
                        100
                      : 0
                  } 100`}
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke="#A33214"
                  strokeWidth="4"
                  strokeDasharray={`${
                    metrics.totalCommission > 0
                      ? (metrics.rentCommission / metrics.totalCommission) * 100
                      : 0
                  } 100`}
                  strokeDashoffset={`-${
                    metrics.totalCommission > 0
                      ? (metrics.thriftCommission / metrics.totalCommission) *
                        100
                      : 0
                  }`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] uppercase font-extrabold text-[#1C1C1C]/50">
                  Total
                </span>
                <span className="text-xs font-bold text-[#1C1C1C]">
                  Rs {metrics.totalCommission.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="w-full space-y-2 text-xs font-bold">
              <div className="flex items-center justify-between border-b border-[#1C1C1C]/10 pb-1">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-[#1C1C1C]" />
                  Thrift Commission (12%)
                </span>
                <span>
                  {metrics.totalCommission > 0
                    ? (
                        (metrics.thriftCommission / metrics.totalCommission) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-[#1C1C1C]/10 pb-1">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-[#A33214]" />
                  Rental Commission (20%)
                </span>
                <span>
                  {metrics.totalCommission > 0
                    ? (
                        (metrics.rentCommission / metrics.totalCommission) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Itemized Transactions Breakdown */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center bg-[#FDF6EC] border border-[#1C1C1C]/20 p-1 self-start rounded-xs shadow-xs">
            <button
              onClick={() => { setTypeFilter("all"); setPage(0); }}
              className={`px-4 py-1.5 font-extrabold text-xs uppercase tracking-wider transition-all rounded-xs ${
                typeFilter === "all"
                  ? "bg-[#1C1C1C] text-[#FDF6EC]"
                  : "text-[#1C1C1C]/80 hover:text-[#1C1C1C]"
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => { setTypeFilter("thrift"); setPage(0); }}
              className={`px-4 py-1.5 font-extrabold text-xs uppercase tracking-wider transition-all rounded-xs flex items-center gap-1.5 ${
                typeFilter === "thrift"
                  ? "bg-[#1C1C1C] text-[#FDF6EC]"
                  : "text-[#1C1C1C]/80 hover:text-[#1C1C1C]"
              }`}
            >
              <Tag size={13} />
              Thrift Sales
            </button>
            <button
              onClick={() => { setTypeFilter("rent"); setPage(0); }}
              className={`px-4 py-1.5 font-extrabold text-xs uppercase tracking-wider transition-all rounded-xs flex items-center gap-1.5 ${
                typeFilter === "rent"
                  ? "bg-[#A33214] text-[#FDF6EC]"
                  : "text-[#1C1C1C]/80 hover:text-[#A33214]"
              }`}
            >
              <Clock size={13} />
              Rentals
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1C1C1C]/50"
            />
            <input
              type="text"
              placeholder="Search by ID, item, seller..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
              className="w-full bg-[#FDF6EC] text-[#1C1C1C] border border-[#1C1C1C]/20 rounded-xs pl-9 pr-3 py-1.5 text-xs font-semibold placeholder-[#1C1C1C]/40 focus:outline-none focus:border-[#A33214]"
            />
          </div>
        </div>

        {/* Transactions Table */}
        <div className="border-2 border-[#1C1C1C]/15 bg-white/60 overflow-x-auto shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1C1C1C] text-[#FDF6EC] text-xs uppercase font-bold tracking-wider">
                <th className="p-3">Txn ID / Order</th>
                <th className="p-3">Item</th>
                <th className="p-3">Type</th>
                <th className="p-3">Item / Rental Fee</th>
                <th className="p-3">Comm. Rate</th>
                <th className="p-3">Platform Cut</th>
                <th className="p-3">Seller Share (Pending)</th>
                <th className="p-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C1C]/10 font-medium text-xs text-[#1C1C1C]">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-8 text-[#1C1C1C]/60 font-semibold uppercase tracking-wider"
                  >
                    No transactions match your criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn) => {
                  const rate = txn.commissionRate;
                  const platformCut = txn.platformCut;
                  const sellerPayout = txn.sellerShare;

                  return (
                    <tr
                      key={txn.id}
                      className="hover:bg-[#A33214]/5 transition-colors"
                    >
                      <td className="p-3 font-mono font-bold text-[#A33214]">
                        <div>{txn.id}</div>
                        <div className="text-[10px] text-[#1C1C1C]/50">
                          {txn.orderId}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <Image
                            src={txn.itemImage}
                            alt={txn.itemTitle}
                            width={36}
                            height={36}
                            className="w-9 h-9 object-cover border border-[#1C1C1C]/20 rounded-xs shrink-0"
                          />
                          <div>
                            <p className="font-bold line-clamp-1">
                              {txn.itemTitle}
                            </p>
                            <p className="text-[10px] text-[#1C1C1C]/60">
                              Seller: {txn.sellerName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border rounded-xs ${
                            txn.type === "thrift"
                              ? "bg-stone-100 text-[#1C1C1C] border-[#1C1C1C]/30"
                              : "bg-amber-50 text-amber-900 border-amber-300"
                          }`}
                        >
                          {txn.type === "thrift" ? "Thrift Sale" : "Rental"}
                        </span>
                      </td>
                      <td className="p-3 font-bold">
                        Rs {txn.grossAmount.toLocaleString()}
                      </td>
                      <td className="p-3 font-bold text-[#A33214]">
                        {txn.source === "CANCELLATION_7_PERCENT" ? "7% cancellation fee" : `${(rate * 100).toFixed(0)}%`}
                      </td>
                      <td className="p-3 font-bold text-emerald-800 bg-emerald-50/50">
                        +Rs {platformCut.toLocaleString()}
                      </td>
                      <td className="p-3 font-semibold text-[#1C1C1C]/70">
                        Rs {sellerPayout.toLocaleString()}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedTxn(txn)}
                          className="p-1.5 bg-[#1C1C1C] text-[#FDF6EC] hover:bg-[#A33214] transition-colors rounded-xs"
                          title="Inspect Commission"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex items-center justify-between text-sm">
        <span>{data.totalElements} item allocations · Page {page + 1}</span>
        <div className="flex gap-3">
          <button disabled={page === 0 || loading} onClick={() => setPage(value => value - 1)} className="disabled:opacity-40">Previous</button>
          <button disabled={(page + 1) * data.size >= data.totalElements || loading} onClick={() => setPage(value => value + 1)} className="disabled:opacity-40">Next</button>
        </div>
      </div>
      <p className="text-xs text-stone-600">Seller share allocated: Rs {metrics.sellerShare.toLocaleString()} · Recorded successful collections: Rs {metrics.verifiedCollections.toLocaleString()} · Non-commissionable charges on included orders: Rs {metrics.excludedCharges.toLocaleString()}. Legacy seller identities may be unavailable.</p>
      {/* Transaction Detail Modal */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1C1C]/50 backdrop-blur-xs">
          <div className="bg-[#FDF6EC] border-2 border-[#1C1C1C]/20 w-full max-w-lg p-6 space-y-6 shadow-xl rounded-xs">
            <div className="flex items-center justify-between border-b border-[#1C1C1C]/15 pb-3">
              <h2
                className="text-lg text-[#1C1C1C] uppercase tracking-wide font-bold"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Commission Slip: {selectedTxn.id}
              </h2>
              <button
                aria-label="Close commission details"
                onClick={() => setSelectedTxn(null)}
                className="text-[#1C1C1C]/60 hover:text-[#A33214] p-1 transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs text-[#1C1C1C]">
              <div className="flex gap-3">
                <Image
                  src={selectedTxn.itemImage}
                  alt={selectedTxn.itemTitle}
                  width={64}
                  height={64}
                  className="w-16 h-16 object-cover border border-[#1C1C1C]/20 rounded-xs"
                />
                <div>
                  <p className="font-bold text-sm">{selectedTxn.itemTitle}</p>
                  <p className="text-[#1C1C1C]/60">
                    Order ID: {selectedTxn.orderId}
                  </p>
                  <p className="text-[#1C1C1C]/60">Date: {selectedTxn.date}</p>
<p className="text-[#1C1C1C]/60">{selectedTxn.gateway} · {selectedTxn.paymentReference}</p>
<p className="text-[#1C1C1C]/60">Source: {selectedTxn.source === "CANCELLATION_7_PERCENT" ? "Retained 7% of original rental fee; no seller share" : selectedTxn.source === "CHECKOUT_SNAPSHOT" ? "Stored checkout fee snapshot" : "Legacy thrift price snapshot"}</p>
                </div>
              </div>

              <div className="bg-white/80 p-4 border border-[#1C1C1C]/15 space-y-2">
                <div className="flex justify-between border-b border-[#1C1C1C]/10 pb-1">
                  <span>{selectedTxn.source === "CANCELLATION_7_PERCENT" ? "Retained cancellation fee" : "Commissionable Item / Rental Fee"}</span>
                  <span className="font-bold">
                    Rs {selectedTxn.grossAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#1C1C1C]/10 pb-1 text-[#A33214]">
                  <span>
                    {selectedTxn.source === "CANCELLATION_7_PERCENT" ? "Cancellation fee (7% of original rental fee)" : `Platform Commission (${(selectedTxn.commissionRate * 100).toFixed(0)}%)`}
                  </span>
                  <span className="font-bold">
                    +Rs{" "}
                    {selectedTxn.platformCut.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between pt-1 font-bold text-sm">
                  <span>Seller Share (Not Paid Out)</span>
                  <span>
                    Rs{" "}
                    {selectedTxn.sellerShare.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
