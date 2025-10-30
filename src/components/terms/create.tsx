"use client";

import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const CreateTerms = () => {
  const router = useRouter();
  const [featured, setFeatured] = useState(false);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <h1 className="text-xl sm:text-2xl font-medium text-gray-900">
          Add New Terms & Conditions
        </h1>

        <button className="rounded-lg bg-[#CE9F41] px-4 py-2 text-sm font-semibold text-white hover:brightness-95">
          Publish
        </button>
      </div>
      {/* Form Card */}
      <div className="max-w-3xl mx-auto rounded-lg border border-[#E1DED1] bg-[#F7F6F3] px-5 py-4 shadow-sm">
        {/* Title */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-semibold text-gray-800">
            Title
          </label>
          <input
            type="text"
            placeholder="Enter section title..."
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-300"
          />
        </div>

        {/* Content */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-semibold text-gray-800">
            Content
          </label>
          <textarea
            placeholder="Enter terms and conditions content..."
            rows={5}
            className="w-full resize-y rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-300"
          ></textarea>
        </div>

        {/* Featured toggle */}
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-semibold text-gray-800">
              Featured
            </label>
            <p className="text-sm text-gray-600">Show on website</p>
          </div>

          <button
            type="button"
            onClick={() => setFeatured(!featured)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
              featured ? "bg-[#CE9F41]" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                featured ? "translate-x-5" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTerms;
