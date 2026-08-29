'use client';

import { useEffect, useState, useCallback, type ReactNode } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  XCircle,
  Search,
  ShieldAlert,
  Tag,
  Loader2,
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  fetchReports,
  fetchReportStats,
  updateReportStatus,
  ReportResponse,
  ReportStatsResponse,
  ReportStatus,
  ListingType,
  ReportActionTaken,
  listingTypeLabel,
} from '@/lib/api/reportApi';

type StatusTab = 'all' | ReportStatus;

const STATUS_TABS: { id: StatusTab; label: string }[] = [
  { id: 'all', label: 'All Reports' },
  { id: 'PENDING', label: 'Pending' },
  { id: 'INVESTIGATING', label: 'Investigating' },
  { id: 'RESOLVED', label: 'Resolved' },
  { id: 'DISMISSED', label: 'Dismissed' },
];

const ACTION_TAKEN_OPTIONS: { id: ReportActionTaken; label: string }[] = [
  { id: 'NONE', label: 'No violation' },
  { id: 'WARNING_ISSUED', label: 'Warning issued' },
  { id: 'LISTING_HIDDEN', label: 'Listing hidden' },
  { id: 'LISTING_REMOVED', label: 'Listing removed' },
  { id: 'SELLER_SUSPENDED', label: 'Seller suspended' },
];

