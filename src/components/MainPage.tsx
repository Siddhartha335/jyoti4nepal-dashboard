"use client";

import { useIsAuthenticated } from "@refinedev/core";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MainPage() {
  const { data, isLoading } = useIsAuthenticated();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (data?.authenticated) router.replace("/dashboard");
    else router.replace("/login");
  }, [data, isLoading, router]);

  return null; // nothing to render while redirecting
}
