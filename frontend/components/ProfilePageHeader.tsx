"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePageHeader({ title, description }: { title: string; description: string }) {
  const router = useRouter();

  function goBack() {
    if (window.history.length > 1) router.back();
    else router.replace("/profile");
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={goBack}
        aria-label="Go back"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#EBE3D5] bg-white text-[#594E46] transition hover:bg-[#FAF6F0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9E2A1B]"
      >
        <ArrowLeft size={16} />
      </button>
      <div>
        <h1 className="font-serif text-[26px] font-normal text-[#1A130E]">{title}</h1>
        <p className="text-[12px] text-[#8C7E74]">{description}</p>
      </div>
    </div>
  );
}
