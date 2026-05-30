"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { saveTokens, saveUser } from "@/app/lib/auth";

function OAuth2CallbackContent() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const id = params.get("userId");
    const fullName = params.get("fullName");
    const email = params.get("email");
    const picture = params.get("picture");

    if (accessToken && refreshToken && id && fullName && email) {
      saveTokens({ accessToken, refreshToken });

      saveUser({
        id: Number(id),
        fullName,
        email,
        profilePictureUrl: picture ?? undefined,
      });

      router.replace("/dashboard");
    } else {
      router.replace("/signup?error=oauth_failed");
    }
  }, [params, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF2E6]">
      <p className="text-[16px] font-medium text-[#5f5048]">
        Signing you in with Google…
      </p>
    </div>
  );
}

export default function OAuth2CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#FAF2E6]">
          <p className="text-[16px] font-medium text-[#5f5048]">Loading...</p>
        </div>
      }
    >
      <OAuth2CallbackContent />
    </Suspense>
  );
}
