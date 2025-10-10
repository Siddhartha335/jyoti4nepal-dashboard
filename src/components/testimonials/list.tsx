"use client";

import React, { useMemo, useState } from "react";
import { Plus, Search, Star } from "lucide-react";
import Link from "next/link";

type Testimonial = {
  id: string;
  name: string;
  role?: "Scheduled" | "Partner";
  content: string;
  rating: 1 | 2 | 3 | 4 | 5;
  featured?: "Scheduled" | "Featured";
  status: "Pending" | "Approved";
};

const MOCK: Testimonial[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    role: "Scheduled",
    content: "Amazing sustainable fashion choices!",
    rating: 5,
    featured: "Scheduled",
    status: "Pending",
  },
  {
    id: "2",
    name: "Green Corp",
    role: "Partner",
    content: "Great partnership experience.",
    rating: 5,
    featured: "Featured",
    status: "Approved",
  },
  {
    id: "3",
    name: "Sarah Johnson",
    role: "Scheduled",
    content: "Amazing sustainable fashion choices!",
    rating: 5,
    featured: "Scheduled",
    status: "Approved",
  },
  {
    id: "4",
    name: "Sarah Johnson",
    role: "Scheduled",
    content: "Amazing sustainable fashion choices!",
    rating: 5,
    featured: "Scheduled",
    status: "Approved",
  },
];

const Badge = ({
  label,
  tone = "gold",
  subtle = false,
}: {
  label: string;
  tone?: "gold" | "gray";
  subtle?: boolean;
}) => {
  const styles =
    tone === "gold"
      ? "bg-[#F2E8D4] text-[#7B5B12] border border-[#E6D8BB]"
      : "bg-white text-gray-700 border border-gray-200";
  const extra = subtle ? "bg-white text-gray-700 border border-gray-200" : styles;

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${extra}`}>
      {label}
    </span>
  );
};

const Stars = ({ value }: { value: number }) => (
  <div className="flex items-center gap-1">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < value ? "fill-[#CE9F41] text-[#CE9F41]" : "text-gray-300"}`}
      />
    ))}
  </div>
);

const listTestimonials = () => {
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return MOCK;
    return MOCK.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.content.toLowerCase().includes(query)
    );
  }, [q]);

  return (
    <div className="mt-2">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Testimonials Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage customer and partner testimonials
        </p>
      </div>

      {/* Top actions */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search testimonials"
            className="w-full rounded-full border border-gray-200 bg-white pl-10 pr-3 py-2.5 text-sm outline-none ring-0 placeholder:text-gray-400 focus:border-gray-300"
          />
        </div>

        <Link href={"/testimonials/create"}>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#CE9F41] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-95"
          >
            <Plus className="h-4 w-4" />
            New Testimonials
          </button>
        </Link>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 bg-[#F7F6F3] p-2 sm:p-3">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-3">
            <thead>
              <tr className="text-left text-sm text-gray-600">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Content</th>
                <th className="px-5 py-3 font-medium">Rating</th>
                <th className="px-5 py-3 font-medium">Featured</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((t) => (
                <tr key={t.id} className="align-middle">
                  <td className="rounded-l-xl bg-white px-5 py-4 text-sm text-gray-900 shadow-sm">
                    {t.name}
                  </td>
                  <td className="bg-white px-5 py-4 text-sm shadow-sm">
                    {t.role && (
                      <Badge
                        label={t.role}
                        tone={t.role === "Partner" ? "gray" : "gold"}
                        subtle={t.role === "Partner"}
                      />
                    )}
                  </td>
                  <td className="bg-white px-5 py-4 text-sm text-gray-800 shadow-sm">
                    {t.content}
                  </td>
                  <td className="bg-white px-5 py-4 text-sm shadow-sm">
                    <Stars value={t.rating} />
                  </td>
                  <td className="bg-white px-5 py-4 text-sm shadow-sm">
                    {t.featured && <Badge label={t.featured} />}
                  </td>
                  <td className="bg-white px-5 py-4 text-sm shadow-sm">
                    <Badge
                      label={t.status}
                      tone={t.status === "Approved" ? "gold" : "gray"}
                      subtle={t.status === "Pending"}
                    />
                  </td>
                  <td className="rounded-r-xl bg-white px-5 py-4 text-sm shadow-sm">
                    <button
                      className="text-[#7B5B12] underline underline-offset-2 hover:opacity-80"
                      onClick={() => alert(`Actions for ${t.name}`)}
                    >
                      Actions
                    </button>
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="rounded-xl bg-white px-5 py-10 text-center text-sm text-gray-500 shadow-sm"
                  >
                    No testimonials found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default listTestimonials;
