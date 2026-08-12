"use client";

import { useState, useMemo } from "react";
import {
  Tag,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Trash2,
  Star,
  ShieldAlert,
  Shirt,
  MoreVertical,
  Check,
  Ban,
  ArrowUpDown,
} from "lucide-react";

type ListingType = "thrift" | "rent";
type ListingStatus = "active" | "pending" | "flagged" | "removed";

interface ListingItem {
  id: string;
  title: string;
  image: string;
  type: ListingType;
  category: string;
  price: number;
  sellerName: string;
  sellerAvatar: string;
  status: ListingStatus;
  isFeatured: boolean;
  condition: string;
  size: string;
  reportsCount: number;
  createdAt: string;
}

// Mock listings data
const INITIAL_LISTINGS: ListingItem[] = [
  {
    id: "LST-882",
    title: "Vintage Denim Jacket - Oversized",
    image: "https://images.unsplash.com/photo-1544441893-675973e31985?w=300",
    type: "thrift",
    category: "Outerwear",
    price: 45.0,
    sellerName: "RetroWardrobe",
    sellerAvatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
    status: "flagged",
    isFeatured: false,
    condition: "Good",
    size: "L",
    reportsCount: 3,
    createdAt: "2026-08-10",
  },
  {
    id: "LST-409",
    title: "Silk Evening Gown - Crimson Red",
    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=300",
    type: "rent",
    category: "Dresses",
    price: 25.0, // per day
    sellerName: "GlamRentals",
    sellerAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    status: "active",
    isFeatured: true,
    condition: "Like New",
    size: "S",
    reportsCount: 1,
    createdAt: "2026-08-09",
  },
  {
    id: "LST-114",
    title: "North Face Puffer Jacket - Black",
    image: "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=300",
    type: "thrift",
    category: "Outerwear",
    price: 110.0,
    sellerName: "HimalayanThrift",
    sellerAvatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
    status: "pending",
    isFeatured: false,
    condition: "Used - Fair",
    size: "M",
    reportsCount: 0,
    createdAt: "2026-08-08",
  },
  {
    id: "LST-903",
    title: "Traditional Cultural Lehenga",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300",
    type: "rent",
    category: "Ethnic Wear",
    price: 40.0,
    sellerName: "HeritageWear",
    sellerAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    status: "active",
    isFeatured: true,
    condition: "New with tags",
    size: "M",
    reportsCount: 0,
    createdAt: "2026-08-07",
  },
  {
    id: "LST-551",
    title: "Classic Leather Trench Coat",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300",
    type: "thrift",
    category: "Outerwear",
    price: 85.0,
    sellerName: "UrbanArchive",
    sellerAvatar:
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100",
    status: "removed",
    isFeatured: false,
    condition: "Good",
    size: "XL",
    reportsCount: 5,
    createdAt: "2026-08-05",
  },
];

