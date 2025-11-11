"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpWideNarrow,
  ArrowDownWideNarrow,
} from "lucide-react";
import { useList, CrudFilters, useDelete } from "@refinedev/core";
import toast from "react-hot-toast";
import DeleteConfirmModal from "@components/DeleteModal";

type TeamRow = {
  team_id: string;
  name: string;
  role: string;
  image: string | null;
  status: "Published" | "Draft";
  createdAt: string;
  updatedAt: string;
};

const STATUS_STYLES: Record<
  TeamRow["status"],
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

const ListTeams = () => {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounced(searchQuery, 400);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [statusFilter, setStatusFilter] = useState<
    "all" | "Published" | "Draft"
  >("all");

  const [sortField, setSortField] = useState<
    "name" | "role" | "createdAt" | "updatedAt"
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    teamId: null as string | null,
    teamName: "",
  });

  const { mutate: deleteTeam, isLoading: isDeleting } = useDelete();

  // --- Filters ---
  const filters: CrudFilters = useMemo(() => {
    const f: CrudFilters = [];
    if (statusFilter !== "all") {
      f.push({ field: "status", operator: "eq", value: statusFilter });
    }
    if (debouncedSearch.trim()) {
      f.push({
        field: "q",
        operator: "contains",
        value: debouncedSearch.trim(),
      });
    }
    return f;
  }, [statusFilter, debouncedSearch]);

  // --- Fetch ---
  const { data, isLoading, isError, refetch } = useList<TeamRow>({
    resource: "team",
    pagination: {
      current: currentPage,
      pageSize,
    },
    sorters: [{ field: sortField, order: sortOrder }],
    filters: filters.length > 0 ? filters : undefined,
    queryOptions: {
      keepPreviousData: true,
    },
  });

  const teams = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, debouncedSearch, sortField, sortOrder, pageSize]);

  const openDeleteModal = (id: string, name: string) => {
    setDeleteModal({ isOpen: true, teamId: id, teamName: name });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, teamId: null, teamName: "" });
  };

  const confirmDelete = () => {
    if (!deleteModal.teamId) return;

    deleteTeam(
      { resource: "teams", id: deleteModal.teamId },
      {
        onSuccess: () => {
          toast.success("Team member deleted successfully");
          closeDeleteModal();
          refetch();
        },
        onError: (error) => {
          console.error("Delete error:", error);
          toast.error("Failed to delete member");
        },
      }
    );
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="mt-2">
      {/* Delete Modal */}
      <DeleteConfirmModal
        title="Team Member"
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        blogTitle={deleteModal.teamName}
        isDeleting={isDeleting}
      />

      {/* Heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Team Management
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your team members
        </p>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3">
        {/* Search + Create Button */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search team members..."
              className="w-full rounded-xl border border-gray-200 bg-white/60 pl-9 pr-3 py-2 text-sm outline-none ring-0 placeholder:text-gray-400 focus:border-gray-300"
            />
          </div>

          {/* Page size + Create */}
          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => setPageSize(parseInt(e.target.value))}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800"
            >
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>

            <Link href="/teams/create">
              <button className="inline-flex items-center gap-2 rounded-xl bg-[#CE9F41] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-95 whitespace-nowrap">
                <Plus className="h-4 w-4" />
                Add Member
              </button>
            </Link>
          </div>
        </div>

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
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 bg-[#F7F6F3] p-2 sm:p-3">
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-sm text-gray-600">
                {/* NAME */}
                <th className="px-4 py-3 font-medium w-[35%]">
                  <button
                    onClick={() => handleSort("name")}
                    className="inline-flex items-center gap-1 hover:text-gray-900 transition"
                  >
                    Name
                    {sortField === "name" &&
                      (sortOrder === "asc" ? (
                        <ArrowUpWideNarrow className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowDownWideNarrow className="h-3.5 w-3.5" />
                      ))}
                  </button>
                </th>

                {/* ROLE */}
                <th className="px-4 py-3 font-medium w-[20%]">
                  <button
                    onClick={() => handleSort("role")}
                    className="inline-flex items-center gap-1 hover:text-gray-900 transition"
                  >
                    Role
                    {sortField === "role" &&
                      (sortOrder === "asc" ? (
                        <ArrowUpWideNarrow className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowDownWideNarrow className="h-3.5 w-3.5" />
                      ))}
                  </button>
                </th>

                {/* STATUS */}
                <th className="px-4 py-3 font-medium w-[15%]">Status</th>

                {/* CREATED */}
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

                {/* ACTIONS */}
                <th className="px-4 py-3 font-medium w-[15%]">Actions</th>
              </tr>
            </thead>

            <tbody>
              {/* Loading */}
              {isLoading && (
                <tr>
                  <td
                    colSpan={5}
                    className="rounded-xl bg-white px-4 py-10 text-center text-sm text-gray-500 shadow-sm"
                  >
                    Loading team members...
                  </td>
                </tr>
              )}

              {/* Error */}
              {isError && (
                <tr>
                  <td
                    colSpan={5}
                    className="rounded-xl bg-white px-4 py-10 text-center text-sm text-red-500 shadow-sm"
                  >
                    Error loading team.
                  </td>
                </tr>
              )}

              {/* Empty */}
              {!isLoading && !isError && teams.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="rounded-xl bg-white px-4 py-10 text-center text-sm text-gray-500 shadow-sm"
                  >
                    No team members found.
                  </td>
                </tr>
              )}

              {/* Rows */}
              {!isLoading &&
                !isError &&
                teams.map((t) => {
                  const s = STATUS_STYLES[t.status];
                  return (
                    <tr key={t.team_id} className="align-middle">
                      {/* NAME CELL */}
                      <td className="rounded-l-xl bg-white px-4 py-4 text-sm font-medium text-gray-900 shadow-sm">
                        <div className="flex items-center gap-3">
                          <img
                            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${t.image}`}
                            alt={t.name}
                            className="h-10 w-10 rounded-full object-cover border border-gray-200"
                          />
                          <div>
                            <div className="truncate">{t.name}</div>
                          </div>
                        </div>
                      </td>

                      {/* ROLE */}
                      <td className="bg-white px-4 py-4 text-sm text-gray-700 shadow-sm">
                        {t.role}
                      </td>

                      {/* STATUS */}
                      <td className="bg-white px-4 py-4 text-sm shadow-sm">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${s.wrap}`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${s.dot}`}
                          />
                          {s.text}
                        </span>
                      </td>

                      {/* CREATED */}
                      <td className="bg-white px-4 py-4 text-sm text-gray-700 shadow-sm">
                        {formatDate(t.createdAt)}
                      </td>

                      {/* ACTIONS */}
                      <td className="rounded-r-xl bg-white px-4 py-4 text-sm shadow-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/teams/${t.team_id}/edit`)}
                            className="text-[#7B5B12] hover:opacity-80 text-xs underline underline-offset-2"
                          >
                            Edit
                          </button>

                          <span className="text-gray-300">|</span>

                          <button
                            onClick={() => openDeleteModal(t.team_id, t.name)}
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
              Showing{" "}
              {teams.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, total)} of {total} results
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;

                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2)
                      pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`min-w-[32px] rounded-lg px-3 py-1.5 text-sm font-medium ${
                          currentPage === pageNum
                            ? "bg-[#CE9F41] text-white"
                            : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
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
                  className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
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

export default ListTeams;
