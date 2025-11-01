"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Plus, Search, ChevronLeft, ChevronRight, ArrowUpWideNarrow, ArrowDownWideNarrow } from "lucide-react";
import Link from "next/link";
import { useList, CrudFilters, useDelete } from "@refinedev/core";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import DeleteConfirmModal from "@components/DeleteModal";

type FaqRow = {
  faq_id: string;
  question: string;
  answer: string;
  category: "General" | "Shipping" | "Returns" | "Ethics";
  status: "Published" | "Draft";
  display_order: number;
  createdAt: string;
  updatedAt: string;
};

const STATUS_STYLES: Record<FaqRow["status"], { wrap: string; dot: string; text: string }> = {
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

const CATEGORY_STYLES: Record<FaqRow["category"], string> = {
  General: "bg-blue-50 text-blue-700 border-blue-200",
  Shipping: "bg-green-50 text-green-700 border-green-200",
  Returns: "bg-orange-50 text-orange-700 border-orange-200",
  Ethics: "bg-purple-50 text-purple-700 border-purple-200",
};

// small debounce helper
function useDebounced<T>(value: T, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

const ListFaq = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounced(searchQuery, 400);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [statusFilter, setStatusFilter] = useState<"all" | "Published" | "Draft">("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | FaqRow["category"]>("all");
  const [sortField, setSortField] = useState<"question" | "display_order" | "createdAt" | "updatedAt">("display_order");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    faqId: string | null;
    faqQuestion: string;
  }>({
    isOpen: false,
    faqId: null,
    faqQuestion: "",
  });

  // Initialize delete hook
  const { mutate: deleteFaq, isLoading: isDeleting } = useDelete();

  // Build filters array
  const filters: CrudFilters = useMemo(() => {
    const f: CrudFilters = [];
    if (statusFilter !== "all") {
      f.push({ field: "status", operator: "eq", value: statusFilter });
    }
    if (categoryFilter !== "all") {
      f.push({ field: "category", operator: "eq", value: categoryFilter });
    }
    if (debouncedSearch.trim()) {
      f.push({ field: "q", operator: "contains", value: debouncedSearch.trim() });
    }
    return f;
  }, [statusFilter, categoryFilter, debouncedSearch]);

  // Fetch FAQs using Refine's useList hook
  const { data, isLoading, isError, refetch } = useList<FaqRow>({
    resource: "faq",
    pagination: {
      current: currentPage,
      pageSize: pageSize,
    },
    sorters: [{ field: sortField, order: sortOrder }],
    filters: filters.length > 0 ? filters : undefined,
    queryOptions: {
      keepPreviousData: true,
    },
  });

  const faqs = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder(field === "display_order" ? "asc" : "desc");
    }
  };

  // whenever filters/sort/pageSize change, reset to page 1
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, categoryFilter, debouncedSearch, sortField, sortOrder, pageSize]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const openDeleteModal = (id: string, question: string) => {
    setDeleteModal({ isOpen: true, faqId: id, faqQuestion: question });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, faqId: null, faqQuestion: "" });
  };

  const confirmDelete = () => {
    if (!deleteModal.faqId) return;
    deleteFaq(
      { resource: "faq", id: deleteModal.faqId },
      {
        onSuccess: () => {
          toast.success("FAQ deleted successfully");
          closeDeleteModal();
          refetch();
        },
        onError: (error) => {
          console.error("Delete error:", error);
          toast.error("Failed to delete FAQ");
        },
      },
    );
  };

  return (
    <div className="mt-2">
      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        title="FAQ"
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        blogTitle={deleteModal.faqQuestion}
        isDeleting={isDeleting}
      />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">FAQ Management</h1>
        <p className="mt-1 text-sm text-gray-600">Manage frequently asked questions and answers</p>
      </div>

      {/* Filters & Actions */}
      <div className="mb-4 flex flex-col gap-3">
        {/* Search and New Button */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search FAQs by question or answer..."
              className="w-full rounded-xl border border-gray-200 bg-white/60 pl-9 pr-3 py-2 text-sm outline-none ring-0 placeholder:text-gray-400 focus:border-gray-300"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Page size selector */}
            <select
              value={pageSize}
              onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800"
              title="Items per page"
            >
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>

            <Link href="/faq/create">
              <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#CE9F41] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 whitespace-nowrap">
                <Plus className="h-4 w-4" />
                Add FAQ
              </button>
            </Link>
          </div>
        </div>

        {/* Status & Category Filters */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <div className="flex gap-2">
              {(["all", "Published", "Draft"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    statusFilter === status
                      ? "bg-[#CE9F41] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {status === "all" ? "All" : status}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Category:</span>
            <div className="flex gap-2 flex-wrap">
              {(["all", "General", "Shipping", "Returns", "Ethics"] as const).map((category) => (
                <button
                  key={category}
                  onClick={() => setCategoryFilter(category)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    categoryFilter === category
                      ? "bg-[#CE9F41] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {category === "all" ? "All" : category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table container */}
      <div className="rounded-2xl border border-gray-200 bg-[#F7F6F3] p-2 sm:p-3">
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-sm text-gray-600">
                <th className="px-4 py-3 font-medium w-[35%]">
                  <button
                    onClick={() => handleSort("question")}
                    className="inline-flex items-center gap-1 hover:text-gray-900 transition"
                    title={`Sort by Question (${sortField === "question" ? sortOrder : "desc"})`}
                  >
                    Question
                    {sortField === "question" &&
                      (sortOrder === "asc" ? (
                        <ArrowUpWideNarrow className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowDownWideNarrow className="h-3.5 w-3.5" />
                      ))}
                  </button>
                </th>
                <th className="px-4 py-3 font-medium w-[12%]">Category</th>
                <th className="px-4 py-3 font-medium w-[10%]">Status</th>
                <th className="px-4 py-3 font-medium w-[8%]">
                  <button
                    onClick={() => handleSort("display_order")}
                    className="inline-flex items-center gap-1 hover:text-gray-900 transition"
                    title={`Sort by Order (${sortField === "display_order" ? sortOrder : "asc"})`}
                  >
                    Order
                    {sortField === "display_order" &&
                      (sortOrder === "asc" ? (
                        <ArrowUpWideNarrow className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowDownWideNarrow className="h-3.5 w-3.5" />
                      ))}
                  </button>
                </th>
                <th className="px-4 py-3 font-medium w-[12%]">
                  <button
                    onClick={() => handleSort("createdAt")}
                    className="inline-flex items-center gap-1 hover:text-gray-900 transition"
                    title={`Sort by Created (${sortField === "createdAt" ? sortOrder : "desc"})`}
                  >
                    Created
                    {sortField === "createdAt" &&
                      (sortOrder === "asc" ? (
                        <ArrowUpWideNarrow className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowDownWideNarrow className="h-3.5 w-3.5" />
                      ))}
                  </button>
                </th>
                <th className="px-4 py-3 font-medium w-[13%]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="rounded-xl bg-white px-4 py-10 text-center text-sm text-gray-500 shadow-sm">
                    Loading FAQs...
                  </td>
                </tr>
              )}

              {isError && (
                <tr>
                  <td colSpan={6} className="rounded-xl bg-white px-4 py-10 text-center text-sm text-red-500 shadow-sm">
                    Error loading FAQs. Please try again.
                  </td>
                </tr>
              )}

              {!isLoading && !isError && faqs.length === 0 && (
                <tr>
                  <td colSpan={6} className="rounded-xl bg-white px-4 py-10 text-center text-sm text-gray-500 shadow-sm">
                    No FAQs found. Try a different search or create a new FAQ.
                  </td>
                </tr>
              )}

              {!isLoading &&
                !isError &&
                faqs.map((faq) => {
                  const s = STATUS_STYLES[faq.status];
                  const c = CATEGORY_STYLES[faq.category];
                  return (
                    <tr key={faq.faq_id} className="align-middle">
                      <td className="rounded-l-xl bg-white px-4 py-4 text-sm font-medium text-gray-900 shadow-sm">
                        <div className="line-clamp-2">{faq.question}</div>
                      </td>
                      <td className="bg-white px-4 py-4 text-sm shadow-sm">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${c}`}>
                          {faq.category}
                        </span>
                      </td>
                      <td className="bg-white px-4 py-4 text-sm shadow-sm">
                        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${s.wrap}`}>
                          <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                          {s.text}
                        </span>
                      </td>
                      <td className="bg-white px-4 py-4 text-sm text-gray-700 shadow-sm text-center">
                        {faq.display_order}
                      </td>
                      <td className="bg-white px-4 py-4 text-sm text-gray-700 shadow-sm">
                        {formatDate(faq.createdAt)}
                      </td>
                      <td className="rounded-r-xl bg-white px-4 py-4 text-sm shadow-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/faq/${faq.faq_id}`)}
                            className="text-[#7B5B12] hover:opacity-80 text-xs underline underline-offset-2"
                          >
                            View
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => router.push(`/faq/${faq.faq_id}/edit`)}
                            className="text-[#7B5B12] hover:opacity-80 text-xs underline underline-offset-2"
                          >
                            Edit
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => openDeleteModal(faq.faq_id, faq.question)}
                            className="text-red-600 hover:opacity-80 text-xs underline underline-offset-2"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && !isError && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-2">
            <div className="text-sm text-gray-600">
              Showing {faqs.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, total)} of {total} results
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`min-w-[32px] rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                          currentPage === pageNum
                            ? "bg-[#CE9F41] text-white"
                            : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListFaq;