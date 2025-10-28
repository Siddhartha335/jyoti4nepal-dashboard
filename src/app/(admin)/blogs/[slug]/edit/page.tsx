"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Upload, Tag as TagIcon, X } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOne, useUpdate } from "@refinedev/core";
import Image from "next/image";

import {
  BlogSchema,
  type BlogFormValues,
} from "@/features/blogs/blog.schema";
import toast from "react-hot-toast";

type Blog = {
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

const EditBlogPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.slug as string;

  const { mutateAsync, isLoading: isUpdating } = useUpdate<BlogFormValues>();
  const { data, isLoading } = useOne<Blog>({
    resource: "blog",
    id,
  });

  const blog = data?.data;

  const [tagInput, setTagInput] = useState("");
  const [existingImage, setExistingImage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BlogFormValues>({
    resolver: zodResolver(BlogSchema),
    defaultValues: {
      title: "",
      description: "",
      content: "",
      status: "Draft",
      tags: [],
      cover_image: undefined,
    },
    mode: "onTouched",
  });

  const tags = watch("tags") || [];
  const coverImage = watch("cover_image");

  // Prefill form when blog data is loaded
  useEffect(() => {
    if (blog) {
      reset({
        title: blog.title,
        description: blog.description,
        content: blog.content,
        status: blog.status,
        tags: blog.tags,
        cover_image: undefined, // Don't set file here
      });
      setExistingImage(blog.cover_image);
    }
  }, [blog, reset]);

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
    handleSubmit(async (formData) => {
      try {
        const payload = { ...formData, status };
        
        await mutateAsync({
          resource: "blog",
          id,
          values: payload,
        });
        toast.success("Blog updated successfully");

        router.push("/blogs");
      } catch (error) {
        console.error("Error updating blog:", error);
        toast.error("Failed to update blog. Please try again.");    
      }
    });

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

  if (!blog) {
    return (
      <div className="mt-2">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-lg font-medium text-red-600">Blog not found</p>
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

        <h1 className="text-xl sm:text-2xl text-gray-800">Edit Blog Post</h1>

        <div className="flex items-center gap-3">
          <button
            onClick={submitWithStatus("Draft")}
            disabled={isSubmitting || isUpdating}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            {isUpdating ? "Saving..." : "Save as Draft"}
          </button>
          <button
            onClick={submitWithStatus("Published")}
            disabled={isSubmitting || isUpdating}
            className="rounded-xl bg-[#CE9F41] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-95 disabled:opacity-60"
          >
            {isUpdating ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>

      {/* Layout */}
      <form className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left */}
        <div className="lg:col-span-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#65421E] font-solomon">
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

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#65421E] font-solomon">
              Description
            </label>
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
            <label className="mb-2 block text-sm font-semibold text-[#65421E] font-solomon">
              Content
            </label>
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
              name="cover_image"
              control={control}
              render={({ field: { onChange, value } }) => {
                const [preview, setPreview] = React.useState<string | null>(null);

                // Update preview when file changes
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
                  if (file) {
                    setExistingImage(null); // Clear existing image when new file selected
                  }
                };

                // Show preview if new file selected, otherwise show existing image
                const imageToShow = preview || (existingImage ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${existingImage}` : null);

                return (
                  <>
                    <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-4 text-center">
                      {imageToShow ? (
                        <div className="mb-3 relative">
                          <div className="relative h-40 w-full max-w-xs mx-auto rounded-lg overflow-hidden">
                            <Image
                              src={imageToShow}
                              alt="Cover preview"
                              fill
                              className="object-cover"
                              decoding="async"
                            />
                          </div>
                          {existingImage && !preview && (
                            <p className="mt-2 text-xs text-gray-500">Current image</p>
                          )}
                          {preview && (
                            <p className="mt-2 text-xs text-green-600">New image selected</p>
                          )}
                        </div>
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
                        {imageToShow ? "Change Image" : "Choose File"}
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

export default EditBlogPage;