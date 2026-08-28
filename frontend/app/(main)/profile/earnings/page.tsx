"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useNotifications } from "@/lib/NotificationContext";
import { useAuth } from "@/lib/AuthContext";
import { getWallet, requestWithdrawal, cancelWithdrawal, apiError, npr, type Wallet } from "@/lib/api/settlement";
import SettlementDialog from "@/components/SettlementDialog";
import ProfilePageHeader from "@/components/ProfilePageHeader";
export default function SellerEarningsPage() {
 const { user, isMounted } = useAuth();
 if (!isMounted) return <p className="p-8">Loading…</p>;
 if (!user) return <p className="p-8">Please <Link className="font-semibold text-[#9E2A1B] transition hover:text-[#7D2116]" href="/login">sign in</Link> to view earnings.</p>;
 return <SellerWallet key={user.id} />;
}
function SellerWallet() {
 const { items: notifications } = useNotifications();
 const [data, setData] = useState<Wallet | null>(null);
 const [error, setError] = useState(""); const [notice, setNotice] = useState("");
 const [amount, setAmount] = useState(""); const [gateway, setGateway] = useState("ESEWA"); const [account, setAccount] = useState("");
 const [request, setRequest] = useState<{ amount: number; gateway: string; account: string; requestKey: string } | null>(null);
 const [busy, setBusy] = useState(false);
 const load = useCallback(async (signal?: AbortSignal) => {
  try { const value = await getWallet(signal); if (!signal?.aborted) { setData(value); setError(""); } }
  catch(e) { if (!signal?.aborted) setError(apiError(e)); }
 }, []);
 useEffect(() => { const c = new AbortController();
  getWallet(c.signal).then(result => { if (!c.signal.aborted) { setData(result);setError(""); } })
   .catch(e => { if (!c.signal.aborted) setError(apiError(e)); }); const refresh = () => void load(c.signal); window.addEventListener("focus", refresh); return () => { c.abort(); window.removeEventListener("focus", refresh); }; }, [load, notifications]);
 async function withdraw() {
  if (!request || busy) return;
  setBusy(true);
  try { await requestWithdrawal(request); setRequest(null); setAmount(""); await load(); setNotice("Withdrawal request recorded. Balance reserved; no transfer has been made yet."); }
  catch(e) { setError(apiError(e)); } finally { setBusy(false); }
 }
 async function cancel(id: number) {
  setBusy(true);try { await cancelWithdrawal(id); await load();setNotice("Request cancelled. Reserved funds are available again."); } catch(e) { setError(apiError(e)); } finally { setBusy(false); }
 }
 return <div className="min-h-screen bg-[#FAF6F0] text-[#1A130E]">
  <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
  <ProfilePageHeader title="My Earnings" description="Your thrift and rental income, after commission." />
  {error && <p role="alert" className="my-4 rounded-lg bg-red-50 p-4 text-red-800">{error}</p>}
  {notice && <p role="status" className="my-4 rounded-lg bg-green-50 p-4">{notice}</p>}
  {!data ? <p>{error ? "Please try again in a moment." : "Loading earnings…"}</p> : <>
   <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["Total earned",data.totalEarned],["Available balance",data.availableBalance],["Withdrawal reserved",data.reservedForWithdrawal],["Withdrawn",data.withdrawn]].map(([label,value]) => <div key={label} className="rounded-xl border border-[#EBE3D5] bg-white p-5"><p className="text-xs text-[#8C7E74]">{label}</p><p className="mt-3 text-xl font-semibold">{npr(Number(value))}</p></div>)}</div>
   <p className="my-4 text-[13px]">Pending rental earnings: <strong>{npr(data.pendingRentalEarnings)}</strong> — available after you confirm return. Thrift credits follow verified payment (12% commission); rental credits follow return (20%). Deposits are never seller income.</p>
   <p className="my-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-[13px]">{data.providerNotice}</p>
   {data.reviewCount > 0 && <p className="text-[13px] text-amber-800">{data.reviewCount} order(s) need payment/snapshot review and are excluded.</p>}
   <form className="my-6 space-y-4 rounded-xl border border-[#EBE3D5] bg-white p-5" onSubmit={e => { e.preventDefault();setError("");setRequest({ amount: Number(amount), gateway, account, requestKey: crypto.randomUUID() }); }}>
    <h2 className="text-[14px] font-semibold">Request withdrawal</h2><div className="grid gap-4 sm:grid-cols-3">
     <label className="text-[13px]">Amount (NPR)<input required type="number" min="1" max={Math.max(0,data.availableBalance)} step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="mt-2 w-full rounded-lg border border-[#EBE3D5] bg-[#FAF6F0] px-3 py-2.5 text-[13px] outline-none transition focus:border-[#9E2A1B] focus:ring-1 focus:ring-[#9E2A1B]" /></label>
     <label className="text-[13px]">Wallet provider<select value={gateway} onChange={e => setGateway(e.target.value)} className="mt-2 w-full rounded-lg border border-[#EBE3D5] bg-[#FAF6F0] px-3 py-2.5 text-[13px] outline-none transition focus:border-[#9E2A1B] focus:ring-1 focus:ring-[#9E2A1B]"><option value="ESEWA">eSewa sandbox</option><option value="KHALTI">Khalti sandbox</option></select></label>
     <label className="text-[13px]">Wallet mobile number<input required type="tel" inputMode="numeric" pattern="9[0-9]{9}" maxLength={10} autoComplete="tel" value={account} onChange={e => setAccount(e.target.value)} className="mt-2 w-full rounded-lg border border-[#EBE3D5] bg-[#FAF6F0] px-3 py-2.5 text-[13px] outline-none transition focus:border-[#9E2A1B] focus:ring-1 focus:ring-[#9E2A1B]" /></label>
    </div><button disabled={busy || data.availableBalance < 1} className="rounded-lg bg-[#9E2A1B] px-4 py-2 text-[13px] font-bold text-white transition hover:bg-[#9E2A1B]/90 disabled:cursor-not-allowed disabled:opacity-40">Review withdrawal request</button>
   </form>
   <h2 className="mb-3 text-[14px] font-semibold">Earning history</h2><div className="overflow-x-auto rounded-xl border border-[#EBE3D5] bg-white"><table className="w-full text-left text-[13px]"><thead><tr className="border-b border-[#EBE3D5] bg-[#FAF6F0]">{["Item","Status","Fee","Commission","Your share"].map(h => <th key={h} className="p-3">{h}</th>)}</tr></thead><tbody>{data.entries.map(e => <tr key={e.itemId} className="border-b border-[#EBE3D5]"><td className="p-3">{e.name}<small className="block">{e.type}</small></td><td className="p-3">{e.state}<small className="block">{e.available ? "Available" : e.state === "CANCELLED" ? "No seller credit" : "Pending return"}</small></td><td className="p-3">{npr(e.fee)}</td><td className="p-3">{npr(e.commission)}</td><td className="p-3">{npr(e.net)}</td></tr>)}</tbody></table>{data.entries.length === 0 && <p className="p-6">No verified earnings yet.</p>}</div>
   <h2 className="mb-3 mt-8 text-[14px] font-semibold">Withdrawal history</h2><div className="space-y-3">{data.withdrawals.map(w => <div key={w.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#EBE3D5] bg-white p-4"><div><p>{npr(w.amount)} · {w.gateway} · {w.account}</p><p className="mt-1 text-xs">{w.status === "PENDING_PROVIDER_SETUP" ? "Pending provider setup — not transferred" : w.status} · {new Date(w.createdAt).toLocaleString()}</p></div>{w.status === "PENDING_PROVIDER_SETUP" && <button disabled={busy} onClick={() => void cancel(w.id)} className="rounded-lg border border-[#EBE3D5] px-3 py-1.5 text-[12px] font-bold text-[#594E46] transition hover:bg-[#FAF6F0] disabled:opacity-40">Cancel request</button>}</div>)}{data.withdrawals.length === 0 && <p className="text-[13px] text-[#8C7E74]">No withdrawal requests yet.</p>}</div>
  </>}
  {request && <SettlementDialog title="Confirm withdrawal request" busy={busy} onClose={() => setRequest(null)} onConfirm={() => void withdraw()} confirmLabel="Reserve & request"><p>Reserve {npr(request.amount)} for {request.gateway} wallet {request.account}?</p><p>This creates a pending request. Seller payout integration is not yet enabled, so it will not transfer money to your wallet.</p>{error && <p role="alert" className="text-red-800">{error}</p>}</SettlementDialog>}
  </main>
 </div>;
}
