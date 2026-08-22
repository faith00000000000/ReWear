"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  HeartHandshake,
  Building2,
  Calendar,
  Search,
  AlertCircle,
  Plus,
  MapPin,
  Phone,
  Mail,
  User,
  Package,
  XCircle,
  Scale,
  RefreshCw,
  Loader2,
  Trash2,
  Power,
} from "lucide-react";

import {
  Donation,
  DonationStatus,
  Organization,
  OrganizationRequest,
  OrganizationType,
  createOrganization,
  deleteOrganization,
  getAllDonations,
  getAllOrganizations,
  updateDonationStatus,
  updateOrganization,
} from "@/lib/api/donationApi";

const DONATION_STATUSES: DonationStatus[] = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "REJECTED",
];

const STATUS_STYLES: Record<DonationStatus, string> = {
  PENDING: "bg-amber-50 text-amber-900 border-amber-300",
  CONFIRMED: "bg-blue-50 text-blue-900 border-blue-300",
  COMPLETED: "bg-emerald-50 text-emerald-900 border-emerald-300",
  REJECTED: "bg-rose-50 text-rose-900 border-rose-300",
};

function errorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message ?? fallback;
  }
  return fallback;
}

export default function DonationsPage() {
  const [activeTab, setActiveTab] = useState<"donations" | "organizations">(
      "donations",
  );

  // ── Data ──────────────────────────────────────────────────────
  const [donations, setDonations] = useState<Donation[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loadingDonations, setLoadingDonations] = useState(true);
  const [loadingOrgs, setLoadingOrgs] = useState(true);

  // ── Filters & Search ─────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // ── Status update modal ─────────────────────────────────────
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(
      null,
  );
  const [nextStatus, setNextStatus] = useState<DonationStatus>("PENDING");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // ── Add organization modal ──────────────────────────────────
  const [isAddOrgOpen, setIsAddOrgOpen] = useState(false);
  const [savingOrg, setSavingOrg] = useState(false);
  const [newOrg, setNewOrg] = useState<OrganizationRequest>({
    name: "",
    type: "NGO",
    description: "",
    active: true,
  });

  // Track ids currently mid-request so a busy card/row can disable itself
  const [orgActionId, setOrgActionId] = useState<number | null>(null);

  const loadDonations = async () => {
    setLoadingDonations(true);
    try {
      const data = await getAllDonations();
      setDonations(data);
    } catch (err) {
      toast.error(errorMessage(err, "Could not load donations."));
    } finally {
      setLoadingDonations(false);
    }
  };

  const loadOrganizations = async () => {
    setLoadingOrgs(true);
    try {
      const data = await getAllOrganizations();
      setOrganizations(data);
    } catch (err) {
      toast.error(errorMessage(err, "Could not load organizations."));
    } finally {
      setLoadingOrgs(false);
    }
  };

  // Load both on mount — the top metric cards need donations AND
  // organizations regardless of which tab is active.
  useEffect(() => {
    loadDonations();
    loadOrganizations();
  }, []);

  // ── Metrics — derived from real data, not mock counters ──────
  const metrics = useMemo(() => {
    const totalWeightCompletedKg = donations
        .filter((d) => d.status === "COMPLETED")
        .reduce((acc, d) => acc + (d.estimatedWeightKg || 0), 0);

    const pendingCount = donations.filter((d) => d.status === "PENDING").length;

    const activeOrgCount = organizations.filter((o) => o.active).length;

    return { totalWeightCompletedKg, pendingCount, activeOrgCount };
  }, [donations, organizations]);

  // ── Filtered donations ───────────────────────────────────────
  const filteredDonations = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return donations.filter((d) => {
      const matchesStatus = statusFilter === "all" || d.status === statusFilter;
      const matchesSearch =
          d.fullName.toLowerCase().includes(q) ||
          String(d.id).includes(q) ||
          d.organization?.name.toLowerCase().includes(q) ||
          d.pickupAddress.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [donations, searchQuery, statusFilter]);

  // ── Filtered organizations ──────────────────────────────────
  const filteredOrganizations = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return organizations.filter(
        (o) =>
            o.name.toLowerCase().includes(q) ||
            (o.description ?? "").toLowerCase().includes(q),
    );
  }, [organizations, searchQuery]);

  // ── Handlers: donation status ────────────────────────────────
  const openStatusModal = (donation: Donation) => {
    setSelectedDonation(donation);
    setNextStatus(donation.status);
  };

  const handleUpdateStatus = async () => {
    if (!selectedDonation) return;
    setUpdatingStatus(true);
    try {
      const updated = await updateDonationStatus(
          selectedDonation.id,
          nextStatus,
      );
      setDonations((prev) =>
          prev.map((d) => (d.id === updated.id ? updated : d)),
      );
      toast.success(`Donation ${updated.id} marked as ${updated.status}.`);
      setSelectedDonation(null);
    } catch (err) {
      toast.error(errorMessage(err, "Could not update donation status."));
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ── Handlers: organizations ─────────────────────────────────
  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrg.name.trim()) {
      toast.error("Organization name is required.");
      return;
    }

    setSavingOrg(true);
    try {
      const created = await createOrganization({
        name: newOrg.name.trim(),
        type: newOrg.type,
        description: newOrg.description?.trim() || undefined,
        active: newOrg.active ?? true,
      });
      setOrganizations((prev) => [created, ...prev]);
      toast.success(`${created.name} added.`);
      setIsAddOrgOpen(false);
      setNewOrg({ name: "", type: "NGO", description: "", active: true });
    } catch (err) {
      toast.error(errorMessage(err, "Could not create the organization."));
    } finally {
      setSavingOrg(false);
    }
  };

  const handleToggleActive = async (org: Organization) => {
    setOrgActionId(org.id);
    try {
      const updated = await updateOrganization(org.id, {
        name: org.name,
        type: org.type,
        description: org.description ?? undefined,
        active: !org.active,
      });
      setOrganizations((prev) =>
          prev.map((o) => (o.id === updated.id ? updated : o)),
      );
      toast.success(
          `${updated.name} is now ${updated.active ? "active" : "inactive"}.`,
      );
    } catch (err) {
      toast.error(errorMessage(err, "Could not update the organization."));
    } finally {
      setOrgActionId(null);
    }
  };

  const handleDeleteOrganization = async (org: Organization) => {
    if (
        !window.confirm(
            `Delete "${org.name}"? This only works if it has no donations linked to it.`,
        )
    )
      return;

    setOrgActionId(org.id);
    try {
      await deleteOrganization(org.id);
      setOrganizations((prev) => prev.filter((o) => o.id !== org.id));
      toast.success(`${org.name} deleted.`);
    } catch (err) {
      toast.error(
          errorMessage(
              err,
              "Could not delete this organization — it likely has donations linked to it. Deactivate it instead.",
          ),
      );
    } finally {
      setOrgActionId(null);
    }
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
              <HeartHandshake size={28} className="text-[#A33214]" />
              Donations & Social Impact Hub
            </h1>
            <p className="text-xs uppercase tracking-[0.1em] text-[#1C1C1C]/60 mt-1">
              Donation submissions & NGO/INGO partner management
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
                onClick={() => {
                  loadDonations();
                  loadOrganizations();
                }}
                className="flex items-center gap-2 border border-[#1C1C1C]/20 text-[#1C1C1C] px-3 py-2 font-bold text-xs uppercase tracking-wider hover:bg-white transition-colors rounded-xs"
            >
              <RefreshCw size={14} /> Refresh
            </button>

            {activeTab === "organizations" && (
                <button
                    onClick={() => setIsAddOrgOpen(true)}
                    className="flex items-center gap-2 bg-[#A33214] text-[#FDF6EC] px-4 py-2 font-bold text-xs uppercase tracking-wider hover:bg-[#1C1C1C] transition-colors rounded-xs shadow-xs"
                >
                  <Plus size={16} /> Add Organization
                </button>
            )}
          </div>
        </div>

        {/* Top Metric Cards — verified against actual donation/organization data */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border-2 border-[#1C1C1C]/15 bg-white/60 p-5">
            <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-[0.14em] text-[#1C1C1C]/60 font-semibold">
              Weight Donated (Completed)
            </span>
              <Scale size={18} className="text-[#A33214]" />
            </div>
            <p
                className="text-3xl text-[#A33214] mt-2 font-bold"
                style={{ fontFamily: "Georgia, serif" }}
            >
              {metrics.totalWeightCompletedKg.toLocaleString()} kg
            </p>
            <p className="text-[10px] uppercase tracking-[0.08em] text-[#1C1C1C]/50 mt-1">
              Across donations marked completed
            </p>
          </div>

          <div className="border-2 border-[#1C1C1C]/15 bg-white/60 p-5">
            <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-[0.14em] text-[#1C1C1C]/60 font-semibold">
              Pending Donations
            </span>
              <AlertCircle size={18} className="text-amber-700" />
            </div>
            <p
                className="text-3xl text-[#1C1C1C] mt-2 font-bold"
                style={{ fontFamily: "Georgia, serif" }}
            >
              {metrics.pendingCount}
            </p>
            <p className="text-[10px] uppercase tracking-[0.08em] text-[#1C1C1C]/50 mt-1">
              Awaiting review / confirmation
            </p>
          </div>

          <div className="border-2 border-[#1C1C1C]/15 bg-white/60 p-5">
            <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-[0.14em] text-[#1C1C1C]/60 font-semibold">
              Active NGO/INGO Partners
            </span>
              <Building2 size={18} className="text-[#1C1C1C]/60" />
            </div>
            <p
                className="text-3xl text-[#1C1C1C] mt-2 font-bold"
                style={{ fontFamily: "Georgia, serif" }}
            >
              {metrics.activeOrgCount}
              <span className="text-base text-[#1C1C1C]/40 font-normal">
              {" "}
                / {organizations.length}
            </span>
            </p>
            <p className="text-[10px] uppercase tracking-[0.08em] text-[#1C1C1C]/50 mt-1">
              Currently visible on the donation form
            </p>
          </div>
        </section>

        {/* Main Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-[#1C1C1C]/20 pb-2">
          <div className="flex items-center gap-2">
            <button
                onClick={() => setActiveTab("donations")}
                className={`px-5 py-2 font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 ${
                    activeTab === "donations"
                        ? "border-[#A33214] text-[#A33214]"
                        : "border-transparent text-[#1C1C1C]/60 hover:text-[#1C1C1C]"
                }`}
            >
              <Package size={16} /> Donations
            </button>
            <button
                onClick={() => setActiveTab("organizations")}
                className={`px-5 py-2 font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 ${
                    activeTab === "organizations"
                        ? "border-[#A33214] text-[#A33214]"
                        : "border-transparent text-[#1C1C1C]/60 hover:text-[#1C1C1C]"
                }`}
            >
              <Building2 size={16} /> NGO & INGO Partners
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex items-center gap-3">
            <div className="relative w-48 sm:w-64">
              <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1C1C1C]/50"
              />
              <input
                  type="text"
                  placeholder={
                    activeTab === "donations"
                        ? "Search donor, org, ID..."
                        : "Search partner name..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/80 text-[#1C1C1C] border border-[#1C1C1C]/20 rounded-xs pl-8 pr-3 py-1.5 text-xs font-semibold placeholder-[#1C1C1C]/40 focus:outline-none focus:border-[#A33214]"
              />
            </div>

            {activeTab === "donations" && (
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-white/80 border border-[#1C1C1C]/20 text-[#1C1C1C] text-xs font-bold py-1.5 px-3 focus:outline-none focus:border-[#A33214]"
                >
                  <option value="all">All Statuses</option>
                  {DONATION_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0) + s.slice(1).toLowerCase()}
                      </option>
                  ))}
                </select>
            )}
          </div>
        </div>

        {/* TAB 1: DONATIONS */}
        {activeTab === "donations" && (
            <div className="border-2 border-[#1C1C1C]/15 bg-white/60 overflow-x-auto shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                <tr className="bg-[#1C1C1C] text-[#FDF6EC] text-xs uppercase font-bold tracking-wider">
                  <th className="p-3">Donation ID</th>
                  <th className="p-3">Donor Info</th>
                  <th className="p-3">Pickup Address</th>
                  <th className="p-3">Package &amp; Weight</th>
                  <th className="p-3">Organization</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-[#1C1C1C]/10 font-medium text-xs text-[#1C1C1C]">
                {loadingDonations ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10">
                        <Loader2
                            size={20}
                            className="animate-spin mx-auto text-[#A33214]"
                        />
                      </td>
                    </tr>
                ) : filteredDonations.length === 0 ? (
                    <tr>
                      <td
                          colSpan={7}
                          className="text-center py-8 text-[#1C1C1C]/60 font-semibold uppercase"
                      >
                        No donations found.
                      </td>
                    </tr>
                ) : (
                    filteredDonations.map((donation) => (
                        <tr
                            key={donation.id}
                            className="hover:bg-[#A33214]/5 transition-colors align-top"
                        >
                          <td className="p-3 font-mono font-bold text-[#A33214]">
                            #{donation.id}
                            <div className="text-[10px] text-[#1C1C1C]/50 flex items-center gap-1 font-sans mt-1">
                              <Calendar size={10} />{" "}
                              {new Date(donation.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="font-bold">{donation.fullName}</div>
                            <div className="text-[10px] text-[#1C1C1C]/60 flex items-center gap-1 mt-0.5">
                              <Phone size={10} /> {donation.phone}
                            </div>
                            <div className="text-[10px] text-[#1C1C1C]/60 flex items-center gap-1 mt-0.5">
                              <Mail size={10} /> {donation.email}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="font-semibold flex items-center gap-1 max-w-[180px]">
                              <MapPin
                                  size={12}
                                  className="text-[#A33214] shrink-0 mt-0.5"
                              />{" "}
                              <span className="line-clamp-2">
                          {donation.pickupAddress}
                        </span>
                            </div>
                          </td>
                          <td className="p-3">
                      <span className="font-bold text-[#1C1C1C]">
                        {donation.packageCount}
                      </span>
                            <p className="text-[10px] text-[#1C1C1C]/60 mt-0.5">
                              ~{donation.estimatedWeightKg} kg
                            </p>
                            {donation.notes && (
                                <p className="text-[10px] text-[#1C1C1C]/50 italic line-clamp-1 max-w-[160px] mt-0.5">
                                  "{donation.notes}"
                                </p>
                            )}
                          </td>
                          <td className="p-3 font-bold text-[#1C1C1C]/80">
                            {donation.organization?.name}
                            <div className="text-[10px] font-normal text-[#1C1C1C]/50 mt-0.5">
                              {donation.organization?.type}
                            </div>
                          </td>
                          <td className="p-3">
                      <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border rounded-xs ${STATUS_STYLES[donation.status]}`}
                      >
                        {donation.status}
                      </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                                onClick={() => openStatusModal(donation)}
                                className="px-3 py-1 bg-[#1C1C1C] text-[#FDF6EC] font-bold text-[11px] uppercase hover:bg-[#A33214] transition-colors rounded-xs"
                            >
                              Update Status
                            </button>
                          </td>
                        </tr>
                    ))
                )}
                </tbody>
              </table>
            </div>
        )}

        {/* TAB 2: NGO & INGO PARTNERS DIRECTORY */}
        {activeTab === "organizations" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingOrgs ? (
                  <div className="col-span-full flex justify-center py-10">
                    <Loader2 size={20} className="animate-spin text-[#A33214]" />
                  </div>
              ) : filteredOrganizations.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-[#1C1C1C]/60 font-semibold uppercase text-xs">
                    No organizations found.
                  </div>
              ) : (
                  filteredOrganizations.map((org) => (
                      <div
                          key={org.id}
                          className={`border-2 bg-white/60 p-5 flex flex-col justify-between relative group transition-all ${
                              org.active
                                  ? "border-[#1C1C1C]/15 hover:border-[#A33214]"
                                  : "border-[#1C1C1C]/10 opacity-60"
                          }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex h-12 w-12 items-center justify-center border border-[#1C1C1C]/20 rounded-xs bg-[#FDF6EC] text-[#A33214]">
                              <Building2 size={20} />
                            </div>
                            <div className="flex flex-col items-end gap-1.5">
                      <span
                          className={`px-2 py-0.5 text-[10px] font-extrabold uppercase border ${
                              org.type === "INGO"
                                  ? "bg-purple-50 text-purple-900 border-purple-200"
                                  : "bg-stone-100 text-stone-900 border-stone-300"
                          }`}
                      >
                        {org.type}
                      </span>
                              <span
                                  className={`px-2 py-0.5 text-[10px] font-extrabold uppercase border ${
                                      org.active
                                          ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                                          : "bg-stone-100 text-stone-500 border-stone-300"
                                  }`}
                              >
                        {org.active ? "Active" : "Inactive"}
                      </span>
                            </div>
                          </div>

                          <h3
                              className="text-lg text-[#1C1C1C] font-bold line-clamp-1"
                              style={{ fontFamily: "Georgia, serif" }}
                          >
                            {org.name}
                          </h3>

                          {org.description && (
                              <p className="text-xs text-[#1C1C1C]/70 mt-2 leading-relaxed line-clamp-4">
                                {org.description}
                              </p>
                          )}
                        </div>

                        <div className="mt-6 pt-3 border-t border-[#1C1C1C]/10 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-[#1C1C1C]/40 font-mono">
                    ID #{org.id}
                  </span>

                          <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleToggleActive(org)}
                                disabled={orgActionId === org.id}
                                title={org.active ? "Deactivate" : "Activate"}
                                className="p-1.5 border border-[#1C1C1C]/20 hover:bg-[#1C1C1C] hover:text-[#FDF6EC] transition-colors rounded-xs disabled:opacity-40"
                            >
                              {orgActionId === org.id ? (
                                  <Loader2 size={14} className="animate-spin" />
                              ) : (
                                  <Power size={14} />
                              )}
                            </button>
                            <button
                                onClick={() => handleDeleteOrganization(org)}
                                disabled={orgActionId === org.id}
                                title="Delete"
                                className="p-1.5 border border-[#1C1C1C]/20 text-[#A33214] hover:bg-[#A33214] hover:text-[#FDF6EC] transition-colors rounded-xs disabled:opacity-40"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                  ))
              )}
            </div>
        )}

        {/* UPDATE STATUS MODAL — replaces the old "dispatch driver" flow,
          which has no equivalent in this backend (no logistics/courier
          model — status is the only lifecycle tracking in place). */}
        {selectedDonation && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1C1C]/50 backdrop-blur-xs">
              <div className="bg-[#FDF6EC] border-2 border-[#1C1C1C]/20 w-full max-w-md p-6 space-y-5 shadow-xl rounded-xs">
                <div className="flex items-center justify-between border-b border-[#1C1C1C]/15 pb-3">
                  <h2
                      className="text-base text-[#1C1C1C] uppercase font-bold"
                      style={{ fontFamily: "Georgia, serif" }}
                  >
                    Update Donation #{selectedDonation.id}
                  </h2>
                  <button
                      onClick={() => setSelectedDonation(null)}
                      className="text-[#1C1C1C]/60 hover:text-[#A33214]"
                  >
                    <XCircle size={20} />
                  </button>
                </div>

                <div className="space-y-3 text-xs text-[#1C1C1C]">
                  <div className="bg-white/80 p-3 border border-[#1C1C1C]/10 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <User size={12} /> {selectedDonation.fullName}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Phone size={12} /> {selectedDonation.phone}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Mail size={12} /> {selectedDonation.email}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin size={12} /> {selectedDonation.pickupAddress}
                    </p>
                    <p>
                      Package: {selectedDonation.packageCount} (~
                      {selectedDonation.estimatedWeightKg} kg)
                    </p>
                    {selectedDonation.notes && (
                        <p className="italic text-[#1C1C1C]/60">
                          "{selectedDonation.notes}"
                        </p>
                    )}
                    <p className="text-[#A33214] font-bold">
                      Destination: {selectedDonation.organization?.name} (
                      {selectedDonation.organization?.type})
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-[#1C1C1C]/60">
                      Status
                    </label>
                    <select
                        value={nextStatus}
                        onChange={(e) =>
                            setNextStatus(e.target.value as DonationStatus)
                        }
                        className="w-full bg-white text-[#1C1C1C] border border-[#1C1C1C]/30 p-2 text-xs font-semibold focus:outline-none focus:border-[#A33214]"
                    >
                      {DONATION_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0) + s.slice(1).toLowerCase()}
                          </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#1C1C1C]/10">
                  <button
                      onClick={() => setSelectedDonation(null)}
                      className="px-4 py-2 border border-[#1C1C1C]/20 text-xs font-bold uppercase hover:bg-white"
                  >
                    Cancel
                  </button>
                  <button
                      onClick={handleUpdateStatus}
                      disabled={updatingStatus}
                      className="px-4 py-2 bg-[#A33214] text-[#FDF6EC] text-xs font-bold uppercase hover:bg-[#1C1C1C] transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {updatingStatus && (
                        <Loader2 size={12} className="animate-spin" />
                    )}
                    {updatingStatus ? "Updating..." : "Update Status"}
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* ADD ORGANIZATION MODAL — fields match OrganizationRequestDto exactly */}
        {isAddOrgOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1C1C]/50 backdrop-blur-xs">
              <div className="bg-[#FDF6EC] border-2 border-[#1C1C1C]/20 w-full max-w-md p-6 space-y-4 shadow-xl rounded-xs">
                <div className="flex items-center justify-between border-b border-[#1C1C1C]/15 pb-3">
                  <h2
                      className="text-base text-[#1C1C1C] uppercase font-bold"
                      style={{ fontFamily: "Georgia, serif" }}
                  >
                    Add NGO / INGO
                  </h2>
                  <button
                      onClick={() => setIsAddOrgOpen(false)}
                      className="text-[#1C1C1C]/60 hover:text-[#A33214]"
                  >
                    <XCircle size={20} />
                  </button>
                </div>

                <form onSubmit={handleCreateOrganization} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#1C1C1C]/60 mb-1">
                      Organization Name
                    </label>
                    <input
                        required
                        type="text"
                        placeholder="e.g. Nepal Red Cross Society"
                        value={newOrg.name}
                        onChange={(e) =>
                            setNewOrg({ ...newOrg, name: e.target.value })
                        }
                        className="w-full bg-white border border-[#1C1C1C]/30 p-2 focus:outline-none focus:border-[#A33214]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#1C1C1C]/60 mb-1">
                      Type
                    </label>
                    <select
                        value={newOrg.type}
                        onChange={(e) =>
                            setNewOrg({
                              ...newOrg,
                              type: e.target.value as OrganizationType,
                            })
                        }
                        className="w-full bg-white border border-[#1C1C1C]/30 p-2 focus:outline-none focus:border-[#A33214]"
                    >
                      <option value="NGO">NGO</option>
                      <option value="INGO">INGO</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#1C1C1C]/60 mb-1">
                      Description{" "}
                      <span className="normal-case font-normal text-[#1C1C1C]/40">
                    (shown to donors when selected)
                  </span>
                    </label>
                    <textarea
                        rows={3}
                        placeholder="What this organization does with donated clothing..."
                        value={newOrg.description}
                        onChange={(e) =>
                            setNewOrg({ ...newOrg, description: e.target.value })
                        }
                        className="w-full bg-white border border-[#1C1C1C]/30 p-2 focus:outline-none focus:border-[#A33214] resize-none"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={newOrg.active ?? true}
                        onChange={(e) =>
                            setNewOrg({ ...newOrg, active: e.target.checked })
                        }
                        className="accent-[#A33214]"
                    />
                    <span className="text-[11px] font-semibold text-[#1C1C1C]">
                  Show on the public donation form immediately
                </span>
                  </label>

                  <div className="flex justify-end gap-2 pt-3 border-t border-[#1C1C1C]/10">
                    <button
                        type="button"
                        onClick={() => setIsAddOrgOpen(false)}
                        className="px-4 py-2 border border-[#1C1C1C]/20 text-xs font-bold uppercase hover:bg-white"
                    >
                      Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={savingOrg}
                        className="px-4 py-2 bg-[#A33214] text-[#FDF6EC] text-xs font-bold uppercase hover:bg-[#1C1C1C] transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {savingOrg && <Loader2 size={12} className="animate-spin" />}
                      {savingOrg ? "Saving..." : "Save Organization"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}
      </div>
  );
}