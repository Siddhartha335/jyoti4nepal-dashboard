// src/providers/auth-provider.ts
import { AuthProvider } from "@refinedev/core";
import Cookies from "js-cookie"; 

// Helper to decode JWT and check expiry
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; 
    return Date.now() >= exp;
  } catch {
    return true;
  }
}

// Helper to get token from localStorage
function getStoredToken(): string | null {
  return localStorage.getItem("token");
}

// Helper to get stored user from localStorage
function getStoredUser(): any | null {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
}

// Helper to store token with expiry info (hybrid approach)
function storeToken(token: string, expiresIn: string) {
  // Calculate expiry in days
  const expiryDays = expiresIn.includes('d') 
    ? parseInt(expiresIn) 
    : 1; // Default to 1 day

  // Cookie options
  const cookieOptions = {
    expires: expiryDays, // Expires in X days
    secure: process.env.NODE_ENV === "production", // Only HTTPS in production
    sameSite: "strict" as const, // CSRF protection
    path: "/",
  };

  // Store token in localStorage (fast access, no HTTP overhead)
  localStorage.setItem("token", token);
  
  // Store expiry info in cookies (SSR-accessible, automatic expiry)
  Cookies.set("tokenExpiresIn", expiresIn, cookieOptions);
  
  // Calculate and store expiry timestamp in cookies
  const expiryTime = Date.now() + (expiryDays * 24 * 60 * 60 * 1000);
  Cookies.set("tokenExpiry", expiryTime.toString(), cookieOptions);
}

// Helper to store user details in localStorage
function storeUser(user: any) {
  localStorage.setItem("user", JSON.stringify(user));
}

// Helper to clear all auth data (hybrid)
function clearAuthData() {
  // Clear localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  
  // Clear cookies
  Cookies.remove("tokenExpiry", { path: "/" });
  Cookies.remove("tokenExpiresIn", { path: "/" });
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
      const { token, expiresIn, user } = data ?? {};
      if (!token) {
        const msg = data?.message || data?.error || "Invalid email or password";
        throw new Error(msg);
      }

      // Store token with expiry info (hybrid approach)
      storeToken(token, expiresIn || "1d");
      
      // Store user details in localStorage
      if (user) {
        storeUser(user);
      }
      
      return { success: true, redirectTo: "/dashboard" };
    } catch (e: any) {
      throw new Error(e?.message ?? "Network error");
    }
  },

  register: async ({ email, password, username, name, role }) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            email, 
            password, 
            username, 
            name,
            role: role || "ADMIN" // Default to "ADMIN" if not specified
          }),
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

      // Don't store token or user data
      // User must login first
      
      return { 
        success: true, 
        successNotification: {
          message: "User registered successfully. They can now login.",
          type: "success"
        }
      };
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
        // Even if backend call fails, still clear frontend data
        console.error("Backend logout failed:", error);
      }
    }
    
    // Clear all auth data (both localStorage and cookies)
    clearAuthData();
    
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
      // Clear expired data
      clearAuthData();
      
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
    
    // Get user from localStorage
    const user = getStoredUser();
    if (user) {
      return {
        id: user.user_id,
        name: user.name || user.username || user.email,
        email: user.email,
        ...user, // Include all other user properties
      };
    }
    
    // Fallback: decode from token if user not stored
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return { id: payload.user_id, name: "Admin" };
    } catch {
      throw new Error("Failed to decode token");
    }
  },

  onError: async (error) => {
    if (error?.statusCode === 401 || error?.message?.includes("Unauthorized")) {
      return { logout: true, redirectTo: "/login" };
    }
    return {};
  },
};