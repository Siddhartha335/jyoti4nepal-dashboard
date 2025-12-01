"use client";

import React, { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Upload, X } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOne, useUpdate } from "@refinedev/core";
import toast from "react-hot-toast";
import { PopupSchema, type PopupFormValues } from "@features/popup/popup.schema";

const EditPopup = () => {
  const router = useRouter();
  const params = useParams();
  const popupId = params?.id as string;

  // Fetch existing popup data
  const { data: popupData, isLoading: isFetching } = useOne({
    resource: "popup",
    id: popupId,
  });

  const { mutateAsync: updatePopup, isLoading: isUpdating } = useUpdate();

  const {
    register,
    handleSubmit,
    control,
    reset,
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

  // Prefill form when data is loaded
  useEffect(() => {
    if (popupData?.data) {
      const popup = popupData.data;
      
      // Format dates for input[type="date"]
      const formatDateForInput = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };

      reset({
        title: popup.title || "",
        type: popup.type || "Promotion",
        content: popup.content || "",
        buttonText: popup.buttonText || "Learn More",
        buttonLink: popup.buttonLink || "https://",
        status: popup.status || "Draft",
        startDate: formatDateForInput(popup.startDate),
        endDate: formatDateForInput(popup.endDate),
        media: undefined, // File will be handled separately
      });
    }
  }, [popupData, reset]);

  // Submit helper
  const submitWithStatus =
    (status: PopupFormValues["status"]) =>
    handleSubmit(async (formData) => {
      try {
        const payload = { ...formData, status };

        await updatePopup({
          resource: "popup",
          id: popupId,
          values: payload,
        });

        toast.success(
          status === "Published"
            ? "Popup published successfully!"
            : "Popup updated successfully."
        );
        router.push("/popup");
      } catch (error) {
        console.error("Error updating popup:", error);
        toast.error("Failed to update popup. Please try again.");
      }
    });

  if (isFetching) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-neutral-600">Loading popup data...</div>
      </div>
    );
  }

  if (!popupData?.data) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-neutral-600">Popup not found</div>
      </div>
    );
  }

  const existingMediaUrl = popupData.data.media_url;

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
          Edit Pop-up
        </h1>

        <div className="flex items-center gap-3">
          <button
            onClick={submitWithStatus("Draft")}
            disabled={isSubmitting || isUpdating}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            {isUpdating ? "Saving..." : "Save as Draft"}
          </button>
          <button
            onClick={submitWithStatus("Published")}
            disabled={isSubmitting || isUpdating}
            className="rounded-xl bg-[#CE9F41] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-95 disabled:opacity-60"
          >
            {isUpdating ? "Publishing..." : "Publish"}
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
              {errors.title?.message && (
                <p className="mt-1 text-xs text-red-600">{errors.title.message as string}</p>
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
              {errors.type?.message && (
                <p className="mt-1 text-xs text-red-600">{errors.type.message as string}</p>
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
              {errors.content?.message && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.content.message as string}
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
                {errors.buttonText?.message && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.buttonText.message as string}
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
                {errors.buttonLink?.message && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.buttonLink.message as string}
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
                const [preview, setPreview] = React.useState<string | null>(
                  existingMediaUrl ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${existingMediaUrl}` : null
                );
                const [mediaType, setMediaType] = React.useState<'image' | 'video' | null>(
                  existingMediaUrl 
                    ? existingMediaUrl.match(/\.(mp4|webm|ogg)$/i) ? 'video' : 'image'
                    : null
                );

                React.useEffect(() => {
                  if (value instanceof File) {
                    const url = URL.createObjectURL(value);
                    setPreview(url);
                    setMediaType(value.type.startsWith('image/') ? 'image' : 'video');
                    return () => URL.revokeObjectURL(url);
                  }
                }, [value]);

                const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files?.[0] ?? null;
                  onChange(file);
                };

                const removeFile = () => {
                  onChange(null);
                  setPreview(existingMediaUrl ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${existingMediaUrl}` : null);
                  setMediaType(
                    existingMediaUrl 
                      ? existingMediaUrl.match(/\.(mp4|webm|ogg)$/i) ? 'video' : 'image'
                      : null
                  );
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
                          {value instanceof File && (
                            <button
                              type="button"
                              onClick={removeFile}
                              className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
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

                    {errors.media?.message && (
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
              {errors.startDate?.message && (
                <p className="mt-1 text-xs text-red-600">{errors.startDate.message as string}</p>
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
              {errors.endDate?.message && (
                <p className="mt-1 text-xs text-red-600">{errors.endDate.message as string}</p>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditPopup;