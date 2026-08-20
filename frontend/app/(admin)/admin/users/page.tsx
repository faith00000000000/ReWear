'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  Users,
  UserCheck,
  UserX,
  Search,
  ShoppingBag,
  Tag,
  Eye,
  Ban,
  XCircle,
  Store,
  UserPlus,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { AdminUser, AdminUserStatus } from '@/lib/types/admin-user';
import { banAdminUser, fetchAdminUsers } from '@/lib/api/adminUsers';

// Defensive: accepts null/undefined so a bad entry in the users array
// (or an unexpectedly-null selectedUser) never crashes the render.
function getAvatarSrc(user: AdminUser | null | undefined) {
  if (!user) {
    return `https://ui-avatars.com/api/?name=%3F&background=A33214&color=FDF6EC&bold=true`;
  }
  if (user.profilePictureUrl) return user.profilePictureUrl;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    user.fullName ?? '?',
  )}&background=A33214&color=FDF6EC&bold=true`;
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'all' | 'banned' | 'sellers'>(
    'all',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Modals
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [modalMode, setModalMode] = useState<'inspect' | 'ban' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [isSubmittingBan, setIsSubmittingBan] = useState(false);
  const [banError, setBanError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const data = await fetchAdminUsers();
        // Filter out any null/undefined entries the API might return
        // so downstream .map()/getAvatarSrc calls never see them.
        if (!cancelled) {
          setUsers(
            (data ?? []).filter(
              (u): u is AdminUser =>
                u != null &&
                u.role !== 'ADMIN' &&
                u.email !== 'admin@rewear.com',
            ),
          );
        }
      } catch (err) {
        console.error('Failed to load admin users', err);
        if (!cancelled)
          setLoadError('Could not load users. Please try refreshing.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadUsers();
    return () => {
      cancelled = true;
    };
  }, []);

  // Metrics
  const metrics = useMemo(() => {
    const totalUsers = users.length;
    const sellersCount = users.filter((u) => u.role === 'SELLER').length;
    const bannedCount = users.filter((u) => u.status === 'BANNED').length;
    const activeCount = users.filter((u) => u.status === 'ACTIVE').length;

    const currentYear = new Date().getFullYear().toString();
    const newUsersCount = users.filter((u) =>
      u.joinedDate.startsWith(currentYear),
    ).length;

    return {
      totalUsers,
      sellersCount,
      bannedCount,
      activeCount,
      newUsersCount,
    };
  }, [users]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return users.filter((u) => {
      if (activeTab === 'banned' && u.status !== 'BANNED') return false;
      if (activeTab === 'sellers' && u.role !== 'SELLER') return false;

      if (roleFilter !== 'all' && u.role.toLowerCase() !== roleFilter)
        return false;

      const matchesSearch =
        !q ||
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone ?? '').includes(q);

      return matchesSearch;
    });
  }, [users, activeTab, roleFilter, searchQuery]);

  async function handleBanUser() {
    if (!selectedUser || actionReason.trim().length < 5) return;

    setIsSubmittingBan(true);
    setBanError(null);
    try {
      const updated = await banAdminUser(selectedUser.id, actionReason.trim());
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      closeModal();
    } catch (err) {
      console.error('Failed to ban user', err);
      setBanError('Could not ban this user. Please try again.');
    } finally {
      setIsSubmittingBan(false);
    }
  }

  function closeModal() {
    setSelectedUser(null);
    setModalMode(null);
    setActionReason('');
    setBanError(null);
  }

  function statusBadgeClasses(status: AdminUserStatus) {
    return status === 'ACTIVE'
      ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
      : 'bg-red-100 text-red-900 border-red-400';
  }

  return (
    <div className="flex flex-col gap-8 max-w-[1400px]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-2 border-[#1C1C1C]/15 pb-4">
        <div>
          <h1
            className="text-2xl sm:text-3xl text-[#1C1C1C] flex items-center gap-2"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            <Users size={28} className="text-[#A33214]" />
            User Management & Moderation
          </h1>
          <p className="text-xs uppercase tracking-[0.1em] text-[#1C1C1C]/60 mt-1">
            Monitor community safety, review registered accounts & enforce bans
          </p>
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
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {metrics.totalUsers.toLocaleString()}
          </p>
          <p className="text-[10px] uppercase tracking-[0.08em] text-[#1C1C1C]/50 mt-1">
            {metrics.activeCount} active accounts
          </p>
        </div>

        <div className="border-2 border-[#1C1C1C]/15 bg-white/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-[0.14em] text-[#1C1C1C]/60 font-semibold">
              Sellers
            </span>
            <Store size={18} className="text-[#1C1C1C]/60" />
          </div>
          <p
            className="text-3xl text-[#1C1C1C] mt-2 font-bold"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {metrics.sellersCount}
          </p>
          <p className="text-[10px] uppercase tracking-[0.08em] text-[#1C1C1C]/50 mt-1">
            Users with at least one listing
          </p>
        </div>

        <div className="border-2 border-[#1C1C1C]/15 bg-white/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-[0.14em] text-[#1C1C1C]/60 font-semibold">
              New Registrations
            </span>
            <UserPlus size={18} className="text-[#1C1C1C]/60" />
          </div>
          <p
            className="text-3xl text-[#1C1C1C] mt-2 font-bold"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {metrics.newUsersCount}
          </p>
          <p className="text-[10px] uppercase tracking-[0.08em] text-[#1C1C1C]/50 mt-1">
            Joined this year
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
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {metrics.bannedCount}
          </p>
          <p className="text-[10px] uppercase tracking-[0.08em] text-[#1C1C1C]/50 mt-1">
            Access revoked permanently
          </p>
        </div>
      </section>

      {/* Tabs & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1C1C1C]/20 pb-3">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 font-extrabold text-xs uppercase tracking-wider transition-all border-b-2 ${
              activeTab === 'all'
                ? 'border-[#A33214] text-[#A33214]'
                : 'border-transparent text-[#1C1C1C]/60 hover:text-[#1C1C1C]'
            }`}
          >
            All Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('banned')}
            className={`px-4 py-2 font-extrabold text-xs uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'banned'
                ? 'border-[#A33214] text-[#A33214]'
                : 'border-transparent text-[#1C1C1C]/60 hover:text-[#1C1C1C]'
            }`}
          >
            <UserX size={14} className="text-[#A33214]" />
            Banned ({metrics.bannedCount})
          </button>
          <button
            onClick={() => setActiveTab('sellers')}
            className={`px-4 py-2 font-extrabold text-xs uppercase tracking-wider transition-all border-b-2 ${
              activeTab === 'sellers'
                ? 'border-[#A33214] text-[#A33214]'
                : 'border-transparent text-[#1C1C1C]/60 hover:text-[#1C1C1C]'
            }`}
          >
            Sellers ({metrics.sellersCount})
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1C1C1C]/50"
            />
            <input
              type="text"
              placeholder="Search name, email, phone..."
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
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
          </select>
        </div>
      </div>

      {/* Loading / Error states */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-16 text-[#1C1C1C]/60">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Loading users...
          </span>
        </div>
      )}

      {!isLoading && loadError && (
        <div className="flex items-center gap-2 border-2 border-red-300 bg-red-50 text-red-900 px-4 py-3 text-xs font-semibold">
          <AlertTriangle size={16} />
          {loadError}
        </div>
      )}

      {/* Users Table */}
      {!isLoading && !loadError && (
        <div className="border-2 border-[#A33214]/15 bg-white/60 overflow-x-auto shadow-xs">
          <table className="w-full text-left border-collapse table-fixed">
            <colgroup>
              <col className="w-[32%]" />
              <col className="w-[17%]" />
              <col className="w-[11%]" />
              <col className="w-[13%]" />
              <col className="w-[10%]" />
              <col className="w-[10%]" />
              <col className="w-[7%]" />
            </colgroup>
            <thead>
              <tr className="bg-[#A33214] text-[#FDF6EC] text-xs uppercase font-bold tracking-wider">
                <th className="p-3">User</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Role</th>
                <th className="p-3">Activity</th>
                <th className="p-3">Joined</th>
                <th className="p-3">Status</th>
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
                      user.status === 'BANNED' ? 'bg-red-500/10 opacity-75' : ''
                    }`}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={getAvatarSrc(user)}
                          alt={user.fullName}
                          width={40}
                          height={40}
                          className="w-10 h-10 object-cover border border-[#1C1C1C]/20 rounded-xs shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-bold truncate">
                            {user.fullName}
                          </div>
                          <div className="text-[10px] text-[#1C1C1C]/60 truncate">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3 text-[11px] text-[#1C1C1C]/80 truncate">
                      {user.phone ?? '—'}
                    </td>

                    <td className="p-3">
                      <span className="uppercase text-[10px] font-extrabold tracking-wider px-2 py-0.5 border border-[#1C1C1C]/20 rounded-xs bg-stone-100">
                        {user.role}
                      </span>
                    </td>

                    <td className="p-3 text-[11px]">
                      <div className="flex items-center gap-3 text-[#1C1C1C]/80">
                        <span
                          title="Total Orders"
                          className="flex items-center gap-1"
                        >
                          <ShoppingBag
                            size={12}
                            className="text-[#1C1C1C]/50"
                          />
                          {user.totalOrders}
                        </span>
                        <span
                          title="Total Listings"
                          className="flex items-center gap-1"
                        >
                          <Tag size={12} className="text-[#1C1C1C]/50" />
                          {user.totalListings}
                        </span>
                      </div>
                    </td>

                    <td className="p-3 text-[11px] text-[#1C1C1C]/70">
                      {user.joinedDate}
                    </td>

                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border rounded-xs ${statusBadgeClasses(
                          user.status,
                        )}`}
                      >
                        {user.status === 'BANNED' ? (
                          <Ban size={10} />
                        ) : (
                          <UserCheck size={10} />
                        )}
                        {user.status}
                      </span>
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setModalMode('inspect');
                          }}
                          className="p-1.5 bg-[#1C1C1C] text-[#FDF6EC] hover:bg-[#A33214] transition-colors rounded-xs"
                          title="View Full Profile"
                        >
                          <Eye size={13} />
                        </button>

                        {user.status !== 'BANNED' && (
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setModalMode('ban');
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
      )}

      {/* MODAL: INSPECT / BAN */}
      {selectedUser && modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1C1C]/50 backdrop-blur-xs">
          <div className="bg-[#FDF6EC] border-2 border-[#1C1C1C]/20 w-full max-w-lg p-6 space-y-5 shadow-xl rounded-xs">
            <div className="flex items-center justify-between border-b border-[#1C1C1C]/15 pb-3">
              <h2
                className="text-base text-[#1C1C1C] uppercase font-bold flex items-center gap-2"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {modalMode === 'inspect' && (
                  <Users size={18} className="text-[#1C1C1C]" />
                )}
                {modalMode === 'ban' && (
                  <Ban size={18} className="text-[#A33214]" />
                )}
                {modalMode === 'inspect'
                  ? 'User Account Dossier'
                  : 'Ban User Account'}
              </h2>
              <button
                onClick={closeModal}
                className="text-[#1C1C1C]/60 hover:text-[#A33214]"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="flex items-center gap-3 bg-white/80 p-3 border border-[#1C1C1C]/15">
              <Image
                src={getAvatarSrc(selectedUser)}
                alt={selectedUser.fullName}
                width={48}
                height={48}
                className="w-12 h-12 object-cover border border-[#1C1C1C]/20 rounded-xs"
              />
              <div className="text-xs">
                <p className="font-bold text-sm text-[#1C1C1C]">
                  {selectedUser.fullName}
                </p>
                <p className="text-[#1C1C1C]/60">
                  {selectedUser.email}{' '}
                  {selectedUser.phone ? `| ${selectedUser.phone}` : ''}
                </p>
                <p className="text-[10px] text-[#A33214] font-bold uppercase mt-0.5">
                  Role: {selectedUser.role} • Joined {selectedUser.joinedDate}
                </p>
              </div>
            </div>

            {modalMode === 'inspect' && (
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
                {selectedUser.status === 'BANNED' && selectedUser.banReason && (
                  <div className="p-3 bg-red-50 border border-red-300 text-red-900">
                    <span className="text-[10px] uppercase font-bold block mb-1">
                      Ban Reason
                    </span>
                    {selectedUser.banReason}
                  </div>
                )}
              </div>
            )}

            {modalMode === 'ban' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#1C1C1C]/60 mb-1">
                    Reason for Banning
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. Counterfeit merchandise confirmed, non-payment, harassment..."
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    className="w-full bg-white text-[#1C1C1C] border border-[#1C1C1C]/30 p-2 font-medium focus:outline-none focus:border-[#A33214]"
                  />
                  {actionReason.trim().length > 0 &&
                    actionReason.trim().length < 5 && (
                      <p className="text-[10px] text-red-700 mt-1">
                        Reason must be at least 5 characters.
                      </p>
                    )}
                </div>
                {banError && (
                  <p className="text-[10px] text-red-700">{banError}</p>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-[#1C1C1C]/10">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-[#1C1C1C]/20 text-xs font-bold uppercase hover:bg-white"
              >
                Close
              </button>

              {modalMode === 'ban' && (
                <button
                  onClick={handleBanUser}
                  disabled={actionReason.trim().length < 5 || isSubmittingBan}
                  className="px-4 py-2 bg-[#A33214] text-[#FDF6EC] text-xs font-bold uppercase hover:bg-[#1C1C1C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmittingBan && (
                    <Loader2 size={12} className="animate-spin" />
                  )}
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
