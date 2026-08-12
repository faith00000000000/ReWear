"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  HeartHandshake,
  Truck,
  Building2,
  Calendar,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Plus,
  MapPin,
  Phone,
  User,
  Package,
  ExternalLink,
  XCircle,
  TrendingUp,
} from "lucide-react";

// Types
type PickupStatus =
  | "pending"
  | "scheduled"
  | "in_transit"
  | "completed"
  | "cancelled";
type PartnerType = "NGO" | "INGO" | "Community Center";

interface PickupLogistics {
  id: string;
  donorName: string;
  donorPhone: string;
  pickupAddress: string;
  city: string;
  itemCount: number;
  itemDescription: string;
  preferredDate: string;
  status: PickupStatus;
  assignedDriver?: string;
  assignedNGO: string;
}

interface PartnerOrganization {
  id: string;
  name: string;
  type: PartnerType;
  logo: string;
  contactPerson: string;
  email: string;
  phone: string;
  location: string;
  activeCampaign: string;
  totalItemsReceived: number;
  status: "active" | "partnered" | "inactive";
}

// Mock Data
const INITIAL_PICKUPS: PickupLogistics[] = [
  {
    id: "PKP-101",
    donorName: "Sujita Nepal",
    donorPhone: "+977 9841234567",
    pickupAddress: "House 45, Lazimpat",
    city: "Kathmandu",
    itemCount: 12,
    itemDescription: "Winter jackets, woolen sweaters, and scarves",
    preferredDate: "2026-08-14",
    status: "pending",
    assignedNGO: "Maitri Nepal Foundation",
  },
  {
    id: "PKP-102",
    donorName: "Aarav Sharma",
    donorPhone: "+977 9801987654",
    pickupAddress: "Jhamsikhel Road, Ward 3",
    city: "Lalitpur",
    itemCount: 8,
    itemDescription: "Kids clothing and summer dresses",
    preferredDate: "2026-08-12",
    status: "scheduled",
    assignedDriver: "Ramesh Gurung (+977 9811223344)",
    assignedNGO: "Himalayan Children Haven",
  },
  {
    id: "PKP-103",
    donorName: "Pooja Bista",
    donorPhone: "+977 9860112233",
    pickupAddress: "Suryabinayak-4",
    city: "Bhaktapur",
    itemCount: 25,
    itemDescription: "Formal suits, shoes, and mixed casual wear",
    preferredDate: "2026-08-10",
    status: "completed",
    assignedDriver: "Bikash Thapa",
    assignedNGO: "Nepal Red Cross Society",
  },
];

const INITIAL_PARTNERS: PartnerOrganization[] = [
  {
    id: "NGO-001",
    name: "Maitri Nepal Foundation",
    type: "NGO",
    logo: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb0?w=200",
    contactPerson: "Sunita Karki",
    email: "contact@maitrinepal.org",
    phone: "+977 01-4412345",
    location: "Kathmandu",
    activeCampaign: "Warmth for Winter Drive",
    totalItemsReceived: 1240,
    status: "active",
  },
  {
    id: "NGO-002",
    name: "Himalayan Children Haven",
    type: "NGO",
    logo: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=200",
    contactPerson: "Deepak Shrestha",
    email: "info@himalayanchildren.org",
    phone: "+977 01-5523456",
    location: "Lalitpur",
    activeCampaign: "Back-to-School Clothing",
    totalItemsReceived: 890,
    status: "active",
  },
  {
    id: "INGO-001",
    name: "Oxfam Nepal Clothes Bank",
    type: "INGO",
    logo: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=200",
    contactPerson: "Elena Rostova",
    email: "donations-nepal@oxfam.org",
    phone: "+977 01-5541122",
    location: "Kathmandu",
    activeCampaign: "Disaster Relief Wardrobe Support",
    totalItemsReceived: 3410,
    status: "partnered",
  },
];

