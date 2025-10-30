"use client";

import React from "react";
import { Plus, Search, Star, ChevronDown, ChevronLeft, ChevronRight, ArrowUpWideNarrow, ArrowDownWideNarrow } from "lucide-react";
import Link from "next/link";
import { useList, useDelete } from "@refinedev/core";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import DeleteConfirmModal from "@components/DeleteModal";

type Testimonial = {
  testimonial_id: string;
  name: string;
  email: string;
  status: "Published" | "Draft";
  content: string;
  rating: 1 | 2 | 3 | 4 | 5;
  featured: "Featured" | "Normal";
  company_logo: string;
  createdAt: string;
  updatedAt: string;
};

const STATUS_STYLES: Record<Testimonial["status"], { wrap: string; dot: string; text: string }> = {
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

const Badge = ({ label }: { label: string }) => {
  const styles =
    label === "Featured"
      ? "bg-[#F2E8D4] text-[#7B5B12] border border-[#E6D8BB]"
      : "bg-white text-gray-700 border border-gray-200";

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${styles}`}>
      {label}
    </span>
  );
};

const Stars = ({ value }: { value: number }) => (
  <div className="flex items-center gap-1">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < value ? "fill-[#CE9F41] text-[#CE9F41]" : "text-gray-300"}`}
      />
    ))}
  </div>
);

function useDebounced<T>(value: T, delay = 400) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

