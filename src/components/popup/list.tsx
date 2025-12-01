"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Eye, Users, MousePointerClick, Plus, Search, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useList, useDelete, CrudFilters } from "@refinedev/core";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import DeleteConfirmModal from "@components/DeleteModal";
import ViewPopupModal from "@components/ViewPopupModal";

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

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
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Published" | "Draft">("all");
  const [sortBy, setSortBy] = useState<"createdAt" | "title" | "startDate">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewModal, setViewModal] = useState<{
      isOpen: boolean;
      popup: any | null;
    }>({
      isOpen: false,
      popup: null,
    });

  // Debounce search query
  const debouncedQuery = useDebounce(query, 500);

  // Update state structure to match DeleteConfirmModal props
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    popupId: null as string | null,
    popupTitle: "",
  });

  // Build filters
  const filters: CrudFilters = useMemo(() => {
    const filterArray: CrudFilters = [];

    if (statusFilter !== "all") {
      filterArray.push({
        field: "status",
        operator: "eq",
        value: statusFilter,
      });
    }

    if (debouncedQuery.trim()) {
      filterArray.push({
        field: "search",
        operator: "contains",
        value: debouncedQuery.trim(),
      });
    }

    return filterArray;
  }, [statusFilter, debouncedQuery]);

  // Fetch popups from backend
  const { data: popupsData, isLoading, refetch } = useList({
    resource: "popup",
    pagination: {
      current: 1,
      pageSize: 100,
    },
    filters,
    sorters: [
      {
        field: sortBy,
        order: sortOrder,
      },
    ],
  });

  const { mutate: deletePopup, isLoading: isDeleting } = useDelete();

  const popups = popupsData?.data || [];

  // Calculate totals
  const totals = useMemo(() => {
    const active = popups.filter((p: any) => p.status === "Published").length;
    const draft = popups.filter((p: any) => p.status === "Draft").length;
    const total = popups.length;
    return { active, draft, total };
  }, [popups]);

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  // Handle delete
  const handleDelete = (id: string, title: string) => {
    setDeleteModal({
      isOpen: true,
      popupId: id,
      popupTitle: title,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      popupId: null,
      popupTitle: "",
    });
  };

  const confirmDelete = () => {
    if (!deleteModal.popupId) return;

    deletePopup(
      {
        resource: "popup",
        id: deleteModal.popupId,
      },
      {
        onSuccess: () => {
          toast.success("Popup deleted successfully!");
          closeDeleteModal();
          refetch();
        },
        onError: (error) => {
          console.error("Error deleting popup:", error);
          toast.error("Failed to delete popup");
        },
      }
    );
  };

  const handleView = (popup: any) => {
  setViewModal({
    isOpen: true,
    popup: popup,
  });
  };

  const closeViewModal = () => {
    setViewModal({
      isOpen: false,
      popup: null,
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-neutral-600">Loading popups...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Pop-up Management</h1>
          <p className="mt-1 text-sm text-neutral-600">Create and manage website pop-ups</p>
        </div>
        <Link href={"/popup/create"}>
          <button className="inline-flex items-center gap-2 rounded-lg bg-[#CE9F41] px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-95">
            <Plus className="h-4 w-4" /> New Pop-up
          </button>
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard icon={Eye} label="Total Pop-ups" value={totals.total} />
        <StatCard icon={Users} label="Published" value={totals.active} />
        <StatCard icon={MousePointerClick} label="Drafts" value={totals.draft} />
      </div>

      {/* Filters and Search */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <label className="relative block w-full max-w-md">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <Search className="h-4 w-4 text-neutral-400" />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pop-ups..."
            className="w-full rounded-lg border border-neutral-300 bg-white py-2.5 pl-9 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-200"
          />
        </label>

        {/* Filters */}
        <div className="flex items-center gap-3">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 focus:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-200"
          >
            <option value="all">All Status</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 focus:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-200"
          >
            <option value="createdAt">Sort by Created</option>
            <option value="title">Sort by Title</option>
            <option value="startDate">Sort by Start Date</option>
          </select>

          {/* Sort Order */}
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-200"
            title={sortOrder === "asc" ? "Ascending" : "Descending"}
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>
        </div>
      </div>

      {/* Results count */}
      <div className="mt-3 text-sm text-neutral-600">
        Showing {popups.length} pop-up{popups.length !== 1 ? "s" : ""}
        {debouncedQuery && ` matching "${debouncedQuery}"`}
        {statusFilter !== "all" && ` with status "${statusFilter}"`}
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full table-fixed">
            <colgroup>
              <col style={{ width: "20%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "14%" }} />
            </colgroup>

            <thead className="bg-neutral-50 text-[11px] uppercase tracking-wide text-neutral-600">
              <tr className="border-b border-neutral-200">
                <th className="px-4 py-2 text-left font-semibold">Title</th>
                <th className="px-2 py-2 text-left font-semibold">Type</th>
                <th className="px-2 py-2 text-left font-semibold">Status</th>
                <th className="px-2 py-2 text-left font-semibold">Duration</th>
                <th className="px-2 py-2 text-left font-semibold">Button Text</th>
                <th className="px-2 py-2 text-left font-semibold">Created</th>
                <th className="px-4 py-2 text-right font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="text-sm">
              {popups.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                    {debouncedQuery || statusFilter !== "all"
                      ? "No pop-ups match your filters"
                      : "No pop-ups found. Create your first one!"}
                  </td>
                </tr>
              ) : (
                popups.map((popup: any) => (
                  <tr key={popup.popup_id} className="border-t border-neutral-200 hover:bg-neutral-50">
                    <td className="px-4 py-3 text-neutral-900">
                      <span className="block truncate font-medium">{popup.title}</span>
                    </td>
                    <td className="px-2 py-3">
                      <Badge tone="amber">{popup.type}</Badge>
                    </td>
                    <td className="px-2 py-3">
                      {popup.status === "Published" ? (
                        <Badge tone="green">Published</Badge>
                      ) : (
                        <Badge tone="slate">Draft</Badge>
                      )}
                    </td>
                    <td className="px-2 py-3 text-neutral-700 text-xs">
                      {formatDate(popup.startDate)} <span className="text-neutral-400">to</span>{" "}
                      {formatDate(popup.endDate)}
                    </td>
                    <td className="px-2 py-3 text-neutral-700">
                      <span className="truncate block">{popup.buttonText}</span>
                    </td>
                    <td className="px-2 py-3 text-neutral-700 text-xs">
                      {formatDate(popup.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button       
                          onClick={() => handleView(popup)}                   
                          className="text-[#7B5B12] hover:opacity-80 text-xs underline underline-offset-2"
                        >
                          View
                        </button>
                        |
                        <button
                          onClick={() => router.push(`/popup/${popup.popup_id}/edit`)}
                          className="text-[#7B5B12] hover:opacity-80 text-xs underline underline-offset-2"
                        >
                          Edit
                        </button>
                        |
                        <button
                          onClick={() => handleDelete(popup.popup_id, popup.title)}
                          className="text-red-600 hover:opacity-80 text-xs underline underline-offset-2"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        title="Popup"
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        blogTitle={deleteModal.popupTitle}
        isDeleting={isDeleting}
      />

      <ViewPopupModal
        isOpen={viewModal.isOpen}
        onClose={closeViewModal}
        popup={viewModal.popup}
      />
    </div>
  );
}