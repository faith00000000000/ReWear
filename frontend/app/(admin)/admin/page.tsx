import {
  ClipboardList,
  ShoppingBag,
  Users,
  Flag,
  HeartHandshake,
  Wallet,
  ArrowUpRight,
} from "lucide-react";
import AdminStatCard from "@/components/admin/AdminStatCard";

// TODO: replace with live data from GET /api/admin/dashboard/summary
const STATS = {
  totalListings: "1,284",
  activeOrders: "96",
  totalUsers: "3,410",
  pendingReports: "12",
  totalDonations: "217",
  totalEarnings: "Rs 482,300",
};

// TODO: replace with GET /api/admin/listings?sort=recent&limit=5
const RECENT_LISTINGS = [
  {
    id: "LST-1042",
    item: "Denim Jacket - Levi's",
    owner: "Anjali S.",
    type: "Rent",
    status: "AVAILABLE",
  },
  {
    id: "LST-1041",
    item: "Batik Wrap Dress",
    owner: "Priya M.",
    type: "Sale",
    status: "AVAILABLE",
  },
  {
    id: "LST-1040",
    item: "Wool Overcoat",
    owner: "Raj K.",
    type: "Sale + Rent",
    status: "PENDING",
  },
  {
    id: "LST-1039",
    item: "Silk Saree - Vintage",
    owner: "Meera T.",
    type: "Rent",
    status: "AVAILABLE",
  },
  {
    id: "LST-1038",
    item: "Leather Boots",
    owner: "Suman P.",
    type: "Sale",
    status: "FLAGGED",
  },
];

// TODO: replace with GET /api/admin/reports?status=pending&limit=5
const RECENT_REPORTS = [
  {
    id: "RPT-221",
    listing: "Leather Boots",
    reason: "Misleading photos",
    reportedBy: "user_2291",
  },
  {
    id: "RPT-220",
    listing: "Silk Kurta Set",
    reason: "Item not as described",
    reportedBy: "user_1187",
  },
  {
    id: "RPT-219",
    listing: "Denim Jacket",
    reason: "Suspected counterfeit",
    reportedBy: "user_3390",
  },
  {
    id: "RPT-218",
    listing: "Wool Overcoat",
    reason: "Owner unresponsive",
    reportedBy: "user_0044",
  },
];

