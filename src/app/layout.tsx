import { Metadata } from "next";
import React, { Suspense } from "react";
import "@styles/global.css";
import { RefineProvider } from "@providers/refine-provider";
import { Toaster } from "react-hot-toast";
import { AuthGuard } from "@providers/AuthGuard";

export const metadata: Metadata = {
  title: {
    default: "JyotiNepal Admin Dashboard",
    template: "%s | JyotiNepal Dashboard",
  },
  description: "Admin dashboard for managing JyotiNepal resources, users, and content.",
  icons: {
    icon: "/favicon/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Suspense>
              <RefineProvider>
                <AuthGuard>
                  {children}
                </AuthGuard>
                <Toaster position="top-right" />
              </RefineProvider>
        </Suspense>
      </body>
    </html>
  );
}
