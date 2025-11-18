"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpWideNarrow,
  ArrowDownWideNarrow,
  Eye,
} from "lucide-react";
import { useList, CrudFilters, useDelete } from "@refinedev/core";
import toast from "react-hot-toast";
import DeleteConfirmModal from "@components/DeleteModal";

type ContactRow = {
  contact_id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  address: string;
  company_name: string;
  region: string;
  inquiry?: string;
  order_piece?: number;
  order_date?: string;
  custom_printing?: boolean;
  sketch?: string;
  comments?: string;
  createdAt: string;
  updatedAt: string;
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

const ListContact = () => {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounced(searchQuery, 400);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [regionFilter, setRegionFilter] = useState<string>("all");

  const [sortField, setSortField] = useState<
    "firstname" | "lastname" | "email" | "company_name" | "createdAt"
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    contactId: null as string | null,
    contactName: "",
  });

  const { mutate: deleteContact, isLoading: isDeleting } = useDelete();

  // --- Filters ---
  const filters: CrudFilters = useMemo(() => {
    const f: CrudFilters = [];
    if (regionFilter !== "all") {
      f.push({ field: "region", operator: "eq", value: regionFilter });
    }
    if (debouncedSearch.trim()) {
      f.push({
        field: "q",
        operator: "contains",
        value: debouncedSearch.trim(),
      });
    }
    return f;
  }, [regionFilter, debouncedSearch]);

  // --- Fetch ---
  const { data, isLoading, isError, refetch } = useList<ContactRow>({
    resource: "contact",
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

  const contacts = data?.data || [];
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
  }, [regionFilter, debouncedSearch, sortField, sortOrder, pageSize]);

  const openDeleteModal = (id: string, name: string) => {
    setDeleteModal({ isOpen: true, contactId: id, contactName: name });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, contactId: null, contactName: "" });
  };

  const confirmDelete = () => {
    if (!deleteModal.contactId) return;

    deleteContact(
      { resource: "contact", id: deleteModal.contactId },
      {
        onSuccess: () => {
          toast.success("Contact deleted successfully");
          closeDeleteModal();
          refetch();
        },
        onError: (error) => {
          console.error("Delete error:", error);
          toast.error("Failed to delete contact");
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
        title="Contact"
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        blogTitle={deleteModal.contactName}
        isDeleting={isDeleting}
      />

      {/* Heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Contact Management
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage customer inquiries and contacts
        </p>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3">
        {/* Search + Page Size */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts..."
              className="w-full rounded-xl border border-gray-200 bg-white/60 pl-9 pr-3 py-2 text-sm outline-none ring-0 placeholder:text-gray-400 focus:border-gray-300"
            />
          </div>

          {/* Page size */}
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
          </div>
        </div>

        {/* Region Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Region:</span>
          <div className="flex gap-2 flex-wrap">
            {["all", "America", "Europe", "Asia", "Australia", "Africa"].map((region) => (
              <button
                key={region}
                onClick={() => setRegionFilter(region)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  regionFilter === region
                    ? "bg-[#CE9F41] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {region === "all" ? "All Regions" : region}
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
                <th className="px-4 py-3 font-medium w-[20%]">
                  <button
                    onClick={() => handleSort("firstname")}
                    className="inline-flex items-center gap-1 hover:text-gray-900 transition"
                  >
                    Name
                    {sortField === "firstname" &&
                      (sortOrder === "asc" ? (
                        <ArrowUpWideNarrow className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowDownWideNarrow className="h-3.5 w-3.5" />
                      ))}
                  </button>
                </th>

                {/* EMAIL */}
                <th className="px-4 py-3 font-medium w-[20%]">
                  <button
                    onClick={() => handleSort("email")}
                    className="inline-flex items-center gap-1 hover:text-gray-900 transition"
                  >
                    Email
                    {sortField === "email" &&
                      (sortOrder === "asc" ? (
                        <ArrowUpWideNarrow className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowDownWideNarrow className="h-3.5 w-3.5" />
                      ))}
                  </button>
                </th>

                {/* COMPANY */}
                <th className="px-4 py-3 font-medium w-[20%]">
                  <button
                    onClick={() => handleSort("company_name")}
                    className="inline-flex items-center gap-1 hover:text-gray-900 transition"
                  >
                    Company
                    {sortField === "company_name" &&
                      (sortOrder === "asc" ? (
                        <ArrowUpWideNarrow className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowDownWideNarrow className="h-3.5 w-3.5" />
                      ))}
                  </button>
                </th>

                {/* REGION */}
                <th className="px-4 py-3 font-medium w-[15%]">Region</th>

                {/* CREATED */}
                <th className="px-4 py-3 font-medium w-[12%]">
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
                <th className="px-4 py-3 font-medium w-[13%]">Actions</th>
              </tr>
            </thead>

            <tbody>
              {/* Loading */}
              {isLoading && (
                <tr>
                  <td
                    colSpan={6}
                    className="rounded-xl bg-white px-4 py-10 text-center text-sm text-gray-500 shadow-sm"
                  >
                    Loading contacts...
                  </td>
                </tr>
              )}

              {/* Error */}
              {isError && (
                <tr>
                  <td
                    colSpan={6}
                    className="rounded-xl bg-white px-4 py-10 text-center text-sm text-red-500 shadow-sm"
                  >
                    Error loading contacts.
                  </td>
                </tr>
              )}

              {/* Empty */}
              {!isLoading && !isError && contacts.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="rounded-xl bg-white px-4 py-10 text-center text-sm text-gray-500 shadow-sm"
                  >
                    No contacts found.
                  </td>
                </tr>
              )}

              {/* Rows */}
              {!isLoading &&
                !isError &&
                contacts.map((c) => {
                  return (
                    <tr key={c.contact_id} className="align-middle">
                      {/* NAME CELL */}
                      <td className="rounded-l-xl bg-white px-4 py-4 text-sm font-medium text-gray-900 shadow-sm">
                        <div className="flex flex-col">
                          <div className="truncate">
                            {c.firstname} {c.lastname}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {c.phone}
                          </div>
                        </div>
                      </td>

                      {/* EMAIL */}
                      <td className="bg-white px-4 py-4 text-sm text-gray-700 shadow-sm">
                        <div className="truncate">{c.email}</div>
                      </td>

                      {/* COMPANY */}
                      <td className="bg-white px-4 py-4 text-sm text-gray-700 shadow-sm">
                        <div className="truncate">{c.company_name}</div>
                      </td>

                      {/* REGION */}
                      <td className="bg-white px-4 py-4 text-sm shadow-sm">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-[#65421E] border border-blue-100">
                          {c.region}
                        </span>
                      </td>

                      {/* CREATED */}
                      <td className="bg-white px-4 py-4 text-sm text-gray-700 shadow-sm">
                        {formatDate(c.createdAt)}
                      </td>

                      {/* ACTIONS */}
                      <td className="rounded-r-xl bg-white px-4 py-4 text-sm shadow-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/contacts/${c.contact_id}`)}
                            className="inline-flex items-center gap-1 text-[#7B5B12] hover:opacity-80 text-xs underline underline-offset-2"
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </button>

                          <span className="text-gray-300">|</span>

                          <button
                            onClick={() =>
                              openDeleteModal(
                                c.contact_id,
                                `${c.firstname} ${c.lastname}`
                              )
                            }
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
              {contacts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
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
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
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

export default ListContact;