export default function DonationsPage() {
  const [activeTab, setActiveTab] = useState<"pickups" | "partners">("pickups");
  const [pickups, setPickups] = useState<PickupLogistics[]>(INITIAL_PICKUPS);
  const [partners, setPartners] =
    useState<PartnerOrganization[]>(INITIAL_PARTNERS);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modals state
  const [selectedPickup, setSelectedPickup] = useState<PickupLogistics | null>(
    null,
  );
  const [driverInput, setDriverInput] = useState("");
  const [isAddPartnerOpen, setIsAddPartnerOpen] = useState(false);

  // New Partner Form State
  const [newPartner, setNewPartner] = useState({
    name: "",
    type: "NGO" as PartnerType,
    contactPerson: "",
    email: "",
    phone: "",
    location: "",
    activeCampaign: "",
  });

  // Calculate Metrics
  const metrics = useMemo(() => {
    const totalDonatedItems = pickups
      .filter((p) => p.status === "completed")
      .reduce((acc, curr) => acc + curr.itemCount, 0);

    const totalPartnersCount = partners.length;
    const pendingPickupsCount = pickups.filter(
      (p) => p.status === "pending",
    ).length;

    return { totalDonatedItems, totalPartnersCount, pendingPickupsCount };
  }, [pickups, partners]);

  // Filtered Pickups
  const filteredPickups = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return pickups.filter((p) => {
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      const matchesSearch =
        p.donorName.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.assignedNGO.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [pickups, searchQuery, statusFilter]);

  // Filtered Partners
  const filteredPartners = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return partners.filter((partner) => {
      return (
        partner.name.toLowerCase().includes(q) ||
        partner.location.toLowerCase().includes(q) ||
        partner.activeCampaign.toLowerCase().includes(q)
      );
    });
  }, [partners, searchQuery]);

  // Handlers
  const handleAssignDriver = () => {
    if (!selectedPickup || !driverInput) return;
    setPickups((prev) =>
      prev.map((p) =>
        p.id === selectedPickup.id
          ? {
              ...p,
              assignedDriver: driverInput,
              status: "scheduled" as PickupStatus,
            }
          : p,
      ),
    );
    setSelectedPickup(null);
    setDriverInput("");
  };

  const handleCreatePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartner.name || !newPartner.email) return;

    const created: PartnerOrganization = {
      id: `PARTNER-${Date.now().toString().slice(-3)}`,
      ...newPartner,
      logo: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb0?w=200",
      totalItemsReceived: 0,
      status: "active",
    };

    setPartners((prev) => [created, ...prev]);
    setIsAddPartnerOpen(false);
    setNewPartner({
      name: "",
      type: "NGO",
      contactPerson: "",
      email: "",
      phone: "",
      location: "",
      activeCampaign: "",
    });
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
            Doorstep pickup logistics & NGO/INGO partner network management
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "partners" && (
            <button
              onClick={() => setIsAddPartnerOpen(true)}
              className="flex items-center gap-2 bg-[#A33214] text-[#FDF6EC] px-4 py-2 font-bold text-xs uppercase tracking-wider hover:bg-[#1C1C1C] transition-colors rounded-xs shadow-xs"
            >
              <Plus size={16} /> Register Partner
            </button>
          )}
        </div>
      </div>

      {/* Top Metric Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border-2 border-[#1C1C1C]/15 bg-white/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-[0.14em] text-[#1C1C1C]/60 font-semibold">
              Total Garments Donated
            </span>
            <Package size={18} className="text-[#A33214]" />
          </div>
          <p
            className="text-3xl text-[#A33214] mt-2 font-bold"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {metrics.totalDonatedItems.toLocaleString()} Units
          </p>
          <p className="text-[10px] uppercase tracking-[0.08em] text-[#1C1C1C]/50 mt-1">
            Diverted from landfills into local communities
          </p>
        </div>

        <div className="border-2 border-[#1C1C1C]/15 bg-white/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-[0.14em] text-[#1C1C1C]/60 font-semibold">
              Pending Pickup Requests
            </span>
            <AlertCircle size={18} className="text-amber-700" />
          </div>
          <p
            className="text-3xl text-[#1C1C1C] mt-2 font-bold"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {metrics.pendingPickupsCount}
          </p>
          <p className="text-[10px] uppercase tracking-[0.08em] text-[#1C1C1C]/50 mt-1">
            Requires driver dispatch
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
            {metrics.totalPartnersCount}
          </p>
          <p className="text-[10px] uppercase tracking-[0.08em] text-[#1C1C1C]/50 mt-1">
            Verified recipient organizations
          </p>
        </div>
      </section>

      {/* Main Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-[#1C1C1C]/20 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("pickups")}
            className={`px-5 py-2 font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 ${
              activeTab === "pickups"
                ? "border-[#A33214] text-[#A33214]"
                : "border-transparent text-[#1C1C1C]/60 hover:text-[#1C1C1C]"
            }`}
          >
            <Truck size={16} /> Pickup Logistics
          </button>
          <button
            onClick={() => setActiveTab("partners")}
            className={`px-5 py-2 font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 ${
              activeTab === "partners"
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
                activeTab === "pickups"
                  ? "Search donor, city, ID..."
                  : "Search partner, city..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/80 text-[#1C1C1C] border border-[#1C1C1C]/20 rounded-xs pl-8 pr-3 py-1.5 text-xs font-semibold placeholder-[#1C1C1C]/40 focus:outline-none focus:border-[#A33214]"
            />
          </div>

          {activeTab === "pickups" && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white/80 border border-[#1C1C1C]/20 text-[#1C1C1C] text-xs font-bold py-1.5 px-3 focus:outline-none focus:border-[#A33214]"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
            </select>
          )}
        </div>
      </div>

      {/* TAB 1: PICKUP LOGISTICS MANAGEMENT */}
      {activeTab === "pickups" && (
        <div className="border-2 border-[#1C1C1C]/15 bg-white/60 overflow-x-auto shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1C1C1C] text-[#FDF6EC] text-xs uppercase font-bold tracking-wider">
                <th className="p-3">Pickup ID</th>
                <th className="p-3">Donor Info</th>
                <th className="p-3">Location</th>
                <th className="p-3">Items</th>
                <th className="p-3">Destination NGO</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Logistics Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C1C]/10 font-medium text-xs text-[#1C1C1C]">
              {filteredPickups.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-8 text-[#1C1C1C]/60 font-semibold uppercase"
                  >
                    No pickup requests found.
                  </td>
                </tr>
              ) : (
                filteredPickups.map((pickup) => (
                  <tr
                    key={pickup.id}
                    className="hover:bg-[#A33214]/5 transition-colors"
                  >
                    <td className="p-3 font-mono font-bold text-[#A33214]">
                      {pickup.id}
                      <div className="text-[10px] text-[#1C1C1C]/50 flex items-center gap-1 font-sans">
                        <Calendar size={10} /> {pickup.preferredDate}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold">{pickup.donorName}</div>
                      <div className="text-[10px] text-[#1C1C1C]/60 flex items-center gap-1">
                        <Phone size={10} /> {pickup.donorPhone}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold flex items-center gap-1">
                        <MapPin size={12} className="text-[#A33214]" />{" "}
                        {pickup.city}
                      </div>
                      <div className="text-[10px] text-[#1C1C1C]/60 truncate max-w-[150px]">
                        {pickup.pickupAddress}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-[#1C1C1C]">
                        {pickup.itemCount} items
                      </span>
                      <p className="text-[10px] text-[#1C1C1C]/60 line-clamp-1 max-w-[180px]">
                        {pickup.itemDescription}
                      </p>
                    </td>
                    <td className="p-3 font-bold text-[#1C1C1C]/80">
                      {pickup.assignedNGO}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border rounded-xs ${
                          pickup.status === "completed"
                            ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                            : pickup.status === "scheduled"
                              ? "bg-blue-50 text-blue-900 border-blue-300"
                              : "bg-amber-50 text-amber-900 border-amber-300"
                        }`}
                      >
                        {pickup.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedPickup(pickup)}
                        className="px-3 py-1 bg-[#1C1C1C] text-[#FDF6EC] font-bold text-[11px] uppercase hover:bg-[#A33214] transition-colors rounded-xs"
                      >
                        {pickup.assignedDriver
                          ? "View Logistics"
                          : "Dispatch Driver"}
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
      {activeTab === "partners" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPartners.map((partner) => (
            <div
              key={partner.id}
              className="border-2 border-[#1C1C1C]/15 bg-white/60 p-5 flex flex-col justify-between relative group hover:border-[#A33214] transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 object-cover border border-[#1C1C1C]/20 rounded-xs"
                  />
                  <span
                    className={`px-2 py-0.5 text-[10px] font-extrabold uppercase border ${
                      partner.type === "INGO"
                        ? "bg-purple-50 text-purple-900 border-purple-200"
                        : "bg-stone-100 text-stone-900 border-stone-300"
                    }`}
                  >
                    {partner.type}
                  </span>
                </div>

                <h3
                  className="text-lg text-[#1C1C1C] font-bold line-clamp-1"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {partner.name}
                </h3>
                <p className="text-xs text-[#A33214] font-semibold mt-0.5 flex items-center gap-1">
                  <MapPin size={12} /> {partner.location}, Nepal
                </p>

                <div className="my-4 bg-[#FDF6EC] p-3 border border-[#1C1C1C]/10 text-xs space-y-1.5">
                  <div className="text-[10px] font-bold uppercase text-[#1C1C1C]/50">
                    Active Campaign Focus
                  </div>
                  <div className="font-bold text-[#1C1C1C]">
                    {partner?.activeCampaign
                      ? `"${partner.activeCampaign}"`
                      : ""}
                  </div>
                </div>

                <div className="space-y-1 text-xs text-[#1C1C1C]/70">
                  <div className="flex items-center gap-2">
                    <User size={13} className="text-[#1C1C1C]/40" />
                    <span>Contact: {partner.contactPerson}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="text-[#1C1C1C]/40" />
                    <span>{partner.phone}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-[#1C1C1C]/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#1C1C1C]/50 block">
                    Received to Date
                  </span>
                  <span className="font-extrabold text-sm text-[#1C1C1C]">
                    {partner.totalItemsReceived.toLocaleString()} items
                  </span>
                </div>
                <button className="p-1.5 border border-[#1C1C1C]/20 hover:bg-[#1C1C1C] hover:text-[#FDF6EC] transition-colors rounded-xs">
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DISPATCH LOGISTICS MODAL */}
      {selectedPickup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1C1C]/50 backdrop-blur-xs">
          <div className="bg-[#FDF6EC] border-2 border-[#1C1C1C]/20 w-full max-w-md p-6 space-y-5 shadow-xl rounded-xs">
            <div className="flex items-center justify-between border-b border-[#1C1C1C]/15 pb-3">
              <h2
                className="text-base text-[#1C1C1C] uppercase font-bold"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Dispatch Courier: {selectedPickup.id}
              </h2>
              <button
                onClick={() => setSelectedPickup(null)}
                className="text-[#1C1C1C]/60 hover:text-[#A33214]"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#1C1C1C]">
              <div className="bg-white/80 p-3 border border-[#1C1C1C]/10 space-y-1">
                <p className="font-bold">Donor: {selectedPickup.donorName}</p>
                <p>
                  Address: {selectedPickup.pickupAddress}, {selectedPickup.city}
                </p>
                <p>
                  Items: {selectedPickup.itemCount} units (
                  {selectedPickup.itemDescription})
                </p>
                <p className="text-[#A33214] font-bold">
                  Destination NGO: {selectedPickup.assignedNGO}
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-[#1C1C1C]/60">
                  Assign Driver / Delivery Courier Info
                </label>
                <input
                  type="text"
                  placeholder="e.g. Shyam Sundar (+977 9800000000)"
                  value={driverInput || selectedPickup.assignedDriver || ""}
                  onChange={(e) => setDriverInput(e.target.value)}
                  className="w-full bg-white text-[#1C1C1C] border border-[#1C1C1C]/30 p-2 text-xs font-semibold focus:outline-none focus:border-[#A33214]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#1C1C1C]/10">
              <button
                onClick={() => setSelectedPickup(null)}
                className="px-4 py-2 border border-[#1C1C1C]/20 text-xs font-bold uppercase hover:bg-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignDriver}
                className="px-4 py-2 bg-[#A33214] text-[#FDF6EC] text-xs font-bold uppercase hover:bg-[#1C1C1C] transition-colors"
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REGISTER PARTNER MODAL */}
      {isAddPartnerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1C1C]/50 backdrop-blur-xs">
          <div className="bg-[#FDF6EC] border-2 border-[#1C1C1C]/20 w-full max-w-md p-6 space-y-4 shadow-xl rounded-xs">
            <div className="flex items-center justify-between border-b border-[#1C1C1C]/15 pb-3">
              <h2
                className="text-base text-[#1C1C1C] uppercase font-bold"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Register NGO / INGO Partner
              </h2>
              <button
                onClick={() => setIsAddPartnerOpen(false)}
                className="text-[#1C1C1C]/60 hover:text-[#A33214]"
              >
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatePartner} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#1C1C1C]/60 mb-1">
                  Organization Name
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Red Cross Nepal"
                  value={newPartner.name}
                  onChange={(e) =>
                    setNewPartner({ ...newPartner, name: e.target.value })
                  }
                  className="w-full bg-white border border-[#1C1C1C]/30 p-2 focus:outline-none focus:border-[#A33214]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#1C1C1C]/60 mb-1">
                    Type
                  </label>
                  <select
                    value={newPartner.type}
                    onChange={(e) =>
                      setNewPartner({
                        ...newPartner,
                        type: e.target.value as PartnerType,
                      })
                    }
                    className="w-full bg-white border border-[#1C1C1C]/30 p-2 focus:outline-none focus:border-[#A33214]"
                  >
                    <option value="NGO">NGO</option>
                    <option value="INGO">INGO</option>
                    <option value="Community Center">Community Center</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#1C1C1C]/60 mb-1">
                    City Location
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Kathmandu"
                    value={newPartner.location}
                    onChange={(e) =>
                      setNewPartner({ ...newPartner, location: e.target.value })
                    }
                    className="w-full bg-white border border-[#1C1C1C]/30 p-2 focus:outline-none focus:border-[#A33214]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#1C1C1C]/60 mb-1">
                  Active Campaign Title
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Winter Clothing Drive 2026"
                  value={newPartner.activeCampaign}
                  onChange={(e) =>
                    setNewPartner({
                      ...newPartner,
                      activeCampaign: e.target.value,
                    })
                  }
                  className="w-full bg-white border border-[#1C1C1C]/30 p-2 focus:outline-none focus:border-[#A33214]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#1C1C1C]/60 mb-1">
                    Contact Email
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="org@domain.org"
                    value={newPartner.email}
                    onChange={(e) =>
                      setNewPartner({ ...newPartner, email: e.target.value })
                    }
                    className="w-full bg-white border border-[#1C1C1C]/30 p-2 focus:outline-none focus:border-[#A33214]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#1C1C1C]/60 mb-1">
                    Contact Phone
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="+977 01-XXXXXXX"
                    value={newPartner.phone}
                    onChange={(e) =>
                      setNewPartner({ ...newPartner, phone: e.target.value })
                    }
                    className="w-full bg-white border border-[#1C1C1C]/30 p-2 focus:outline-none focus:border-[#A33214]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1C1C1C]/10">
                <button
                  type="button"
                  onClick={() => setIsAddPartnerOpen(false)}
                  className="px-4 py-2 border border-[#1C1C1C]/20 text-xs font-bold uppercase hover:bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#A33214] text-[#FDF6EC] text-xs font-bold uppercase hover:bg-[#1C1C1C] transition-colors"
                >
                  Save Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
