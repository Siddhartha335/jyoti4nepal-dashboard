"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { useOne } from "@refinedev/core";
import { ArrowLeft, Calendar, Tag, Eye, Edit, Trash2 } from "lucide-react";
import Link from "next/link";

type FaqData = {
  faq_id: string;
  question: string;
  answer: string;
  category: "General" | "Shipping" | "Returns" | "Ethics";
  status: "Published" | "Draft";
  display_order: number;
  createdAt: string;
  updatedAt: string;
};

const STATUS_STYLES: Record<FaqData["status"], { wrap: string; dot: string; text: string }> = {
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
};

const CATEGORY_STYLES: Record<FaqData["category"], string> = {
  General: "bg-blue-50 text-blue-700 border-blue-200",
  Shipping: "bg-green-50 text-green-700 border-green-200",
  Returns: "bg-orange-50 text-orange-700 border-orange-200",
  Ethics: "bg-purple-50 text-purple-700 border-purple-200",
};

const ViewFaqPage = () => {
  const router = useRouter();
  const params = useParams();
  const faqId = params?.id as string;

  const { data, isLoading, isError } = useOne<FaqData>({
    resource: "faq",
    id: faqId,
  });

  const faq = data?.data;

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#CE9F41] border-r-transparent"></div>
          <p className="mt-4 text-sm text-gray-600">Loading FAQ...</p>
        </div>
      </div>
    );
  }

  if (isError || !faq) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 font-medium">Failed to load FAQ</p>
          <button
            onClick={() => router.push("/faq")}
            className="mt-4 text-[#CE9F41] hover:underline text-sm"
          >
            ← Back to FAQ list
          </button>
        </div>
      </div>
    );
  }

  const statusStyle = STATUS_STYLES[faq.status];
  const categoryStyle = CATEGORY_STYLES[faq.category];

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/faq")}
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to FAQs
        </button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusStyle.wrap}`}
              >
                <span className={`h-2 w-2 rounded-full ${statusStyle.dot}`} />
                {statusStyle.text}
              </span>
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${categoryStyle}`}>
                {faq.category}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{faq.question}</h1>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/faq/${faq.faq_id}/edit`}>
              <button className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
                <Edit className="h-4 w-4" />
                Edit
              </button>
            </Link>
            <button className="inline-flex items-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition">
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="rounded-2xl border border-gray-200 bg-[#F7F6F3] p-6 sm:p-8 shadow-sm mb-6">
        {/* Answer Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-[#65421E] mb-4">Answer</h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{faq.answer}</p>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
          {/* Display Order */}
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#CE9F41]/10">
              <Eye className="h-5 w-5 text-[#CE9F41]" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Display Order</p>
              <p className="text-lg font-semibold text-gray-900">{faq.display_order}</p>
            </div>
          </div>

          {/* Category */}
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#CE9F41]/10">
              <Tag className="h-5 w-5 text-[#CE9F41]" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Category</p>
              <p className="text-lg font-semibold text-gray-900">{faq.category}</p>
            </div>
          </div>

          {/* Created Date */}
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#CE9F41]/10">
              <Calendar className="h-5 w-5 text-[#CE9F41]" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Created</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(faq.createdAt)}</p>
            </div>
          </div>

          {/* Updated Date */}
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#CE9F41]/10">
              <Calendar className="h-5 w-5 text-[#CE9F41]" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Last Updated</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(faq.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ ID Info Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">FAQ ID</p>
            <p className="mt-1 text-sm font-mono text-gray-700">{faq.faq_id}</p>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(faq.faq_id);
            }}
            className="text-xs text-[#CE9F41] hover:underline font-medium"
          >
            Copy ID
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewFaqPage;