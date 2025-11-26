"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Upload, Tag as TagIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useCreate } from "@refinedev/core";

import {
  ProductSchema,
  type Product,
} from "@features/products/product.schema";

const CreateProduct = () => {
  const router = useRouter();
  const { mutateAsync, isLoading } = useCreate<Product>();

  const [tagInput, setTagInput] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  // Category system
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [useExistingCategory, setUseExistingCategory] = useState(true);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const res = await fetch(
          "http://localhost:8000/api/v1/product/all-categories"
        );
        const json = await res.json();
        const names = json.data?.map((c: any) => c.category) || [];
        setCategories(names);
      } catch (err) {
        console.error("Failed to load categories", err);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Product>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      image: undefined,
      status: "Draft",
      tags: [],
    },
  });

  const tags = watch("tags") || [];

  // Tag functions
  const addTag = () => {
    if (!tagInput.trim()) return;
    if (!tags.includes(tagInput)) {
      setValue("tags", [...tags, tagInput]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setValue(
      "tags",
      tags.filter((t) => t !== tag)
    );
  };

  // Submit logic
  const submitWithStatus =
    (status: Product["status"]) =>
    handleSubmit(async (data) => {
      try {
        const payload = { ...data, status };

        await mutateAsync({
          resource: "product",
          values: payload,
        });

        toast.success(
          status === "Published"
            ? "Product published successfully!"
            : "Product saved as draft."
        );
        router.push("/products");
      } catch (error) {
        console.error("Error creating product:", error);
        toast.error("Failed to create product. Please try again.");
      }
    });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm">Back</span>
        </button>

        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
          Add New Product
        </h1>

        <div className="flex items-center gap-3">
          <button
            onClick={submitWithStatus("Draft")}
            disabled={isSubmitting}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : "Save as Draft"}
          </button>
          <button
            onClick={submitWithStatus("Published")}
            disabled={isSubmitting}
            className="rounded-xl bg-[#CE9F41] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-95 disabled:opacity-60"
          >
            {isSubmitting ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>

      {/* Form Layout */}
      <form className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Product Details */}
          <div className="rounded-2xl border border-[#E1DED1] bg-[#F7F6F3] p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Product</h3>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  {...register("name")}
                  placeholder="Enter product name"
                  className="w-full rounded-lg border border-[#E1DED1] bg-white px-3 py-2 text-sm outline-none focus:border-[#CE9F41]"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  {...register("description")}
                  placeholder="Describe your product"
                  rows={3}
                  className="w-full rounded-lg border border-[#E1DED1] bg-white px-3 py-2 text-sm outline-none focus:border-[#CE9F41]"
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="rounded-2xl border border-[#E1DED1] bg-[#F7F6F3] p-5">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Category
            </label>

            {/* Toggle Buttons */}
            <div className="flex items-center gap-3 mb-4">
              <button
                type="button"
                onClick={() => {
                  setUseExistingCategory(true);
                  setValue("category", "");
                }}
                className={`px-3 py-2 text-sm rounded-lg border ${
                  useExistingCategory
                    ? "border-[#CE9F41] text-[#CE9F41]"
                    : "border-gray-300 text-gray-600"
                }`}
              >
                Choose Existing
              </button>

              <button
                type="button"
                onClick={() => {
                  setUseExistingCategory(false);
                  setValue("category", "");
                }}
                className={`px-3 py-2 text-sm rounded-lg border ${
                  !useExistingCategory
                    ? "border-[#CE9F41] text-[#CE9F41]"
                    : "border-gray-300 text-gray-600"
                }`}
              >
                Create New
              </button>
            </div>

            {/* Existing Category Dropdown */}
            {useExistingCategory ? (
              <select
                {...register("category")}
                disabled={isLoadingCategories}
                className="w-full rounded-lg border border-[#E1DED1] bg-white px-3 py-2 text-sm outline-none"
              >
                <option value="">
                  {isLoadingCategories
                    ? "Loading categories..."
                    : "Select a category"}
                </option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            ) : (
              // Create New Category Input
              <input
                {...register("category")}
                placeholder="Enter new category"
                className="w-full rounded-lg border border-[#E1DED1] bg-white px-3 py-2 text-sm outline-none focus:border-[#CE9F41]"
              />
            )}

            {errors.category && (
              <p className="mt-1 text-xs text-red-600">
                {errors.category.message}
              </p>
            )}
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
                    className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700 border border-[#E1DED1]"
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
            {errors.tags && (
              <p className="mt-1 text-xs text-red-600">
                {errors.tags.message as string}
              </p>
            )}
          </div>
        </div>

        {/* Right Column - Image Upload */}
        <div>
          <div className="rounded-2xl border border-[#E1DED1] bg-[#F7F6F3] p-5 h-full flex flex-col">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Image</h3>

            <Controller
              name="image"
              control={control}
              render={({ field: { onChange } }) => (
                <div className="flex-1 flex flex-col justify-center items-center border-2 border-dashed border-[#E1DED1] rounded-lg bg-white py-10 text-center">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="h-40 w-auto mx-auto rounded-lg object-cover mb-3"
                    />
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Upload image</p>
                    </>
                  )}
                  <label
                    htmlFor="file"
                    className="mt-3 inline-block cursor-pointer rounded-lg border border-[#E1DED1] bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Choose File
                  </label>
                  <input
                    id="file"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setPreview(URL.createObjectURL(file));
                        onChange(file);
                      }
                    }}
                  />
                  {errors.image && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.image.message as string}
                    </p>
                  )}
                </div>
              )}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateProduct;
