"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Star, Upload, AlertCircle } from "lucide-react";
import { useCreate } from "@refinedev/core";
import toast from "react-hot-toast";

import {
  TestimonialSchema,
  type TestimonialForm,
} from "@/features/testimonials/testimonial.schema";

const CreateTestimonial = () => {
  const router = useRouter();
  const { mutate: createTestimonial, isLoading } = useCreate();
  const [isHeicFile, setIsHeicFile] = React.useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
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

  const onSubmit =
  (status: "Draft" | "Published") =>
  async (values: TestimonialForm) => {
    if (!values.company_logo) {
      toast.error("Please upload a company logo");
      return;
    }

    createTestimonial(
      {
        resource: "testimonial",
        values: {
          company_logo: values.company_logo,
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
          toast.success("Testimonial created successfully!");
          router.push("/testimonials");
        },
        onError: (error: any) => {
          console.error("Failed to create testimonial:", error);
          toast.error(
            error?.response?.data?.message || "Failed to create testimonial. Please try again."
          );
        },
      }
    );
  };

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

        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
          Add New Testimonial
        </h1>

        <div className="flex items-center gap-3">
          <button
            disabled={isSubmitting || isLoading}
            onClick={handleSubmit(onSubmit("Draft"))}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            Save as Draft
          </button>
          <button
            disabled={isSubmitting || isLoading}
            onClick={handleSubmit(onSubmit("Published"))}
            className="rounded-xl bg-[#CE9F41] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-95 disabled:opacity-60"
          >
            {isLoading ? "Publishing..." : "Publish"}
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
            <h3 className="mb-3 text-sm font-semibold text-gray-800">
              Company Logo <span className="text-red-500">*</span>
            </h3>

            <Controller
              name="company_logo"
              control={control}
              render={({ field: { onChange, value } }) => {
                const [preview, setPreview] = React.useState<string | null>(null);

                React.useEffect(() => {
                  if (value instanceof File) {
                    const isHeic = value.type === 'image/heic' || 
                                  value.type === 'image/heif' ||
                                  value.name.toLowerCase().endsWith('.heic') || 
                                  value.name.toLowerCase().endsWith('.heif');
                    
                    setIsHeicFile(isHeic);
                    
                    if (!isHeic) {
                      const url = URL.createObjectURL(value);
                      setPreview(url);
                      return () => URL.revokeObjectURL(url);
                    } else {
                      setPreview(null);
                    }
                  } else {
                    setPreview(null);
                    setIsHeicFile(false);
                  }
                }, [value]);

                const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files?.[0] ?? null;
                  onChange(file);
                };

                return (
                  <>
                    <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-4 text-center">
                      {isHeicFile ? (
                        <div className="px-4 py-6">
                          <AlertCircle className="h-12 w-12 text-amber-500 mb-3 mx-auto" />
                          <p className="text-sm font-medium text-gray-700 mb-2">HEIC File Selected</p>
                          <p className="text-xs text-gray-500">Preview not available</p>
                          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-xs text-amber-800 flex items-center justify-center gap-2">
                              <AlertCircle className="h-4 w-4 flex-shrink-0" />
                              Image will be automatically converted to JPEG after upload
                            </p>
                          </div>
                        </div>
                      ) : preview ? (
                        <div className="mb-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={preview}
                            alt="Company logo preview"
                            className="mx-auto h-24 w-24 rounded-lg object-contain"
                            decoding="async"
                          />
                        </div>
                      ) : (
                        <div className="mb-3 flex flex-col items-center justify-center gap-2 text-gray-500">
                          <Upload className="h-6 w-6" />
                          <p className="text-sm">Click to upload or drag and drop</p>
                        </div>
                      )}
                      <input
                        id="company_logo"
                        type="file"
                        accept="image/*,.heic,.heif"
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
          {errors.content && (
            <p className="mt-1 text-xs text-red-600">{errors.content.message}</p>
          )}
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
            {errors.rating && (
              <p className="mt-1 text-xs text-red-600">{errors.rating.message}</p>
            )}
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
              {" "}
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

export default CreateTestimonial;