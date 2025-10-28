"use client";

import React from "react";
import AdminShell from "@components/layout";
import RequireAuth from "@providers/require-auth";

export default function Adminlayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <AdminShell>{children}</AdminShell>
    </RequireAuth>
  );
}
