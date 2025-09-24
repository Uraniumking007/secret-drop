import { createAuthClient } from "better-auth/react";
import { usernameClient, twoFactorClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    usernameClient(),
    twoFactorClient({
      // Let the login page handle modal instead of redirecting
      onTwoFactorRedirect() {
        try {
          localStorage.setItem(
            "twofa-challenge",
            JSON.stringify({ ts: Date.now() })
          );
        } catch {}
      },
    }),
  ],
  // Use same-origin in browser to ensure cookies are first-party
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.BETTER_AUTH_URL!,
  cookies: {
    enabled: true,
    name: "better-auth",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  },
});
