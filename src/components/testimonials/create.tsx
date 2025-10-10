"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Star } from "lucide-react";

import {
  TestimonialSchema,
  type TestimonialForm,
  TESTIMONIAL_ROLES,
  TESTIMONIAL_STATUSES,
} from "@/features/testimonials/testimonial.schema";

const CreateTestimonial = () => {
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<TestimonialForm>({
    resolver: zodResolver(TestimonialSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "Customer",
      roleNote: "",
      content: "",
      rating: 5,
      status: "Pending",
      featured: false,
    },
    mode: "onTouched",
  });

  const rating = watch("rating");
  const featured = watch("featured");

  const onSubmit =
    (targetStatus: TestimonialForm["status"]) =>
    async (values: TestimonialForm) => {
      const payload = { ...values, status: targetStatus };
      // TODO: integrate with refine useCreate({ resource: "testimonials" })
      console.log("Submitting testimonial:", payload);
      alert(`${targetStatus} submitted (mock). Wire to your API/refine useCreate.`);
      // router.push("/testimonials");
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
            disabled={isSubmitting}
            onClick={handleSubmit(onSubmit("Pending"))}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            Save as Draft
          </button>
          <button
            disabled={isSubmitting}
            onClick={handleSubmit(onSubmit("Approved"))}
            className="rounded-xl bg-[#CE9F41] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-95 disabled:opacity-60"
          >
            Publish
          </button>
        </div>
      </div>

      {/* Card */}
      <form className="rounded-2xl max-w-3xl mx-auto border border-gray-200 bg-[#F7F6F3] p-5">
        {/* Grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">Name</label>
            <input
              {...register("name")}
              placeholder="Enter full name"
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-300"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">Email</label>
            <input
              {...register("email")}
              placeholder="Enter email  address"
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-300"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">Role</label>
            <select
              {...register("role")}
              className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-300"
            >
              {TESTIMONIAL_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {errors.role && <p className="mt-1 text-xs text-red-600">{errors.role.message}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">Role</label>
            <input
              {...register("roleNote")}
              placeholder="Description of blog post"
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-300"
            />
            {errors.roleNote && (
              <p className="mt-1 text-xs text-red-600">{errors.roleNote.message}</p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="mt-5">
          <label className="mb-2 block text-sm font-semibold text-gray-800">
            Testimonial Content
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

        {/* Rating / Status / Featured */}
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* Rating */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">Rating</label>
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

          {/* Status */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">Status</label>
            <select
              {...register("status")}
              className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-300"
            >
              <option value="">Status</option>
              {TESTIMONIAL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {errors.status && (
              <p className="mt-1 text-xs text-red-600">{errors.status.message}</p>
            )}
          </div>

          {/* Featured toggle */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">Featured</label>
            <Controller
              control={control}
              name="featured"
              render={({ field: { value, onChange } }) => (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onChange(!value)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                      value ? "bg-[#CE9F41]" : "bg-gray-300"
                    }`}
                    aria-pressed={value}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                        value ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <span className="text-sm text-gray-600">Show on Homepage</span>
                </div>
              )}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateTestimonial;