export default function ListingsManagementPage() {
  const [listings, setListings] = useState<ListingItem[]>(INITIAL_LISTINGS);
  const [typeFilter, setTypeFilter] = useState<"all" | ListingType>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedListing, setSelectedListing] = useState<ListingItem | null>(
    null,
  );

  // Filtered dataset
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      const matchesType = typeFilter === "all" || item.type === typeFilter;
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesType && matchesStatus && matchesSearch;
    });
  }, [listings, typeFilter, statusFilter, searchQuery]);

  // Moderation Handlers
  const handleUpdateStatus = (id: string, newStatus: ListingStatus) => {
    setListings((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item,
      ),
    );
    if (selectedListing?.id === id) {
      setSelectedListing((prev) =>
        prev ? { ...prev, status: newStatus } : null,
      );
    }
  };

  const handleToggleFeature = (id: string) => {
    setListings((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isFeatured: !item.isFeatured } : item,
      ),
    );
    if (selectedListing?.id === id) {
      setSelectedListing((prev) =>
        prev ? { ...prev, isFeatured: !prev.isFeatured } : null,
      );
    }
  };

  const handleDeleteListing = (id: string) => {
    if (
      confirm(
        `Are you sure you want to permanently delete listing ${id}? This action cannot be reversed.`,
      )
    ) {
      setListings((prev) => prev.filter((item) => item.id !== id));
      if (selectedListing?.id === id) setSelectedListing(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#1C1C1C]/15 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1C1C1C] uppercase tracking-wide flex items-center gap-2">
            <Shirt size={28} className="text-[#A33214]" />
            Listings Management
          </h1>
          <p className="text-sm font-medium text-[#1C1C1C]/70 mt-1">
            Review, approve, flag, and curate all Thrift & Rent apparel items
            across ReWear.
          </p>
        </div>

        {/* Counter Pills */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-[#1C1C1C] text-[#FDF6EC] font-bold text-xs uppercase tracking-wider rounded-sm">
            Total: {listings.length}
          </div>
          <div className="px-3 py-1 bg-[#A33214] text-[#FDF6EC] font-bold text-xs uppercase tracking-wider rounded-sm">
            Flagged: {listings.filter((l) => l.status === "flagged").length}
          </div>
        </div>
      </div>

      {/* Filter and Control Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Type Filter Buttons */}
        <div className="flex items-center bg-[#FDF6EC] border border-[#1C1C1C]/20 p-1 self-start rounded-sm shadow-sm">
          <button
            onClick={() => setTypeFilter("all")}
            className={`px-4 py-1.5 font-extrabold text-xs uppercase tracking-wider transition-all rounded-sm ${
              typeFilter === "all"
                ? "bg-[#1C1C1C] text-[#FDF6EC]"
                : "text-[#1C1C1C]/80 hover:text-[#1C1C1C] hover:bg-[#1C1C1C]/5"
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => setTypeFilter("thrift")}
            className={`px-4 py-1.5 font-extrabold text-xs uppercase tracking-wider transition-all rounded-sm flex items-center gap-1.5 ${
              typeFilter === "thrift"
                ? "bg-[#A33214] text-[#FDF6EC]"
                : "text-[#1C1C1C]/80 hover:text-[#A33214] hover:bg-[#A33214]/5"
            }`}
          >
            <Tag size={13} />
            Thrift
          </button>
          <button
            onClick={() => setTypeFilter("rent")}
            className={`px-4 py-1.5 font-extrabold text-xs uppercase tracking-wider transition-all rounded-sm flex items-center gap-1.5 ${
              typeFilter === "rent"
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
          <div className="relative w-full sm:w-64">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1C1C1C]/50"
            />
            <input
              type="text"
              placeholder="Search by title, seller, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FDF6EC] text-[#1C1C1C] border border-[#1C1C1C]/20 rounded-sm pl-9 pr-3 py-1.5 text-xs font-semibold placeholder-[#1C1C1C]/40 focus:outline-none focus:border-[#A33214]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={16} className="text-[#1C1C1C]/70 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto bg-[#FDF6EC] text-[#1C1C1C] border border-[#1C1C1C]/20 rounded-sm px-3 py-1.5 text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-[#A33214]"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending Approval</option>
              <option value="flagged">Flagged</option>
              <option value="removed">Removed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Full Listings Table */}
      <div className="border border-[#1C1C1C]/15 bg-[#FDF6EC] overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#1C1C1C] text-[#FDF6EC] text-xs uppercase font-bold tracking-wider border-b border-[#1C1C1C]">
              <th className="p-3">Item</th>
              <th className="p-3">Type</th>
              <th className="p-3">Category / Specs</th>
              <th className="p-3">Seller</th>
              <th className="p-3">Price</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-center">Featured</th>
              <th className="p-3 text-right">Moderation Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1C1C1C]/10 font-medium text-xs">
            {filteredListings.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="text-center py-10 text-[#1C1C1C]/60 font-semibold uppercase tracking-wider"
                >
                  No apparel listings found matching your parameters.
                </td>
              </tr>
            ) : (
              filteredListings.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-[#1C1C1C]/5 transition-colors"
                >
                  {/* Item Image & Title */}
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-12 h-12 object-cover border border-[#1C1C1C]/20 rounded-sm shrink-0"
                      />
                      <div>
                        <p className="font-bold text-[#1C1C1C] line-clamp-1">
                          {item.title}
                        </p>
                        <p className="text-[11px] font-mono text-[#A33214]">
                          {item.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Type Badge */}
                  <td className="p-3">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border rounded-xs ${
                        item.type === "thrift"
                          ? "bg-stone-100 text-[#1C1C1C] border-[#1C1C1C]/30"
                          : "bg-amber-50 text-amber-900 border-amber-300"
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>

                  {/* Category / Specs */}
                  <td className="p-3">
                    <span className="font-bold text-[#1C1C1C] block">
                      {item.category}
                    </span>
                    <span className="text-[11px] text-[#1C1C1C]/60">
                      Size: {item.size} • {item.condition}
                    </span>
                  </td>

                  {/* Seller info */}
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={item.sellerAvatar}
                        alt={item.sellerName}
                        className="w-5 h-5 rounded-full object-cover border border-[#1C1C1C]/20"
                      />
                      <span className="font-bold text-[#1C1C1C]">
                        {item.sellerName}
                      </span>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="p-3 font-bold text-[#1C1C1C]">
                    ${item.price.toFixed(2)}
                    {item.type === "rent" && (
                      <span className="text-[10px] font-normal text-[#1C1C1C]/60">
                        /day
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="p-3">
                    <ListingStatusBadge
                      status={item.status}
                      reportsCount={item.reportsCount}
                    />
                  </td>

                  {/* Featured Toggle */}
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleToggleFeature(item.id)}
                      className={`p-1.5 rounded-xs transition-colors border ${
                        item.isFeatured
                          ? "bg-amber-400 text-amber-950 border-amber-500"
                          : "bg-stone-100 text-stone-400 border-stone-200 hover:text-amber-600"
                      }`}
                      title={
                        item.isFeatured ? "Unfeature Item" : "Mark as Featured"
                      }
                    >
                      <Star
                        size={14}
                        fill={item.isFeatured ? "currentColor" : "none"}
                      />
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Approve Button */}
                      {item.status !== "active" && (
                        <button
                          onClick={() => handleUpdateStatus(item.id, "active")}
                          className="p-1.5 bg-emerald-700 text-[#FDF6EC] hover:bg-emerald-800 transition-colors rounded-sm"
                          title="Approve / Activate Listing"
                        >
                          <Check size={14} />
                        </button>
                      )}

                      {/* Flag Button */}
                      {item.status !== "flagged" && (
                        <button
                          onClick={() => handleUpdateStatus(item.id, "flagged")}
                          className="p-1.5 bg-amber-600 text-[#FDF6EC] hover:bg-amber-700 transition-colors rounded-sm"
                          title="Flag Listing"
                        >
                          <AlertTriangle size={14} />
                        </button>
                      )}

                      {/* Remove Button */}
                      {item.status !== "removed" && (
                        <button
                          onClick={() => handleUpdateStatus(item.id, "removed")}
                          className="p-1.5 bg-[#A33214] text-[#FDF6EC] hover:bg-[#A33214]/80 transition-colors rounded-sm"
                          title="Restrict / Remove Listing"
                        >
                          <Ban size={14} />
                        </button>
                      )}

                      {/* View Detail Modal */}
                      <button
                        onClick={() => setSelectedListing(item)}
                        className="p-1.5 bg-[#1C1C1C] text-[#FDF6EC] hover:bg-[#A33214] transition-colors rounded-sm"
                        title="View Full Details"
                      >
                        <Eye size={14} />
                      </button>

                      {/* Permanent Delete */}
                      <button
                        onClick={() => handleDeleteListing(item.id)}
                        className="p-1.5 bg-transparent text-[#1C1C1C]/40 hover:text-[#A33214] transition-colors rounded-sm"
                        title="Delete Permanently"
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

      {/* Item Detail Modal */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1C1C]/50 backdrop-blur-xs">
          <div className="bg-[#FDF6EC] border border-[#1C1C1C]/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-xl rounded-sm">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#1C1C1C]/15 pb-3">
              <div className="flex items-center gap-2">
                <Shirt className="text-[#A33214]" size={20} />
                <h2 className="text-lg font-black text-[#1C1C1C] uppercase tracking-wide">
                  Listing Detail: {selectedListing.id}
                </h2>
              </div>
              <button
                onClick={() => setSelectedListing(null)}
                className="text-[#1C1C1C]/60 hover:text-[#A33214] p-1 transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Main Listing View */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <img
                src={selectedListing.image}
                alt={selectedListing.title}
                className="w-full h-48 md:h-full object-cover border border-[#1C1C1C]/20 rounded-sm"
              />

              <div className="md:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#A33214]">
                    {selectedListing.id}
                  </span>
                  <ListingStatusBadge
                    status={selectedListing.status}
                    reportsCount={selectedListing.reportsCount}
                  />
                </div>

                <h3 className="font-black text-lg text-[#1C1C1C]">
                  {selectedListing.title}
                </h3>

                <div className="grid grid-cols-2 gap-2 text-xs font-medium text-[#1C1C1C] bg-[#1C1C1C]/5 p-3 rounded-sm border border-[#1C1C1C]/10">
                  <div>
                    <span className="text-[#1C1C1C]/60 block text-[10px] uppercase font-bold">
                      Price
                    </span>
                    <span className="font-bold">
                      ${selectedListing.price.toFixed(2)}{" "}
                      {selectedListing.type === "rent" ? "/day" : ""}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#1C1C1C]/60 block text-[10px] uppercase font-bold">
                      Category
                    </span>
                    <span className="font-bold">
                      {selectedListing.category}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#1C1C1C]/60 block text-[10px] uppercase font-bold">
                      Size & Condition
                    </span>
                    <span className="font-bold">
                      {selectedListing.size} • {selectedListing.condition}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#1C1C1C]/60 block text-[10px] uppercase font-bold">
                      Listing Type
                    </span>
                    <span className="font-bold uppercase">
                      {selectedListing.type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <img
                    src={selectedListing.sellerAvatar}
                    alt={selectedListing.sellerName}
                    className="w-8 h-8 rounded-full border border-[#1C1C1C]/20 object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold text-[#1C1C1C]">
                      Seller: {selectedListing.sellerName}
                    </p>
                    <p className="text-[10px] text-[#1C1C1C]/60">
                      Listed on {selectedListing.createdAt}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Moderation Controls in Modal */}
            <div className="border-t border-[#1C1C1C]/15 pt-4 space-y-3">
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#1C1C1C]/70">
                Moderation Actions
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() =>
                    handleUpdateStatus(selectedListing.id, "active")
                  }
                  className="px-3 py-2 bg-emerald-700 text-[#FDF6EC] font-bold text-xs uppercase tracking-wider hover:bg-emerald-800 transition-colors rounded-sm"
                >
                  Approve
                </button>
                <button
                  onClick={() =>
                    handleUpdateStatus(selectedListing.id, "flagged")
                  }
                  className="px-3 py-2 bg-amber-600 text-[#FDF6EC] font-bold text-xs uppercase tracking-wider hover:bg-amber-700 transition-colors rounded-sm"
                >
                  Flag Item
                </button>
                <button
                  onClick={() =>
                    handleUpdateStatus(selectedListing.id, "removed")
                  }
                  className="px-3 py-2 bg-[#A33214] text-[#FDF6EC] font-bold text-xs uppercase tracking-wider hover:bg-[#A33214]/90 transition-colors rounded-sm"
                >
                  Remove
                </button>
                <button
                  onClick={() => handleToggleFeature(selectedListing.id)}
                  className="px-3 py-2 bg-[#1C1C1C] text-[#FDF6EC] font-bold text-xs uppercase tracking-wider hover:bg-[#1C1C1C]/80 transition-colors rounded-sm"
                >
                  {selectedListing.isFeatured ? "Unfeature" : "Feature"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Badge Component
function ListingStatusBadge({
  status,
  reportsCount,
}: {
  status: ListingStatus;
  reportsCount: number;
}) {
  switch (status) {
    case "active":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xs">
          <CheckCircle2 size={11} /> Active
        </span>
      );
    case "pending":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-sky-100 text-sky-900 border border-sky-300 rounded-xs">
          <Clock size={11} /> Pending
        </span>
      );
    case "flagged":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 rounded-xs">
          <AlertTriangle size={11} /> Flagged ({reportsCount})
        </span>
      );
    case "removed":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-red-100 text-red-900 border border-red-300 rounded-xs">
          <XCircle size={11} /> Removed
        </span>
      );
  }
}
