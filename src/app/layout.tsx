import { Metadata } from "next";
import React, { Suspense } from "react";
import "@styles/global.css";
import { RefineProvider } from "@providers/refine-provider";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Created by Nymna Technology",
  icons: {
    icon: "/logo1.svg",
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
              <RefineProvider>{children}</RefineProvider>
              <Toaster 
                position="bottom-right"
              />
        </Suspense>
      </body>
    </html>
  );
}
