"use client";
import { useEffect, useState } from "react";
import SettlementDialog from "@/components/SettlementDialog";
import { useNotifications } from "@/lib/NotificationContext";
import { confirmExternalRefund, getSettlement, apiError, npr, type Settlement } from "@/lib/api/settlement";
export default function AdminSettlementPanel({ refreshKey }: { refreshKey: number }) {
 const { items: notifications } = useNotifications();
 const [selected,setSelected] = useState<Settlement["rentals"][number] | null>(null);
 const [reference,setReference] = useState("");
 const [confirmed,setConfirmed] = useState(false);
 const [busy,setBusy] = useState(false);
 const [version,setVersion] = useState(0);
 async function recordRefund() {
  if (!selected || busy) return;
  if (!confirmed || !/^[A-Za-z0-9][A-Za-z0-9._/-]{5,119}$/.test(reference)) { setError("Enter a valid provider refund reference and confirm the external refund succeeded.");return; }
  setBusy(true);setError("");
  try { await confirmExternalRefund(selected.itemId, { providerReference: reference, refundedAmount: selected.refundDue, externallyRefunded: true });setSelected(null);setVersion(v => v+1); }
  catch(e) { setError(apiError(e)); } finally { setBusy(false); }
 }
 const [data,setData] = useState<Settlement | null>(null); const [error,setError] = useState("");
 useEffect(() => { const c = new AbortController(); getSettlement(c.signal).then(value => { if (!c.signal.aborted) { setData(value);setError(""); } }).catch(e => { if (!c.signal.aborted) setError(apiError(e)); });return () => c.abort(); }, [refreshKey, version, notifications]);
 return <section className="space-y-4 rounded-xl border border-amber-300 bg-white p-5">
  <h2 className="font-serif text-xl">Deposits & settlement obligations</h2>
  <p className="text-sm text-stone-600">Held deposits are liabilities, not earnings. A returned or cancelled rental creates a refund due; held funds remain until an admin records an externally completed refund. Withdrawals below are requests, not completed transfers.</p>
  {error && <p role="alert" className="text-red-800">{error}</p>}
  {!data ? <p>Loading settlement records…</p> : <><div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[["Security deposits held",data.depositsHeld],["Refunds due",data.refundsDue],["7% cancellation fees",data.cancellationFees],["Withdrawal reservations",data.reservedWithdrawals]].map(([label,value]) => <div key={label} className="rounded-lg bg-stone-50 p-3"><p className="text-xs">{label}</p><strong className="mt-2 block">{npr(Number(value))}</strong></div>)}</div>
   {data.reviewCount > 0 && <p className="text-sm text-amber-800">{data.reviewCount} order(s) excluded pending reconciliation.</p>}
   <details><summary className="cursor-pointer text-sm font-semibold">Rental deposits and refund queue ({data.rentals.length})</summary><div className="mt-3 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{["Item / buyer","Rental status","Deposit","Refund due","Transfer status"].map(h => <th key={h} className="p-2">{h}</th>)}</tr></thead><tbody>{data.rentals.map(r => <tr key={r.itemId} className="border-t"><td className="p-2">{r.itemName}<small className="block">{r.buyerName}</small></td><td className="p-2">{r.state}</td><td className="p-2">{npr(r.deposit)}</td><td className="p-2">{npr(r.refundDue)}</td><td className="p-2">{r.refundState === "REFUNDED_MANUALLY" ? "External refund confirmed by admin" : r.refundState ?? "Held until return"}
    {r.providerReference && <small className="block">{r.gateway} · {r.providerReference}</small>}
    {r.refundState === "PENDING_PROVIDER" && r.refundDue > 0 && <button className="mt-2 block rounded-lg border border-[#9E2A1B] px-3 py-2 text-xs font-semibold text-[#9E2A1B]" onClick={() => {setSelected(r);setReference("");setConfirmed(false);setError("");}}>Record completed refund</button>}
    </td></tr>)}</tbody></table></div></details>
   <details><summary className="cursor-pointer text-sm font-semibold">Pending withdrawal requests ({data.withdrawals.length})</summary>{data.withdrawals.map(w => <p key={w.id} className="mt-3 border-t pt-3 text-sm">Request #{w.id} · {npr(w.amount)} · {w.gateway} · {w.account} · Awaiting provider setup</p>)}</details>
  </>}
  {selected && <SettlementDialog title="Record external refund" busy={busy} onClose={() => setSelected(null)} onConfirm={() => void recordRefund()} confirmLabel="Confirm refund record">
   <p>{selected.itemName} · {selected.buyerName}</p>
   <p>Amount: <strong>{npr(selected.refundDue)}</strong> via <strong>{selected.gateway}</strong>.</p>
   <p>This button does not send money. First complete and verify the refund in the merchant provider account, then record its refund reference below. This releases the deposit liability and notifies the buyer.</p>
   <label className="block">Provider refund reference<input value={reference} maxLength={120} onChange={e => setReference(e.target.value.trim())} className="mt-2 w-full rounded-lg border border-[#EBE3D5] bg-white p-3" /></label>
   <label className="flex items-start gap-2"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className="mt-1" /><span>I verified that this exact amount was refunded to the original buyer. This is not just a pending transfer request.</span></label>
   {error && <p role="alert" className="text-red-800">{error}</p>}
  </SettlementDialog>}
 </section>;
}
