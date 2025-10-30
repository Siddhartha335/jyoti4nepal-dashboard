// src/providers/auth-provider.ts
import { AuthProvider } from "@refinedev/core";

// Helper to decode JWT and check expiry
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= exp;
  } catch {
    return true;
  }
}

// Helper to get token from localStorage
function getStoredToken(): string | null {
  return localStorage.getItem("token");
}

// Helper to store token with expiry info
function storeToken(token: string, expiresIn: string) {
  localStorage.setItem("token", token);
  localStorage.setItem("tokenExpiresIn", expiresIn);
  
  // Calculate expiry timestamp
  const expiryMs = expiresIn.includes('d') 
    ? parseInt(expiresIn) * 24 * 60 * 60 * 1000 
    : 24 * 60 * 60 * 1000;
  const expiryTime = Date.now() + expiryMs;
  localStorage.setItem("tokenExpiry", expiryTime.toString());
}

export const authProvider: AuthProvider = {
  login: async ({ email, password, rememberMe }) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, rememberMe }),
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

      // If API returned OK but no token → throw
      const { token, expiresIn } = data ?? {};
      if (!token) {
        const msg = data?.message || data?.error || "Invalid email or password";
        throw new Error(msg);
      }

      // Store token with expiry info
      storeToken(token, expiresIn || "1d");
      
      return { success: true, redirectTo: "/dashboard" };
    } catch (e: any) {
      throw new Error(e?.message ?? "Network error");
    }
  },

  logout: async () => {
    const token = getStoredToken();
    
    // Call backend logout endpoint to clear httpOnly cookie
    if (token) {
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/logout`,
          {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
          }
        );
      } catch (error) {
        // Even if backend call fails, still clear frontend token
        console.error("Backend logout failed:", error);
      }
    }
    
    // Clear all frontend tokens
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiry");
    localStorage.removeItem("tokenExpiresIn");
    
    return { success: true, redirectTo: "/login" };
  },

  check: async () => {
    const token = getStoredToken();
    
    if (!token) {
      return {
        authenticated: false,
        error: { name: "Unauthorized", message: "No token found" },
        redirectTo: "/login",
      };
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
      // Clear expired token
      localStorage.removeItem("token");
      localStorage.removeItem("tokenExpiry");
      localStorage.removeItem("tokenExpiresIn");
      
      return {
        authenticated: false,
        error: { name: "TokenExpired", message: "Session expired. Please login again." },
        redirectTo: "/login",
      };
    }

    return { authenticated: true };
  },

  getIdentity: async () => {
    const token = getStoredToken();
    if (!token || isTokenExpired(token)) return null;
    
    // Optionally decode user info from token
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return { id: payload.user_id, name: "Admin" };
    } catch {
      return { id: 1, name: "Admin" };
    }
  },

  onError: async (error) => {
    if (error?.statusCode === 401 || error?.message?.includes("Unauthorized")) {
      return { logout: true, redirectTo: "/login" };
    }
    return {};
  },
};