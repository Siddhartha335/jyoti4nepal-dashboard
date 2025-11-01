"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaqSchema, type FaqForm } from "@features/faqs/faq.schema";
import { useCreate } from "@refinedev/core";
import toast from "react-hot-toast";

const CreateFaqPage = () => {
  const router = useRouter();

  const { mutate: createFaq, isLoading } = useCreate({
    resource: "faq",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FaqForm>({
    resolver: zodResolver(FaqSchema),
    defaultValues: {
      question: "",
      answer: "",
      category: "General",
      display_order: 1,
    },
  });

  const onSubmit = (data: FaqForm, status: "Draft" | "Published") => {
    const faqData = { ...data, status };
    
    createFaq(
      {
        values: faqData,
      },
      {
        onSuccess: () => {
          toast.success(
            status === "Draft" 
              ? "FAQ saved as draft successfully!" 
              : "FAQ published successfully!"
          );
          router.push("/faq");
        },
        onError: (error) => {
          console.error("Error creating FAQ:", error);
          toast.error("Failed to create FAQ. Please try again.");
        },
      }
    );
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-gray-900">Add New FAQ</h1>
          <p className="text-sm text-[#65421E]">
            Create a new frequently asked question and answer.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSubmit((data) => onSubmit(data, "Draft"))}
            disabled={isLoading}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            {isLoading ? "Saving..." : "Save as Draft"}
          </button>
          <button
            onClick={handleSubmit((data) => onSubmit(data, "Published"))}
            disabled={isLoading}
            className="rounded-xl bg-[#CE9F41] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-95 disabled:opacity-60"
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
            Question
          </label>
          <input
            type="text"
            placeholder="Enter the question"
            {...register("question")}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-300"
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
            Answer
          </label>
          <textarea
            placeholder="Enter the answer"
            rows={4}
            {...register("answer")}
            className="w-full resize-y rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-300"
          />
          {errors.answer && (
            <p className="mt-1 text-sm text-red-500">
              {errors.answer.message}
            </p>
          )}
        </div>

        {/* Category and Order */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 mb-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#65421E]">
              Category
            </label>
            <select
              {...register("category")}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-300"
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
              Display order
            </label>
            <input
              type="number"
              min="0"
              placeholder="1"
              {...register("display_order", { valueAsNumber: true })}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-300"
            />
            {errors.display_order && (
              <p className="mt-1 text-sm text-red-500">
                {errors.display_order.message}
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateFaqPage;