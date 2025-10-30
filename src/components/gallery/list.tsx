"use client";

import React from "react";
import Link from "next/link";
import {
  Upload,
  Search,
  ChevronDown,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ArrowUpWideNarrow,
  ArrowDownWideNarrow,
  MoreHorizontal,
} from "lucide-react";
import { useList, useDelete } from "@refinedev/core";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import DeleteConfirmModal from "@components/DeleteModal"; // ✅ use your modal

type GalleryItem = {
  image_id: string;
  image_url: string;
  album: "Products" | "Events" | "Lifestyle";
  image_description: string;
  createdAt: string;
  updatedAt: string;
};

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white/60 px-2 py-0.5 text-xs text-neutral-700">
    <ShieldCheck className="h-3.5 w-3.5" /> {children}
  </span>
);

const Thumb = ({ src, alt }: { src: string; alt: string }) => (
  <div className="aspect-[4/3] w-full overflow-hidden rounded-md bg-neutral-100 ring-1 ring-neutral-200">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-cover transition group-hover:scale-[1.02]"
    />
  </div>
);

const RowActionsMenu = ({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) => (
  <div
    data-row-actions-popover
    role="menu"
    className="absolute right-0 top-full z-20 mt-2 w-36 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg"
  >
    <button
      role="menuitem"
      onClick={onEdit}
      className="block w-full px-3 py-2 text-left text-sm text-neutral-800 hover:bg-neutral-50"
    >
      Edit
    </button>
    <button
      role="menuitem"
      onClick={onDelete}
      className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
    >
      Delete
    </button>
  </div>
);

function GalleryCard({
  item,
  onEdit,
  onDelete,
}: {
  item: GalleryItem;
  onEdit: (item: GalleryItem) => void;
  onDelete: (item: GalleryItem) => void;
}) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const fileName = item.image_url.split("/").pop() || "image.jpg";
  const date = new Date(item.updatedAt || item.createdAt).toLocaleDateString();

  const closeMenu = () => setMenuOpen(false);
  const toggleMenu = () => setMenuOpen((s) => !s);

  // Close on outside click / Esc
  React.useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest("[data-row-actions-popover]") && !t.closest("[data-row-actions-trigger]")) {
        closeMenu();
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  return (
    <div className="group rounded-xl border border-neutral-200 bg-[#F7F6F3] p-3 shadow-sm transition hover:shadow-md">
      <div className="relative">
        <Thumb
          src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${item.image_url}`}
          alt={item.image_description || fileName}
        />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <Badge>Verified</Badge>
        <span className="rounded-lg bg-white/70 px-2 py-0.5 text-[11px] font-medium text-neutral-700 ring-1 ring-neutral-200">
          {item.album}
        </span>
      </div>

      <div className="mt-2">
        <p className="truncate text-sm font-medium text-neutral-900" title={fileName}>
          {fileName}
        </p>
        <p
          className="mt-0.5 min-h-[1.5rem] line-clamp-2 text-xs text-neutral-600"
          title={item.image_description}
        >
          {item.image_description || "—"}
        </p>

        <div className="mt-1 flex items-center justify-between text-xs text-neutral-500">
          <p>{date}</p>

          {/* Ellipsis / actions */}
          <div className="relative">
            <button
              data-row-actions-trigger
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={toggleMenu}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
              title="Actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {menuOpen && (
              <RowActionsMenu
                onEdit={() => {
                  closeMenu();
                  onEdit(item);
                }}
                onDelete={() => {
                  closeMenu();
                  onDelete(item);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const Toolbar = () => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-center gap-2">
      <h1 className="text-xl font-semibold text-neutral-900">Gallery Management</h1>
    </div>
    <div className="flex items-center gap-2">
      <Link href={"/gallery/upload"}>
        <button className="inline-flex items-center gap-2 rounded-lg bg-[#CE9F41] px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#B88A38]">
          <Upload className="h-4 w-4" /> Upload Images
        </button>
      </Link>
    </div>
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

export default function ListGallery() {
  const router = useRouter();

  // --- UI state ---
  const [q, setQ] = React.useState("");
  const debouncedQ = useDebounced(q, 400);

  const [album, setAlbum] = React.useState<"" | "Products" | "Events" | "Lifestyle">("");
  const [sortField, setSortField] = React.useState<"updatedAt" | "createdAt" | "image_description">("updatedAt");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");

  const [current, setCurrent] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(12);

  // Delete modal state
  const [deleteModal, setDeleteModal] = React.useState<{
    isOpen: boolean;
    imageId: string | null;
    imageTitle: string;
  }>({
    isOpen: false,
    imageId: null,
    imageTitle: "",
  });

  // --- Refine query (re-fetches when state changes) ---
  const { data, isLoading, isError, refetch } = useList<GalleryItem>({
    resource: "gallery",
    pagination: { current, pageSize },
    sorters: [{ field: sortField, order: sortOrder }],
    filters: [
      ...(debouncedQ ? [{ field: "q", operator: "contains" as const, value: debouncedQ }] : []),
      ...(album ? [{ field: "album", operator: "eq" as const, value: album }] : []),
    ],
    queryOptions: { keepPreviousData: true },
  });

  const { mutate: deleteImage, isLoading: isDeleting } = useDelete();

  const items = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Reset to page 1 when filters/sort change
  React.useEffect(() => {
    setCurrent(1);
  }, [debouncedQ, album, sortField, sortOrder, pageSize]);

  // Modal helpers
  const openDeleteModal = (item: GalleryItem) => {
    const title = item.image_description?.trim()
      ? item.image_description
      : item.image_url.split("/").pop() || "image";
    setDeleteModal({ isOpen: true, imageId: item.image_id, imageTitle: title });
  };
  const closeDeleteModal = () =>
    setDeleteModal({ isOpen: false, imageId: null, imageTitle: "" });

  const confirmDelete = () => {
    if (!deleteModal.imageId) return;
    deleteImage(
      { resource: "gallery", id: deleteModal.imageId },
      {
        onSuccess: () => {
          toast.success("Image deleted");
          closeDeleteModal();
          refetch(); // refresh list
        },
        onError: (err: any) => {
          console.error(err);
          toast.error(err?.response?.data?.message || "Failed to delete image");
        },
      }
    );
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Delete Confirmation Modal (re-using your Blog modal) */}
      <DeleteConfirmModal
        title="Gallery Image"               
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        blogTitle={deleteModal.imageTitle}   // ✅ pass image title/file name here
        isDeleting={isDeleting}
      />

      <Toolbar />
      <p className="mt-1 text-sm text-neutral-600">Upload and organize your images</p>

      {/* Filters */}
      <div className="mt-3 grid grid-cols-1 gap-3 sm:mt-4 sm:grid-cols-12">
        {/* Search */}
        <label className="relative col-span-12 sm:col-span-6 lg:col-span-5">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <Search className="h-4 w-4 text-neutral-400" />
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search description or file name"
            className="w-full rounded-lg border border-neutral-300 bg-white py-2.5 pl-9 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-200"
          />
        </label>

        {/* Album */}
        <div className="col-span-6 sm:col-span-3 lg:col-span-2">
          <div className="relative">
            <select
              value={album}
              onChange={(e) => setAlbum(e.target.value as any)}
              className="w-full appearance-none rounded-lg border border-neutral-300 bg-[#F7F6F3] px-3 py-2.5 pr-9 text-sm text-neutral-900 focus:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-200"
            >
              <option value="">All albums</option>
              <option value="Products">Products</option>
              <option value="Events">Events</option>
              <option value="Lifestyle">Lifestyle</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          </div>
        </div>

        {/* Sort field */}
        <div className="col-span-6 sm:col-span-3 lg:col-span-2">
          <div className="relative">
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as any)}
              className="w-full appearance-none rounded-lg border border-neutral-300 bg-white px-3 py-2.5 pr-9 text-sm text-neutral-900 focus:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-200"
            >
              <option value="updatedAt">Updated</option>
              <option value="createdAt">Created</option>
              <option value="image_description">Description</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          </div>
        </div>

        {/* Sort order */}
        <div className="col-span-6 sm:col-span-3 lg:col-span-1">
          <button
            onClick={() => setSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-700 shadow-sm transition hover:bg-neutral-50"
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

        {/* Page size */}
        <div className="col-span-6 sm:col-span-3 lg:col-span-2">
          <div className="relative">
            <select
              value={pageSize}
              onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
              className="w-full appearance-none rounded-lg border border-neutral-300 bg-white px-3 py-2.5 pr-9 text-sm text-neutral-900 focus:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-200"
            >
              {[8, 12, 24, 48].map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mt-5 min-h-[240px]">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: pageSize }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-neutral-200 bg-[#F7F6F3] p-3">
                <div className="aspect-[4/3] w-full rounded-md bg-neutral-200" />
                <div className="mt-3 h-4 w-24 rounded bg-neutral-200" />
                <div className="mt-2 h-3 w-3/4 rounded bg-neutral-200" />
                <div className="mt-1 h-3 w-1/2 rounded bg-neutral-200" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Failed to load images. Please try again.
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-600">
            No images found.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <GalleryCard
                key={item.image_id}
                item={item}
                onEdit={(it) => router.push(`/gallery/${it.image_id}/edit`)}
                onDelete={(it) => openDeleteModal(it)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
        <div className="text-sm text-neutral-600">
          Showing{" "}
          <span className="font-medium text-neutral-800">
            {items.length === 0 ? 0 : (current - 1) * pageSize + 1}
          </span>{" "}
          –{" "}
          <span className="font-medium text-neutral-800">
            {(current - 1) * pageSize + items.length}
          </span>{" "}
          of <span className="font-medium text-neutral-800">{total}</span>
        </div>

        <div className="inline-flex items-center gap-2">
          <button
            onClick={() => setCurrent((c) => Math.max(1, c - 1))}
            disabled={current === 1}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </button>
          <span className="text-sm text-neutral-700">
            Page <span className="font-semibold text-neutral-900">{current}</span> of{" "}
            <span className="font-semibold text-neutral-900">{totalPages}</span>
          </span>
          <button
            onClick={() => setCurrent((c) => Math.min(totalPages, c + 1))}
            disabled={current >= totalPages}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
