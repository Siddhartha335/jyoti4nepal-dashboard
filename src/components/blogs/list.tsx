"use client";

import React, { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import Link from "next/link";

type BlogRow = {
  id: string;
  title: string;
  status: "Published" | "Draft" | "Scheduled";
  author: string;
  date: string; // ISO or YYYY-MM-DD
  views: number;
};

const STATUS_STYLES: Record<
  BlogRow["status"],
  { wrap: string; dot: string; text: string }
> = {
  Published: {
    wrap: "bg-[#F2E8D4] text-[#7B5B12] border border-[#E6D8BB]",
    dot: "bg-[#CE9F41]",
    text: "Published",
  },
  Draft: {
    wrap: "bg-gray-100 text-gray-600 border border-gray-200",
    dot: "bg-gray-400",
    text: "Draft",
  },
  Scheduled: {
    wrap: "bg-[#F2E8D4] text-[#7B5B12] border border-[#E6D8BB]",
    dot: "bg-[#CE9F41]",
    text: "Scheduled",
  },
};

const MOCK_DATA: BlogRow[] = [
  {
    id: "1",
    title: "Sustainable Fashion Revolution",
    status: "Published",
    author: "Admin",
    date: "2024-01-15",
    views: 1234,
  },
  {
    id: "2",
    title: "Artisan Spotlight: Sita Story",
    status: "Draft",
    author: "Admin",
    date: "2024-01-10",
    views: 0,
  },
  {
    id: "3",
    title: "Impact Report 2023",
    status: "Scheduled",
    author: "Admin",
    date: "2024-01-20",
    views: 0,
  },
];

const ListPage = () => {
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return MOCK_DATA;
    return MOCK_DATA.filter((r) => r.title.toLowerCase().includes(query));
  }, [q]);

  return (
    <div className="mt-2">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Blog Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          Create and manage your blog posts
        </p>
      </div>

      {/* Top actions: search + button */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search blogs"
            className="w-full rounded-xl border border-gray-200 bg-[#78788029] pl-9 pr-3 py-1.5 text-sm outline-none ring-0 placeholder:text-gray-400 focus:border-gray-300"
          />
        </div>

        <Link href={"/blogs/create"}>
            <button
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#CE9F41] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-95"          
            >
            <Plus className="h-4 w-4" />
            New Blog Post
            </button>
        </Link>
      </div>

      {/* Table container */}
      <div className="rounded-2xl border border-gray-200 bg-[#F7F6F3] p-2 sm:p-3">
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-sm text-gray-600">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Author</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Views</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const s = STATUS_STYLES[r.status];
                return (
                  <tr key={r.id} className="align-middle">
                    <td className="rounded-l-xl bg-white px-4 py-4 text-sm font-medium text-gray-900 shadow-sm">
                      {r.title}
                    </td>
                    <td className="bg-white px-4 py-4 text-sm shadow-sm">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${s.wrap}`}
                      >
                        <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                        {s.text}
                      </span>
                    </td>
                    <td className="bg-white px-4 py-4 text-sm text-gray-700 shadow-sm">
                      {r.author}
                    </td>
                    <td className="bg-white px-4 py-4 text-sm text-gray-700 shadow-sm">
                      {r.date}
                    </td>
                    <td className="bg-white px-4 py-4 text-sm text-gray-700 shadow-sm">
                      {r.views.toLocaleString()}
                    </td>
                    <td className="rounded-r-xl bg-white px-4 py-4 text-sm shadow-sm">
                      <button
                        className="text-[#7B5B12] underline underline-offset-2 hover:opacity-80"
                        onClick={() => alert(`Open actions for ${r.title}`)}
                      >
                        Actions
                      </button>
                    </td>
                  </tr>
                );
              })}

              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="rounded-xl bg-white px-4 py-10 text-center text-sm text-gray-500 shadow-sm"
                  >
                    No blogs found. Try a different search.
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

export default ListPage;
