"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { saveTokens, saveUser } from "@/lib/auth";

/**
 * After Google OAuth, the Spring backend redirects to:
 *   /oauth2/callback?accessToken=...&refreshToken=...&userId=...&fullName=...&email=...&picture=...
 *
 * This page reads those params, stores them, and sends the user to /dashboard.
 */
export default function OAuth2CallbackPage() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    // const accessToken = params.get("accessToken");
    // const refreshToken = params.get("refreshToken");
    // const id = params.get("userId");
    // const fullName = params.get("fullName");
    // const email = params.get("email");
    // const picture = params.get("picture");
    //
    // if (accessToken && refreshToken && id && fullName && email) {
    //   saveTokens({ accessToken, refreshToken });
    //   saveUser({
    //     id: Number(id),
    //     fullName,
    //     email,
    //     profilePictureUrl: picture ?? undefined,
    //   });
    //   router.replace("/");
    // } else {
    //   // Something went wrong — send back to signup
    //   router.replace("/signup?error=oauth_failed");
    // }
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const id = params.get("userId");
    const fullName = params.get("fullName");
    const email = params.get("email");
    const picture = params.get("picture");
    const expiresIn = params.get("expiresIn");
    const redirectTo = params.get("redirect") || "/";

    if (accessToken && refreshToken && id && fullName && email) {
      saveTokens({
        accessToken,
        refreshToken,
        expiresIn: expiresIn ? Number(expiresIn) : undefined,
      });
      saveUser({
        id: Number(id),
        fullName,
        email,
        profilePictureUrl: picture ?? undefined,
      });
      router.replace(redirectTo);
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
