"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface EditPhoneModalProps {
    currentPhone?: string;
    saving: boolean;
    onClose: () => void;
    onSave: (phone: string) => void; // parent handles the API call + errors
}

const PHONE_REGEX = /^\d{10}$/;

export default function EditPhoneModal({ currentPhone, saving, onClose, onSave }: EditPhoneModalProps) {
    const [phone, setPhone] = useState(currentPhone ?? "");
    const [error, setError] = useState<string | null>(null);

    function handleSave() {
        const trimmed = phone.trim();

        if (!PHONE_REGEX.test(trimmed)) {
            setError("Enter a valid 10-digit phone number");
            return;
        }

        setError(null);
        onSave(trimmed);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
                <div className="flex items-center justify-between">
                    <h3 className="text-[15px] font-bold text-[#1A130E]">Edit Phone Number</h3>
                    <button onClick={onClose} aria-label="Close" className="text-[#8C7E74] hover:text-[#1A130E]">
                        <X size={16} />
                    </button>
                </div>

                <div className="mt-4">
                    <label className="text-[11px] font-semibold uppercase tracking-wide text-[#8C7E74]">
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => {
                            // strip anything non-numeric as the user types
                            setPhone(e.target.value.replace(/\D/g, ""));
                            if (error) setError(null);
                        }}
                        placeholder="9812345678"
                        className="mt-1 w-full rounded-lg border border-[#DDD5C8] px-3 py-2 text-[13px] outline-none focus:border-[#9E2A1B]"
                    />
                    {error && <p className="mt-1.5 text-[11px] font-medium text-[#9E2A1B]">{error}</p>}
                </div>

                <div className="mt-5 flex gap-2.5">
                    <button
                        onClick={onClose}
                        disabled={saving}
                        className="flex-1 rounded-lg border border-[#DDD5C8] py-2 text-[13px] font-bold text-[#594E46] transition hover:bg-[#FAF6F0] disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 rounded-lg bg-[#9E2A1B] py-2 text-[13px] font-bold text-white transition hover:bg-[#9E2A1B]/90 disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}