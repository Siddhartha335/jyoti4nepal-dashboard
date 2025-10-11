"use client";

import React, { useMemo, useState } from "react";
import { Eye, Users, MousePointerClick, Plus, Search } from "lucide-react";
import Link from "next/link";

const mockPopups = [
  {
    id: 1,
    title: "New Collection Launch",
    type: "Promotion",
    status: "Active",
    start: "2024-01-01",
    end: "2024-01-31",
    views: 1250,
    clicks: 45,
    target: "all",
  },
  {
    id: 2,
    title: "Special Offer",
    type: "Discount",
    status: "Scheduled",
    start: "2024-01-01",
    end: "2024-01-31",
    views: 0,
    clicks: 0,
    target: "returning",
  },
];

type Tone = "neutral" | "amber" | "green" | "slate";
const Badge = ({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) => {
  const tones: Record<Tone, string> = {
    neutral: "border-neutral-300 bg-neutral-100 text-neutral-700",
    amber: "border-amber-300 bg-amber-100 text-amber-800",
    green: "border-green-300 bg-green-100 text-green-800",
    slate: "border-slate-300 bg-slate-100 text-slate-800",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${tones[tone]}`}>
      {children}
    </span>
  );
};

const StatCard = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
}) => (
  <div className="flex flex-1 items-center justify-between rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
    <div>
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-neutral-900">{value}</p>
    </div>
    <div className="rounded-lg bg-neutral-50 p-3">
      <Icon className="h-5 w-5 text-neutral-600" />
    </div>
  </div>
);

export default function ListPopup() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mockPopups;
    return mockPopups.filter((p) =>
      [p.title, p.type, p.status, p.target].some((v) => v.toLowerCase().includes(q))
    );
  }, [query]);

  const totals = useMemo(() => {
    const active = mockPopups.filter((p) => p.status === "Active").length;
    const views = mockPopups.reduce((a, b) => a + (b.views || 0), 0);
    const clicks = mockPopups.reduce((a, b) => a + (b.clicks || 0), 0);
    return { active, views, clicks };
  }, []);

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Pop-up Management</h1>
          <p className="mt-1 text-sm text-neutral-600">Create and manage website pop-ups</p>
        </div>
        <Link href={"/popup/create"}>
            <button className="inline-flex items-center gap-2 rounded-lg bg-[#CE9F41] px-3 py-2 text-sm font-semibold text-white shadow-sm transition">
                <Plus className="h-4 w-4" /> New Pop-up
            </button>
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard icon={Eye} label="Active Pop-ups" value={totals.active} />
        <StatCard icon={Users} label="Total Views" value={totals.views.toLocaleString()} />
        <StatCard icon={MousePointerClick} label="Total Clicks" value={totals.clicks} />
      </div>

      {/* Search */}
      <div className="mt-4">
        <label className="relative block max-w-md">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <Search className="h-4 w-4 text-neutral-400" />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pop-ups"
            className="w-full rounded-lg border border-neutral-300 bg-white py-2.5 pl-9 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-200"
          />
        </label>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full table-fixed">
            {/* 8 columns with fixed proportions (3:2:2:2:1:1:1:1) */}
            <colgroup>
              <col style={{ width: "18%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "7%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "10%" }} />
            </colgroup>

            <thead className="bg-neutral-50 text-[11px] uppercase tracking-wide text-neutral-600">
              <tr className="border-b border-neutral-200">
                <th className="px-4 py-2 text-left font-semibold">Title</th>
                <th className="px-2 py-2 text-left font-semibold">Type</th>
                <th className="px-2 py-2 text-left font-semibold">Status</th>
                <th className="px-2 py-2 text-left font-semibold">Duration</th>
                <th className="px-2 py-2 text-right font-semibold">Views</th>
                <th className="px-2 py-2 text-right font-semibold">Clicks</th>
                <th className="px-2 py-2 text-center font-semibold">Target</th>
                <th className="px-4 py-2 text-right font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="text-sm">
              {filtered.map((p) => (
                <tr key={p.id} className="border-t border-neutral-200">
                  <td className="px-4 py-3 text-neutral-900">
                    <span className="block truncate">{p.title}</span>
                    {/* optional actions-under-title line */}
                    {/* <span className="mt-0.5 block text-xs font-medium text-amber-700">Actions</span> */}
                  </td>
                  <td className="px-2 py-3">
                    <Badge tone="amber">{p.type}</Badge>
                  </td>
                  <td className="px-2 py-3">
                    {p.status === "Active" ? (
                      <Badge tone="green">Active</Badge>
                    ) : (
                      <Badge tone="slate">Scheduled</Badge>
                    )}
                  </td>
                  <td className="px-2 py-3 text-neutral-700">
                    {p.start} <span className="text-neutral-400">to</span> {p.end}
                  </td>
                  <td className="px-2 py-3 text-right text-neutral-900">
                    {p.views.toLocaleString()}
                  </td>
                  <td className="px-2 py-3 text-right text-neutral-900">{p.clicks}</td>
                  <td className="px-2 py-3 text-center">
                    <Badge>{p.target}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-amber-700">Actions</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
