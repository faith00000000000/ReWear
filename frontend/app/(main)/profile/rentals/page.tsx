"use client";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useNotifications } from "@/lib/NotificationContext";
import { getRentals, closeRental, apiError, npr, type Rental } from "@/lib/api/settlement";
import SettlementDialog from "@/components/SettlementDialog";
import ProfilePageHeader from "@/components/ProfilePageHeader";

export default function ActiveRentalsPage() {
 const { user, isMounted } = useAuth();
 if (!isMounted) return <p className="p-8">Loading…</p>;
 if (!user) return <p className="p-8">Please <Link className="font-semibold text-[#9E2A1B] transition hover:text-[#7D2116]" href="/login">sign in</Link> to view rentals.</p>;
 return <RentalInbox key={user.id} />;
}
function RentalInbox() {
 const [items, setItems] = useState<Rental[]>([]);
 const [side, setSide] = useState<"buyer" | "seller">("buyer");
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");
 const [notice, setNotice] = useState("");
 const [selected, setSelected] = useState<{ item: Rental; action: "cancel" | "return" } | null>(null);
 const [busy, setBusy] = useState(false);
 const { items: notifications } = useNotifications();
 const load = useCallback(async (signal?: AbortSignal) => {
  try { const result = await getRentals(signal); if (!signal?.aborted) { setItems(result); setError(""); } }
  catch (e) { if (!signal?.aborted) setError(apiError(e)); }
  finally { if (!signal?.aborted) setLoading(false); }
 }, []);
 useEffect(() => {
  const controller = new AbortController();
  getRentals(controller.signal).then(result => { if (!controller.signal.aborted) { setItems(result);setError(""); } })
   .catch(e => { if (!controller.signal.aborted) setError(apiError(e)); })
   .finally(() => { if (!controller.signal.aborted) setLoading(false); });
  const refresh = () => void load(controller.signal); window.addEventListener("focus", refresh);
  return () => { controller.abort(); window.removeEventListener("focus", refresh); };
 }, [load, notifications]);
 async function confirm() {
  if (!selected || busy) return;
  setBusy(true);setError("");
  try {
   const result = await closeRental(selected.item.id, selected.action);
   setItems(current => current.map(i => i.id === result.id ? result : i));
   setNotice(result.refundState === "REQUIRES_REVIEW" ? "Return confirmed. Deposit refund and seller earnings need payment review for this older booking." : `${result.state === "CANCELLED" ? "Rental cancelled" : "Return confirmed"}. ${npr(result.refundDue)} refund due; provider transfer is pending.`);
   setSelected(null);
  } catch(e) { setError(apiError(e)); }
  finally { setBusy(false); }
 }
 const rows = items.filter(i => side === "buyer" ? i.buyerSide : i.sellerSide);
 return <div className="min-h-screen bg-[#FAF6F0] text-[#1A130E]">
  <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
  <ProfilePageHeader title="Active Rentals" description="Manage rentals, returns and refund status." />
  <div className="my-6 flex w-fit max-w-full items-center gap-1.5 rounded-full border border-[#EBE3D5] bg-white p-1" aria-label="Rental perspective">
   {(["buyer", "seller"] as const).map(s => <button key={s} aria-pressed={side === s} onClick={() => setSide(s)} className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition ${side === s ? "bg-[#9E2A1B] text-white" : "text-[#6E6053] hover:bg-[#FAF6F0]"}`}>{s === "buyer" ? "Clothes I rented" : "My clothes being rented"}</button>)}
  </div>
  {notice && <p role="status" className="mb-4 rounded-xl bg-green-50 p-4 text-[13px]">{notice}</p>}
  {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-4 text-[13px] text-red-800">{error}</p>}
  {loading ? <p>Loading rentals…</p> : rows.length === 0 ? <div className="rounded-xl border border-[#EBE3D5] bg-white px-5 py-16 text-center text-[13px] text-[#8C7E74]">No rentals on this side yet.</div> :
   <div className="grid gap-4 lg:grid-cols-2">{rows.map(item => <article key={item.id} className="rounded-xl border border-[#EBE3D5] bg-white p-4 sm:p-5">
    <div className="flex gap-4"><div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-[#F5F0E8]"><Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" /></div>
     <div className="min-w-0 flex-1"><h2 className="text-[14px] font-semibold">{item.name}</h2><p className="mt-1 text-[13px] text-[#8C7E74]">{item.startDate} → {item.endDate}</p><p className="mt-1 text-[13px]">{side === "buyer" ? `Seller: ${item.sellerName ?? "Needs review"}` : `Rented by: ${item.buyerName}`}</p><span className="mt-2 inline-block rounded bg-[#F5F0E8] px-2 py-1 text-xs">{item.state}</span></div>
    </div>
    <div className="mt-4 flex flex-wrap justify-between gap-4 border-t border-[#EBE3D5] pt-4"><p className="text-[13px]">Rental: {npr(item.rentalFee)} · Deposit: {npr(item.deposit)}</p>
     {side === "buyer" ? item.state === "ACTIVE" && <button disabled={!item.canCancel || busy} onClick={() => { setError("");setSelected({ item, action: "cancel" }); }} className="rounded-lg border border-[#9E2A1B] px-3 py-1.5 text-[12px] font-bold text-[#9E2A1B] transition hover:bg-[#9E2A1B]/6 disabled:cursor-not-allowed disabled:opacity-40">Cancel rental</button> :
      <label className="flex items-center gap-3 text-[13px] font-semibold"><span>Returned</span><input type="checkbox" role="switch" checked={item.state === "RETURNED"} disabled={!item.canReturn || busy} onChange={() => { setError("");setSelected({ item, action: "return" }); }} className="h-6 w-6 accent-[#9E2A1B]" /></label>}
    </div>
    {item.actionBlockReason && item.state === "ACTIVE" && <p className="mt-3 text-xs text-amber-800">{item.actionBlockReason}</p>}
    {side === "seller" && item.state === "ACTIVE" && !item.canReturn && !item.actionBlockReason && <p className="mt-3 text-xs text-[#8C7E74]">Return confirmation becomes available on the rental start date.</p>}
    {item.state !== "ACTIVE" && <p className="mt-3 text-[13px] text-[#594E46]">{item.state === "CANCELLED" && <>7% cancellation fee: {npr(item.cancellationFee)}. </>}{item.refundState === "REFUNDED_MANUALLY" ? "Refund confirmed by admin" : "Refund due"}: {npr(item.refundDue)} · {item.refundState === "REFUNDED_MANUALLY" ? "External refund recorded by admin" : item.refundState === "REQUIRES_REVIEW" ? "Payment breakdown needs review before refund calculation" : item.refundState === "NOT_REQUIRED" ? "No transfer required" : "Pending provider processing (not yet refunded)"}</p>}
   </article>)}</div>}
  {selected && <SettlementDialog title={selected.action === "cancel" ? "Cancel your rental?" : "Confirm clothes returned"} busy={busy} onClose={() => setSelected(null)} onConfirm={() => void confirm()} confirmLabel={selected.action === "cancel" ? "Yes, cancel rental" : "Confirm returned"}>
   {selected.action === "cancel" ? <><p>Are you sure you want to cancel <strong>{selected.item.name}</strong>?</p><p>A <strong>7% cancellation fee ({npr(selected.item.cancellationFee)})</strong> applies to the rental charge. Your full security deposit and shipping charge are included in the refund due.</p><p>The item will be released from your reservation. Refunds remain pending until the payment provider confirms the transfer.</p></> : <><p>Great, your clothes are back! Confirm only after you have received and checked the item.</p><p>The same listing and description will be available in the marketplace again, unless another reservation still applies. The buyer is due 100% of the security deposit; your rental earnings become available after 20% commission.</p><p>This cannot be undone. Deposit transfer is tracked separately and may remain pending. Older bookings with incomplete payment records require review before a refund or seller credit can be calculated.</p></>}
   {error && <p role="alert" className="text-red-800">{error}</p>}
  </SettlementDialog>}
  </main>
 </div>;
}
