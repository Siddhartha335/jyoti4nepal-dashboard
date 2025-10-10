import { AuthProvider } from "@refinedev/core";

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    // Replace with your real API call
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const { token } = await res.json();
      localStorage.setItem("token", token);
      return { success: true, redirectTo: "/" };
    }

    return {
      success: false,
      error: {
        message: "Login failed",
        name: "Invalid credentials",
      },
    };
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
      error: { message: "Unauthorized", name: "Unauthorized" },
      redirectTo: "/login",
    };
  },

  getIdentity: async () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    // Optionally decode or fetch user info
    return { id: 1, name: "Admin" };
  },

  onError: async (error) => {
    console.error("Auth Error:", error);
    return {};
  },
};