"use client";

import React from "react";
import { useOne } from "@refinedev/core";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, ImageIcon, Calendar } from "lucide-react";

type Product = {
  product_id: string;
  name: string;
  description: string;
  category: string;
  status: "Published" | "Draft";
  image: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

const STATUS_STYLES: Record<Product["status"], { wrap: string; dot: string }> = {
  Published: {
    wrap: "bg-[#F2E8D4] text-[#7B5B12] border border-[#E6D8BB]",
    dot: "bg-[#CE9F41]",
  },
  Draft: {
    wrap: "bg-gray-100 text-gray-600 border border-gray-200",
    dot: "bg-gray-400",
  },
};

const ViewProductPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { data, isLoading, isError } = useOne<Product>({
    resource: "product",
    id,
  });

  const product = data?.data;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px] text-gray-500">
        Loading product details...
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="text-center py-20 text-gray-600">
        <p className="text-lg font-medium text-red-500 mb-2">
          Failed to load product details.
        </p>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-[#7B5B12] underline underline-offset-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm">Back</span>
        </button>

        <h1 className="text-2xl font-semibold text-gray-800">
          {product.name}
        </h1>

        <button
          onClick={() => router.push(`/products/${id}/edit`)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#CE9F41] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-95"
        >
          <Edit className="h-4 w-4" />
          Edit Product
        </button>
      </div>

      {/* Content Card */}
      <div className="rounded-2xl border border-[#E1DED1] bg-[#F7F6F3] p-6 space-y-6 shadow-sm">
        {/* Image */}
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-full sm:w-1/3 rounded-xl overflow-hidden border border-[#E1DED1] bg-white shadow-sm flex items-center justify-center h-56">
            {product.image ? (
              <img
                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${product.image}`}
                alt={product.name}
                className="object-cover h-full w-full"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400">
                <ImageIcon className="h-10 w-10" />
                <p className="mt-2 text-sm">No image available</p>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-[#65421E] mb-1">
                Category
              </h2>
              <p className="text-gray-800 text-sm">{product.category}</p>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-[#65421E] mb-1">
                Status
              </h2>
              {product.status && STATUS_STYLES[product.status] ? (
                <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[product.status].wrap}`}
                >
                    <span
                    className={`mr-2 inline-block h-2 w-2 rounded-full ${STATUS_STYLES[product.status].dot}`}
                    ></span>
                    {product.status}
                </span>
                ) : (
                <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-500 px-3 py-1 text-xs font-semibold border border-gray-200">
                    Unknown
                </span>
                )}
            </div>

            <div>
              <h2 className="text-sm font-semibold text-[#65421E] mb-1">
                Tags
              </h2>
              {product.tags?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full bg-[#E1DED1]/60 px-3 py-1 text-xs font-medium text-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No tags available</p>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 pt-2">
              <Calendar className="h-4 w-4" />
              <span>
                Created on{" "}
                <span className="font-medium text-gray-800">
                  {new Date(product.createdAt).toLocaleDateString()}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h2 className="text-sm font-semibold text-[#65421E] mb-2">
            Description
          </h2>
          <p className="text-sm leading-relaxed text-gray-700 bg-white border border-[#E1DED1] rounded-xl p-4 shadow-sm">
            {product.description || "No description provided."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ViewProductPage;
