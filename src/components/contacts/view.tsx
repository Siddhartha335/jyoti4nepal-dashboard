"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { useOne } from "@refinedev/core";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Building2,
  Globe,
  MessageSquare,
  Calendar,
  Package,
  Printer,
  FileText,
  Clock,
} from "lucide-react";

type Contact = {
  contact_id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  address: string;
  company_name: string;
  region: string;
  inquiry?: string;
  order_piece?: number;
  order_date?: string;
  custom_printing?: boolean;
  sketch?: string;
  comments?: string;
  createdAt: string;
  updatedAt: string;
};

const ViewContacts = () => {
  const router = useRouter();
  const params = useParams();
  const contactId = params?.id as string;

  const { data, isLoading, isError } = useOne<Contact>({
    resource: "contact",
    id: contactId,
  });

  const contact = data?.data;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateOnly = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CE9F41] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading contact details...</p>
        </div>
      </div>
    );
  }

  if (isError || !contact) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Contact Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The contact you're looking for doesn't exist or has been deleted.
          </p>
          <button
            onClick={() => router.push("/contacts")}
            className="inline-flex items-center gap-2 rounded-xl bg-[#CE9F41] px-4 py-2 text-sm font-semibold text-white hover:brightness-95"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Contacts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push("/contacts")}
            className="mb-3 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Contacts
          </button>
          <h1 className="text-2xl font-semibold text-gray-800">
            Contact Details
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            View inquiry and customer information
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Personal & Company Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[#F2E8D4] flex items-center justify-center">
                <Mail className="h-4 w-4 text-[#7B5B12]" />
              </div>
              Personal Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  First Name
                </label>
                <p className="mt-1 text-sm text-gray-900 font-medium">
                  {contact.firstname}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Last Name
                </label>
                <p className="mt-1 text-sm text-gray-900 font-medium">
                  {contact.lastname}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  Email
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-[#65421E] hover:underline"
                  >
                    {contact.email}
                  </a>
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  Phone
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  <a
                    href={`tel:${contact.phone}`}
                    className="text-[#65421E] hover:underline"
                  >
                    {contact.phone}
                  </a>
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Address
                </label>
                <p className="mt-1 text-sm text-gray-900">{contact.address}</p>
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[#F2E8D4] flex items-center justify-center">
                <Building2 className="h-4 w-4 text-[#7B5B12]" />
              </div>
              Company Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  Company Name
                </label>
                <p className="mt-1 text-sm text-gray-900 font-medium">
                  {contact.company_name}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  Region
                </label>
                <p className="mt-1">
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-[#65421E] border border-blue-100">
                    {contact.region}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Inquiry Details */}
          {contact.inquiry && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-[#F2E8D4] flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-[#7B5B12]" />
                </div>
                Inquiry Details
              </h2>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Message
                </label>
                <p className="mt-2 text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                  {contact.inquiry}
                </p>
              </div>
            </div>
          )}

          {/* Additional Comments */}
          {contact.comments && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-[#F2E8D4] flex items-center justify-center">
                  <FileText className="h-4 w-4 text-[#7B5B12]" />
                </div>
                Additional Comments
              </h2>

              <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                {contact.comments}
              </p>
            </div>
          )}
        </div>

        {/* Right Column - Order Info & Meta */}
        <div className="space-y-6">
          {/* Order Information */}
          {(contact.order_piece ||
            contact.order_date ||
            contact.custom_printing !== undefined) && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-[#F2E8D4] flex items-center justify-center">
                  <Package className="h-4 w-4 text-[#7B5B12]" />
                </div>
                Order Information
              </h2>

              <div className="space-y-4">
                {contact.order_piece && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      Order Pieces
                    </label>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">
                      {contact.order_piece.toLocaleString()}
                    </p>
                  </div>
                )}

                {contact.order_date && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Order Date
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDateOnly(contact.order_date)}
                    </p>
                  </div>
                )}

                {contact.custom_printing !== undefined && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                      <Printer className="h-3 w-3" />
                      Custom Printing
                    </label>
                    <p className="mt-1">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                          contact.custom_printing
                            ? "bg-green-50 text-green-700 border border-green-100"
                            : "bg-gray-50 text-gray-600 border border-gray-100"
                        }`}
                      >
                        {contact.custom_printing ? "Yes" : "No"}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sketch/Design */}
          {contact.sketch && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Design Sketch
              </h2>

              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <img
                  src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${contact.sketch}`}
                  alt="Design sketch"
                  className="w-full h-auto object-contain bg-gray-50"
                />
              </div>

              <a
                href={`${process.env.NEXT_PUBLIC_BACKEND_URL}${contact.sketch}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-sm text-[#7B5B12] hover:underline"
              >
                View full size
                <ArrowLeft className="h-3 w-3 rotate-180" />
              </a>
            </div>
          )}

          {/* Timestamps */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[#F2E8D4] flex items-center justify-center">
                <Clock className="h-4 w-4 text-[#7B5B12]" />
              </div>
              Timeline
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Created At
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(contact.createdAt)}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Last Updated
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(contact.updatedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl border border-gray-200 bg-[#F7F6F3] p-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-2 rounded-lg bg-white border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                <Mail className="h-4 w-4 text-gray-500" />
                Send Email
              </a>

              <a
                href={`tel:${contact.phone}`}
                className="flex items-center gap-2 rounded-lg bg-white border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                <Phone className="h-4 w-4 text-gray-500" />
                Call Phone
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewContacts;