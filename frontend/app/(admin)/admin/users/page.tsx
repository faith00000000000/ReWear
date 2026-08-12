"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  Users,
  UserCheck,
  UserX,
  Flag,
  Search,
  Filter,
  ShieldAlert,
  ShieldCheck,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  Tag,
  AlertTriangle,
  XCircle,
  Eye,
  Ban,
  CheckCircle2,
} from "lucide-react";

type UserRole = "buyer" | "seller" | "hybrid";
type UserStatus = "active" | "flagged" | "banned";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: UserRole;
  status: UserStatus;
  joinedDate: string;
  totalOrders: number;
  totalListings: number;
  trustScore: number; // Out of 100
  flagReason?: string;
  flaggedBySystem?: boolean;
}

// Mock User Data
const INITIAL_USERS: User[] = [
  {
    id: "USR-901",
    name: "Siddharth Shrestha",
    email: "siddharth.s@gmail.com",
    phone: "+977 9841001122",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
    role: "hybrid",
    status: "active",
    joinedDate: "2025-11-12",
    totalOrders: 14,
    totalListings: 6,
    trustScore: 98,
  },
  {
    id: "USR-902",
    name: "Aayush Karki",
    email: "aayush.thriftnepal@gmail.com",
    phone: "+977 9801239876",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    role: "seller",
    status: "flagged",
    joinedDate: "2026-02-18",
    totalOrders: 0,
    totalListings: 24,
    trustScore: 42,
    flagReason:
      "Multiple reports of counterfeit luxury items & suspicious external links.",
    flaggedBySystem: true,
  },
  {
    id: "USR-903",
    name: "Prashna Basnet",
    email: "prashna.b@outlook.com",
    phone: "+977 9860114455",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    role: "buyer",
    status: "active",
    joinedDate: "2026-04-05",
    totalOrders: 8,
    totalListings: 0,
    trustScore: 95,
  },
  {
    id: "USR-904",
    name: "Rohan Gurung",
    email: "rohan.scam101@tempmail.com",
    phone: "+977 9811998877",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
    role: "seller",
    status: "banned",
    joinedDate: "2026-07-01",
    totalOrders: 1,
    totalListings: 12,
    trustScore: 12,
    flagReason:
      "Abusive behavior towards buyers & failed order fulfillment repeatedly.",
    flaggedBySystem: false,
  },
  {
    id: "USR-905",
    name: "Subeksha Maharjan",
    email: "subeksha.m@yahoo.com",
    phone: "+977 9845667788",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200",
    role: "hybrid",
    status: "flagged",
    joinedDate: "2026-06-14",
    totalOrders: 3,
    totalListings: 5,
    trustScore: 55,
    flagReason: "Unusually high cancellation rate (75%) on rental orders.",
    flaggedBySystem: true,
  },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [activeTab, setActiveTab] = useState<
    "all" | "flagged" | "banned" | "sellers"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Modals
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalMode, setModalMode] = useState<"inspect" | "flag" | "ban" | null>(
    null,
  );
  const [actionReason, setActionReason] = useState("");

  // Metrics
  const metrics = useMemo(() => {
    const totalUsers = users.length;
    const flaggedCount = users.filter((u) => u.status === "flagged").length;
    const bannedCount = users.filter((u) => u.status === "banned").length;
    const activeCount = users.filter((u) => u.status === "active").length;

    return { totalUsers, flaggedCount, bannedCount, activeCount };
  }, [users]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return users.filter((u) => {
      // Tab filter
      if (activeTab === "flagged" && u.status !== "flagged") return false;
      if (activeTab === "banned" && u.status !== "banned") return false;
      if (activeTab === "sellers" && u.role === "buyer") return false;

      // Role filter
      if (roleFilter !== "all" && u.role !== roleFilter) return false;

      // Search query
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q) ||
        u.phone.includes(q);

      return matchesSearch;
    });
  }, [users, activeTab, roleFilter, searchQuery]);

  // User Actions
  const handleBanUser = () => {
    if (!selectedUser) return;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id
          ? {
              ...u,
              status: "banned",
              flagReason:
                actionReason ||
                "Banned by administrator due to policy violations.",
            }
          : u,
      ),
    );
    closeModal();
  };

  const handleFlagUser = () => {
    if (!selectedUser) return;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id
          ? {
              ...u,
              status: "flagged",
              flagReason:
                actionReason || "Manually flagged for safety inspection.",
              flaggedBySystem: false,
            }
          : u,
      ),
    );
    closeModal();
  };

  const handleUnflagRestore = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              status: "active",
              flagReason: undefined,
              trustScore: Math.max(u.trustScore, 80),
            }
          : u,
      ),
    );
  };

  const closeModal = () => {
    setSelectedUser(null);
    setModalMode(null);
    setActionReason("");
  };

  return (
    <div className="flex flex-col gap-8 max-w-[1400px]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-2 border-[#1C1C1C]/15 pb-4">
        <div>
          <h1
            className="text-2xl sm:text-3xl text-[#1C1C1C] flex items-center gap-2"
            style={{ fontFamily: "Georgia, serif" }}
          >
            <Users size={28} className="text-[#A33214]" />
            User Management & Moderation
          </h1>
          <p className="text-xs uppercase tracking-[0.1em] text-[#1C1C1C]/60 mt-1">
            Monitor community safety, review flagged accounts & enforce bans
          </p>
        </div>

        <div className="flex items-center gap-2">
          {metrics.flaggedCount > 0 && (
            <div className="px-3 py-1 bg-[#A33214] text-[#FDF6EC] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
              <AlertTriangle size={14} />
              {metrics.flaggedCount} Accounts Need Review
            </div>
          )}
        </div>
      </div>

      {/* Metric Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border-2 border-[#1C1C1C]/15 bg-white/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-[0.14em] text-[#1C1C1C]/60 font-semibold">
              Total Community Users
            </span>
            <Users size={18} className="text-[#1C1C1C]/60" />
          </div>
          <p
            className="text-3xl text-[#1C1C1C] mt-2 font-bold"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {metrics.totalUsers.toLocaleString()}
          </p>
          <p className="text-[10px] uppercase tracking-[0.08em] text-[#1C1C1C]/50 mt-1">
            {metrics.activeCount} verified & active
          </p>
        </div>

        <div className="border-2 border-[#1C1C1C]/15 bg-white/60 p-5 border-l-4 border-l-amber-600">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-[0.14em] text-[#1C1C1C]/60 font-semibold">
              Flagged Abnormalities
            </span>
            <Flag size={18} className="text-amber-600" />
          </div>
          <p
            className="text-3xl text-amber-700 mt-2 font-bold"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {metrics.flaggedCount}
          </p>
          <p className="text-[10px] uppercase tracking-[0.08em] text-[#1C1C1C]/50 mt-1">
            Suspicious activity detected
          </p>
        </div>

        <div className="border-2 border-[#1C1C1C]/15 bg-white/60 p-5 border-l-4 border-l-[#A33214]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-[0.14em] text-[#1C1C1C]/60 font-semibold">
              Banned Accounts
            </span>
            <UserX size={18} className="text-[#A33214]" />
          </div>
          <p
            className="text-3xl text-[#A33214] mt-2 font-bold"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {metrics.bannedCount}
          </p>
          <p className="text-[10px] uppercase tracking-[0.08em] text-[#1C1C1C]/50 mt-1">
            Access revoked permanently
          </p>
        </div>

        <div className="border-2 border-[#1C1C1C]/15 bg-white/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-[0.14em] text-[#1C1C1C]/60 font-semibold">
              System Trust Avg.
            </span>
            <ShieldCheck size={18} className="text-emerald-700" />
          </div>
          <p
            className="text-3xl text-[#1C1C1C] mt-2 font-bold"
            style={{ fontFamily: "Georgia, serif" }}
          >
            88.4 / 100
          </p>
          <p className="text-[10px] uppercase tracking-[0.08em] text-[#1C1C1C]/50 mt-1">
            Community safety metric
          </p>
        </div>
      </section>

      {/* Tabs & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1C1C1C]/20 pb-3">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 font-extrabold text-xs uppercase tracking-wider transition-all border-b-2 ${
              activeTab === "all"
                ? "border-[#A33214] text-[#A33214]"
                : "border-transparent text-[#1C1C1C]/60 hover:text-[#1C1C1C]"
            }`}
          >
            All Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("flagged")}
            className={`px-4 py-2 font-extrabold text-xs uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === "flagged"
                ? "border-[#A33214] text-[#A33214]"
                : "border-transparent text-[#1C1C1C]/60 hover:text-[#1C1C1C]"
            }`}
          >
            <Flag size={14} className="text-amber-600" />
            Flagged ({metrics.flaggedCount})
          </button>
          <button
            onClick={() => setActiveTab("banned")}
            className={`px-4 py-2 font-extrabold text-xs uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === "banned"
                ? "border-[#A33214] text-[#A33214]"
                : "border-transparent text-[#1C1C1C]/60 hover:text-[#1C1C1C]"
            }`}
          >
            <UserX size={14} className="text-[#A33214]" />
            Banned ({metrics.bannedCount})
          </button>
          <button
            onClick={() => setActiveTab("sellers")}
            className={`px-4 py-2 font-extrabold text-xs uppercase tracking-wider transition-all border-b-2 ${
              activeTab === "sellers"
                ? "border-[#A33214] text-[#A33214]"
                : "border-transparent text-[#1C1C1C]/60 hover:text-[#1C1C1C]"
            }`}
          >
            Sellers
          </button>
        </div>

        {/* Search Bar & Role Filter */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1C1C1C]/50"
            />
            <input
              type="text"
              placeholder="Search user, email, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/80 text-[#1C1C1C] border border-[#1C1C1C]/20 rounded-xs pl-8 pr-3 py-1.5 text-xs font-semibold placeholder-[#1C1C1C]/40 focus:outline-none focus:border-[#A33214]"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-white/80 border border-[#1C1C1C]/20 text-[#1C1C1C] text-xs font-bold py-1.5 px-3 focus:outline-none focus:border-[#A33214]"
          >
            <option value="all">All Roles</option>
            <option value="buyer">Buyer Only</option>
            <option value="seller">Seller Only</option>
            <option value="hybrid">Hybrid (Buyer + Seller)</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="border-2 border-[#1C1C1C]/15 bg-white/60 overflow-x-auto shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#1C1C1C] text-[#FDF6EC] text-xs uppercase font-bold tracking-wider">
              <th className="p-3">User Profile</th>
              <th className="p-3">Role</th>
              <th className="p-3">Trust Score</th>
              <th className="p-3">Activity</th>
              <th className="p-3">Status</th>
              <th className="p-3">Flag / Moderation Reason</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1C1C1C]/10 font-medium text-xs text-[#1C1C1C]">
            {filteredUsers.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-8 text-[#1C1C1C]/60 font-semibold uppercase"
                >
                  No user accounts match the current filter.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className={`hover:bg-[#A33214]/5 transition-colors ${
                    user.status === "flagged"
                      ? "bg-amber-500/10"
                      : user.status === "banned"
                        ? "bg-red-500/10 opacity-75"
                        : ""
                  }`}
                >
                  {/* Profile */}
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={user.avatar}
                        alt={user.name}
                        width={40}
                        height={40}
                        className="w-10 h-10 object-cover border border-[#1C1C1C]/20 rounded-xs shrink-0"
                      />
                      <div>
                        <div className="font-bold flex items-center gap-1.5">
                          {user.name}
                          <span className="text-[10px] font-mono text-[#1C1C1C]/50 font-normal">
                            ({user.id})
                          </span>
                        </div>
                        <div className="text-[10px] text-[#1C1C1C]/60">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="p-3">
                    <span className="uppercase text-[10px] font-extrabold tracking-wider px-2 py-0.5 border border-[#1C1C1C]/20 rounded-xs bg-stone-100">
                      {user.role}
                    </span>
                  </td>

                  {/* Trust Score */}
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-stone-200 h-2 rounded-xs overflow-hidden border border-[#1C1C1C]/10">
                        <div
                          style={{ width: `${user.trustScore}%` }}
                          className={`h-full ${
                            user.trustScore < 50
                              ? "bg-[#A33214]"
                              : user.trustScore < 75
                                ? "bg-amber-600"
                                : "bg-emerald-700"
                          }`}
                        />
                      </div>
                      <span className="font-mono font-bold text-xs">
                        {user.trustScore}/100
                      </span>
                    </div>
                  </td>

                  {/* Activity */}
                  <td className="p-3 text-[11px]">
                    <div className="flex items-center gap-3 text-[#1C1C1C]/80">
                      <span title="Total Orders">
                        <ShoppingBag
                          size={12}
                          className="inline mr-1 text-[#1C1C1C]/50"
                        />
                        {user.totalOrders}
                      </span>
                      <span title="Total Listings">
                        <Tag
                          size={12}
                          className="inline mr-1 text-[#1C1C1C]/50"
                        />
                        {user.totalListings}
                      </span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border rounded-xs ${
                        user.status === "active"
                          ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                          : user.status === "flagged"
                            ? "bg-amber-100 text-amber-900 border-amber-400"
                            : "bg-red-100 text-red-900 border-red-400"
                      }`}
                    >
                      {user.status === "active" && <CheckCircle2 size={10} />}
                      {user.status === "flagged" && <AlertTriangle size={10} />}
                      {user.status === "banned" && <Ban size={10} />}
                      {user.status}
                    </span>
                  </td>

                  {/* Flag Reason */}
                  <td className="p-3 text-[11px] max-w-[220px]">
                    {user.flagReason ? (
                      <p
                        className="text-amber-900 font-medium line-clamp-2"
                        title={user.flagReason}
                      >
                        {user.flaggedBySystem && (
                          <span className="font-bold text-[#A33214] mr-1">
                            [AI BOT]
                          </span>
                        )}
                        {user.flagReason}
                      </p>
                    ) : (
                      <span className="text-[#1C1C1C]/40 italic">
                        Clean standing
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Inspect User */}
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setModalMode("inspect");
                        }}
                        className="p-1.5 bg-[#1C1C1C] text-[#FDF6EC] hover:bg-[#A33214] transition-colors rounded-xs"
                        title="View Full Profile"
                      >
                        <Eye size={13} />
                      </button>

                      {/* Restore / Clear Flag */}
                      {user.status !== "active" && (
                        <button
                          onClick={() => handleUnflagRestore(user.id)}
                          className="px-2 py-1 bg-emerald-800 text-white font-bold text-[10px] uppercase hover:bg-emerald-900 transition-colors rounded-xs"
                          title="Restore & Clear Flags"
                        >
                          Clear Flag
                        </button>
                      )}

                      {/* Flag User */}
                      {user.status === "active" && (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setModalMode("flag");
                          }}
                          className="p-1.5 bg-amber-600 text-white hover:bg-amber-700 transition-colors rounded-xs"
                          title="Flag Abnormal Behavior"
                        >
                          <Flag size={13} />
                        </button>
                      )}

                      {/* Ban User */}
                      {user.status !== "banned" && (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setModalMode("ban");
                          }}
                          className="p-1.5 bg-[#A33214] text-white hover:bg-[#1C1C1C] transition-colors rounded-xs"
                          title="Ban Account"
                        >
                          <Ban size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: INSPECT / FLAG / BAN */}
      {selectedUser && modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1C1C]/50 backdrop-blur-xs">
          <div className="bg-[#FDF6EC] border-2 border-[#1C1C1C]/20 w-full max-w-lg p-6 space-y-5 shadow-xl rounded-xs">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#1C1C1C]/15 pb-3">
              <h2
                className="text-base text-[#1C1C1C] uppercase font-bold flex items-center gap-2"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {modalMode === "inspect" && (
                  <Users size={18} className="text-[#1C1C1C]" />
                )}
                {modalMode === "flag" && (
                  <Flag size={18} className="text-amber-600" />
                )}
                {modalMode === "ban" && (
                  <Ban size={18} className="text-[#A33214]" />
                )}
                {modalMode === "inspect"
                  ? "User Account Dossier"
                  : modalMode === "flag"
                    ? "Flag Abnormal Account"
                    : "Ban User Account"}
              </h2>
              <button
                onClick={closeModal}
                className="text-[#1C1C1C]/60 hover:text-[#A33214]"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Profile Brief Header */}
            <div className="flex items-center gap-3 bg-white/80 p-3 border border-[#1C1C1C]/15">
              <Image
                src={selectedUser.avatar}
                alt={selectedUser.name}
                width={48}
                height={48}
                className="w-12 h-12 object-cover border border-[#1C1C1C]/20 rounded-xs"
              />
              <div className="text-xs">
                <p className="font-bold text-sm text-[#1C1C1C]">
                  {selectedUser.name}
                </p>
                <p className="text-[#1C1C1C]/60">
                  {selectedUser.email} | {selectedUser.phone}
                </p>
                <p className="text-[10px] text-[#A33214] font-bold uppercase mt-0.5">
                  Role: {selectedUser.role} • Joined {selectedUser.joinedDate}
                </p>
              </div>
            </div>

            {/* MODE: INSPECT */}
            {modalMode === "inspect" && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white/60 border border-[#1C1C1C]/10">
                    <span className="text-[10px] uppercase font-bold text-[#1C1C1C]/50 block">
                      Buying History
                    </span>
                    <span className="text-base font-extrabold text-[#1C1C1C]">
                      {selectedUser.totalOrders} Orders
                    </span>
                  </div>
                  <div className="p-3 bg-white/60 border border-[#1C1C1C]/10">
                    <span className="text-[10px] uppercase font-bold text-[#1C1C1C]/50 block">
                      Active Listings
                    </span>
                    <span className="text-base font-extrabold text-[#1C1C1C]">
                      {selectedUser.totalListings} Items
                    </span>
                  </div>
                </div>

                {selectedUser.flagReason && (
                  <div className="p-3 bg-amber-50 border border-amber-300 space-y-1">
                    <span className="font-bold text-amber-900 text-[11px] flex items-center gap-1">
                      <AlertTriangle size={12} /> Flag/Ban Log Note:
                    </span>
                    <p className="text-amber-900">{selectedUser.flagReason}</p>
                  </div>
                )}
              </div>
            )}

            {/* MODE: FLAG OR BAN INPUT */}
            {(modalMode === "flag" || modalMode === "ban") && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#1C1C1C]/60 mb-1">
                    Reason for {modalMode === "flag" ? "Flagging" : "Banning"}
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder={
                      modalMode === "flag"
                        ? "e.g. Unresponsive seller, suspicious pricing, spamming messaging system..."
                        : "e.g. Counterfeit merchandise confirmed, non-payment, harassment..."
                    }
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    className="w-full bg-white text-[#1C1C1C] border border-[#1C1C1C]/30 p-2 font-medium focus:outline-none focus:border-[#A33214]"
                  />
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t border-[#1C1C1C]/10">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-[#1C1C1C]/20 text-xs font-bold uppercase hover:bg-white"
              >
                Close
              </button>

              {modalMode === "flag" && (
                <button
                  onClick={handleFlagUser}
                  className="px-4 py-2 bg-amber-600 text-white text-xs font-bold uppercase hover:bg-amber-700 transition-colors"
                >
                  Confirm Flag
                </button>
              )}

              {modalMode === "ban" && (
                <button
                  onClick={handleBanUser}
                  className="px-4 py-2 bg-[#A33214] text-[#FDF6EC] text-xs font-bold uppercase hover:bg-[#1C1C1C] transition-colors"
                >
                  Confirm Permanent Ban
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
