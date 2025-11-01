"use client";

import React, { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useShow, useList, useUpdate } from "@refinedev/core";
import TinyMCEEditor from "@/components/TinyMCEEditor";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { TermSchema, type TermForm } from "@features/terms/term.schema";
import toast from "react-hot-toast";

type User = {
  user_id: string;
  username: string | null;
  email: string;
  role: "SUPERADMIN" | "ADMIN" | "USER";
  isActive: boolean;
};

const EditTerms = () => {
  const router = useRouter();
  const params = useParams();
  const termId = params?.id as string;

  // ✅ Fetch term details
  const { queryResult } = useShow({
    resource: "term",
    id: termId,
  });

  const { data, isLoading: isTermLoading, isError } = queryResult;
  const term = data?.data;

  // ✅ Fetch active users
  const { data: usersData, isLoading: usersLoading } = useList<User>({
    resource: "user",
    pagination: { pageSize: 100 },
    filters: [{ field: "isActive", operator: "eq", value: true }],
  });

  const users = Array.isArray(usersData?.data) ? usersData.data : [];

  // ✅ Update mutation
  const { mutate: updateTerm, isLoading: isUpdating } = useUpdate();

  // ✅ Form setup
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TermForm>({
    resolver: zodResolver(TermSchema),
    defaultValues: {
      title: "",
      content: "",
      author: "",
    },
  });

  // ✅ Prefill form once term data is fetched
  useEffect(() => {
    if (term) {
      reset({
        title: term.title || "",
        content: term.content || "",
        author: term.author?.user_id || term.author || "",
      });
    }
  }, [term, reset]);

  const content = watch("content");

  // ✅ Submit updated data
  const onSubmit = async (status: "Draft" | "Published") => {
    await handleSubmit(async (values) => {
      try {
        const formData = { ...values, status };

        await updateTerm({
          resource: "term",
          id: termId,
          values: formData,
        });

        toast.success(
          status === "Draft"
            ? "Terms updated and saved as draft!"
            : "Terms updated and published successfully!"
        );
        router.push("/terms");
      } catch (err) {
        toast.error("Failed to update Terms & Conditions. Please try again.");
      }
    })();
  };

  if (isTermLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center text-gray-500">
        Loading term details...
      </div>
    );
  }

  if (isError || !term) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center text-gray-600">
        <p className="text-sm">Term not found or failed to load.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-sm text-[#CE9F41] hover:underline"
        >
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <h1 className="text-xl sm:text-2xl font-medium text-gray-900">
          Edit Terms & Conditions
        </h1>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isSubmitting || isUpdating}
            onClick={() => onSubmit("Draft")}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            Save as Draft
          </button>
          <button
            type="button"
            disabled={isSubmitting || isUpdating}
            onClick={() => onSubmit("Published")}
            className="rounded-xl bg-[#CE9F41] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-95 disabled:opacity-60"
          >
            Update & Publish
          </button>
        </div>
      </div>

      {/* Form Card */}
      <div className="max-w-full mx-auto rounded-lg border border-[#E1DED1] bg-[#F7F6F3] px-5 py-4 shadow-sm">
        {/* Title */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-semibold text-gray-800">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            {...register("title")}
            type="text"
            placeholder="Enter section title..."
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-300"
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
          )}
        </div>

        {/* Content */}
        <div className="mb-5">
          <label className="mb-2 text-sm font-semibold text-gray-800 flex gap-2">
            Content <span className="text-red-500">*</span>
            {content && (
              <Link href={"#contents"}>
                <p className="text-xs text-[#65421E]">See preview below</p>
              </Link>
            )}
          </label>
          <Controller
            control={control}
            name="content"
            render={({ field }) => (
              <TinyMCEEditor
                value={field.value}
                onChange={(value) =>
                  setValue("content", value, { shouldValidate: true })
                }
                height={500}
                placeholder="Edit terms and conditions content..."
              />
            )}
          />
          {errors.content && (
            <p className="mt-1 text-xs text-red-500">{errors.content.message}</p>
          )}
        </div>

        {/* Author */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-semibold text-gray-800">
            Author <span className="text-red-500">*</span>
          </label>
          <select
            {...register("author")}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-300"
            disabled={usersLoading}
          >
            <option value="">
              {usersLoading ? "Loading users..." : "Select author..."}
            </option>
            {users.map((user) => (
              <option key={user.user_id} value={user.user_id}>
                {user.username || user.email}
              </option>
            ))}
          </select>
          {errors.author && (
            <p className="mt-1 text-xs text-red-500">{errors.author.message}</p>
          )}
        </div>

        {/* Preview */}
        {content && (
          <div className="mb-5" id="contents">
            <label className="mb-2 block text-sm font-semibold text-gray-800">
              Preview
            </label>
            <div
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EditTerms;
