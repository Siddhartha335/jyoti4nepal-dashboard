"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Tag as TagIcon, X } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreate, useList } from "@refinedev/core";
import toast from "react-hot-toast";

import {
  BlogSchema,
  type BlogFormValues,
} from "@/features/blogs/blog.schema";

import type { User } from "../terms/create"; 

const CreateBlogPage = () => {
  const router = useRouter();
  const { mutateAsync, isLoading } = useCreate<BlogFormValues>();

  const [tagInput, setTagInput] = useState("");

  // ✅ Fetch active users for author field
  const { data: usersData, isLoading: usersLoading } = useList<User>({
    resource: "user",
    pagination: { pageSize: 100 },
    filters: [{ field: "isActive", operator: "eq", value: true }],
  });

  const users = Array.isArray(usersData?.data) ? usersData.data : [];

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BlogFormValues>({
    resolver: zodResolver(BlogSchema),
    defaultValues: {
      title: "",
      description: "",
      content: "",
      status: "Draft",
      readtime: 0,
      author: "",
      tags: [],
      cover_image: undefined,
    },
    mode: "onTouched",
  });

  const tags = watch("tags") || [];

  // ✅ Tag functions
  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    if (!tags.includes(t)) setValue("tags", [...tags, t], { shouldValidate: true });
    setTagInput("");
  };

  const removeTag = (t: string) => {
    setValue(
      "tags",
      (tags as string[]).filter((x) => x !== t),
      { shouldValidate: true }
    );
  };

  // ✅ Submit helper
  const submitWithStatus =
    (status: BlogFormValues["status"]) =>
    handleSubmit(async (formData) => {
      try {
        const payload = { ...formData, status };

        await mutateAsync({
          resource: "blog",
          values: payload,
        });

        toast.success(
          status === "Published"
            ? "Blog post published successfully!"
            : "Blog saved as draft."
        );
        router.push("/blogs");
      } catch (error) {
        console.error("Error creating blog:", error);
        toast.error("Failed to create blog post. Please try again.");
      }
    });

  return (
    <div className="mt-2">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm">Back</span>
        </button>

        <h1 className="text-xl sm:text-2xl text-gray-800">
          Create New Blog Post
        </h1>

        <div className="flex items-center gap-3">
          <button
            onClick={submitWithStatus("Draft")}
            disabled={isSubmitting || isLoading}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            {isLoading ? "Saving..." : "Save as Draft"}
          </button>
          <button
            onClick={submitWithStatus("Published")}
            disabled={isSubmitting || isLoading}
            className="rounded-xl bg-[#CE9F41] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-95 disabled:opacity-60"
          >
            {isLoading ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>

      {/* Layout */}
      <form className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left */}
        <div className="lg:col-span-8 space-y-5">
          {/* Title */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#65421E]">
              Title
            </label>
            <input
              {...register("title")}
              placeholder="Enter blog post title"
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-300"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#65421E]">
              Description
            </label>
            <input
              {...register("description")}
              placeholder="Short blog description"
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-300"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#65421E]">
              Content
            </label>
            <textarea
              {...register("content")}
              placeholder="Write your blog post content here..."
              rows={14}
              className="w-full resize-y rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-gray-300"
            />
            {errors.content && (
              <p className="mt-1 text-xs text-red-600">
                {errors.content.message}
              </p>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="lg:col-span-4 space-y-5">
          {/* Cover Image */}
          <div className="rounded-2xl border border-[#E1DED1] bg-[#F7F6F3] p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-800">
              Cover Image
            </h3>

            <Controller
              name="cover_image"
              control={control}
              render={({ field: { onChange, value } }) => {
                const [preview, setPreview] = React.useState<string | null>(null);

                React.useEffect(() => {
                  if (value instanceof File) {
                    const url = URL.createObjectURL(value);
                    setPreview(url);
                    return () => URL.revokeObjectURL(url);
                  }
                  setPreview(null);
                }, [value]);

                const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files?.[0] ?? null;
                  onChange(file);
                };

                return (
                  <>
                    <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-4 text-center">
                      {preview ? (
                        <img
                          src={preview}
                          alt="Cover preview"
                          className="mx-auto h-40 w-full max-w-xs rounded-lg object-cover mb-3"
                        />
                      ) : (
                        <div className="mb-3 flex flex-col items-center justify-center gap-2 text-gray-500">
                          <Upload className="h-6 w-6" />
                          <p className="text-sm">Click to upload or drag and drop</p>
                        </div>
                      )}

                      <input
                        id="cover"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFile}
                      />

                      <label
                        htmlFor="cover"
                        className="inline-block cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Choose File
                      </label>
                    </div>

                    {errors.cover_image && (
                      <p className="mt-2 text-xs text-red-600">
                        {errors.cover_image.message as string}
                      </p>
                    )}
                  </>
                );
              }}
            />
          </div>

          {/* Tags, Author, and Read Time */}
          <div className="rounded-2xl border border-[#E1DED1] bg-[#F7F6F3] p-4">
            {/* Tags */}
            <h3 className="mb-3 text-sm font-semibold text-gray-800">Tags</h3>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Add tags"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 pl-9 text-sm outline-none focus:border-gray-300"
                />
                <TagIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
              <button
                type="button"
                onClick={addTag}
                className="rounded-xl bg-white px-3 py-2 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50"
              >
                Add
              </button>
            </div>

            {tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700 border border-gray-200"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => removeTag(t)}
                      className="ml-1 rounded-full p-0.5 hover:bg-gray-100"
                      aria-label={`Remove ${t}`}
                    >
                      <X className="h-3 w-3 text-gray-500" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Author */}
            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-gray-800">
                Author
              </label>
              <select
                {...register("author")}
                disabled={usersLoading}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-300"
              >
                <option value="">
                  {usersLoading ? "Loading users..." : "Select author..."}
                </option>
                {users.map((user) => (
                  <option key={user.user_id} value={user.user_id}>
                    {user.username || user.email}
                  </option>
                ))}
              </select>
              {errors.author && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.author.message}
                </p>
              )}
              {!usersLoading && users.length === 0 && (
                <p className="mt-1 text-xs text-red-500">
                  No active users found
                </p>
              )}
            </div>

            {/* Read Time */}
            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-gray-800">
                Read Time (minutes)
              </label>
              <input
                type="number"
                {...register("readtime", { valueAsNumber: true })}
                placeholder="e.g. 5"
                min={0}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-300"
              />
              {errors.readtime && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.readtime.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateBlogPage;
