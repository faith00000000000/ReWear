"use client";

import { useState, useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Trash2,
  XCircle,
  Filter,
  Search,
  Tag,
  ShieldAlert,
} from "lucide-react";

// Types for report management
type ListingType = "thrift" | "rent";
type ReportStatus = "pending" | "investigating" | "resolved" | "dismissed";

interface ReportItem {
  id: string;
  listingId: string;
  itemTitle: string;
  itemImage: string;
  listingType: ListingType;
  price: number;
  reporterName: string;
  reporterEmail: string;
  sellerName: string;
  reason: string;
  details: string;
  reportedAt: string;
  status: ReportStatus;
}

// Mock initial reports data
const INITIAL_REPORTS: ReportItem[] = [
  {
    id: "REP-101",
    listingId: "LST-882",
    itemTitle: "Vintage Denim Jacket - Oversized",
    itemImage:
      "https://images.unsplash.com/photo-1544441893-675973e31985?w=300",
    listingType: "thrift",
    price: 45.0,
    reporterName: "Anish Maharjan",
    reporterEmail: "anish@example.com",
    sellerName: "RetroWardrobe",
    reason: "Counterfeit / Fake Brand",
    details:
      "Listed as genuine Levi's 1990s, but tags clearly show it is a replica. Stitching quality is very poor.",
    reportedAt: "2026-08-10 14:20",
    status: "pending",
  },
  {
    id: "REP-102",
    listingId: "LST-409",
    itemTitle: "Silk Evening Gown - Red",
    itemImage:
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=300",
    listingType: "rent",
    price: 25.0, // per day
    reporterName: "Sita Sharma",
    reporterEmail: "sita@example.com",
    sellerName: "GlamRentals",
    reason: "Inappropriate / Misleading Photos",
    details:
      "The images shown are stock photos from a high-end designer website, not actual photos of the rental dress.",
    reportedAt: "2026-08-09 11:05",
    status: "investigating",
  },
  {
    id: "REP-103",
    listingId: "LST-114",
    itemTitle: "North Face Puffer Jacket - M",
    itemImage:
      "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=300",
    listingType: "thrift",
    price: 110.0,
    reporterName: "Kiran Gurung",
    reporterEmail: "kiran@example.com",
    sellerName: "HimalayanThrift",
    reason: "Prohibited / Damaged Goods",
    details:
      "Seller failed to mention major tear under the left sleeve armpit.",
    reportedAt: "2026-08-08 09:30",
    status: "pending",
  },
  {
    id: "REP-104",
    listingId: "LST-903",
    itemTitle: "Traditional Cultural Dress - Lehenga",
    itemImage:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300",
    listingType: "rent",
    price: 40.0,
    reporterName: "Pooja Shrestha",
    reporterEmail: "pooja@example.com",
    sellerName: "HeritageWear",
    reason: "Pricing Fraud",
    details:
      "Security deposit demanded outside the ReWear platform escrow system via direct bank transfer.",
    reportedAt: "2026-08-07 18:45",
    status: "resolved",
  },
];

