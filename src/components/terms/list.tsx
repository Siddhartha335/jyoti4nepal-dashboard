"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpWideNarrow,
  ArrowDownWideNarrow,
} from "lucide-react";
import Link from "next/link";
import { useList, CrudFilters, useDelete } from "@refinedev/core";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import DeleteConfirmModal from "@components/DeleteModal";

type TermRow = {
  term_id: string;
  title: string;
  content: string;
  status: "Published" | "Draft";
  author: {
    user_id: string;
    username: string | null;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
};

const STATUS_STYLES: Record<
  TermRow["status"],
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
};

// Debounce helper
function useDebounced<T>(value: T, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

const ListTerms = () => {
  const router = useRouter();

  // Filters, pagination, sorting
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounced(searchQuery, 400);
  const [statusFilter, setStatusFilter] = useState<"all" | "Published" | "Draft">("all");
  const [sortField, setSortField] = useState<"title" | "createdAt">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Delete modal
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    termId: string | null;
    termTitle: string;
  }>({
    isOpen: false,
    termId: null,
    termTitle: "",
  });

  const { mutate: deleteTerm, isLoading: isDeleting } = useDelete();

  // Filters
  const filters: CrudFilters = useMemo(() => {
    const f: CrudFilters = [];
    if (statusFilter !== "all") {
      f.push({ field: "status", operator: "eq", value: statusFilter });
    }
    if (debouncedSearch.trim()) {
      f.push({ field: "q", operator: "contains", value: debouncedSearch.trim() });
    }
    return f;
  }, [statusFilter, debouncedSearch]);

  // Fetch data
  const { data, isLoading, isError, refetch } = useList<TermRow>({
    resource: "term",
    pagination: { current: currentPage, pageSize },
    sorters: [{ field: sortField, order: sortOrder }],
    filters: filters.length > 0 ? filters : undefined,
    queryOptions: { keepPreviousData: true },
  });

  const terms = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const openDeleteModal = (id: string, title: string) =>
    setDeleteModal({ isOpen: true, termId: id, termTitle: title });

  const closeDeleteModal = () =>
    setDeleteModal({ isOpen: false, termId: null, termTitle: "" });

  const confirmDelete = () => {
    if (!deleteModal.termId) return;
    deleteTerm(
      { resource: "term", id: deleteModal.termId },
      {
        onSuccess: () => {
          toast.success("Term deleted successfully");
          closeDeleteModal();
          refetch();
        },
        onError: (err) => {
          console.error(err);
          toast.error("Failed to delete term");
        },
      }
    );
  };

  return (
    <div className="mt-2">
      {/* Delete Modal */}
      <DeleteConfirmModal
        title="Term"
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        blogTitle={deleteModal.termTitle}
        isDeleting={isDeleting}
      />

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Terms & Conditions Management
          </h1>
          <p className="text-sm text-gray-600">
            Create and manage your terms and conditions
          </p>
        </div>

        <Link href="/terms/create">
          <button className="flex items-center gap-2 rounded-xl bg-[#CE9F41] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-95">
            <Plus className="h-4 w-4" />
            Add Terms
          </button>
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Search */}
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search terms..."
            className="w-full rounded-xl border border-gray-200 bg-white/60 pl-9 pr-3 py-2 text-sm outline-none ring-0 placeholder:text-gray-400 focus:border-gray-300"
          />
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Status:</span>
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

        {/* Page size */}
        <select
          value={pageSize}
          onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800"
        >
          {[10, 20, 50].map((n) => (
            <option key={n} value={n}>
              {n} / page
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 bg-[#F7F6F3] p-2 sm:p-3">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2 text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="px-4 py-3 font-medium w-[40%]">
                  <button
                    onClick={() => handleSort("title")}
                    className="inline-flex items-center gap-1 hover:text-gray-900 transition"
                  >
                    Title
                    {sortField === "title" &&
                      (sortOrder === "asc" ? (
                        <ArrowUpWideNarrow className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowDownWideNarrow className="h-3.5 w-3.5" />
                      ))}
                  </button>
                </th>
                <th className="px-4 py-3 font-medium w-[15%]">Status</th>
                <th className="px-4 py-3 font-medium w-[20%]">Author</th>
                <th className="px-4 py-3 font-medium w-[15%]">
                  <button
                    onClick={() => handleSort("createdAt")}
                    className="inline-flex items-center gap-1 hover:text-gray-900 transition"
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
                <th className="px-4 py-3 font-medium w-[10%]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td
                    colSpan={5}
                    className="bg-white px-4 py-10 text-center text-gray-500 rounded-xl shadow-sm"
                  >
                    Loading terms...
                  </td>
                </tr>
              )}

              {isError && (
                <tr>
                  <td
                    colSpan={5}
                    className="bg-white px-4 py-10 text-center text-red-500 rounded-xl shadow-sm"
                  >
                    Error loading terms.
                  </td>
                </tr>
              )}

              {!isLoading &&
                !isError &&
                terms.map((term) => {
                  const s = STATUS_STYLES[term.status];
                  return (
                    <tr key={term.term_id}>
                      <td className="rounded-l-xl bg-white px-4 py-3 shadow-sm text-gray-900 font-medium">
                        {term.title}
                      </td>
                      <td className="bg-white px-4 py-3 shadow-sm">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${s.wrap}`}
                        >
                          <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                          {s.text}
                        </span>
                      </td>
                      <td className="bg-white px-4 py-3 shadow-sm text-gray-700">
                        {term.author?.username || term.author?.email || "Unknown"}
                      </td>
                      <td className="bg-white px-4 py-3 shadow-sm text-gray-600">
                        {formatDate(term.createdAt)}
                      </td>
                      <td className="rounded-r-xl bg-white px-4 py-3 shadow-sm">
                        <div className="flex gap-2 text-xs">
                          <button
                            onClick={() => router.push(`/terms/${term.term_id}`)}
                            className="text-[#7B5B12] underline hover:opacity-80"
                          >
                            View
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => router.push(`/terms/${term.term_id}/edit`)}
                            className="text-[#7B5B12] underline hover:opacity-80"
                          >
                            Edit
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() =>
                              openDeleteModal(term.term_id, term.title)
                            }
                            className="text-red-600 hover:opacity-80 underline underline-offset-2"
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
        {!isLoading && !isError && totalPages > 1 && (
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between px-2 text-sm text-gray-600">
            <span>
              Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, total)} of {total}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListTerms;
