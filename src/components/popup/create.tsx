"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, X } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreate } from "@refinedev/core";
import toast from "react-hot-toast";
import { PopupSchema, type PopupFormValues } from "@features/popup/popup.schema";

const CreatePopup = () => {
  const router = useRouter();
  const { mutateAsync, isLoading } = useCreate<PopupFormValues>();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: zodResolver(PopupSchema),
    defaultValues: {
      title: "",
      type: "Promotion",
      content: "",
      buttonText: "Learn More",
      buttonLink: "https://",
      media: undefined,
      status: "Draft",
      startDate: "",
      endDate: "",
    },
    mode: "onTouched",
  });

  // Submit helper
  const submitWithStatus =
    (status: PopupFormValues["status"]) =>
    handleSubmit(async (formData) => {
      try {
        const payload = { ...formData, status };

        await mutateAsync({
          resource: "popup",
          values: payload,
        });

        toast.success(
          status === "Published"
            ? "Popup published successfully!"
            : "Popup saved as draft."
        );
        router.push("/popup");
      } catch (error) {
        console.error("Error creating popup:", error);
        toast.error("Failed to create popup. Please try again.");
      }
    });

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

        <h1 className="text-xl sm:text-2xl text-gray-800">
          Create New Pop-up
        </h1>

        <div className="flex items-center gap-3">
          <button
            onClick={submitWithStatus("Draft")}
            disabled={isSubmitting || isLoading}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            {isLoading ? "Saving..." : "Save as Draft"}
          </button>
          <button
            onClick={submitWithStatus("Published")}
            disabled={isSubmitting || isLoading}
            className="rounded-xl bg-[#CE9F41] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-95 disabled:opacity-60"
          >
            {isLoading ? "Publishing..." : "Publish"}
          </button>
          <button
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            See Preview
          </button>
        </div>
      </div>

      {/* Layout */}
      <form className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-5">
          {/* Basic Information */}
          <div className="rounded-2xl border border-[#E1DED1] bg-[#F7F6F3] p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">
              Basic Information
            </h3>

            {/* Title */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-[#65421E]">
                Title
              </label>
              <input
                {...register("title")}
                placeholder="Enter popup title"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-300"
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-600">{String(errors.title.message)}</p>
              )}
            </div>

            {/* Type */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-[#65421E]">
                Type
              </label>
              <select
                {...register("type")}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-300"
              >
                <option value="Promotion">Promotion</option>
                <option value="Announcement">Announcement</option>
                <option value="Newsletter">Newsletter</option>
                <option value="Discount">Discount</option>
              </select>
              {errors.type && (
                <p className="mt-1 text-xs text-red-600">{String(errors.type.message)}</p>
              )}
            </div>

            {/* Content */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#65421E]">
                Content
              </label>
              <textarea
                {...register("content")}
                placeholder="Enter popup message"
                rows={6}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-300 resize-none"
              />
              {errors.content && (
                <p className="mt-1 text-xs text-red-600">
                  {String(errors.content.message)}
                </p>
              )}
            </div>
          </div>

          {/* Call to Action */}
          <div className="rounded-2xl border border-[#E1DED1] bg-[#F7F6F3] p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">
              Call to Action
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Button Text */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#65421E]">
                  Button Text
                </label>
                <input
                  {...register("buttonText")}
                  placeholder="Learn more"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-300"
                />
                {errors.buttonText && (
                  <p className="mt-1 text-xs text-red-600">
                    {String(errors.buttonText.message)}
                  </p>
                )}
              </div>

              {/* Button Link */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#65421E]">
                  Button Link
                </label>
                <input
                  {...register("buttonLink")}
                  placeholder="https://"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-300"
                />
                {errors.buttonLink && (
                  <p className="mt-1 text-xs text-red-600">
                    {String(errors.buttonLink.message)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-5">
          {/* Media Upload */}
          <div className="rounded-2xl border border-[#E1DED1] bg-[#F7F6F3] p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-800">Media</h3>

            <Controller
              name="media"
              control={control}
              render={({ field: { onChange, value } }) => {
                const [preview, setPreview] = React.useState<string | null>(null);
                const [mediaType, setMediaType] = React.useState<'image' | 'video' | null>(null);

                React.useEffect(() => {
                  if (value instanceof File) {
                    const url = URL.createObjectURL(value);
                    setPreview(url);
                    setMediaType(value.type.startsWith('image/') ? 'image' : 'video');
                    return () => URL.revokeObjectURL(url);
                  }
                  setPreview(null);
                  setMediaType(null);
                }, [value]);

                const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files?.[0] ?? null;
                  onChange(file);
                };

                const removeFile = () => {
                  onChange(null);
                  setPreview(null);
                  setMediaType(null);
                };

                return (
                  <>
                    <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-6 text-center">
                      {preview ? (
                        <div className="relative">
                          {mediaType === 'image' ? (
                            <img
                              src={preview}
                              alt="Media preview"
                              className="mx-auto h-40 w-full max-w-xs rounded-lg object-cover mb-3"
                            />
                          ) : (
                            <video
                              src={preview}
                              controls
                              className="mx-auto h-40 w-full max-w-xs rounded-lg object-cover mb-3"
                            />
                          )}
                          <button
                            type="button"
                            onClick={removeFile}
                            className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="mb-3 flex flex-col items-center justify-center gap-2 text-gray-500">
                          <Upload className="h-8 w-8" />
                          <p className="text-sm">Upload image or video for popup</p>
                          <p className="text-xs text-gray-400">Max 10MB</p>
                        </div>
                      )}

                      <input
                        id="media"
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={handleFile}
                      />

                      <label
                        htmlFor="media"
                        className="inline-block cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        {preview ? "Change File" : "Choose File"}
                      </label>
                    </div>

                    {errors.media && (
                      <p className="mt-2 text-xs text-red-600">
                        {errors.media.message as string}
                      </p>
                    )}
                  </>
                );
              }}
            />
          </div>

          {/* Date Range */}
          <div className="rounded-2xl border border-[#E1DED1] bg-[#F7F6F3] p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-800">Schedule</h3>
            
            {/* Start Date */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-[#65421E]">
                Start Date
              </label>
              <input
                type="date"
                {...register("startDate")}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-300"
              />
              {errors.startDate && (
                <p className="mt-1 text-xs text-red-600">{String(errors.startDate.message)}</p>
              )}
            </div>

            {/* End Date */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#65421E]">
                End Date
              </label>
              <input
                type="date"
                {...register("endDate")}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-300"
              />
              {errors.endDate && (
                <p className="mt-1 text-xs text-red-600">{String(errors.endDate.message)}</p>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePopup;