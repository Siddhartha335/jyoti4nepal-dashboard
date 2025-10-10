"use client";

import { useIsAuthenticated } from "@refinedev/core";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data, isLoading } = useIsAuthenticated();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!data?.authenticated) {
      router.replace("/login");
    } else {
      setReady(true);
    }
  }, [data, isLoading, router]);

  if (!ready) return null;

  return <>{children}</>;
}