function statusBadgeClasses(status: string) {
  switch (status) {
    case "AVAILABLE":
      return "bg-green-700/10 text-green-800";
    case "PENDING":
      return "bg-amber-600/10 text-amber-700";
    case "FLAGGED":
      return "bg-[#A33214]/10 text-[#A33214]";
    default:
      return "bg-[#1C1C1C]/10 text-[#1C1C1C]";
  }
}

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-8 max-w-[1400px]">
      {/* Stat cards */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <AdminStatCard
            label="Total Listings"
            value={STATS.totalListings}
            icon={ClipboardList}
            trend={{ value: "8.2%", direction: "up" }}
          />
          <AdminStatCard
            label="Active Orders"
            value={STATS.activeOrders}
            icon={ShoppingBag}
            trend={{ value: "3.1%", direction: "up" }}
          />
          <AdminStatCard
            label="Total Users"
            value={STATS.totalUsers}
            icon={Users}
            trend={{ value: "5.4%", direction: "up" }}
          />
          <AdminStatCard
            label="Pending Reports"
            value={STATS.pendingReports}
            icon={Flag}
            trend={{ value: "2.0%", direction: "down" }}
          />
          <AdminStatCard
            label="Total Donations"
            value={STATS.totalDonations}
            icon={HeartHandshake}
            trend={{ value: "11.6%", direction: "up" }}
          />
          <AdminStatCard
            label="Total Earnings"
            value={STATS.totalEarnings}
            icon={Wallet}
            trend={{ value: "6.7%", direction: "up" }}
            accent
          />
        </div>
      </section>

      {/* Recent Listings + Recent Reports */}
      <section className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Recent Listings */}
        <div className="xl:col-span-3 bg-white/60 border-2 border-[#1C1C1C]/15">
          <div className="flex items-center justify-between px-5 py-4 border-b-2 border-[#1C1C1C]/15">
            <h2
              className="text-lg text-[#1C1C1C]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Recent Listings
            </h2>
            <a
              href="/admin/listings"
              className="flex items-center gap-1 text-xs uppercase tracking-[0.1em] text-[#A33214] hover:underline"
            >
              View all
              <ArrowUpRight size={14} />
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-[0.1em] text-[#1C1C1C]/45">
                  <th className="px-5 py-3 font-normal">Item</th>
                  <th className="px-5 py-3 font-normal">Owner</th>
                  <th className="px-5 py-3 font-normal">Type</th>
                  <th className="px-5 py-3 font-normal">Status</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_LISTINGS.map((listing) => (
                  <tr
                    key={listing.id}
                    className="border-t border-[#1C1C1C]/10 hover:bg-[#A33214]/5"
                  >
                    <td className="px-5 py-3 text-[#1C1C1C]">
                      <span className="block">{listing.item}</span>
                      <span className="block text-[11px] text-[#1C1C1C]/40">
                        {listing.id}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#1C1C1C]/70">
                      {listing.owner}
                    </td>
                    <td className="px-5 py-3 text-[#1C1C1C]/70">
                      {listing.type}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block px-2 py-1 text-[10px] uppercase tracking-[0.08em] ${statusBadgeClasses(
                          listing.status,
                        )}`}
                      >
                        {listing.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="xl:col-span-2 bg-white/60 border-2 border-[#1C1C1C]/15">
          <div className="flex items-center justify-between px-5 py-4 border-b-2 border-[#1C1C1C]/15">
            <h2
              className="text-lg text-[#1C1C1C]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Recent Reports
            </h2>
            <a
              href="/admin/reports"
              className="flex items-center gap-1 text-xs uppercase tracking-[0.1em] text-[#A33214] hover:underline"
            >
              View all
              <ArrowUpRight size={14} />
            </a>
          </div>
          <ul>
            {RECENT_REPORTS.map((report) => (
              <li
                key={report.id}
                className="flex items-start gap-3 px-5 py-3.5 border-t border-[#1C1C1C]/10"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center bg-[#A33214]/10 text-[#A33214]">
                  <Flag size={14} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-[#1C1C1C] truncate">
                    {report.listing}
                  </p>
                  <p className="text-xs text-[#1C1C1C]/50 truncate">
                    {report.reason}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.08em] text-[#1C1C1C]/35 mt-1">
                    Reported by {report.reportedBy}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Donation & Earnings quick summary */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="border-2 border-[#1C1C1C]/15 bg-white/60 p-5">
          <div className="flex items-center gap-2 mb-3">
            <HeartHandshake size={16} className="text-[#A33214]" />
            <h3 className="text-[11px] uppercase tracking-[0.14em] text-[#1C1C1C]/60">
              Donation Pipeline
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p
                className="text-xl text-[#1C1C1C]"
                style={{ fontFamily: "Georgia, serif" }}
              >
                34
              </p>
              <p className="text-[10px] uppercase tracking-[0.08em] text-[#1C1C1C]/45 mt-1">
                Awaiting Pickup
              </p>
            </div>
            <div>
              <p
                className="text-xl text-[#1C1C1C]"
                style={{ fontFamily: "Georgia, serif" }}
              >
                58
              </p>
              <p className="text-[10px] uppercase tracking-[0.08em] text-[#1C1C1C]/45 mt-1">
                In Transit
              </p>
            </div>
            <div>
              <p
                className="text-xl text-[#1C1C1C]"
                style={{ fontFamily: "Georgia, serif" }}
              >
                125
              </p>
              <p className="text-[10px] uppercase tracking-[0.08em] text-[#1C1C1C]/45 mt-1">
                Completed
              </p>
            </div>
          </div>
        </div>

        <div className="border-2 border-[#1C1C1C]/15 bg-white/60 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Wallet size={16} className="text-[#A33214]" />
            <h3 className="text-[11px] uppercase tracking-[0.14em] text-[#1C1C1C]/60">
              Earnings Breakdown
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p
                className="text-xl text-[#1C1C1C]"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Rs 340k
              </p>
              <p className="text-[10px] uppercase tracking-[0.08em] text-[#1C1C1C]/45 mt-1">
                Sale Commission
              </p>
            </div>
            <div>
              <p
                className="text-xl text-[#1C1C1C]"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Rs 142k
              </p>
              <p className="text-[10px] uppercase tracking-[0.08em] text-[#1C1C1C]/45 mt-1">
                Rental Commission
              </p>
            </div>
            <div>
              <p
                className="text-xl text-[#A33214]"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Rs 482k
              </p>
              <p className="text-[10px] uppercase tracking-[0.08em] text-[#1C1C1C]/45 mt-1">
                Total Income
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
