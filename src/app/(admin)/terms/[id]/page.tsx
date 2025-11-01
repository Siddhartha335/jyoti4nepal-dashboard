"use client";

import React from "react";
import { useShow } from "@refinedev/core";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Clock, User, CheckCircle, FileText } from "lucide-react";

const ViewTerm = () => {
  const router = useRouter();
  const params = useParams();
  const termId = params?.id as string;

  const { queryResult } = useShow({
    resource: "term",
    id: termId,
  });

  const { data, isLoading, isError } = queryResult;
  const term = data?.data;

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center text-gray-500">
        Loading term details...
      </div>
    );
  }

  if (isError || !term) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center text-gray-600">
        <FileText className="h-12 w-12 text-gray-400 mb-3" />
        <p className="text-sm">Term not found or failed to load.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-sm text-[#CE9F41] hover:underline"
        >
          ← Go Back
        </button>
      </div>
    );
  }

  const formatDate = (dateString?: string) =>
    dateString
      ? new Date(dateString).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "—";

  const isPublished = term.status === "Published";

  return (
    <div className="mx-auto max-w-4xl px-3 sm:px-6 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
            isPublished
              ? "bg-[#F2E8D4] text-[#7B5B12] border border-[#E6D8BB]"
              : "bg-gray-100 text-gray-600 border border-gray-200"
          }`}
        >
          {isPublished ? (
            <CheckCircle className="h-3.5 w-3.5 text-[#CE9F41]" />
          ) : (
            <Clock className="h-3.5 w-3.5 text-gray-400" />
          )}
          {term.status}
        </div>
      </div>

      {/* Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-900 leading-tight">
          {term.title}
        </h1>

        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1.5">
            <User className="h-4 w-4" />
            <span>
              {term.author && typeof term.author === "object"
                        ? term.author.username || term.author.email || "Unknown Author"
                        : term.author}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>{formatDate(term.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="rounded-2xl border border-[#E1DED1] bg-[#F7F6F3] p-6 shadow-sm">
        <div
          className="prose prose-sm sm:prose max-w-none text-gray-800"
          dangerouslySetInnerHTML={{ __html: term.content }}
        />
      </div>

      {/* Metadata footer */}
      <div className="mt-6 text-xs text-gray-500 flex justify-between">
        <span>Created: {formatDate(term.createdAt)}</span>
        <span>Last updated: {formatDate(term.updatedAt)}</span>
      </div>
    </div>
  );
};

export default ViewTerm;
