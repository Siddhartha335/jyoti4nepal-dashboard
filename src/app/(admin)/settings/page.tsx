"use client";

import ListSettings from '@components/settings/list'
import React from 'react'
import { useGetIdentity } from "@refinedev/core";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';

interface User {
  role?: string;
}

const page = () => {

  const { data: user } = useGetIdentity<User>();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "SUPERADMIN") {
      toast.error("Only SUPERADMIN can access that");
      router.push("/dashboard");
    }
  }, [user, router]);

  // Don't render content if not SUPERADMIN
  if (!user || user.role !== "SUPERADMIN") {
    return null;
  }

  return (
    <ListSettings />
  )
}

export default page