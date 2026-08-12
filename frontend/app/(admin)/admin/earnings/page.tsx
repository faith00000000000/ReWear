"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  Wallet,
  TrendingUp,
  Tag,
  Clock,
  Search,
  Filter,
  DollarSign,
  ArrowUpRight,
  PieChart as PieIcon,
  BarChart2,
  Receipt,
  Eye,
  XCircle,
} from "lucide-react";

type TransactionType = "thrift" | "rent";

interface Transaction {
  id: string;
  orderId: string;
  itemTitle: string;
  itemImage: string;
  sellerName: string;
  buyerName: string;
  type: TransactionType;
  grossAmount: number; // In NPR / Rs.
  date: string;
}

// Fixed commission rates
const THRIFT_COMMISSION_RATE = 0.12; // 12%
const RENT_COMMISSION_RATE = 0.2; // 20%

// Mock transaction data
const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "TXN-8801",
    orderId: "ORD-9901",
    itemTitle: "Vintage Denim Jacket - Oversized",
    itemImage:
      "https://images.unsplash.com/photo-1544441893-675973e31985?w=300",
    sellerName: "RetroWardrobe",
    buyerName: "Siddharth Shrestha",
    type: "thrift",
    grossAmount: 4500,
    date: "2026-08-10",
  },
  {
    id: "TXN-8802",
    orderId: "ORD-9902",
    itemTitle: "Silk Evening Gown - Crimson Red",
    itemImage:
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=300",
    sellerName: "GlamRentals",
    buyerName: "Aayusha Thapa",
    type: "rent",
    grossAmount: 7500,
    date: "2026-08-08",
  },
  {
    id: "TXN-8803",
    orderId: "ORD-9903",
    itemTitle: "North Face Puffer Jacket - Black",
    itemImage:
      "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=300",
    sellerName: "HimalayanThrift",
    buyerName: "Rohan Adhikari",
    type: "thrift",
    grossAmount: 11000,
    date: "2026-08-05",
  },
  {
    id: "TXN-8804",
    orderId: "ORD-9904",
    itemTitle: "Traditional Cultural Dress - Lehenga",
    itemImage:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300",
    sellerName: "HeritageWear",
    buyerName: "Prashna Basnet",
    type: "rent",
    grossAmount: 12000,
    date: "2026-08-01",
  },
  {
    id: "TXN-8805",
    orderId: "ORD-9905",
    itemTitle: "Leather Biker Jacket",
    itemImage:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300",
    sellerName: "UrbanThrift",
    buyerName: "Kiran Gurung",
    type: "thrift",
    grossAmount: 8500,
    date: "2026-07-28",
  },
];

// Monthly overview data for the bar chart
const MONTHLY_EARNINGS = [
  { month: "Mar", thriftComm: 18400, rentComm: 21000 },
  { month: "Apr", thriftComm: 22100, rentComm: 28500 },
  { month: "May", thriftComm: 29000, rentComm: 34000 },
  { month: "Jun", thriftComm: 31200, rentComm: 41000 },
  { month: "Jul", thriftComm: 38500, rentComm: 48000 },
  { month: "Aug", thriftComm: 44200, rentComm: 56000 },
];

