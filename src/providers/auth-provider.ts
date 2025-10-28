// src/providers/auth-provider.ts
import { AuthProvider } from "@refinedev/core";

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json().catch(() => ({} as any));

      // If HTTP not OK → throw
      if (!res.ok) {
        const msg =
          data?.message ||
          data?.error ||
          data?.errors?.[0]?.msg ||
          `${res.status} ${res.statusText}`;
        throw new Error(msg);
      }

      // If API returned OK but no token (some backends respond 200 with an error message) → throw
      const { token } = data ?? {};
      if (!token) {
        const msg =
          data?.message ||
          data?.error ||
          "Invalid email or password";
        throw new Error(msg);
      }

      localStorage.setItem("token", token);
      return { success: true, redirectTo: "/dashboard" };
    } catch (e: any) {
      // Network or explicit throws above land here — rethrow so refine treats it as an error
      throw new Error(e?.message ?? "Network error");
    }
  },

  logout: async () => {
    localStorage.removeItem("token");
    return { success: true, redirectTo: "/login" };
  },

  check: async () => {
    const token = localStorage.getItem("token");
    if (token) return { authenticated: true };
    return {
      authenticated: false,
      error: { name: "Unauthorized", message: "Unauthorized" },
      redirectTo: "/login",
    };
  },

  getIdentity: async () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return { id: 1, name: "Admin" };
  },

  onError: async () => {
    return {};
  },
};
