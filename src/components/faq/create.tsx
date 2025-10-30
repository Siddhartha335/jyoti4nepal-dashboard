"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const CreateFaqPage = () => {
  const router = useRouter();
  const [isPublished, setIsPublished] = useState(false);

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
            onClick={() => router.back()}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button className="rounded-lg bg-[#CE9F41] px-4 py-2 text-sm font-semibold text-white hover:brightness-95">
            Create FAQ
          </button>
        </div>
      </div>
      {/* Form Card */}
      <div className="rounded-lg border border-gray-200 bg-[#F7F6F3] px-5 py-4 shadow-sm w-full">
        {/* Question */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium text-[#65421E]">
            Question
          </label>
          <input
            type="text"
            placeholder="Enter the question"
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-300"
          />
        </div>

        {/* Answer */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium text-[#65421E]">
            Answer
          </label>
          <textarea
            placeholder="Enter the answer"
            rows={4}
            className="w-full resize-y rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-300"
          ></textarea>
        </div>

        {/* Category and Order */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 mb-5">
          <div>
            <label className="mb-2 block text-sm font-medium   text-[#65421E]">
              Category
            </label>
            <select className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-300">
              <option>Once per visitor</option>
              <option>General</option>
              <option>Shipping</option>
              <option>Returns</option>
              <option>Ethics</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#65421E]">
              Display order
            </label>
            <input
              type="number"
              min="1"
              placeholder="1"
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-300"
            />
          </div>
        </div>

        {/* Publish toggle */}
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-800">
              Publish FAQ
            </label>
            <p className="text-sm text-[#65421E]">
              Make this FAQ visible on the website
            </p>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            onClick={() => setIsPublished(!isPublished)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
              isPublished ? "bg-[#CE9F41]" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                isPublished ? "translate-x-5" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateFaqPage;