export default function EarningsPage() {
  const [transactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [typeFilter, setTypeFilter] = useState<"all" | TransactionType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  // Compute platform metrics
  const metrics = useMemo(() => {
    let totalGMV = 0;
    let totalThriftGMV = 0;
    let totalRentGMV = 0;
    let thriftCommission = 0;
    let rentCommission = 0;

    transactions.forEach((txn) => {
      totalGMV += txn.grossAmount;
      if (txn.type === "thrift") {
        totalThriftGMV += txn.grossAmount;
        thriftCommission += txn.grossAmount * THRIFT_COMMISSION_RATE;
      } else {
        totalRentGMV += txn.grossAmount;
        rentCommission += txn.grossAmount * RENT_COMMISSION_RATE;
      }
    });

    const totalCommission = thriftCommission + rentCommission;

    return {
      totalGMV,
      totalThriftGMV,
      totalRentGMV,
      thriftCommission,
      rentCommission,
      totalCommission,
    };
  }, [transactions]);

  // Filtered transactions for table
  const filteredTransactions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return transactions.filter((txn) => {
      const matchesType = typeFilter === "all" || txn.type === typeFilter;
      const matchesSearch =
        !q ||
        txn.itemTitle.toLowerCase().includes(q) ||
        txn.sellerName.toLowerCase().includes(q) ||
        txn.buyerName.toLowerCase().includes(q) ||
        txn.id.toLowerCase().includes(q) ||
        txn.orderId.toLowerCase().includes(q);

      return matchesType && matchesSearch;
    });
  }, [transactions, typeFilter, searchQuery]);

  return (
    <div className="flex flex-col gap-8 max-w-[1400px]">
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
            Total Revenue: Rs {metrics.totalCommission.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Platform Earnings */}
        <div className="border-2 border-[#1C1C1C]/15 bg-white/60 p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-[0.14em] text-[#1C1C1C]/60 font-semibold">
              Net Platform Commission
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
              Monthly Commission Revenue (NPR)
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
            {MONTHLY_EARNINGS.map((item) => {
              const maxVal = 110000;
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
                      : 50
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
                      : 50
                  } 100`}
                  strokeDashoffset={`-${
                    metrics.totalCommission > 0
                      ? (metrics.thriftCommission / metrics.totalCommission) *
                        100
                      : 50
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
              onClick={() => setTypeFilter("all")}
              className={`px-4 py-1.5 font-extrabold text-xs uppercase tracking-wider transition-all rounded-xs ${
                typeFilter === "all"
                  ? "bg-[#1C1C1C] text-[#FDF6EC]"
                  : "text-[#1C1C1C]/80 hover:text-[#1C1C1C]"
              }`}
            >
              All Items ({transactions.length})
            </button>
            <button
              onClick={() => setTypeFilter("thrift")}
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
              onClick={() => setTypeFilter("rent")}
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
              onChange={(e) => setSearchQuery(e.target.value)}
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
                <th className="p-3">Gross Amount</th>
                <th className="p-3">Comm. Rate</th>
                <th className="p-3">Platform Cut</th>
                <th className="p-3">Seller Payout</th>
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
                  const rate =
                    txn.type === "thrift"
                      ? THRIFT_COMMISSION_RATE
                      : RENT_COMMISSION_RATE;
                  const platformCut = txn.grossAmount * rate;
                  const sellerPayout = txn.grossAmount - platformCut;

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
                        {(rate * 100).toFixed(0)}%
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
                </div>
              </div>

              <div className="bg-white/80 p-4 border border-[#1C1C1C]/15 space-y-2">
                <div className="flex justify-between border-b border-[#1C1C1C]/10 pb-1">
                  <span>Gross Item Price</span>
                  <span className="font-bold">
                    Rs {selectedTxn.grossAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#1C1C1C]/10 pb-1 text-[#A33214]">
                  <span>
                    Platform Commission (
                    {selectedTxn.type === "thrift" ? "12%" : "20%"})
                  </span>
                  <span className="font-bold">
                    +Rs{" "}
                    {(
                      selectedTxn.grossAmount *
                      (selectedTxn.type === "thrift"
                        ? THRIFT_COMMISSION_RATE
                        : RENT_COMMISSION_RATE)
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between pt-1 font-bold text-sm">
                  <span>Seller Payable Net</span>
                  <span>
                    Rs{" "}
                    {(
                      selectedTxn.grossAmount *
                      (1 -
                        (selectedTxn.type === "thrift"
                          ? THRIFT_COMMISSION_RATE
                          : RENT_COMMISSION_RATE))
                    ).toLocaleString()}
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
