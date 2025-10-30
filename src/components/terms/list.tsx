"use client";

import React from "react";
import { Plus, Search } from "lucide-react";
import Link from "next/link";

const ListTerms = () => {
  const terms = [
    {
      id: 1,
      title: "Privacy",
      status: "Published",
      author: "Admin",
      date: "2024-01-15",
    },
    {
      id: 2,
      title: "Acceptance of Terms",
      status: "Draft",
      author: "Admin",
      date: "2024-01-10",
    },
  ];

  return (
    <div >
    {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-gray-900">
            Terms & Conditions Management
          </h1>
          <p className="text-sm text-[#65421E]">
            Create and manage your terms and conditions
          </p>
        </div>

        <Link href={"/terms/create"}>
            <button className="flex items-center gap-2 rounded-lg bg-[#CE9F41] px-4 py-2 text-sm font-semibold text-white hover:brightness-95">
                <Plus className="h-4 w-4" />
                New Terms
            </button>
        </Link>
      </div>
      {/* Search Bar */}
      <div className="mb-5 max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search terms"
            className="w-full rounded-full border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-gray-300"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-[#E1DED1] bg-[#F7F6F3] p-5 shadow-sm">
        <table className="w-full text-left text-sm text-gray-700">
          <thead>
            <tr className="border-b border-gray-200 text-gray-600">
              <th className="py-2 font-semibold">Title</th>
              <th className="py-2 font-semibold">Status</th>
              <th className="py-2 font-semibold">Author</th>
              <th className="py-2 font-semibold">Date</th>
              <th className="py-2 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {terms.map((term) => (
              <tr
                key={term.id}
                className="border-b border-gray-200 hover:bg-white/60 transition"
              >
                <td className="py-5">{term.title}</td>
                <td className="py-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      term.status === "Published"
                        ? "bg-[#F5EBD1] text-[#9A7B28]"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {term.status}
                  </span>
                </td>
                <td className="py-3 text-gray-700">{term.author}</td>
                <td className="py-3 text-gray-600">{term.date}</td>
                <td className="py-3">
                  <button className="text-[#CE9F41] font-medium hover:underline">
                    Actions
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListTerms;
