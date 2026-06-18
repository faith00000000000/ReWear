// export interface AuthTokens {
//   accessToken: string;
//   refreshToken: string;
//   expiresIn?: number; // seconds
// }
//
// export interface AuthUser {
//   id: number;
//   fullName: string;
//   email: string;
//   profilePictureUrl?: string;
// }
//
// export function saveTokens(tokens: AuthTokens) {
//   localStorage.setItem("accessToken", tokens.accessToken);
//   localStorage.setItem("refreshToken", tokens.refreshToken);
//
//   if (tokens.expiresIn) {
//     // Store absolute expiry timestamp (ms) so we can check client-side
//     const expiresAt = Date.now() + tokens.expiresIn * 1000;
//     localStorage.setItem("expiresAt", String(expiresAt));
//   }
// }
//
// export function clearTokens() {
//   localStorage.removeItem("accessToken");
//   localStorage.removeItem("refreshToken");
//   localStorage.removeItem("expiresAt");
//   localStorage.removeItem("user");
// }
//
// export function saveUser(user: AuthUser) {
//   localStorage.setItem("user", JSON.stringify(user));
// }
//
// export function getUser(): AuthUser | null {
//   if (typeof window === "undefined") return null;
//   const raw = localStorage.getItem("user");
//   return raw ? JSON.parse(raw) : null;
// }
//
// export function isAuthenticated(): boolean {
//   if (typeof window === "undefined") return false;
//   return !!localStorage.getItem("accessToken");
// }
//
// /** Kick off Google OAuth — backend redirects to Google consent screen */
// export function redirectToGoogle() {
//   window.location.href = `${
//       process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"
//   }/oauth2/authorization/google`;
// }


export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  profilePictureUrl?: string;
}

export function saveTokens(tokens: AuthTokens) {
  localStorage.setItem("accessToken", tokens.accessToken);
  localStorage.setItem("refreshToken", tokens.refreshToken);

  if (tokens.expiresIn) {
    const expiresAt = Date.now() + tokens.expiresIn * 1000;
    localStorage.setItem("expiresAt", String(expiresAt));
  }
}

export function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("expiresAt");
  localStorage.removeItem("user");
}

export function saveUser(user: AuthUser) {
  localStorage.setItem("user", JSON.stringify(user));
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ── Fixed: now checks expiry, auto-clears stale tokens ──────────────────────
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;

  const token = localStorage.getItem("accessToken");
  if (!token) return false;

  // If we stored an expiry, honour it
  const expiresAt = localStorage.getItem("expiresAt");
  if (expiresAt && Date.now() > Number(expiresAt)) {
    clearTokens(); // wipe the stale session automatically
    return false;
  }

  return true;
}
export function saveSession(tokens: AuthTokens, user: AuthUser) {
  saveTokens(tokens);
  saveUser(user);
}

export function redirectToGoogle() {
  window.location.href = `${
      process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"
  }/oauth2/authorization/google`;
}