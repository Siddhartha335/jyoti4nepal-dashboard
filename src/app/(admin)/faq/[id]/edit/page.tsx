"use client";

import React, { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaqSchema, type FaqForm } from "@features/faqs/faq.schema";
import { useOne, useUpdate } from "@refinedev/core";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

type FaqData = {
  faq_id: string;
  question: string;
  answer: string;
  category: "General" | "Shipping" | "Returns" | "Ethics";
  status: "Published" | "Draft";
  display_order: number;
  createdAt: string;
  updatedAt: string;
};

const EditFaqPage = () => {
  const router = useRouter();
  const params = useParams();
  const faqId = params?.id as string;

  // Fetch existing FAQ data
  const { data, isLoading: isFetching } = useOne<FaqData>({
    resource: "faq",
    id: faqId,
  });

  const faq = data?.data;

  // Update mutation
  const { mutate: updateFaq, isLoading: isUpdating } = useUpdate({
    resource: "faq",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FaqForm>({
    resolver: zodResolver(FaqSchema),
    defaultValues: {
      question: "",
      answer: "",
      category: "General",
      display_order: 1,
    },
  });

  // Populate form when data is loaded
  useEffect(() => {
    if (faq) {
      reset({
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        display_order: faq.display_order,
      });
    }
  }, [faq, reset]);

  const onSubmit = (data: FaqForm, status: "Draft" | "Published") => {
    const faqData = { ...data, status };

    updateFaq(
      {
        id: faqId,
        values: faqData,
      },
      {
        onSuccess: () => {
          toast.success(
            status === "Draft"
              ? "FAQ updated as draft successfully!"
              : "FAQ published successfully!"
          );
          router.push("/faq");
        },
        onError: (error) => {
          console.error("Error updating FAQ:", error);
          toast.error("Failed to update FAQ. Please try again.");
        },
      }
    );
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#CE9F41] border-r-transparent"></div>
          <p className="mt-4 text-sm text-gray-600">Loading FAQ...</p>
        </div>
      </div>
    );
  }

  if (!faq) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 font-medium">FAQ not found</p>
          <button
            onClick={() => router.push("/faq")}
            className="mt-4 text-[#CE9F41] hover:underline text-sm"
          >
            ← Back to FAQ list
          </button>
        </div>
      </div>
    );
  }

  const isLoading = isUpdating;

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={() => router.push("/faq")}
        className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to FAQs
      </button>

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-gray-900">Edit FAQ</h1>
          <p className="text-sm text-[#65421E]">
            Update the frequently asked question and answer.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSubmit((data) => onSubmit(data, "Draft"))}
            disabled={isLoading}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition"
          >
            {isLoading ? "Saving..." : "Save as Draft"}
          </button>
          <button
            onClick={handleSubmit((data) => onSubmit(data, "Published"))}
            disabled={isLoading}
            className="rounded-xl bg-[#CE9F41] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-95 disabled:opacity-60 transition"
          >
            {isLoading ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit((data) => onSubmit(data, "Published"))}
        className="rounded-lg border border-gray-200 bg-[#F7F6F3] px-5 py-4 shadow-sm w-full"
      >
        {/* Question */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium text-[#65421E]">
            Question <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter the question"
            {...register("question")}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-300 transition"
          />
          {errors.question && (
            <p className="mt-1 text-sm text-red-500">
              {errors.question.message}
            </p>
          )}
        </div>

        {/* Answer */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium text-[#65421E]">
            Answer <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder="Enter the answer"
            rows={6}
            {...register("answer")}
            className="w-full resize-y rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-300 transition"
          />
          {errors.answer && (
            <p className="mt-1 text-sm text-red-500">
              {errors.answer.message}
            </p>
          )}
        </div>

        {/* Category and Display Order */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 mb-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#65421E]">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              {...register("category")}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-300 transition"
            >
              <option value="General">General</option>
              <option value="Shipping">Shipping</option>
              <option value="Returns">Returns</option>
              <option value="Ethics">Ethics</option>
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-500">
                {errors.category.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#65421E]">
              Display Order <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              placeholder="1"
              {...register("display_order", { valueAsNumber: true })}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-300 transition"
            />
            {errors.display_order && (
              <p className="mt-1 text-sm text-red-500">
                {errors.display_order.message}
              </p>
            )}
          </div>
        </div>

        {/* Current Status Info */}
        <div className="mt-6 pt-5 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="text-gray-600">
                Current Status:{" "}
                <span
                  className={`font-semibold ${
                    faq.status === "Published" ? "text-[#7B5B12]" : "text-gray-700"
                  }`}
                >
                  {faq.status}
                </span>
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Last updated: {new Date(faq.updatedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push(`/faq/${faq.faq_id}`)}
              className="text-[#CE9F41] hover:underline text-sm font-medium"
            >
              View FAQ →
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditFaqPage;