import { createAuthClient } from "better-auth/react";
import { usernameClient, twoFactorClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    usernameClient(),
    twoFactorClient({
      onTwoFactorRedirect() {
        window.location.href = "/2fa";
      },
    }),
  ],
  baseURL: process.env.BETTER_AUTH_URL!,
  cookies: {
    enabled: true,
    name: "better-auth",
  },
});
