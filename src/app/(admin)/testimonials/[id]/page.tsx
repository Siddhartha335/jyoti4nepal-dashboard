"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { useOne } from "@refinedev/core";
import { ArrowLeft, Star, Mail, Building2, Calendar, Edit, Trash2 } from "lucide-react";
import Link from "next/link";

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

const STATUS_STYLES: Record<Testimonial["status"], { wrap: string; dot: string; text: string }> = {
  Published: {
    wrap: "bg-[#F2E8D4] text-[#7B5B12] border border-[#E6D8BB]",
    dot: "bg-[#CE9F41]",
    text: "Published",
  },
  Draft: {
    wrap: "bg-gray-100 text-gray-600 border border-gray-200",
    dot: "bg-gray-400",
    text: "Draft",
  },
};

const Stars = ({ value }: { value: number }) => (
  <div className="flex items-center gap-1">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${i < value ? "fill-[#CE9F41] text-[#CE9F41]" : "text-gray-300"}`}
      />
    ))}
  </div>
);

const ViewTestimonial = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { data, isLoading, isError } = useOne<Testimonial>({
    resource: "testimonial",
    id: id,
  });

  const testimonial = data?.data;

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#CE9F41]"></div>
          <p className="mt-4 text-sm text-gray-600">Loading testimonial...</p>
        </div>
      </div>
    );
  }

  if (isError || !testimonial) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-800">Testimonial not found</p>
          <button
            onClick={() => router.back()}
            className="mt-4 inline-flex items-center gap-2 text-sm text-[#7B5B12] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Go back
          </button>
        </div>
      </div>
    );
  }

  const statusStyle = STATUS_STYLES[testimonial.status];

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="flex items-center gap-3">
          <Link href={`/testimonials/${id}/edit`}>
            <button className="inline-flex items-center gap-2 rounded-xl border border-gray-300 text-white bg-[#CE9F41] px-4 py-2 text-sm font-semibold hover:bg-gray-50">
              <Edit className="h-4 w-4" />
              Edit
            </button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* Status and Featured Badges */}
        <div className="mb-6 flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyle.wrap}`}
          >
            <span className={`h-2 w-2 rounded-full ${statusStyle.dot}`} />
            {statusStyle.text}
          </span>

          {testimonial.featured === "Featured" && (
            <span className="inline-flex items-center rounded-full bg-[#F2E8D4] px-3 py-1.5 text-xs font-semibold text-[#7B5B12] border border-[#E6D8BB]">
              ⭐ Featured
            </span>
          )}
        </div>

        {/* Company Logo and Basic Info */}
        <div className="flex items-start gap-6 border-b border-gray-200 pb-6">
          {/* Company Logo */}
          <div className="flex-shrink-0">
            {testimonial.company_logo ? (
              <img
                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${testimonial.company_logo}`}
                alt={testimonial.name}
                className="h-20 w-20 rounded-lg border border-gray-200 object-contain p-2"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
                <Building2 className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Name and Contact */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{testimonial.name}</h1>
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4" />
              <a href={`mailto:${testimonial.email}`} className="hover:text-[#7B5B12] hover:underline">
                {testimonial.email}
              </a>
            </div>

            {/* Rating */}
            <div className="mt-3">
              <Stars value={testimonial.rating} />
            </div>
          </div>
        </div>

        {/* Testimonial Content */}
        <div className="py-6">
          <h2 className="mb-3 text-sm font-semibold text-gray-800">Testimonial</h2>
          <div className="rounded-xl bg-gray-50 p-5 text-gray-800 leading-relaxed">
            <p className="italic">"{testimonial.content}"</p>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between border-t border-gray-200 pt-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Created: {formatDate(testimonial.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Updated: {formatDate(testimonial.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTestimonial;