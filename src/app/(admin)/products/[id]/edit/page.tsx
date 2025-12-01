"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  Tag as TagIcon,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { useOne, useUpdate } from "@refinedev/core";
import toast from "react-hot-toast";
import {
  ProductSchema,
  type Product,
} from "@features/products/product.schema";

const EditProductPage = () => {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const { data, isLoading } = useOne<Product>({
    resource: "product",
    id,
  });

  const { mutateAsync, isLoading: isUpdating } = useUpdate<Product>();

  const [tagInput, setTagInput] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Product>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      status: "Draft",
      tags: [],
      image: undefined,
    },
    mode: "onTouched",
  });

  const product = Array.isArray(data?.data) ? data?.data[0] : data?.data;
  const tags = watch("tags") || [];

  // ✅ Prefill form data when product is loaded
  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description,
        category: product.category,
        status: product.status,
        tags: product.tags || [],
        image: undefined,
      });
      setExistingImage(product.image ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${product.image}` : null);
    }
  }, [product, reset]);

  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    if (!tags.includes(t)) setValue("tags", [...tags, t]);
    setTagInput("");
  };

  const removeTag = (t: string) => {
    setValue(
      "tags",
      (tags as string[]).filter((x) => x !== t)
    );
  };

  const submitWithStatus =
    (status: Product["status"]) =>
    handleSubmit(async (formData) => {
      try {
        const payload = { ...formData, status };

        await mutateAsync({
          resource: "product",
          id,
          values: payload,
        });

        toast.success(
          status === "Published"
            ? "Product updated and published!"
            : "Product saved as draft."
        );

        router.push("/products");
      } catch (error) {
        console.error("Error updating product:", error);
        toast.error("Failed to update product. Please try again.");
      }
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-gray-500">
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20 text-gray-600">
        Product not found.
      </div>
    );
  }

  return (
    <div className="mt-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm">Back</span>
        </button>

        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
          Edit Product
        </h1>

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

      {/* Form Layout */}
      <form className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#E1DED1] bg-[#F7F6F3] p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">
              Product Details
            </h3>

            {/* Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                {...register("name")}
                placeholder="Enter product name"
                className="w-full rounded-lg border border-[#E1DED1] bg-white px-3 py-2 text-sm outline-none focus:border-[#CE9F41]"
              />
              {errors.name && (
                <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                {...register("description")}
                rows={3}
                placeholder="Describe your product"
                className="w-full rounded-lg border border-[#E1DED1] bg-white px-3 py-2 text-sm outline-none focus:border-[#CE9F41]"
              />
              {errors.description && (
                <p className="text-xs text-red-600 mt-1">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="rounded-2xl border border-[#E1DED1] bg-[#F7F6F3] p-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <input
                  {...register("category")}
                  placeholder="Enter the category"
                  className="w-full rounded-lg border border-[#E1DED1] bg-white px-3 py-2 text-sm outline-none focus:border-[#CE9F41]"
                />
            {errors.category && (
              <p className="text-xs text-red-600 mt-1">{errors.category.message}</p>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Image Upload */}
          <div className="rounded-2xl border border-[#E1DED1] bg-[#F7F6F3] p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Image</h3>
              <Controller
                name="image"
                control={control}
                render={({ field: { onChange, value }, fieldState: { error } }) => {
                  useEffect(() => {
                    if (value instanceof File) {
                      const url = URL.createObjectURL(value);
                      setPreview(url);
                      return () => URL.revokeObjectURL(url);
                    }
                    setPreview(null);
                  }, [value]);

                  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0];

                    if (file) {
                      // --- Optional validation ----
                      if (!file.type.startsWith("image/")) {
                        toast.error("Only image files are allowed.");
                        return;
                      }

                      if (file.size > 2 * 1024 * 1024) {
                        toast.error("Image size must be less than 2MB.");
                        return;
                      }

                      onChange(file);
                      setExistingImage(null);
                    }
                  };

                  const displayImage = preview || existingImage;

                  return (
                    <div>
                      <div className="border-2 border-dashed border-[#E1DED1] bg-white rounded-xl p-4 text-center">
                        {displayImage ? (
                          <img
                            src={displayImage}
                            alt="Preview"
                            className="mx-auto h-40 w-auto object-cover rounded-lg mb-3"
                          />
                        ) : (
                          <div className="flex flex-col items-center text-gray-400 mb-3">
                            <Upload className="h-6 w-6" />
                            <p className="text-sm mt-2">Upload image</p>
                          </div>
                        )}

                        <label
                          htmlFor="fileUpload"
                          className="cursor-pointer inline-block rounded-lg border border-[#E1DED1] bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          {displayImage ? "Change Image" : "Choose File"}
                        </label>

                        <input
                          id="fileUpload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </div>

                      {/* 🔴 ERROR MESSAGE BELOW IMAGE */}
                      {error?.message && (
                        <p className="text-xs text-red-600 mt-2">{error.message}</p>
                      )}
                    </div>
                  );
                }}
              />
          </div>

          {/* Tags */}
          <div className="rounded-2xl border border-[#E1DED1] bg-[#F7F6F3] p-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
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
                  className="w-full rounded-lg border border-[#E1DED1] bg-white px-3 py-2 pl-9 text-sm outline-none focus:border-[#CE9F41]"
                />
                <TagIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
              <button
                type="button"
                onClick={addTag}
                className="rounded-lg bg-white border border-[#E1DED1] px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Add
              </button>
            </div>

            {tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-white border border-[#E1DED1] px-3 py-1 text-xs font-semibold text-gray-700"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      ×
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

export default EditProductPage;