export default function ReportManagementPage() {
  const [reports, setReports] = useState<ReportItem[]>(INITIAL_REPORTS);
  const [categoryFilter, setCategoryFilter] = useState<"all" | ListingType>(
    "all",
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);

  // Filter logic
  const filteredReports = useMemo(() => {
    return reports.filter((item) => {
      const matchesCategory =
        categoryFilter === "all" || item.listingType === categoryFilter;
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;
      const matchesSearch =
        item.itemTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.reporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [reports, categoryFilter, statusFilter, searchQuery]);

  // Action handlers
  const handleUpdateStatus = (id: string, newStatus: ReportStatus) => {
    setReports((prev) =>
      prev.map((rep) => (rep.id === id ? { ...rep, status: newStatus } : rep)),
    );
    if (selectedReport?.id === id) {
      setSelectedReport((prev) =>
        prev ? { ...prev, status: newStatus } : null,
      );
    }
  };

  const handleDeleteListing = (listingId: string, reportId: string) => {
    if (
      confirm(
        `Are you sure you want to delete listing ${listingId}? This action cannot be undone.`,
      )
    ) {
      setReports((prev) =>
        prev.map((rep) =>
          rep.id === reportId ? { ...rep, status: "resolved" } : rep,
        ),
      );
      setSelectedReport(null);
      alert(`Listing ${listingId} removed and report marked as resolved.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#1C1C1C]/15 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1C1C1C] uppercase tracking-wide flex items-center gap-2">
            <ShieldAlert size={28} className="text-[#A33214]" />
            Report Management
          </h1>
          <p className="text-sm font-medium text-[#1C1C1C]/70 mt-1">
            Review user reports, claims, and flagged listings across ReWear.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-[#A33214] text-[#FDF6EC] border border-[#A33214] font-bold text-xs uppercase tracking-wider rounded-sm">
            Pending: {reports.filter((r) => r.status === "pending").length}
          </div>
          <div className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs uppercase tracking-wider rounded-sm">
            Investigating:{" "}
            {reports.filter((r) => r.status === "investigating").length}
          </div>
        </div>
      </div>

      {/* Top Filter Bar: Category Toggle & Search */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Thrift vs Rent Category Toggle */}
        <div className="flex items-center bg-[#FDF6EC] border border-[#1C1C1C]/20 p-1 self-start rounded-sm shadow-sm">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`px-4 py-1.5 font-extrabold text-xs uppercase tracking-wider transition-all rounded-sm ${
              categoryFilter === "all"
                ? "bg-[#A33214] text-[#FDF6EC]"
                : "text-[#1C1C1C]/80 hover:text-[#1C1C1C] hover:bg-[#1C1C1C]/5"
            }`}
          >
            All ({reports.length})
          </button>
          <button
            onClick={() => setCategoryFilter("thrift")}
            className={`px-4 py-1.5 font-extrabold text-xs uppercase tracking-wider transition-all rounded-sm flex items-center gap-1.5 ${
              categoryFilter === "thrift"
                ? "bg-[#A33214] text-[#FDF6EC]"
                : "text-[#1C1C1C]/80 hover:text-[#A33214] hover:bg-[#A33214]/5"
            }`}
          >
            <Tag size={13} />
            Thrift
          </button>
          <button
            onClick={() => setCategoryFilter("rent")}
            className={`px-4 py-1.5 font-extrabold text-xs uppercase tracking-wider transition-all rounded-sm flex items-center gap-1.5 ${
              categoryFilter === "rent"
                ? "bg-[#A33214] text-[#FDF6EC]"
                : "text-[#1C1C1C]/80 hover:text-[#A33214] hover:bg-[#A33214]/5"
            }`}
          >
            <Clock size={13} />
            Rent
          </button>
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1C1C1C]/50"
            />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FDF6EC] text-[#1C1C1C] border border-[#1C1C1C]/20 rounded-sm pl-9 pr-3 py-1.5 text-xs font-semibold placeholder-[#1C1C1C]/40 focus:outline-none focus:border-[#A33214]"
            />
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={16} className="text-[#1C1C1C]/70 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto bg-[#FDF6EC] text-[#1C1C1C] border border-[#1C1C1C]/20 rounded-sm px-3 py-1.5 text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-[#A33214]"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="border border-[#1C1C1C]/15 bg-[#FDF6EC] overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#A33214] text-[#FDF6EC] text-xs uppercase font-bold tracking-wider border-b border-[#1C1C1C]">
              <th className="p-3">Report ID</th>
              <th className="p-3">Listing Item</th>
              <th className="p-3">Category</th>
              <th className="p-3">Reason</th>
              <th className="p-3">Reporter</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1C1C1C]/10 font-medium text-xs">
            {filteredReports.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-10 text-[#1C1C1C]/60 font-semibold uppercase tracking-wider"
                >
                  No reports found matching your selected criteria.
                </td>
              </tr>
            ) : (
              filteredReports.map((report) => (
                <tr
                  key={report.id}
                  className="hover:bg-[#1C1C1C]/5 transition-colors"
                >
                  <td className="p-3 font-mono font-bold text-[#A33214]">
                    {report.id}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={report.itemImage}
                        alt={report.itemTitle}
                        className="w-10 h-10 object-cover border border-[#1C1C1C]/20 rounded-sm"
                      />

                      <div>
                        <p className="font-bold text-[#1C1C1C] line-clamp-1">
                          {report.itemTitle}
                        </p>
                        <p className="text-[11px] text-[#1C1C1C]/60 font-medium">
                          ID: {report.listingId} • ${report.price}
                          {report.listingType === "rent" ? "/day" : ""}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border rounded-xs ${
                        report.listingType === "thrift"
                          ? "bg-stone-100 text-[#1C1C1C] border-[#1C1C1C]/30"
                          : "bg-amber-50 text-amber-900 border-amber-300"
                      }`}
                    >
                      {report.listingType}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="font-bold text-[#1C1C1C] text-xs block">
                      {report.reason}
                    </span>
                    <span className="text-[11px] text-[#1C1C1C]/60 line-clamp-1">
                      {report.details}
                    </span>
                  </td>
                  <td className="p-3 text-xs">
                    <p className="font-bold text-[#1C1C1C]">
                      {report.reporterName}
                    </p>
                    <p className="text-[11px] text-[#1C1C1C]/60">
                      {report.reportedAt}
                    </p>
                  </td>
                  <td className="p-3">
                    <StatusBadge status={report.status} />
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="p-1.5 bg-[#A33214] text-[#FDF6EC] hover:bg-[#A33214] transition-colors border border-[#1C1C1C] rounded-sm"
                        title="View Report Details"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteListing(report.listingId, report.id)
                        }
                        className="p-1.5 bg-transparent text-[#A33214] hover:bg-[#A33214] hover:text-[#FDF6EC] transition-colors border border-[#A33214]/40 rounded-sm"
                        title="Delete Flagged Listing"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detailed Inspection Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1C1C]/50 backdrop-blur-xs">
          <div className="bg-[#FDF6EC] border border-[#1C1C1C]/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-xl rounded-sm">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#1C1C1C]/15 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-[#A33214]" size={20} />
                <h2 className="text-lg font-black text-[#1C1C1C] uppercase tracking-wide">
                  Report Detail: {selectedReport.id}
                </h2>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-[#1C1C1C]/60 hover:text-[#A33214] p-1 transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Listing Info Box */}
            <div className="border border-[#A33214]/15 p-4 bg-[#FDF6EC] flex flex-col sm:flex-row gap-4 rounded-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedReport.itemImage}
                alt={selectedReport.itemTitle}
                className="w-20 h-20 object-cover border border-[#1C1C1C]/20 rounded-sm"
              />
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#A33214]">
                    {selectedReport.listingId}
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 border border-[#1C1C1C]/20 bg-stone-100 text-[#1C1C1C]">
                    Category: {selectedReport.listingType}
                  </span>
                </div>
                <h3 className="font-bold text-base text-[#1C1C1C]">
                  {selectedReport.itemTitle}
                </h3>
                <p className="text-xs font-semibold text-[#1C1C1C]">
                  Price: ${selectedReport.price}
                  {selectedReport.listingType === "rent" ? "/day" : ""}
                </p>
                <p className="text-xs text-[#1C1C1C]/70">
                  Seller Username:{" "}
                  <span className="font-bold text-[#1C1C1C]">
                    {selectedReport.sellerName}
                  </span>
                </p>
              </div>
            </div>

            {/* Complaint Details */}
            <div className="space-y-3 border-l-2 border-[#A33214] pl-4 py-1">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#1C1C1C]/60">
                  Reported Reason
                </p>
                <p className="text-sm font-bold text-[#A33214]">
                  {selectedReport.reason}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#1C1C1C]/60">
                  Complainant Description
                </p>
                <p className="text-xs font-medium text-[#1C1C1C] bg-[#1C1C1C]/5 p-3 border border-[#1C1C1C]/10 rounded-sm mt-1">
                  {`"${selectedReport.details}"`}
                </p>
              </div>
              <div className="flex justify-between text-xs font-medium text-[#1C1C1C]/60">
                <span>
                  Filed by: {selectedReport.reporterName} (
                  {selectedReport.reporterEmail})
                </span>
                <span>Date: {selectedReport.reportedAt}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t border-[#1C1C1C]/15 pt-4 space-y-3">
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#1C1C1C]/70">
                Take Administrative Action
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() =>
                    handleUpdateStatus(selectedReport.id, "investigating")
                  }
                  className="px-3 py-2 bg-amber-100 text-amber-950 border border-amber-300 font-bold text-xs uppercase tracking-wider hover:bg-amber-200 transition-colors rounded-sm"
                >
                  Mark Reviewing
                </button>
                <button
                  onClick={() =>
                    handleUpdateStatus(selectedReport.id, "resolved")
                  }
                  className="px-3 py-2 bg-emerald-100 text-emerald-950 border border-emerald-300 font-bold text-xs uppercase tracking-wider hover:bg-emerald-200 transition-colors rounded-sm"
                >
                  Resolve & Keep
                </button>
                <button
                  onClick={() =>
                    handleUpdateStatus(selectedReport.id, "dismissed")
                  }
                  className="px-3 py-2 bg-stone-200 text-stone-800 border border-stone-300 font-bold text-xs uppercase tracking-wider hover:bg-stone-300 transition-colors rounded-sm"
                >
                  Dismiss
                </button>
              </div>

              <button
                onClick={() =>
                  handleDeleteListing(
                    selectedReport.listingId,
                    selectedReport.id,
                  )
                }
                className="w-full mt-2 px-4 py-2.5 bg-[#A33214] text-[#FDF6EC] border border-[#A33214] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#A33214]/90 transition-colors rounded-sm"
              >
                <Trash2 size={15} />
                Delete Flagged Clothing Listing Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper badge component for report status
function StatusBadge({ status }: { status: ReportStatus }) {
  switch (status) {
    case "pending":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-[#A33214] text-[#FDF6EC] rounded-xs">
          <AlertTriangle size={11} /> Pending
        </span>
      );
    case "investigating":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 rounded-xs">
          <Clock size={11} /> Reviewing
        </span>
      );
    case "resolved":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xs">
          <CheckCircle2 size={11} /> Resolved
        </span>
      );
    case "dismissed":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-stone-200 text-stone-700 border border-stone-300 rounded-xs">
          <XCircle size={11} /> Dismissed
        </span>
      );
  }
}
