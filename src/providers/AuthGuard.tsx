// src/components/AuthGuard.tsx
"use client";

import { useEffect } from "react";
import { useLogout } from "@refinedev/core";
import { toast } from "react-hot-toast";

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000;
    return Date.now() >= exp;
  } catch {
    return true;
  }
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { mutate: logout } = useLogout();

  useEffect(() => {
    // Check token expiry every minute
    const interval = setInterval(() => {
      const token = localStorage.getItem("token");
      
      if (token && isTokenExpired(token)) {
        toast.error("Your session has expired. Please login again.");
        logout();
      }
    }, 60000); // Check every 60 seconds

    return () => clearInterval(interval);
  }, [logout]);

  return <>{children}</>;
}