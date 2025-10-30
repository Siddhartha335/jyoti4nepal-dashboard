"use client";

import React, { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Star, Upload } from "lucide-react";
import { useOne, useUpdate } from "@refinedev/core";
import toast from "react-hot-toast";

import {
  TestimonialSchema,
  type TestimonialForm,
} from "@/features/testimonials/testimonial.schema";

type Testimonial = {
  testimonial_id: string;
  name: string;
  email: string;
  status: "Published" | "Draft";
  content: string;
  rating: 1 | 2 | 3 | 4 | 5;
  featured: "Featured" | "Normal";
  company_logo: string;
  createdAt: string;
  updatedAt: string;
};

const EditTestimonial = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  // Fetch existing testimonial data
  const { data, isLoading: isFetching } = useOne<Testimonial>({
    resource: "testimonial",
    id: id,
  });

  const { mutate: updateTestimonial, isLoading: isUpdating } = useUpdate();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TestimonialForm>({
    resolver: zodResolver(TestimonialSchema),
    defaultValues: {
      name: "",
      email: "",
      content: "",
      rating: 5,
      featured: "Normal",
      company_logo: null,
    },
    mode: "onTouched",
  });

  // Prefill form when data is loaded
  useEffect(() => {
    if (data?.data) {
      reset({
        name: data.data.name,
        email: data.data.email,
        content: data.data.content,
        rating: data.data.rating,
        featured: data.data.featured,
        company_logo: null, // Don't prefill file input
      });
    }
  }, [data, reset]);

  const onSubmit =
    (status: "Draft" | "Published") => async (values: TestimonialForm) => {
      updateTestimonial(
        {
          resource: "testimonial",
          id: id,
          values: {
            company_logo: values.company_logo || undefined,
            name: values.name,
            email: values.email,
            content: values.content,
            rating: values.rating,
            featured: values.featured,
            status: status,
          },
        },
        {
          onSuccess: () => {
            toast.success("Testimonial updated successfully!");
            router.push(`/testimonials/${id}`);
          },
          onError: (error: any) => {
            console.error("Failed to update testimonial:", error);
            toast.error(
              error?.response?.data?.message || "Failed to update testimonial. Please try again."
            );
          },
        }
      );
    };

  if (isFetching) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#CE9F41]"></div>
          <p className="mt-4 text-sm text-gray-600">Loading testimonial...</p>
        </div>
      </div>
    );
  }

  const testimonial = data?.data;

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

        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">Edit Testimonial</h1>

        <div className="flex items-center gap-3">
          <button
            disabled={isUpdating}
            onClick={handleSubmit(onSubmit("Draft"))}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            Save as Draft
          </button>
          <button
            disabled={isUpdating}
            onClick={handleSubmit(onSubmit("Published"))}
            className="rounded-xl bg-[#CE9F41] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-95 disabled:opacity-60"
          >
            {isUpdating ? "Updating..." : "Update & Publish"}
          </button>
        </div>
      </div>

      {/* Form */}
      <form
        className="rounded-2xl max-w-3xl mx-auto border border-gray-200 bg-[#F7F6F3] p-5"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Name */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register("name")}
              placeholder="Enter full name"
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-300"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              {...register("email")}
              placeholder="name@example.com"
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-300"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          {/* Company Logo */}
          <div className="md:col-span-2 rounded-2xl border border-[#E1DED1] bg-[#F7F6F3] p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-800">Company Logo</h3>

            {/* Show current logo */}
            {testimonial?.company_logo && (
              <div className="mb-3">
                <p className="mb-2 text-xs text-gray-600">Current logo:</p>
                <img
                  src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${testimonial.company_logo}`}
                  alt="Current logo"
                  className="h-16 w-16 rounded-lg border border-gray-200 object-contain p-2"
                />
              </div>
            )}

            <Controller
              name="company_logo"
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
                        <div className="mb-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={preview}
                            alt="New logo preview"
                            className="mx-auto h-24 w-24 rounded-lg object-contain"
                            decoding="async"
                          />
                        </div>
                      ) : (
                        <div className="mb-3 flex flex-col items-center justify-center gap-2 text-gray-500">
                          <Upload className="h-6 w-6" />
                          <p className="text-sm">Upload new logo (optional)</p>
                        </div>
                      )}
                      <input
                        id="company_logo"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFile}
                      />
                      <label
                        htmlFor="company_logo"
                        className="inline-block cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Choose File
                      </label>
                    </div>
                    {errors.company_logo && (
                      <p className="mt-1 text-xs text-red-600">{errors.company_logo.message}</p>
                    )}
                  </>
                );
              }}
            />
          </div>
        </div>

        {/* Testimonial Content */}
        <div className="mt-5">
          <label className="mb-2 block text-sm font-semibold text-gray-800">
            Testimonial Content <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register("content")}
            placeholder="Enter testimonial content here"
            rows={8}
            className="w-full resize-y rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-gray-300"
          />
          {errors.content && <p className="mt-1 text-xs text-red-600">{errors.content.message}</p>}
        </div>

        {/* Rating / Featured */}
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Rating */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">
              Rating <span className="text-red-500">*</span>
            </label>
            <Controller
              control={control}
              name="rating"
              render={({ field: { value, onChange } }) => (
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const n = i + 1;
                    const active = n <= (value ?? 0);
                    return (
                      <button
                        type="button"
                        key={n}
                        className="p-0.5"
                        onClick={() => onChange(n)}
                        aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
                      >
                        <Star
                          className={`h-6 w-6 ${
                            active ? "fill-[#CE9F41] text-[#CE9F41]" : "text-gray-300"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            />
            {errors.rating && <p className="mt-1 text-xs text-red-600">{errors.rating.message}</p>}
          </div>

          {/* Featured */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">Featured</label>
            <Controller
              name="featured"
              control={control}
              render={({ field: { value, onChange } }) => (
                <select
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-300"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                >
                  <option value="Normal">Normal</option>
                  <option value="Featured">Featured</option>
                </select>
              )}
            />
            <p className="mt-2 text-xs font-medium text-gray-800">
              If you choose <strong>featured</strong>, this testimonial will appear on the landing
              of homepage
            </p>
            {errors.featured && (
              <p className="mt-1 text-xs text-red-600">{errors.featured.message}</p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditTestimonial;