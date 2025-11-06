"use client";

import React from "react";
import {
  Plus,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpWideNarrow,
  ArrowDownWideNarrow,
  ImageIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useList, useDelete } from "@refinedev/core";
import toast from "react-hot-toast";
import DeleteConfirmModal from "@components/DeleteModal";

type Product = {
  product_id: string;
  name: string;
  description: string;
  category: string;
  status: "Published" | "Draft";
  image: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

function useDebounced<T>(value: T, delay = 400) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

const STATUS_STYLES: Record<Product["status"], { wrap: string; dot: string }> = {
  Published: {
    wrap: "bg-[#F2E8D4] text-[#7B5B12] border border-[#E6D8BB]",
    dot: "bg-[#CE9F41]",
  },
  Draft: {
    wrap: "bg-gray-100 text-gray-600 border border-gray-200",
    dot: "bg-gray-400",
  },
};

const ListProducts = () => {
  const router = useRouter();

  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<"" | "Published" | "Draft">("");
  const [category, setCategory] = React.useState<string>("");
  const [sortField, setSortField] = React.useState<"updatedAt" | "createdAt" | "name">("updatedAt");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const [current, setCurrent] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const debouncedQ = useDebounced(q, 400);

  // --- Delete modal ---
  const [deleteModal, setDeleteModal] = React.useState<{
    isOpen: boolean;
    productId: string | null;
    productName: string;
  }>({
    isOpen: false,
    productId: null,
    productName: "",
  });

  // --- Refine Hooks ---
  const { data, isLoading, isError, refetch } = useList<Product>({
    resource: "product",
    pagination: { current, pageSize },
    sorters: [{ field: sortField, order: sortOrder }],
    filters: [
      ...(debouncedQ ? [{ field: "q", operator: "contains" as const, value: debouncedQ }] : []),
      ...(status ? [{ field: "status", operator: "eq" as const, value: status }] : []),
      ...(category ? [{ field: "category", operator: "eq" as const, value: category }] : []),
    ],
    queryOptions: { keepPreviousData: true },
  });
  const { mutate: deleteProduct, isLoading: isDeleting } = useDelete();

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // --- Pagination Reset ---
  React.useEffect(() => {
    setCurrent(1);
  }, [debouncedQ, status, category, sortField, sortOrder, pageSize]);

  // --- Modal Handlers ---
  const openDeleteModal = (product: Product) =>
    setDeleteModal({
      isOpen: true,
      productId: product.product_id,
      productName: product.name,
    });

  const closeDeleteModal = () =>
    setDeleteModal({ isOpen: false, productId: null, productName: "" });

  const confirmDelete = () => {
    if (!deleteModal.productId) return;
    deleteProduct(
      { resource: "product", id: deleteModal.productId },
      {
        onSuccess: () => {
          toast.success("Product deleted successfully");
          closeDeleteModal();
          refetch();
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || "Failed to delete product");
        },
      }
    );
  };

  return (
    <div className="mt-2">
      {/* Delete Modal */}
      <DeleteConfirmModal
        title="Product"
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        blogTitle={deleteModal.productName}
        isDeleting={isDeleting}
      />

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Product Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your handmade and sustainable products
          </p>
        </div>

        <Link href="/products/create">
          <button className="inline-flex items-center gap-2 rounded-xl bg-[#CE9F41] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-95">
            <Plus className="h-4 w-4" />
            New Product
          </button>
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-12">
        {/* Search */}
        <div className="relative col-span-12 sm:col-span-5 lg:col-span-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search product name or category"
            className="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm placeholder:text-gray-400 focus:border-gray-300 focus:ring-0"
          />
        </div>

        {/* Category Filter */}
        <div className="col-span-6 sm:col-span-3 lg:col-span-2 relative">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-9 text-sm focus:border-gray-600 focus:outline-none"
          >
            <option value="">All Categories</option>
            {Array.from(new Set((data?.data ?? []).map((p) => p.category))).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        </div>


        {/* Status Filter */}
        <div className="col-span-6 sm:col-span-3 lg:col-span-2 relative">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-9 text-sm focus:border-gray-600 focus:outline-none"
          >
            <option value="">All Status</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        </div>

        {/* Sort */}
        <div className="col-span-6 sm:col-span-3 lg:col-span-2 relative">
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as any)}
            className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-9 text-sm focus:border-gray-600 focus:outline-none"
          >
            <option value="updatedAt">Updated</option>
            <option value="createdAt">Created</option>
            <option value="name">Name</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        </div>

        {/* Sort Order */}
        <div className="col-span-6 sm:col-span-3 lg:col-span-1">
          <button
            onClick={() => setSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 shadow-sm hover:bg-gray-50"
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
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 bg-[#F7F6F3] p-2 sm:p-3">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-gray-500">Loading products...</div>
          ) : isError ? (
            <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700">
              Failed to load products. Please try again.
            </div>
          ) : (
            <table className="min-w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-sm text-gray-600">
                  <th className="px-5 py-3 font-medium">Product Name</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Image</th>
                  <th className="px-5 py-3 font-medium">Tags</th>
                  <th className="px-5 py-3 font-medium">Created</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((p) => (
                  <tr key={p.product_id} className="align-middle">                    
                    {/* Name */}
                    <td className="bg-white px-5 py-3 text-sm font-medium text-gray-900 shadow-sm">
                      {p.name}
                    </td>

                    {/* Category */}
                    <td className="bg-white px-5 py-3 text-sm text-gray-700 shadow-sm">
                      {p.category}
                    </td>

                    {/* Status */}
                    <td className="bg-white px-5 py-3 text-sm shadow-sm">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[p.status].wrap}`}
                      >
                        <span
                          className={`mr-2 inline-block h-2 w-2 rounded-full ${STATUS_STYLES[p.status].dot}`}
                        ></span>
                        {p.status}
                      </span>
                    </td>

                    {/* Image */}
                    <td className="rounded-l-xl bg-white px-5 py-3 text-sm shadow-sm">
                      {p.image ? (
                        <img
                          src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${p.image}`}
                          alt={p.name}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-gray-400" />
                      )}
                    </td>


                    {/* Tags */}
                    <td className="bg-white px-5 py-3 text-sm shadow-sm">
                      {p.tags?.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {p.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center rounded-full bg-[#E1DED1]/60 px-3 py-1 text-xs font-medium text-gray-700"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">No tags</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="bg-white px-5 py-3 text-sm text-gray-700 shadow-sm">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="rounded-r-xl bg-white px-5 py-3 text-sm shadow-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/products/${p.product_id}`)}
                          className="text-[#7B5B12] hover:opacity-80 text-xs underline underline-offset-2"
                        >
                          View
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => router.push(`/products/${p.product_id}/edit`)}
                          className="text-[#7B5B12] hover:opacity-80 text-xs underline underline-offset-2"
                        >
                          Edit
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => openDeleteModal(p)}
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
                      No products found.
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
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 disabled:opacity-50"
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
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 disabled:opacity-50"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListProducts;
