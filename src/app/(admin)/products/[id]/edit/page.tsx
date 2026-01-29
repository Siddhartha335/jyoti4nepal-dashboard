"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  Tag as TagIcon,
  AlertCircle,
  X,
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
  
  // Gallery Management
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newPreviews, setNewPreviews] = useState<{ url: string; isHeic: boolean }[]>([]);

  const [categories, setCategories] = useState<string[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [useExistingCategory, setUseExistingCategory] = useState(true);

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
      images: [], 
    },
    mode: "onTouched",
  });

  const product = Array.isArray(data?.data) ? data?.data[0] : data?.data;
  const tags = watch("tags") || [];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/product/all-categories`);
        const json = await res.json();
        setCategories(json.data?.map((c: any) => c.category) || []);
      } catch (err) {
        console.error("Failed to load categories", err);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description,
        category: product.category,
        status: product.status,
        tags: product.tags || [],
        images: [],
      });

      if (product.images && Array.isArray(product.images)) {
        setExistingImages(product.images);
      } else if (product.image) {
        setExistingImages([product.image]);
      }
      
      if (product.category && categories.length > 0) {
        setUseExistingCategory(categories.includes(product.category));
      }
    }
  }, [product, reset, categories]);

  const addTag = () => {
    const t = tagInput.trim();
    if (!t || tags.includes(t)) return;
    setValue("tags", [...tags, t]);
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setValue("tags", tags.filter((t) => t !== tag), { shouldDirty: true });
  };

  const removeExistingImage = (idx: number) => {
    setExistingImages((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      // Trigger form dirty state so images are included in payload
      setValue("images", watch("images"), { shouldDirty: true });
      return updated;
    });
  };

  const removeNewFile = (index: number, currentFiles: File[], onChange: any) => {
    const updatedFiles = [...currentFiles];
    updatedFiles.splice(index, 1);
    
    const updatedPreviews = [...newPreviews];
    if (!updatedPreviews[index].isHeic) URL.revokeObjectURL(updatedPreviews[index].url);
    updatedPreviews.splice(index, 1);
    
    setNewPreviews(updatedPreviews);
    onChange(updatedFiles);
  };

  const submitWithStatus = (status: Product["status"]) =>
    handleSubmit(async (formData) => {
      const totalImages = existingImages.length + (formData.images?.length || 0);

      if (totalImages === 0) {
        toast.error("At least one image is required.");
        return;
      }

      try {
        const payload = { 
          ...formData,
          status,
          tags: formData.tags ?? [],
          existingImages // ✅ Passing state into payload
        };

        await mutateAsync({
          resource: "product",
          id,
          values: payload,
        });

        toast.success("Product updated successfully!");
        router.push("/products");
      } catch (error) {
        console.error("Update error:", error);
        toast.error("Failed to update product.");
      }
    });

  if (isLoading) return <div className="flex items-center justify-center min-h-[400px]">Loading...</div>;

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm">Back</span>
        </button>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">Edit Product</h1>
        <div className="flex items-center gap-3">
          <button onClick={submitWithStatus("Draft")} disabled={isSubmitting || isUpdating} className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            {isUpdating ? "Saving..." : "Save as Draft"}
          </button>
          <button onClick={submitWithStatus("Published")} disabled={isSubmitting || isUpdating} className="rounded-xl bg-[#CE9F41] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-95">
            Update & Publish
          </button>
        </div>
      </div>

      <form className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#E1DED1] bg-[#F7F6F3] p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Product Details</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input {...register("name")} className="w-full rounded-lg border border-[#E1DED1] bg-white px-3 py-2 text-sm outline-none focus:border-[#CE9F41]" />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea {...register("description")} rows={3} className="w-full rounded-lg border border-[#E1DED1] bg-white px-3 py-2 text-sm outline-none focus:border-[#CE9F41]" />
              {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description.message}</p>}
            </div>
          </div>

          <div className="rounded-2xl border border-[#E1DED1] bg-[#F7F6F3] p-5">
            <label className="block text-sm font-medium text-gray-700 mb-3">Category</label>
            <div className="flex items-center gap-3 mb-4">
              <button type="button" onClick={() => { setUseExistingCategory(true); setValue("category", ""); }} className={`px-3 py-2 text-sm rounded-lg border ${useExistingCategory ? "border-[#CE9F41] text-[#CE9F41]" : "border-gray-300 text-gray-600"}`}>Choose Existing</button>
              <button type="button" onClick={() => { setUseExistingCategory(false); setValue("category", ""); }} className={`px-3 py-2 text-sm rounded-lg border ${!useExistingCategory ? "border-[#CE9F41] text-[#CE9F41]" : "border-gray-300 text-gray-600"}`}>Create New</button>
            </div>
            {useExistingCategory ? (
              <select {...register("category")} className="w-full rounded-lg border border-[#E1DED1] bg-white px-3 py-2 text-sm outline-none">
                <option value="">Select a category</option>
                {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            ) : (
              <input {...register("category")} placeholder="Enter new category" className="w-full rounded-lg border border-[#E1DED1] bg-white px-3 py-2 text-sm outline-none focus:border-[#CE9F41]" />
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-[#E1DED1] bg-[#F7F6F3] p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Product Gallery</h3>
            <Controller
              name="images"
              control={control}
              render={({ field: { onChange, value = [] }, fieldState: { error } }) => {
                const hasNoImagesAtAll = existingImages.length === 0 && value.length === 0;
                
                return (
                  <div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {existingImages.map((img, idx) => (
                        <div key={`exist-${idx}`} className="relative group aspect-square rounded-lg border border-[#E1DED1] bg-white overflow-hidden shadow-sm">
                          <img src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${img}`} alt="Existing" className="h-full w-full object-cover" />
                          <button type="button" onClick={() => removeExistingImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}

                      {newPreviews.map((prev, idx) => (
                        <div key={`new-${idx}`} className="relative group aspect-square rounded-lg border border-[#E1DED1] bg-white overflow-hidden ring-2 ring-[#CE9F41] shadow-sm">
                          {prev.isHeic ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-2 bg-amber-50">
                              <AlertCircle className="h-6 w-6 text-amber-500 mb-1" />
                              <span className="text-[10px] font-medium">HEIC</span>
                            </div>
                          ) : (
                            <img src={prev.url} alt="New" className="h-full w-full object-cover" />
                          )}
                          <button type="button" onClick={() => removeNewFile(idx, value, onChange)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}

                      <label htmlFor="multi-upload" className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-[#E1DED1] rounded-lg bg-white cursor-pointer hover:bg-gray-50 transition-colors">
                        <Upload className="h-6 w-6 text-gray-400 mb-1" />
                        <span className="text-[10px] text-gray-500 font-medium">Add Photo</span>
                        <input id="multi-upload" type="file" multiple accept="image/*,.heic,.heif" className="hidden" 
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            const updatedFiles = [...value, ...files];
                            const updatedPreviews = files.map(file => ({
                              url: file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif') ? "" : URL.createObjectURL(file),
                              isHeic: file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')
                            }));
                            setNewPreviews([...newPreviews, ...updatedPreviews]);
                            onChange(updatedFiles);
                          }}
                        />
                      </label>
                    </div>
                    {error && hasNoImagesAtAll && (
                      <p className="text-xs text-red-600 mt-3 font-medium flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> At least one image is required.
                      </p>
                    )}
                  </div>
                );
              }}
            />
          </div>

          <div className="rounded-2xl border border-[#E1DED1] bg-[#F7F6F3] p-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} placeholder="Add tags" className="w-full rounded-lg border border-[#E1DED1] bg-white px-3 py-2 pl-9 text-sm outline-none focus:border-[#CE9F41]" />
                <TagIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
              <button type="button" onClick={addTag} className="rounded-lg bg-white border border-[#E1DED1] px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Add</button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-white border border-[#E1DED1] px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="ml-1 text-gray-500 hover:text-red-500">×</button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditProductPage;