"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Tag as TagIcon, X } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  BlogSchema,
  type BlogFormValues,
} from "@/features/blogs/blog.schema";

const CreateBlogPage = () => {
  const router = useRouter();
  const hiddenFileRef = useRef<HTMLInputElement | null>(null);

  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");

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
      tags: [],
      cover: undefined,
    },
    mode: "onTouched",
  });

  const tags = watch("tags") || [];

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

  const submitWithStatus = (status: BlogFormValues["status"]) =>
    handleSubmit(async (data) => {
      const payload = { ...data, status };
      // TODO: integrate refine useCreate({ resource: "blogs" }) here.
      console.log("Submitting:", payload);
      alert(`${status} submitted (mock). Connect to your API/refine useCreate.`);
      // router.push("/blogs");
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
            disabled={isSubmitting}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            Save as Draft
          </button>
          <button
            onClick={submitWithStatus("Published")}
            disabled={isSubmitting}
            className="rounded-xl bg-[#CE9F41] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-95 disabled:opacity-60"
          >
            Publish
          </button>
        </div>
      </div>

      {/* Layout */}
      <form className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left */}
        <div className="lg:col-span-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#65421E] font-solomon">Title</label>
            <input
              {...register("title")}
              placeholder="Enter blog post title"
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-300"
            />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#65421E] font-solomon">Description</label>
            <input
              {...register("description")}
              placeholder="Description of blog post"
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-300"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#65421E] font-solomon">Content</label>
            <textarea
              {...register("content")}
              placeholder="Write your blog post content here"
              rows={14}
              className="w-full resize-y rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-gray-300"
            />
            {errors.content && (
              <p className="mt-1 text-xs text-red-600">{errors.content.message}</p>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="lg:col-span-4 space-y-5">
          {/* Cover Image */}
          <div className="rounded-2xl border border-[#E1DED1] bg-[#F7F6F3] p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-800">Cover Image</h3>

            <Controller
              name="cover"
              control={control}
              render={({ field: { onChange, value } }) => (
                <>
                  <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-4 text-center">
                    {value ? (
                      <div className="mb-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            typeof value === "object"
                              ? URL.createObjectURL(value as File)
                              : undefined
                          }
                          alt="Cover preview"
                          className="mx-auto h-40 w-full max-w-xs rounded-lg object-cover"
                        />
                      </div>
                    ) : (
                      <div className="mb-3 flex flex-col items-center justify-center gap-2 text-gray-500">
                        <Upload className="h-6 w-6" />
                        <p className="text-sm">Click to upload or drag and drop</p>
                      </div>
                    )}

                    <input
                      ref={hiddenFileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        onChange(file);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => hiddenFileRef.current?.click()}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Choose File
                    </button>
                  </div>
                  {errors.cover && (
                    <p className="mt-2 text-xs text-red-600">{errors.cover.message as string}</p>
                  )}
                </>
              )}
            />
          </div>

          {/* Publish Settings */}
          <div className="rounded-2xl border border-[#E1DED1] bg-[#F7F6F3] p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-800">Publish Settings</h3>

            <label className="mb-2 block text-sm font-medium text-gray-700">Status</label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <div className="relative">
                  <select
                    {...field}
                    className="w-full appearance-none rounded-xl border border-[#E1DED1] bg-white px-3 py-2.5 pr-8 text-sm outline-none focus:border-gray-300"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                    <option value="Scheduled">Scheduled</option>
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    ▾
                  </span>
                </div>
              )}
            />
            {errors.status && (
              <p className="mt-1 text-xs text-red-600">{errors.status.message}</p>
            )}
          </div>

          {/* Tags */}
          <div className="rounded-2xl border border-[#E1DED1] bg-[#F7F6F3] p-4">
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
                title="Add tag"
              >
                Add
              </button>
            </div>

            {errors.tags && (
              <p className="mt-2 text-xs text-red-600">{errors.tags.message as string}</p>
            )}

            {(tags as string[]).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700 border border-gray-200"
                  >
                    {t}
                    <button
                      type="button"
                      className="ml-1 rounded-full p-0.5 hover:bg-gray-100"
                      onClick={() => removeTag(t)}
                      aria-label={`Remove ${t}`}
                    >
                      <X className="h-3 w-3 text-gray-500" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateBlogPage;
