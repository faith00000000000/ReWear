"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, ClipboardList, Flag, HeartHandshake, Loader2, Users, Wallet } from "lucide-react";
import AdminStatCard from "@/components/admin/AdminStatCard";
import { fetchAdminDashboard, type AdminDashboard } from "@/lib/api/adminDashboard";

const money = (value: number) => `Rs ${Number(value || 0).toLocaleString("en-NP", { maximumFractionDigits: 2 })}`;
const label = (value: string) => value.replaceAll("_", " ");

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetchAdminDashboard(controller.signal).then(setData).catch((reason) => {
      if (reason?.code !== "ERR_CANCELED") setError("Dashboard data could not be loaded.");
    });
    return () => controller.abort();
  }, []);

  if (!data && !error) return <div className="flex min-h-80 items-center justify-center text-[#A33214]"><Loader2 className="animate-spin" /><span className="ml-2">Loading overview…</span></div>;
  if (!data) return <div role="alert" className="rounded-xl border border-[#A33214]/30 bg-[#A33214]/5 p-6 text-[#A33214]">{error}</div>;

  return <div className="flex max-w-[1400px] flex-col gap-6">
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <AdminStatCard label="Total Listings" value={data.metrics.totalListings.toLocaleString()} icon={ClipboardList} />
      <AdminStatCard label="Total Users" value={data.metrics.totalUsers.toLocaleString()} icon={Users} />
      <AdminStatCard label="Total Donations" value={data.metrics.totalDonations.toLocaleString()} icon={HeartHandshake} />
      <AdminStatCard label="Admin Earnings" value={money(data.metrics.totalEarnings)} icon={Wallet} accent />
    </section>

    <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
      <div className="overflow-hidden rounded-xl border-2 border-[#A33214]/15 bg-white/70 xl:col-span-3">
        <PanelHeader title="Recent Listings" href="/admin/listings" />
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="bg-[#A33214] text-left text-[11px] uppercase tracking-wider text-white"><th className="px-5 py-3">Item</th><th className="px-5 py-3">Owner</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">Status</th></tr></thead>
          <tbody>{data.recentListings.length ? data.recentListings.map((item) => <tr key={item.id} className="border-t border-[#A33214]/10 hover:bg-[#A33214]/5"><td className="px-5 py-3"><span className="block font-semibold">{item.title}</span><span className="text-[11px] opacity-50">LST-{item.id}</span></td><td className="px-5 py-3">{item.owner}</td><td className="px-5 py-3">{label(item.type)}</td><td className="px-5 py-3"><span className="rounded-xl bg-[#A33214]/10 px-2 py-1 text-[10px] font-bold text-[#A33214]">{label(item.status)}</span></td></tr>) : <EmptyRow columns={4} text="No listings yet." />}</tbody>
        </table></div>
      </div>

      <div className="overflow-hidden rounded-xl border-2 border-[#A33214]/15 bg-white/70 xl:col-span-2">
        <PanelHeader title="Recent Reports" href="/admin/reports" />
        {data.recentReports.length ? <ul>{data.recentReports.map((report) => <li key={report.id} className="flex gap-3 border-t border-[#A33214]/10 px-5 py-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#A33214] text-white"><Flag size={14} /></span><div className="min-w-0"><p className="truncate font-semibold">{report.listing}</p><p className="truncate text-xs opacity-60">{report.reason}</p><p className="mt-1 text-[10px] uppercase tracking-wider opacity-45">REP-{report.id} · {report.reportedBy} · {label(report.status)}</p></div></li>)}</ul> : <p className="p-8 text-center text-sm opacity-60">No reports yet.</p>}
      </div>
    </section>

    <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <Summary title="Donation Pipeline" icon={<HeartHandshake size={17} />} values={[["Pending", data.donations.pending], ["Confirmed", data.donations.confirmed], ["Completed", data.donations.completed], ["Rejected", data.donations.rejected]]} />
      <Summary title="Verified Commission Earnings" icon={<Wallet size={17} />} values={[["Thrift (12%)", money(data.earnings.thriftCommission)], ["Rental (20%)", money(data.earnings.rentalCommission)], ["Total", money(data.earnings.totalCommission)]]} />
    </section>
  </div>;
}

function PanelHeader({ title, href }: { title: string; href: string }) { return <div className="flex items-center justify-between border-b-2 border-[#A33214]/15 px-5 py-4"><h2 className="font-serif text-lg">{title}</h2><Link href={href} className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#A33214]">View all <ArrowUpRight size={14} /></Link></div>; }
function EmptyRow({ columns, text }: { columns: number; text: string }) { return <tr><td colSpan={columns} className="px-5 py-12 text-center opacity-60">{text}</td></tr>; }
function Summary({ title, icon, values }: { title: string; icon: React.ReactNode; values: Array<[string, string | number]> }) { return <div className="rounded-xl border-2 border-[#A33214]/15 bg-white/70 p-5"><div className="mb-4 flex items-center gap-2 text-[#A33214]">{icon}<h3 className="text-xs font-bold uppercase tracking-widest">{title}</h3></div><div className={`grid gap-4 text-center ${values.length === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"}`}>{values.map(([name, value]) => <div key={name}><p className="font-serif text-xl text-[#A33214]">{value}</p><p className="mt-1 text-[10px] uppercase tracking-wider opacity-50">{name}</p></div>)}</div></div>; }
