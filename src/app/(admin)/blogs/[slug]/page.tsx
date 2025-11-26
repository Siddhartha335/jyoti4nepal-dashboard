"use client";

import React from "react";
import { useOne } from "@refinedev/core";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Tag, Edit2 } from "lucide-react";
import Image from "next/image";

type Blog = {
  blog_id: string;
  title: string;
  description: string;
  content: string;
  status: "Published" | "Draft";
  author:{
    username:string
  }
  tags: string[];
  cover_image: string;
  createdAt: string;
  updatedAt: string;
};

const STATUS_STYLES: Record<Blog["status"], { wrap: string; dot: string; text: string }> = {
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

const ViewBlogPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.slug as string;
  const { data, isLoading, isError } = useOne<Blog>({
    resource: "blog",
    id,
  });

  const blog = data?.data;
  console.log(blog)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="mt-2">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#CE9F41] border-r-transparent"></div>
            <p className="mt-4 text-sm text-gray-600">Loading blog...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !blog) {
    return (
      <div className="mt-2">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-lg font-medium text-red-600">Failed to load blog</p>
            <button
              onClick={() => router.back()}
              className="mt-4 text-sm text-[#7B5B12] underline underline-offset-2"
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const s = STATUS_STYLES[blog.status as keyof typeof STATUS_STYLES] || STATUS_STYLES.Draft;

  return (
    <div className="mt-2 pb-8">
      {/* Header Actions */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 transition"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <button
          onClick={() => router.push(`/blogs/${id}/edit`)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#CE9F41] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-95"
        >
          <Edit2 className="h-4 w-4" />
          Edit Blog
        </button>
      </div>

      {/* Main Content Card */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {/* Cover Image */}
        {blog.cover_image && (
          <div className="relative w-full h-64 sm:h-80 md:h-96 bg-gray-100">
            <Image
              src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${blog.cover_image}`}
              alt={blog.title}
              fill
              className="object-contain"
              priority
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6 sm:p-8 md:p-10">
          {/* Status and Meta */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${s.wrap}`}
            >
              <span className={`h-2 w-2 rounded-full ${s.dot}`} />
              {s.text}
            </span>

            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(blog.createdAt)}</span>
            </div>

            {blog.updatedAt !== blog.createdAt && (
              <span className="text-xs text-gray-500">
                (Updated: {formatDate(blog.updatedAt)})
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="mb-4 text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
            {blog.title}
          </h1>

          {/* Description */}
          {blog.description && (
            <p className="mb-6 text-lg text-gray-600 leading-relaxed">
              {blog.description}
            </p>
          )}

          {/* Divider */}
          <div className="my-6 border-t border-gray-200"></div>

          {/* Content */}
          <div className="prose prose-gray max-w-none">
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: blog.content }}>              
            </div>
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Tags:</span>
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 border border-gray-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Metadata Card */}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-[#F7F6F3] p-6">
        <h3 className="mb-4 text-sm font-semibold text-gray-800">Blog Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Blog ID:</span>
            <p className="font-medium text-gray-900 mt-1">{blog.blog_id}</p>
          </div>
          <div>
            <span className="text-gray-600">Status:</span>
            <p className="font-medium text-gray-900 mt-1">{blog.status}</p>
          </div>
          <div>
            <span className="text-gray-600">Created:</span>
            <p className="font-medium text-gray-900 mt-1">{formatDate(blog.createdAt)}</p>
          </div>
          <div>
            <span className="text-gray-600">Last Updated:</span>
            <p className="font-medium text-gray-900 mt-1">{formatDate(blog.updatedAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewBlogPage;