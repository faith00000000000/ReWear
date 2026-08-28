"use client";
import { useEffect, useRef, type ReactNode } from "react";
export default function SettlementDialog({ title, children, busy, onClose, onConfirm, confirmLabel }: {
 title: string; children: ReactNode; busy: boolean; onClose: () => void; onConfirm: () => void; confirmLabel: string;
}) {
 const dialog = useRef<HTMLDialogElement>(null);
 useEffect(() => { const node = dialog.current; node?.showModal(); return () => node?.close(); }, []);
 return <dialog ref={dialog} aria-labelledby="settlement-dialog-title" onCancel={e => { e.preventDefault(); if (!busy) onClose(); }}
  className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-[#EBE3D5] bg-[#FAF6F0] p-6 text-[#1A130E] shadow-xl backdrop:bg-black/50">
  <h2 id="settlement-dialog-title" className="font-serif text-[22px] font-normal">{title}</h2>
  <div className="my-5 space-y-3 text-[13px] leading-6 text-[#594E46]">{children}</div>
  <div className="flex justify-end gap-3">
   <button autoFocus disabled={busy} onClick={onClose} className="rounded-lg border border-[#EBE3D5] bg-white px-4 py-2 text-[13px] font-bold text-[#594E46] transition hover:bg-[#F5F0E8] disabled:opacity-50">Go back</button>
   <button disabled={busy} onClick={onConfirm} className="rounded-lg bg-[#9E2A1B] px-4 py-2 text-[13px] font-bold text-white transition hover:bg-[#9E2A1B]/90 disabled:opacity-50">{busy ? "Processing…" : confirmLabel}</button>
  </div>
 </dialog>;
}
