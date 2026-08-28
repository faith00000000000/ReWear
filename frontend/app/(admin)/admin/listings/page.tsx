'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
  Shirt,
  MoreVertical,
  Check,
  Ban,
  Loader2,
  FileClock,
} from 'lucide-react';
import {
  AdminListingItem,
  BackendListingStatus,
} from '@/lib/types/admin-listing';
import { mapListingsToAdminItems } from '@/lib/mappers/adminListingMapper';
import {
  approveListing,
  deleteListingById,
  fetchAdminListings,
  rejectListing,
} from '@/lib/api/adminListings';

type TypeFilter = 'all' | 'thrift' | 'rent';
type StatusFilter = 'all' | BackendListingStatus;

export default function ListingsManagementPage() {
  const [listings, setListings] = useState<AdminListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedListing, setSelectedListing] =
    useState<AdminListingItem | null>(null);

  // Which row's quick-action dropdown is open, if any
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Tracks in-flight approve/reject/delete calls per listing id so we can
  // disable buttons and show a spinner without blocking the whole page.
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // ── Initial load ─────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError(null);
      try {
        const dtos = await fetchAdminListings();
        if (!cancelled) setListings(mapListingsToAdminItems(dtos));
      } catch (err) {
        console.error(err);
        if (!cancelled)
          setLoadError("Couldn't load listings. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Close quick-action dropdown on outside click ────────────────────
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Filtering ────────────────────────────────────────────────────────
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      const matchesStatus =
        statusFilter === 'all' || item.status === statusFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        item.title.toLowerCase().includes(q) ||
        item.sellerName.toLowerCase().includes(q);
      return matchesType && matchesStatus && matchesSearch;
    });
  }, [listings, typeFilter, statusFilter, searchQuery]);

  // ── Moderation actions ───────────────────────────────────────────────
  async function handleApprove(id: number) {
    setActionLoadingId(id);
    try {
      await approveListing(id);
      setListings((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: 'PUBLISHED' } : l)),
      );
      setSelectedListing((prev) =>
        prev && prev.id === id ? { ...prev, status: 'PUBLISHED' } : prev,
      );
    } catch (err) {
      console.error(err);
      alert('Failed to approve listing. Please try again.');
    } finally {
      setActionLoadingId(null);
      setOpenMenuId(null);
    }
  }

  async function handleReject(id: number) {
    setActionLoadingId(id);
    try {
      await rejectListing(id);
      setListings((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: 'REJECTED' } : l)),
      );
      setSelectedListing((prev) =>
        prev && prev.id === id ? { ...prev, status: 'REJECTED' } : prev,
      );
    } catch (err) {
      console.error(err);
      alert('Failed to reject listing. Please try again.');
    } finally {
      setActionLoadingId(null);
      setOpenMenuId(null);
    }
  }

  async function handleDelete(id: number) {
    if (
      !confirm(
        'Are you sure you want to permanently delete this listing? This action cannot be reversed.',
      )
    ) {
      return;
    }
    setActionLoadingId(id);
    try {
      await deleteListingById(id);
      setListings((prev) => prev.filter((l) => l.id !== id));
      setSelectedListing((prev) => (prev?.id === id ? null : prev));
    } catch (err) {
      console.error(err);
      alert('Failed to delete listing. Please try again.');
    } finally {
      setActionLoadingId(null);
      setOpenMenuId(null);
    }
  }

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
            Review, approve, reject, and remove apparel listings across ReWear.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-[#A33214] text-[#FDF6EC] font-bold text-xs uppercase tracking-wider rounded-sm">
            Total: {listings.length}
          </div>
          <div className="px-3 py-1 bg-[#A33214] text-[#FDF6EC] font-bold text-xs uppercase tracking-wider rounded-sm">
            Pending:{' '}
            {listings.filter((l) => l.status === 'PENDING_REVIEW').length}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex items-center bg-[#FDF6EC] border border-[#1C1C1C]/20 p-1 self-start rounded-sm shadow-sm">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-4 py-1.5 font-extrabold text-xs uppercase tracking-wider transition-all rounded-sm ${
              typeFilter === 'all'
                ? 'bg-[#A33214] text-[#FDF6EC]'
                : 'text-[#1C1C1C]/80 hover:text-[#1C1C1C] hover:bg-[#1C1C1C]/5'
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => setTypeFilter('thrift')}
            className={`px-4 py-1.5 font-extrabold text-xs uppercase tracking-wider transition-all rounded-sm flex items-center gap-1.5 ${
              typeFilter === 'thrift'
                ? 'bg-[#A33214] text-[#FDF6EC]'
                : 'text-[#1C1C1C]/80 hover:text-[#A33214] hover:bg-[#A33214]/5'
            }`}
          >
            <Tag size={13} />
            Thrift
          </button>
          <button
            onClick={() => setTypeFilter('rent')}
            className={`px-4 py-1.5 font-extrabold text-xs uppercase tracking-wider transition-all rounded-sm flex items-center gap-1.5 ${
              typeFilter === 'rent'
                ? 'bg-[#A33214] text-[#FDF6EC]'
                : 'text-[#1C1C1C]/80 hover:text-[#A33214] hover:bg-[#A33214]/5'
            }`}
          >
            <Clock size={13} />
            Rent
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1C1C1C]/50"
            />
            <input
              type="text"
              placeholder="Search by title or seller..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FDF6EC] text-[#1C1C1C] border border-[#1C1C1C]/20 rounded-sm pl-9 pr-3 py-1.5 text-xs font-semibold placeholder-[#1C1C1C]/40 focus:outline-none focus:border-[#A33214]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={16} className="text-[#1C1C1C]/70 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="w-full sm:w-auto bg-[#FDF6EC] text-[#1C1C1C] border border-[#1C1C1C]/20 rounded-sm px-3 py-1.5 text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-[#A33214]"
            >
              <option value="all">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="PUBLISHED">Published</option>
              <option value="REJECTED">Rejected</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border border-[#1C1C1C]/15 bg-[#FDF6EC] overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#A33214] text-[#FDF6EC] text-xs uppercase font-bold tracking-wider border-b border-[#1C1C1C]">
              <th className="p-3">Item</th>
              <th className="p-3">Type</th>
              <th className="p-3">Seller</th>
              <th className="p-3">Price</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-center">Reports</th>
              <th className="p-3">Listed</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1C1C1C]/10 font-medium text-xs">
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-10">
                  <Loader2
                    size={20}
                    className="animate-spin inline-block text-[#A33214]"
                  />
                </td>
              </tr>
            ) : loadError ? (
              <tr>
                <td
                  colSpan={8}
                  className="text-center py-10 text-[#A33214] font-semibold"
                >
                  {loadError}
                </td>
              </tr>
            ) : filteredListings.length === 0 ? (
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
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-12 h-12 object-cover border border-[#1C1C1C]/20 rounded-sm shrink-0"
                      />
                      <p className="font-bold text-[#1C1C1C] line-clamp-1">
                        {item.title}
                      </p>
                    </div>
                  </td>

                  <td className="p-3">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border rounded-xs ${
                        item.type === 'thrift'
                          ? 'bg-stone-100 text-[#1C1C1C] border-[#1C1C1C]/30'
                          : 'bg-amber-50 text-amber-900 border-amber-300'
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>

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

                  <td className="p-3 font-bold text-[#1C1C1C]">
                    Rs. {item.price.toLocaleString('en-IN')}
                    {item.type === 'rent' && (
                      <span className="text-[10px] font-normal text-[#1C1C1C]/60">
                        /day
                      </span>
                    )}
                  </td>

                  <td className="p-3">
                    <ListingStatusBadge status={item.status} />
                  </td>

                  <td className="p-3 text-center">
                    <span
                      className={`font-bold ${
                        item.reportsCount > 0
                          ? 'text-[#A33214]'
                          : 'text-[#1C1C1C]/40'
                      }`}
                    >
                      {item.reportsCount}
                    </span>
                  </td>

                  <td className="p-3 text-[#1C1C1C]/70">
                    {formatDate(item.createdAt)}
                  </td>

                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5 relative">
                      <button
                        onClick={() => setSelectedListing(item)}
                        className="p-1.5 bg-[#1C1C1C] text-[#FDF6EC] hover:bg-[#A33214] transition-colors rounded-sm"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>

                      <button
                        onClick={() =>
                          setOpenMenuId(openMenuId === item.id ? null : item.id)
                        }
                        className="p-1.5 bg-stone-200 text-[#1C1C1C] hover:bg-stone-300 transition-colors rounded-sm"
                        title="Quick Actions"
                        disabled={actionLoadingId === item.id}
                      >
                        {actionLoadingId === item.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <MoreVertical size={14} />
                        )}
                      </button>

                      {openMenuId === item.id && (
                        <div
                          ref={menuRef}
                          className="absolute right-0 top-full mt-1 w-40 bg-[#FDF6EC] border border-[#1C1C1C]/20 shadow-lg rounded-sm z-10 overflow-hidden text-left"
                        >
                          <button
                            onClick={() => handleApprove(item.id)}
                            disabled={item.status === 'PUBLISHED'}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Check size={13} /> Approve
                          </button>
                          <button
                            onClick={() => handleReject(item.id)}
                            disabled={item.status === 'REJECTED'}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-amber-800 hover:bg-amber-50 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Ban size={13} /> Reject
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-[#A33214] hover:bg-red-50"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1C1C]/50 backdrop-blur-xs">
          <div className="bg-[#FDF6EC] border border-[#1C1C1C]/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-xl rounded-sm">
            <div className="flex items-center justify-between border-b border-[#1C1C1C]/15 pb-3">
              <div className="flex items-center gap-2">
                <Shirt className="text-[#A33214]" size={20} />
                <h2 className="text-lg font-black text-[#1C1C1C] uppercase tracking-wide">
                  Listing Detail
                </h2>
              </div>
              <button
                onClick={() => setSelectedListing(null)}
                className="text-[#1C1C1C]/60 hover:text-[#A33214] p-1 transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Photo gallery */}
            {(() => {
              const raw = selectedListing.raw;
              const gallery = [
                raw.photoFrontUrl,
                raw.photoBackUrl,
                raw.photoLabelUrl,
                raw.photoDetailUrl,
              ].filter((u): u is string => Boolean(u));

              return gallery.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {gallery.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`${selectedListing.title} ${i + 1}`}
                      className="w-full h-24 object-cover border border-[#1C1C1C]/20 rounded-sm"
                    />
                  ))}
                </div>
              ) : (
                <img
                  src={selectedListing.image}
                  alt={selectedListing.title}
                  className="w-full h-56 object-cover border border-[#1C1C1C]/20 rounded-sm"
                />
              );
            })()}

            {selectedListing.raw.videoUrl && (
              <video
                src={selectedListing.raw.videoUrl}
                controls
                className="w-full h-56 object-cover border border-[#1C1C1C]/20 rounded-sm bg-black"
              />
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <ListingStatusBadge status={selectedListing.status} />
                {selectedListing.reportsCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#A33214]">
                    <AlertTriangle size={12} />
                    {selectedListing.reportsCount} report
                    {selectedListing.reportsCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              <h3 className="font-black text-lg text-[#1C1C1C]">
                {selectedListing.title}
              </h3>
              {selectedListing.raw.brand && (
                <p className="text-xs text-[#1C1C1C]/60 -mt-2">
                  {selectedListing.raw.brand}
                </p>
              )}

              {/* Price row */}
              <div className="flex items-baseline gap-3">
                {selectedListing.raw.thriftPrice != null && (
                  <span className="text-xl font-black text-[#A33214]">
                    Rs {selectedListing.raw.thriftPrice.toLocaleString('en-IN')}
                  </span>
                )}
                {selectedListing.raw.rentPerDay != null && (
                  <span className="text-xl font-black text-[#A33214]">
                    Rs {selectedListing.raw.rentPerDay.toLocaleString('en-IN')}
                    <span className="text-xs font-normal text-[#1C1C1C]/60 ml-1">
                      / day
                    </span>
                  </span>
                )}
                {selectedListing.raw.originalPrice != null && (
                  <span className="text-xs text-[#1C1C1C]/40 line-through">
                    Rs{' '}
                    {selectedListing.raw.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              {/* Attribute pills */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  selectedListing.raw.size &&
                    `Size ${selectedListing.raw.size}`,
                  selectedListing.raw.condition,
                  selectedListing.raw.color,
                  selectedListing.raw.material,
                  selectedListing.raw.gender,
                  selectedListing.raw.clothingType,
                ]
                  .filter(Boolean)
                  .map((label) => (
                    <span
                      key={label}
                      className="text-[10px] bg-[#1C1C1C]/5 border border-[#1C1C1C]/15 text-[#1C1C1C] px-2 py-0.5 rounded-full font-semibold"
                    >
                      {label}
                    </span>
                  ))}
              </div>

              {/* Description */}
              {selectedListing.raw.description && (
                <div className="bg-[#1C1C1C]/5 border border-[#1C1C1C]/10 rounded-sm px-3 py-2.5">
                  <p className="text-[10px] font-bold uppercase text-[#1C1C1C]/60 mb-1">
                    Description
                  </p>
                  <p className="text-xs text-[#1C1C1C] leading-relaxed">
                    {selectedListing.raw.description}
                  </p>
                </div>
              )}

              {/* Flaws */}
              {selectedListing.raw.defectFlaws && (
                <div className="bg-[#A33214]/5 border border-[#A33214]/20 rounded-sm px-3 py-2.5">
                  <p className="text-[10px] font-bold uppercase text-[#A33214] mb-1">
                    Noted Flaws
                  </p>
                  <p className="text-xs text-[#1C1C1C] leading-relaxed">
                    {selectedListing.raw.defectFlaws}
                  </p>
                </div>
              )}

              {/* Delivery */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase text-[#1C1C1C]/60">
                  Delivery
                </p>
                {(selectedListing.raw.deliveryOption === 'SHIPPING' ||
                  selectedListing.raw.deliveryOption === 'FLEX') && (
                  <div className="text-xs bg-[#1C1C1C]/5 border border-[#1C1C1C]/10 rounded-sm px-3 py-2">
                    <p className="font-bold">
                      Shipping — {selectedListing.raw.shippingAvailability}
                    </p>
                    <p className="text-[#1C1C1C]/60 mt-0.5">
                      {selectedListing.raw.shippingFeeType?.replace(/_/g, ' ')}
                      {selectedListing.raw.fixedShippingFee != null &&
                        ` · Rs ${selectedListing.raw.fixedShippingFee}`}
                      {' · Dispatch: '}
                      {selectedListing.raw.dispatchTime}
                    </p>
                  </div>
                )}
                {(selectedListing.raw.deliveryOption === 'PICKUP' ||
                  selectedListing.raw.deliveryOption === 'FLEX') && (
                  <div className="text-xs bg-[#1C1C1C]/5 border border-[#1C1C1C]/10 rounded-sm px-3 py-2">
                    <p className="font-bold">
                      Pickup — {selectedListing.raw.pickupArea}
                    </p>
                    <p className="text-[#1C1C1C]/60 mt-0.5">
                      {selectedListing.raw.pickupTimeFrom} –{' '}
                      {selectedListing.raw.pickupTimeTo}
                      {selectedListing.raw.pickupDays &&
                        ` (${selectedListing.raw.pickupDays})`}
                    </p>
                    {selectedListing.raw.pickupContactNumber && (
                      <p className="text-[#1C1C1C]/60">
                        Contact: {selectedListing.raw.pickupContactNumber}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-[#1C1C1C]/10">
                <img
                  src={selectedListing.sellerAvatar}
                  alt={selectedListing.sellerName}
                  className="w-8 h-8 rounded-full border border-[#1C1C1C]/20 object-cover"
                />
                <p className="text-xs font-bold text-[#1C1C1C]">
                  Seller: {selectedListing.sellerName}
                </p>
              </div>
            </div>

            <div className="border-t border-[#1C1C1C]/15 pt-4 space-y-3">
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#1C1C1C]/70">
                Moderation Actions
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleApprove(selectedListing.id)}
                  disabled={
                    selectedListing.status === 'PUBLISHED' ||
                    actionLoadingId === selectedListing.id
                  }
                  className="px-3 py-2 bg-emerald-700 text-[#FDF6EC] font-bold text-xs uppercase tracking-wider hover:bg-emerald-800 transition-colors rounded-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  <Check size={13} /> Approve
                </button>
                <button
                  onClick={() => handleReject(selectedListing.id)}
                  disabled={
                    selectedListing.status === 'REJECTED' ||
                    actionLoadingId === selectedListing.id
                  }
                  className="px-3 py-2 bg-amber-600 text-[#FDF6EC] font-bold text-xs uppercase tracking-wider hover:bg-amber-700 transition-colors rounded-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  <Ban size={13} /> Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function ListingStatusBadge({ status }: { status: BackendListingStatus }) {
  switch (status) {
    case 'PUBLISHED':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xs">
          <CheckCircle2 size={11} /> Published
        </span>
      );
    case 'PENDING_REVIEW':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-sky-100 text-sky-900 border border-sky-300 rounded-xs">
          <Clock size={11} /> Pending
        </span>
      );
    case 'REJECTED':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 rounded-xs">
          <AlertTriangle size={11} /> Rejected
        </span>
      );
    case 'ARCHIVED':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-red-100 text-red-900 border border-red-300 rounded-xs">
          <XCircle size={11} /> Archived
        </span>
      );
    case 'DRAFT':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-stone-100 text-stone-700 border border-stone-300 rounded-xs">
          <Tag size={11} /> Draft
        </span>
      );
  }
}
