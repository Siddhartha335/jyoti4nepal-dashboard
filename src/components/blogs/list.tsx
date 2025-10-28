"use client";

import React, { useState } from "react";
import { Plus, Search, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { useList, CrudFilters, useDelete } from "@refinedev/core";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import DeleteConfirmModal from "@components/DeleteModal";

type BlogRow = {
  blog_id: string;
  title: string;
  description: string;
  content: string;
  status: "Published" | "Draft";
  tags: string[];
  cover_image: string;
  createdAt: string;
  updatedAt: string;
};

const STATUS_STYLES: Record<BlogRow["status"], { wrap: string; dot: string; text: string }> = {
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



const ListPage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<"all" | "Published" | "Draft">("all");
  const [sortField, setSortField] = useState<"title" | "createdAt" | "updatedAt">("updatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    blogId: string | null;
    blogTitle: string;
  }>({
    isOpen: false,
    blogId: null,
    blogTitle: "",
  });

  // Initialize delete hook at component level
  const { mutate: deleteBlog, isLoading: isDeleting } = useDelete();

  // Build filters array with proper typing
  const filters: CrudFilters = [];
  if (statusFilter !== "all") {
    filters.push({ field: "status", operator: "eq", value: statusFilter });
  }
  if (searchQuery.trim()) {
    filters.push({ field: "search", operator: "contains", value: searchQuery.trim() });
  }

  // Fetch blogs using Refine's useList hook
  const { data, isLoading, isError, refetch } = useList<BlogRow>({
    resource: "blog",
    pagination: {
      current: currentPage,
      pageSize: pageSize,
    },
    sorters: [
      {
        field: sortField,
        order: sortOrder,
      },
    ],
    filters: filters.length > 0 ? filters : undefined,
  });

  const blogs = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const openDeleteModal = (id: string, title: string) => {
    setDeleteModal({
      isOpen: true,
      blogId: id,
      blogTitle: title,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      blogId: null,
      blogTitle: "",
    });
  };

  const confirmDelete = () => {
    if (!deleteModal.blogId) return;

    deleteBlog(
      {
        resource: "blog",
        id: deleteModal.blogId,
      },
      {
        onSuccess: () => {
          toast.success("Blog deleted successfully");
          closeDeleteModal();
          refetch();
        },
        onError: (error) => {
          console.error("Delete error:", error);
          toast.error("Failed to delete blog");
        },
      }
    );
  };

  return (
    <div className="mt-2">
      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        blogTitle={deleteModal.blogTitle}
        isDeleting={isDeleting}
      />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Blog Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          Create and manage your blog posts
        </p>
      </div>

      {/* Filters & Actions */}
      <div className="mb-4 flex flex-col gap-3">
        {/* Search and New Button */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search blogs by title, description, or content..."
              className="w-full rounded-xl border border-gray-200 bg-[#78788029] pl-9 pr-3 py-2 text-sm outline-none ring-0 placeholder:text-gray-400 focus:border-gray-300"
            />
          </div>

          <Link href="/blogs/create">
            <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#CE9F41] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 whitespace-nowrap">
              <Plus className="h-4 w-4" />
              New Blog Post
            </button>
          </Link>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          <div className="flex gap-2">
            {(["all", "Published", "Draft"] as const).map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setCurrentPage(1);
                }}
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

      {/* Table container */}
      <div className="rounded-2xl border border-gray-200 bg-[#F7F6F3] p-2 sm:p-3">
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-sm text-gray-600">
                <th className="px-4 py-3 font-medium w-[35%]">
                  <button
                    onClick={() => handleSort("title")}
                    className="inline-flex items-center gap-1 hover:text-gray-900 transition"
                  >
                    Title
                    {sortField === "title" && (
                      <ArrowUpDown className="h-3 w-3" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 font-medium w-[15%]">Status</th>
                <th className="px-4 py-3 font-medium w-[15%]">
                  <button
                    onClick={() => handleSort("createdAt")}
                    className="inline-flex items-center gap-1 hover:text-gray-900 transition"
                  >
                    Created
                    {sortField === "createdAt" && (
                      <ArrowUpDown className="h-3 w-3" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 font-medium w-[15%]">
                  <button
                    onClick={() => handleSort("updatedAt")}
                    className="inline-flex items-center gap-1 hover:text-gray-900 transition"
                  >
                    Updated
                    {sortField === "updatedAt" && (
                      <ArrowUpDown className="h-3 w-3" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 font-medium w-[10%]">Tags</th>
                <th className="px-4 py-3 font-medium w-[10%]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td
                    colSpan={6}
                    className="rounded-xl bg-white px-4 py-10 text-center text-sm text-gray-500 shadow-sm"
                  >
                    Loading blogs...
                  </td>
                </tr>
              )}

              {isError && (
                <tr>
                  <td
                    colSpan={6}
                    className="rounded-xl bg-white px-4 py-10 text-center text-sm text-red-500 shadow-sm"
                  >
                    Error loading blogs. Please try again.
                  </td>
                </tr>
              )}

              {!isLoading && !isError && blogs.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="rounded-xl bg-white px-4 py-10 text-center text-sm text-gray-500 shadow-sm"
                  >
                    No blogs found. Try a different search or create a new blog post.
                  </td>
                </tr>
              )}

              {!isLoading &&
                !isError &&
                blogs.map((blog) => {
                  const s = STATUS_STYLES[blog.status as keyof typeof STATUS_STYLES] || STATUS_STYLES.Draft;
                  
                  return (
                    <tr key={blog.blog_id} className="align-middle">
                      <td className="rounded-l-xl bg-white px-4 py-4 text-sm font-medium text-gray-900 shadow-sm">
                        <div className="line-clamp-2">{blog.title}</div>
                      </td>
                      <td className="bg-white px-4 py-4 text-sm shadow-sm">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${s.wrap}`}
                        >
                          <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                          {s.text}
                        </span>
                      </td>
                      <td className="bg-white px-4 py-4 text-sm text-gray-700 shadow-sm">
                        {formatDate(blog.createdAt)}
                      </td>
                      <td className="bg-white px-4 py-4 text-sm text-gray-700 shadow-sm">
                        {formatDate(blog.updatedAt)}
                      </td>
                      <td className="bg-white px-4 py-4 text-sm text-gray-700 shadow-sm">
                        <div className="line-clamp-1 text-xs">
                          {blog.tags.length > 0
                            ? blog.tags.slice(0, 2).join(", ") +
                              (blog.tags.length > 2 ? "..." : "")
                            : "—"}
                        </div>
                      </td>
                      <td className="rounded-r-xl bg-white px-4 py-4 text-sm shadow-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/blogs/${blog.blog_id}`)}
                            className="text-[#7B5B12] hover:opacity-80 text-xs underline underline-offset-2"
                          >
                            View
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => router.push(`/blogs/${blog.blog_id}/edit`)}
                            className="text-[#7B5B12] hover:opacity-80 text-xs underline underline-offset-2"
                          >
                            Edit
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => openDeleteModal(blog.blog_id, blog.title)}
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
        {!isLoading && !isError && totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between px-2">
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, total)} of {total} results
            </div>

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
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

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
          </div>
        )}
      </div>
    </div>
  );
};

export default ListPage;