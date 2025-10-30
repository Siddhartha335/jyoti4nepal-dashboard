"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLogout } from "@refinedev/core";
import { useState } from "react";
import Image from "next/image";
import {
  LayoutDashboard,
  Building2,
  BookOpen,
  FileText,
  Newspaper,
  LogOut,
  Menu,
  Bell,
  User,
} from "lucide-react";

const NAV = [
  { label: "Management", href: "/dashboard", icon: LayoutDashboard },
  { label: "Blogs", href: "/blogs", icon: Newspaper },
  { label: "Testimonials", href: "/testimonials", icon: FileText },
  { label: "Gallery", href: "/gallery", icon: Building2 },
  { label: "Pop-up", href: "/popup", icon: Bell },
  { label: "FAQ", href: "/faq", icon: BookOpen },
  { label: "Terms & Condition", href: "/terms", icon: FileText },
  { label: "Settings", href: "/settings", icon: User },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { mutate: logout } = useLogout();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + "/");

  return (
    <div className="h-screen overflow-hidden bg-gray-100">
      {/* Fixed sidebar */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-30 w-64 bg-[#F7F6F3] border-r shadow-sm font-solomon",
          open ? "block" : "hidden",
          "lg:block",
        ].join(" ")}
      >
        {/* Admin Panel Header */}
        <Link href={"/dashboard"}>
            <div className="flex items-center gap-3 p-4">
              <Image width={44} height={44} src="/dashboard-logo.svg" alt="jyoti" />
              <span className="text-lg font-semibold text-gray-800">Admin Panel</span>
            </div>
        </Link>

        {/* Sidebar nav */}
        <nav className="p-4">
          <div className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Management
          </div>
          <ul className="space-y-1">
            {NAV.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={[
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
                      isActive(item.href)
                        ? "bg-[#CE9F41] text-white"
                        : "text-gray-700 hover:bg-gray-100",
                    ].join(" ")}
                    onClick={() => setOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 w-64 p-4 bg-[#F7F6F3]">
          <button
            onClick={() => logout()}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Content column shifts right on lg to clear fixed sidebar */}
      <div className="relative z-10 flex h-full flex-col lg:ml-64">
        {/* Fixed header (height = 4rem) */}
        <header className="fixed top-0 right-0 left-0 lg:left-64 z-20 flex h-16 items-center justify-between border-b bg-[#F7F6F3] px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              className="inline-flex items-center justify-center rounded-md p-2 hover:bg-gray-100 lg:hidden"
              onClick={() => setOpen((p) => !p)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-normal text-gray-800">Content Management</h1>
          </div>

          <div className="flex items-center gap-3">
            <button className="rounded-full p-2 hover:bg-gray-100">
              <Bell className="h-5 w-5 text-gray-600" />
            </button>
            <button className="rounded-full p-2 hover:bg-gray-100">
              <User className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </header>

        {/* Scrollable main area only */}
        <main className="pt-20 h-[calc(100vh)] overflow-y-auto p-6">
          {children}
        </main>
      </div>

      {/* Mobile header spacer to prevent overlap when sidebar is open (optional) */}
      <style jsx global>{`
        /* Prevent body scrolling behind the layout on iOS */
        html, body { height: 100%; }
        body { overflow: hidden; }
      `}</style>
    </div>
  );
}