const ListTestimonials = () => {
  const router = useRouter();

  // --- UI state ---
  const [q, setQ] = React.useState("");
  const debouncedQ = useDebounced(q, 400);

  const [status, setStatus] = React.useState<"" | "Published" | "Draft">("");
  const [featured, setFeatured] = React.useState<"" | "Featured" | "Normal">("");
  const [sortField, setSortField] = React.useState<"updatedAt" | "createdAt" | "rating" | "name">("updatedAt");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");

  const [current, setCurrent] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Delete modal state
  const [deleteModal, setDeleteModal] = React.useState<{
    isOpen: boolean;
    testimonialId: string | null;
    testimonialName: string;
  }>({
    isOpen: false,
    testimonialId: null,
    testimonialName: "",
  });

  // --- Refine query ---
  const { data, isLoading, isError, refetch } = useList<Testimonial>({
    resource: "testimonial",
    pagination: { current, pageSize },
    sorters: [{ field: sortField, order: sortOrder }],
    filters: [
      ...(debouncedQ ? [{ field: "q", operator: "contains" as const, value: debouncedQ }] : []),
      ...(status ? [{ field: "status", operator: "eq" as const, value: status }] : []),
      ...(featured ? [{ field: "featured", operator: "eq" as const, value: featured }] : []),
    ],
    queryOptions: { keepPreviousData: true },
  });

  const { mutate: deleteTestimonial, isLoading: isDeleting } = useDelete();

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Reset to page 1 when filters/sort change
  React.useEffect(() => {
    setCurrent(1);
  }, [debouncedQ, status, featured, sortField, sortOrder, pageSize]);

  // Modal helpers
  const openDeleteModal = (testimonial: Testimonial) => {
    setDeleteModal({ 
      isOpen: true, 
      testimonialId: testimonial.testimonial_id, 
      testimonialName: testimonial.name 
    });
  };
  
  const closeDeleteModal = () =>
    setDeleteModal({ isOpen: false, testimonialId: null, testimonialName: "" });

  const confirmDelete = () => {
    if (!deleteModal.testimonialId) return;
    deleteTestimonial(
      { resource: "testimonial", id: deleteModal.testimonialId },
      {
        onSuccess: () => {
          toast.success("Testimonial deleted successfully");
          closeDeleteModal();
          refetch();
        },
        onError: (err: any) => {
          console.error(err);
          toast.error(err?.response?.data?.message || "Failed to delete testimonial");
        },
      }
    );
  };

  return (
    <div className="mt-2">
      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        title="Testimonial"
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        blogTitle={deleteModal.testimonialName}
        isDeleting={isDeleting}
      />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Testimonials Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage customer and partner testimonials
        </p>
      </div>

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-12">
        {/* Search */}
        <label className="relative col-span-12 sm:col-span-6 lg:col-span-4">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <Search className="h-4 w-4 text-gray-400" />
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, or content"
            className="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none ring-0 placeholder:text-gray-400 focus:border-gray-300"
          />
        </label>

        {/* Status Filter */}
        <div className="col-span-6 sm:col-span-3 lg:col-span-2">
          <div className="relative">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-9 text-sm text-gray-900 focus:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              <option value="">All Status</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {/* Featured Filter */}
        <div className="col-span-6 sm:col-span-3 lg:col-span-2">
          <div className="relative">
            <select
              value={featured}
              onChange={(e) => setFeatured(e.target.value as any)}
              className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-9 text-sm text-gray-900 focus:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              <option value="">All Featured</option>
              <option value="Featured">Featured</option>
              <option value="Normal">Normal</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {/* Sort Field */}
        <div className="col-span-6 sm:col-span-3 lg:col-span-2">
          <div className="relative">
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as any)}
              className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-9 text-sm text-gray-900 focus:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              <option value="updatedAt">Updated</option>
              <option value="createdAt">Created</option>
              <option value="rating">Rating</option>
              <option value="name">Name</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {/* Sort Order */}
        <div className="col-span-6 sm:col-span-3 lg:col-span-1">
          <button
            onClick={() => setSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 shadow-sm transition hover:bg-gray-50"
            title={`Sort ${sortOrder === "asc" ? "ascending" : "descending"}`}
          >
            {sortOrder === "asc" ? (
              <>
                <ArrowUpWideNarrow className="h-4 w-4" /> Asc
              </>
            ) : (
              <>
                <ArrowDownWideNarrow className="h-4 w-4" /> Desc
              </>
            )}
          </button>
        </div>

        {/* Page Size */}
        <div className="col-span-6 sm:col-span-3 lg:col-span-1">
          <div className="relative">
            <select
              value={pageSize}
              onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
              className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-9 text-sm text-gray-900 focus:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Add New Button */}
      <div className="mb-4 flex justify-end">
        <Link href="/testimonials/create">
          <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#CE9F41] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-95">
            <Plus className="h-4 w-4" />
            New Testimonial
          </button>
        </Link>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 bg-[#F7F6F3] p-2 sm:p-3">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-gray-500">Loading testimonials...</div>
          ) : isError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Failed to load testimonials. Please try again.
            </div>
          ) : (
            <table className="min-w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-sm text-gray-600">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Content</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Company Logo</th>
                  <th className="px-5 py-3 font-medium">Rating</th>
                  <th className="px-5 py-3 font-medium">Featured</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((t) => (
                  <tr key={t.testimonial_id} className="align-middle">
                    <td className="rounded-l-xl bg-white px-5 py-4 text-sm text-gray-900 shadow-sm">
                      <div>
                        <p className="font-medium">{t.name}</p>
                      </div>
                    </td>
                    <td className="bg-white px-5 py-4 text-sm text-gray-800 shadow-sm">
                      <p className="line-clamp-2">{t.content}</p>
                    </td>
                    <td className="bg-white px-5 py-4 text-sm text-gray-900 shadow-sm">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[t.status].wrap}`}
                      >
                        <span
                          className={`mr-2 inline-block h-2 w-2 rounded-full ${STATUS_STYLES[t.status].dot}`}
                        ></span>
                        {STATUS_STYLES[t.status].text}
                      </span>
                    </td>
                    <td className="bg-white px-5 py-4 text-sm text-gray-800 shadow-sm">
                      {t.company_logo ? (
                        <img
                          src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${t.company_logo}`}
                          alt={t.name}
                          className="h-8 w-8 rounded object-contain"
                        />
                      ) : (
                        <span className="text-gray-400">No logo</span>
                      )}
                    </td>
                    <td className="bg-white px-5 py-4 text-sm shadow-sm">
                      <Stars value={t.rating} />
                    </td>
                    <td className="bg-white px-5 py-4 text-sm shadow-sm">
                      <Badge label={t.featured} />
                    </td>
                    <td className="rounded-r-xl bg-white px-4 py-4 text-sm shadow-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/testimonials/${t.testimonial_id}`)}
                          className="text-[#7B5B12] hover:opacity-80 text-xs underline underline-offset-2"
                        >
                          View
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => router.push(`/testimonials/${t.testimonial_id}/edit`)}
                          className="text-[#7B5B12] hover:opacity-80 text-xs underline underline-offset-2"
                        >
                          Edit
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => openDeleteModal(t)}
                          className="text-red-600 hover:opacity-80 text-xs underline underline-offset-2"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="rounded-xl bg-white px-5 py-10 text-center text-sm text-gray-500 shadow-sm"
                    >
                      No testimonials found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
        <div className="text-sm text-gray-600">
          Showing{" "}
          <span className="font-medium text-gray-800">
            {rows.length === 0 ? 0 : (current - 1) * pageSize + 1}
          </span>{" "}
          –{" "}
          <span className="font-medium text-gray-800">
            {(current - 1) * pageSize + rows.length}
          </span>{" "}
          of <span className="font-medium text-gray-800">{total}</span>
        </div>

        <div className="inline-flex items-center gap-2">
          <button
            onClick={() => setCurrent((c) => Math.max(1, c - 1))}
            disabled={current === 1}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </button>
          <span className="text-sm text-gray-700">
            Page <span className="font-semibold text-gray-900">{current}</span> of{" "}
            <span className="font-semibold text-gray-900">{totalPages}</span>
          </span>
          <button
            onClick={() => setCurrent((c) => Math.min(totalPages, c + 1))}
            disabled={current >= totalPages}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListTestimonials;