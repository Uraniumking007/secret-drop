import { createAuthClient } from "better-auth/react";
import { usernameClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [usernameClient()],
  baseURL: process.env.BETTER_AUTH_URL!,
  cookies: {
    enabled: true,
    name: "better-auth",
  },
});
