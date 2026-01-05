"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLogout, useGetIdentity } from "@refinedev/core";
import { useState, useRef, useEffect, useMemo } from "react";
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
  ShoppingCart,
  Users,
  PhoneCall,
  CheckCheck,
} from "lucide-react";
import ChangePasswordModal from "@components/ChangePasswordModal";
import toast from "react-hot-toast";

type Notification = {
  notification_id: string;
  type: "CONTACT_INQUIRY" | "NEWSLETTER" | "ORDER" | "SYSTEM";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

const NAV = [
  { label: "Management", href: "/dashboard", icon: LayoutDashboard },
  { label: "Products", href: "/products", icon: ShoppingCart },
  { label: "Blogs", href: "/blogs", icon: Newspaper },
  { label: "Customer Inquiry", href: "/contacts", icon: PhoneCall },
  { label: "Testimonials", href: "/testimonials", icon: FileText },
  { label: "Gallery", href: "/gallery", icon: Building2 },
  { label: "Pop-up", href: "/popup", icon: Bell },
  { label: "FAQ", href: "/faq", icon: BookOpen },
  { label: "Teams", href: "/teams", icon: Users },
  { label: "Terms & Condition", href: "/terms", icon: FileText },
  { label: "Settings", href: "/settings", icon: User, requiresSuperAdmin: true },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { data: user } = useGetIdentity<{ role?: string }>();
  const pathname = usePathname();
  const { mutate: logout } = useLogout();

  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + "/");
  const isSuperAdmin = user?.role === "SUPERADMIN";

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  // Count unread contact inquiries
  const unreadContactInquiries = useMemo(
    () => notifications.filter((n) => !n.isRead && n.type === "CONTACT_INQUIRY").length,
    [notifications]
  );

  // Fetch unread count on mount and periodically
  useEffect(() => {
    fetchUnreadCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Close user dropdown if clicked outside it
      if (menuRef.current && !menuRef.current.contains(target)) {
        setUserOpen(false);
      }

      // Close notif dropdown if clicked outside it
      if (notifRef.current && !notifRef.current.contains(target)) {
        setNotifOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setUserOpen(false);
        setNotifOpen(false);
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleChangePassword = async (data: { currentPassword: string; newPassword: string }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("/api/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword: data.currentPassword,
          password: data.newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to change password");
      }

      toast.success("Password changed successfully!");
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error(error.message || "Failed to change password. Please try again.");
    }
  };

  // Fetch unread count only (lightweight)
  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/notification?limit=100`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok && data.success) {
        setTotalUnread(data.unreadCount || 0);
        // Also update the notifications list for sidebar badge
        const list: Notification[] = data.data || [];
        setNotifications(list);
      }
    } catch (err: any) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  // Fetch all recent notifications (for dropdown)
  const fetchNotifications = async () => {
    try {
      setNotifLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/notification?limit=20`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to fetch notifications");
      }

      const list: Notification[] = data.data || [];
      setNotifications(list);
      setTotalUnread(data.unreadCount || 0);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load notifications");
      setNotifications([]);
    } finally {
      setNotifLoading(false);
    }
  };

  // Mark single notification as read
  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/notification/${id}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Failed to mark as read");
      }

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.notification_id === id ? { ...n, isRead: true } : n))
      );
      
      // Update unread count
      setTotalUnread((prev) => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Could not mark as read");
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/notification/read-all`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to mark all as read");
      }

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      setTotalUnread(0);

      toast.success(data.message || "All notifications marked as read");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Could not mark all as read");
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-gray-100">
      {/* Fixed sidebar */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-30 w-64 bg-[#F7F6F3] border-r shadow-sm font-solomon flex flex-col",
          open ? "block" : "hidden",
          "lg:flex",
        ].join(" ")}
      >
        {/* Fixed Admin Panel Header */}
        <Link href={"/dashboard"}>
          <div className="flex items-center gap-3 p-4 border-b">
            <Image width={44} height={44} src="/dashboard-logo.svg" alt="jyoti" />
            <span className="text-lg font-semibold text-gray-800">
              {isSuperAdmin ? "SuperAdmin Panel" : "Admin Panel"}
            </span>
          </div>
        </Link>

        {/* Scrollable Sidebar nav */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Management
          </div>
          <ul className="space-y-1">
            {NAV.map((item) => {
              const Icon = item.icon;

              if (item.requiresSuperAdmin && !isSuperAdmin) return null;

              // Show badge for Customer Inquiry
              const showBadge = item.href === "/contacts" && unreadContactInquiries > 0;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={[
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors relative",
                      isActive(item.href)
                        ? "bg-[#CE9F41] text-white"
                        : "text-gray-700 hover:bg-gray-100",
                    ].join(" ")}
                    onClick={() => setOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="flex-1">{item.label}</span>
                    {showBadge && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                        {unreadContactInquiries > 9 ? '9+' : unreadContactInquiries}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Fixed Logout Button */}
        <div className="p-4 border-t bg-[#F7F6F3]">
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

          <div className="relative flex items-center gap-3">
            {/* Notifications */}
            <button
              onClick={() => {
                setNotifOpen((p) => {
                  const next = !p;
                  if (next) fetchNotifications(); // refresh when opening
                  return next;
                });
                setUserOpen(false);
              }}
              className="relative rounded-full p-2 hover:bg-gray-100"
            >
              <Bell className="h-5 w-5 text-gray-600" />
              {totalUnread > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                  {totalUnread > 99 ? '99+' : totalUnread}
                </span>
              )}
            </button>

            {notifOpen && (
              <div
                ref={notifRef}
                className="absolute right-0 top-12 w-80 rounded-xl border bg-white shadow-xl z-50"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <span className="font-semibold text-gray-800">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="flex items-center gap-1 text-xs text-[#CE9F41] hover:underline"
                    >
                      <CheckCheck className="h-3 w-3" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifLoading ? (
                    <p className="p-4 text-sm text-gray-500">Loading...</p>
                  ) : notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No notifications</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.notification_id}
                        className={`px-4 py-3 border-b text-sm hover:bg-gray-50 transition-colors ${
                          !n.isRead ? "bg-blue-50" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{n.title}</p>
                            <p className="text-gray-600 text-xs mt-1">{n.message}</p>
                            <p className="text-gray-400 text-xs mt-1">
                              {new Date(n.createdAt).toLocaleString()}
                            </p>
                          </div>
                          {!n.isRead && (
                            <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                          )}
                        </div>

                        {!n.isRead && (
                          <button
                            onClick={() => markAsRead(n.notification_id)}
                            className="mt-2 text-xs text-[#CE9F41] hover:underline"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* User icon */}
            <button
              onClick={() => {
                setUserOpen((prev) => !prev);
                setNotifOpen(false);
              }}
              className="rounded-full p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#CE9F41]"
            >
              <User className="h-5 w-5 text-gray-600" />
            </button>

            {userOpen && (
              <div
                ref={menuRef}
                className="absolute right-0 top-12 w-48 rounded-xl border border-gray-200 bg-white shadow-xl z-50 animate-fadeIn"
              >
                <button
                  onClick={() => {
                    setUserOpen(false);
                    setIsChangePasswordOpen(true);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-t-xl"
                >
                  Change Password
                </button>
                <hr className="border-gray-200" />
                <button
                  onClick={() => {
                    setUserOpen(false);
                    logout();
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-b-xl"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="pt-20 h-[calc(100vh)] overflow-y-auto p-6">{children}</main>
      </div>

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        onSubmit={handleChangePassword}
      />

      <style jsx global>{`
        html,
        body {
          height: 100%;
        }
        body {
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}