function formatDateTime(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ReportManagementPage() {
  const [statusTab, setStatusTab] = useState<StatusTab>('all');
  const [listingTypeFilter, setListingTypeFilter] = useState<'all' | ListingType>('all');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [stats, setStats] = useState<ReportStatsResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ReportResponse | null>(null);

  // Debounce the search box so we don't fire a request on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(0);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchReports({
        status: statusTab,
        listingType: listingTypeFilter,
        search,
        page,
        size: 10,
      });
      setReports(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (err) {
      console.error('Failed to load reports:', err);
      toast.error("Couldn't load reports. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [statusTab, listingTypeFilter, search, page]);

  const loadStats = useCallback(async () => {
    try {
      const result = await fetchReportStats();
      setStats(result);
    } catch (err) {
      console.error('Failed to load report stats:', err);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Called after any status change so cards + table stay in sync.
  const refreshAll = useCallback(() => {
    loadReports();
    loadStats();
  }, [loadReports, loadStats]);

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#1C1C1C]/15 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1C1C1C] uppercase tracking-wide flex items-center gap-2">
              <ShieldAlert size={28} className="text-[#A33214]" />
              Report Management
            </h1>
            <p className="text-sm font-medium text-[#1C1C1C]/70 mt-1">
              Review and manage user reports submitted against listings and sellers across RE:WEAR.
            </p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Reports', value: stats?.total },
            { label: 'Pending', value: stats?.pending },
            { label: 'Investigating', value: stats?.investigating },
            { label: 'Resolved', value: stats?.resolved },
          ].map(({ label, value }) => (
              <div
                  key={label}
                  className="rounded-xl border border-[#1C1C1C]/15 bg-[#FDF6EC] px-4 py-3 shadow-sm"
              >
                <p className="text-2xl font-black text-[#A33214]">{value ?? '—'}</p>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#1C1C1C]/60">
                  {label}
                </p>
              </div>
          ))}
        </div>

        {/* Status tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-[#FDF6EC] border border-[#1C1C1C]/20 p-1 rounded-xl shadow-sm w-fit">
          {STATUS_TABS.map((tab) => (
              <button
                  key={tab.id}
                  onClick={() => {
                    setStatusTab(tab.id);
                    setPage(0);
                  }}
                  className={`px-3.5 py-1.5 font-extrabold text-xs uppercase tracking-wider transition-all rounded-xl ${
                      statusTab === tab.id
                          ? 'bg-[#A33214] text-[#FDF6EC]'
                          : 'text-[#1C1C1C]/80 hover:bg-[#1C1C1C]/5'
                  }`}
              >
                {tab.label}
              </button>
          ))}
        </div>

        {/* Search + listing-type filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1C1C1C]/50" />
            <input
                type="text"
                placeholder="Search reports, listings or users..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-[#FDF6EC] text-[#1C1C1C] border border-[#1C1C1C]/20 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold placeholder-[#1C1C1C]/40 focus:outline-none focus:border-[#A33214]"
            />
          </div>

          <select
              value={listingTypeFilter}
              onChange={(e) => {
                setListingTypeFilter(e.target.value as 'all' | ListingType);
                setPage(0);
              }}
              className="bg-[#FDF6EC] text-[#1C1C1C] border border-[#1C1C1C]/20 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-[#A33214]"
          >
            <option value="all">All Listing Types</option>
            <option value="THRIFT">Thrift</option>
            <option value="RENT">Rent</option>
            <option value="THRIFT_AND_RENT">Flex</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-[#A33214]/15 bg-[#FDF6EC] shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
            <tr className="bg-[#A33214] text-[#FDF6EC] text-xs uppercase font-bold tracking-wider border-b border-[#1C1C1C]">
              <th className="p-3">Report ID</th>
              <th className="p-3">Listing</th>
              <th className="p-3">Seller</th>
              <th className="p-3">Reason</th>
              <th className="p-3">Reported By</th>
              <th className="p-3">Reported On</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Action</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C1C]/10 font-medium text-xs">
            {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-[#1C1C1C]/60">
                    <Loader2 size={18} className="inline animate-spin mr-2" />
                    Loading reports…
                  </td>
                </tr>
            ) : reports.length === 0 ? (
                <tr>
                  <td
                      colSpan={8}
                      className="text-center py-10 text-[#1C1C1C]/60 font-semibold uppercase tracking-wider"
                  >
                    No reports found matching your selected criteria.
                  </td>
                </tr>
            ) : (
                reports.map((report) => (
                    <tr key={report.id} className="hover:bg-[#1C1C1C]/5 transition-colors">
                      <td className="p-3 font-mono font-bold text-[#A33214]">REP-{report.id}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                              src={report.itemImage}
                              alt={report.itemTitle}
                              className="w-10 h-10 object-cover border border-[#1C1C1C]/20 rounded-xl"
                          />
                          <div>
                            <p className="font-bold text-[#1C1C1C] line-clamp-1">{report.itemTitle}</p>
                            <p className="text-[11px] text-[#1C1C1C]/60 font-medium flex items-center gap-1">
                              <Tag size={10} /> LST-{report.listingId} · {listingTypeLabel(report.listingType)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-bold text-[#1C1C1C]">{report.sellerName}</td>
                      <td className="p-3 font-bold text-[#1C1C1C]">{report.reason}</td>
                      <td className="p-3">
                        <p className="font-bold text-[#1C1C1C]">{report.reporterName}</p>
                      </td>
                      <td className="p-3 text-[#1C1C1C]/70">{formatDateTime(report.reportedAt)}</td>
                      <td className="p-3">
                        <StatusBadge status={report.status} />
                      </td>
                      <td className="p-3 text-right">
                        <button
                            onClick={() => setSelectedReport(report)}
                            className="p-1.5 bg-[#A33214] text-[#FDF6EC] hover:bg-[#832510] transition-colors border border-[#1C1C1C] rounded-xl"
                            title="View Report Details"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                ))
            )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
            <div className="flex items-center justify-between text-xs font-semibold text-[#1C1C1C]/70">
          <span>
            Page {page + 1} of {totalPages} · {totalElements} reports
          </span>
              <div className="flex gap-2">
                <button
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    className="px-3 py-1.5 border border-[#1C1C1C]/20 rounded-xl disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                    disabled={page + 1 >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1.5 border border-[#1C1C1C]/20 rounded-xl disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
        )}

        {selectedReport && (
            <ReportDetailModal
                report={selectedReport}
                onClose={() => setSelectedReport(null)}
                onUpdated={(updated) => {
                  setSelectedReport(updated);
                  refreshAll();
                }}
            />
        )}
      </div>
  );
}

function StatusBadge({ status }: { status: ReportStatus }) {
  const config: Record<ReportStatus, { label: string; className: string; icon: ReactNode }> = {
    PENDING: {
      label: 'Pending',
      className: 'bg-[#A33214] text-[#FDF6EC]',
      icon: <AlertTriangle size={11} />,
    },
    INVESTIGATING: {
      label: 'Investigating',
      className: 'bg-amber-100 text-amber-900 border border-amber-300',
      icon: <Clock size={11} />,
    },
    RESOLVED: {
      label: 'Resolved',
      className: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
      icon: <CheckCircle2 size={11} />,
    },
    DISMISSED: {
      label: 'Dismissed',
      className: 'bg-stone-200 text-stone-700 border border-stone-300',
      icon: <XCircle size={11} />,
    },
  };
  const { label, className, icon } = config[status];
  return (
      <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-xl ${className}`}
      >
      {icon} {label}
    </span>
  );
}

/* ── Report Detail Modal — review + resolution flow ────────────── */
function ReportDetailModal({
                             report,
                             onClose,
                             onUpdated,
                           }: {
  report: ReportResponse;
  onClose: () => void;
  onUpdated: (updated: ReportResponse) => void;
}) {
  const [actionTaken, setActionTaken] = useState<ReportActionTaken>(report.actionTaken ?? 'NONE');
  const [adminNote, setAdminNote] = useState(report.adminNote ?? '');
  const [submitting, setSubmitting] = useState<'investigate' | 'resolve' | 'dismiss' | null>(null);

  const submit = async (status: ReportStatus, key: typeof submitting) => {
    setSubmitting(key);
    try {
      const updated = await updateReportStatus(report.id, {
        status,
        actionTaken,
        adminNote: adminNote.trim() || undefined,
      });
      toast.success(`Report REP-${report.id} updated.`);
      onUpdated(updated);
    } catch (err) {
      console.error('Failed to update report:', err);
      toast.error("Couldn't update this report. Please try again.");
    } finally {
      setSubmitting(null);
    }
  };

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1C1C]/50 backdrop-blur-xs">
        <div className="bg-[#FDF6EC] border border-[#1C1C1C]/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-xl rounded-xl">
          {/* Header */}
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-[#1C1C1C]/15 pb-3">
            <StatusBadge status={report.status} />
            <div className="flex items-center justify-center gap-2 text-center">
              <AlertTriangle className="text-[#A33214]" size={20} />
              <h2 className="text-lg font-black text-[#1C1C1C] uppercase tracking-wide">
                Report Detail: REP-{report.id}
              </h2>
            </div>
            <button onClick={onClose} aria-label="Close report" className="rounded-xl p-1 text-[#1C1C1C]/60 transition-colors hover:bg-[#A33214]/10 hover:text-[#A33214]">
              <XCircle size={20} />
            </button>
          </div>

          {/* Listing info */}
          <div className="border border-[#A33214]/15 p-4 bg-[#FDF6EC] flex flex-col sm:flex-row gap-4 rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={report.itemImage}
                alt={report.itemTitle}
                className="w-20 h-20 object-cover border border-[#1C1C1C]/20 rounded-xl"
            />
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#A33214]">LST-{report.listingId}</span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 border border-[#1C1C1C]/20 bg-stone-100 text-[#1C1C1C]">
                {listingTypeLabel(report.listingType)}
              </span>
              </div>
              <h3 className="font-bold text-base text-[#1C1C1C]">{report.itemTitle}</h3>
              <p className="text-xs font-semibold text-[#1C1C1C]">
                Price: Rs. {report.price?.toLocaleString('en-IN') ?? '—'}
                {report.listingType !== 'THRIFT' ? '/day' : ''}
              </p>
              <p className="text-xs text-[#1C1C1C]/70">
                Seller: <span className="font-bold text-[#1C1C1C]">{report.sellerName}</span>
              </p>
            </div>
          </div>

          {/* Complaint details */}
          <div className="space-y-3 border-l-2 border-[#A33214] pl-4 py-1">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#1C1C1C]/60">
                Reported Reason
              </p>
              <p className="text-sm font-bold text-[#A33214]">{report.reason}</p>
            </div>
            {report.details && (
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#1C1C1C]/60">
                    Additional Details
                  </p>
                  <p className="text-xs font-medium text-[#1C1C1C] bg-[#1C1C1C]/5 p-3 border border-[#1C1C1C]/10 rounded-xl mt-1">
                    &ldquo;{report.details}&rdquo;
                  </p>
                </div>
            )}
            <div className="flex justify-between text-xs font-medium text-[#1C1C1C]/60">
            <span>
              Filed by: {report.reporterName} ({report.reporterEmail})
            </span>
              <span>Date: {formatDateTime(report.reportedAt)}</span>
            </div>
            {report.reviewedBy && (
                <p className="text-xs font-medium text-[#1C1C1C]/60">
                  Last reviewed by: {report.reviewedBy}
                  {report.resolvedAt ? ` on ${formatDateTime(report.resolvedAt)}` : ''}
                </p>
            )}
          </div>

          {/* Resolution panel */}
          <div className="border-t border-[#1C1C1C]/15 pt-4 space-y-3">
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#1C1C1C]/70">
              Admin Resolution
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wide text-[#1C1C1C]/60">
                Action Taken
              </label>
              <select
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value as ReportActionTaken)}
                  className="bg-white border border-[#1C1C1C]/20 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wide"
              >
                {ACTION_TAKEN_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wide text-[#1C1C1C]/60">
                Admin Note
              </label>
              <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Explain what was found and why this action was taken…"
                  rows={3}
                  maxLength={1000}
                  className="w-full resize-none rounded-xl border border-[#1C1C1C]/20 bg-white px-3 py-2 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                  onClick={() => submit('INVESTIGATING', 'investigate')}
                  disabled={submitting !== null}
                  className="px-3 py-2 bg-amber-100 text-amber-950 border border-amber-300 font-bold text-xs uppercase tracking-wider hover:bg-amber-200 transition-colors rounded-xl disabled:opacity-50"
              >
                {submitting === 'investigate' ? 'Saving…' : 'Mark Investigating'}
              </button>
              <button
                  onClick={() => submit('RESOLVED', 'resolve')}
                  disabled={submitting !== null}
                  className="px-3 py-2 bg-emerald-100 text-emerald-950 border border-emerald-300 font-bold text-xs uppercase tracking-wider hover:bg-emerald-200 transition-colors rounded-xl disabled:opacity-50"
              >
                {submitting === 'resolve' ? 'Saving…' : 'Resolve Report'}
              </button>
              <button
                  onClick={() => submit('DISMISSED', 'dismiss')}
                  disabled={submitting !== null}
                  className="px-3 py-2 bg-stone-200 text-stone-800 border border-stone-300 font-bold text-xs uppercase tracking-wider hover:bg-stone-300 transition-colors rounded-xl disabled:opacity-50"
              >
                {submitting === 'dismiss' ? 'Saving…' : 'Dismiss Report'}
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}