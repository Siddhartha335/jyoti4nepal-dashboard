"use client";

import React from "react";
import { Plus } from "lucide-react";
import Link from "next/link";

const ListFaq = () => {
  const faqs = [
    {
      id: 1,
      question: "What is your return policy?",
      category: "General",
      status: "Published",
      created: "2024-01-15",
      order: 1,
    },
    {
      id: 2,
      question: "How do you ensure fair trade practices?",
      category: "Ethics",
      status: "Published",
      created: "2024-01-25",
      order: 2,
    },
    {
      id: 3,
      question: "How do you ensure fair trade practices?",
      category: "Shipping",
      status: "Draft",
      created: "2024-01-25",
      order: 2,
    },
  ];

  const publishedCount = faqs.filter((f) => f.status === "Published").length;

  return (
    <div>
        <div className="mb-6 flex items-center justify-between">
            <div>
            <h1 className="text-2xl font-light text-gray-900">FAQ Management</h1>
            <p className="text-sm text-[#65421E]">
                Manage frequently asked questions and answers
            </p>
            </div>

            <Link href={"/faq/create"}>
              <button className="flex items-center gap-2 rounded-lg bg-[#CE9F41] px-4 py-2 text-sm font-semibold text-white hover:brightness-95">
                <Plus className="h-4 w-4" />
                Add FAQ
              </button>
            </Link>
        </div>
      {/* Card */}
      <div className="rounded-lg border border-[#E1DED1] bg-[#F7F6F3] px-5 py-4 shadow-sm">
        <h2 className="text-lg font-semibold text-[#65421E] mb-1">FAQ Overview</h2>
        <p className="text-sm text-gray-600 mb-4">
          Total FAQs: {faqs.length} | Published: {publishedCount}
        </p>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700">
            <thead>
              <tr className="border-b border-gray-200 text-gray-600">
                <th className="py-2 font-semibold">Question</th>
                <th className="py-2 font-semibold">Category</th>
                <th className="py-2 font-semibold">Status</th>
                <th className="py-2 font-semibold">Created</th>
                <th className="py-2 font-semibold">Order</th>
                <th className="py-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {faqs.map((faq) => (
                <tr
                  key={faq.id}
                  className="hover:bg-white/60 transition border-b border-gray-200 text-gray-600 "
                >
                  <td className="py-5">{faq.question}</td>
                  <td className="py-3">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                      {faq.category}
                    </span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        faq.status === "Published"
                          ? "bg-[#F5EBD1] text-[#9A7B28]"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {faq.status}
                    </span>
                  </td>
                  <td className="py-3 text-gray-600">{faq.created}</td>
                  <td className="py-3">{faq.order}</td>
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
    </div>
  );
};

export default ListFaq;
