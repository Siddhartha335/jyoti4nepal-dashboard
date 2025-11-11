"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useUpdate, useOne } from "@refinedev/core";
import { X, ImageIcon, ArrowLeft, Loader2 } from "lucide-react";

import { TeamSchema, type Team } from "@features/teams/team.schema";

const EditTeamPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { data: teamData, isLoading: isLoadingTeam } = useOne<Team>({
    resource: "team",
    id,
  });

  const { mutateAsync, isLoading: isUpdating } = useUpdate<Team>();
  const [preview, setPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = useForm<Team>({
    resolver: zodResolver(TeamSchema),
    defaultValues: {
      name: "",
      role: "",
      status: "Draft",
      image: undefined,
    },
  });

  // Prefill form when data loads
  useEffect(() => {
    if (teamData?.data) {
      const team = teamData.data;
      reset({
        name: team.name,
        role: team.role,
        status: team.status,
        image: undefined, // Don't prefill file input
      });

      // Set preview to existing image
      if (team.image) {
        const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
        setPreview(`${baseURL}${team.image}`);
      }
    }
  }, [teamData, reset]);

  const submitWithStatus =
    (status: Team["status"]) =>
    handleSubmit(async (data) => {
      try {
        console.log("=== FORM SUBMISSION START ===");
        console.log("Raw form data:", data);
        console.log("Image field:", data.image);
        console.log("Image is File?", data.image instanceof File);

        if (data.image instanceof File) {
          console.log("File details:", {
            name: data.image.name,
            type: data.image.type,
            size: data.image.size,
          });
        }

        const payload = {
          name: data.name,
          role: data.role,
          status,
          image: data.image,
        };

        console.log("Payload to send:", payload);

        await mutateAsync({
          resource: "team",
          id,
          values: payload,
        });

        toast.success(
          status === "Published"
            ? "Team member updated and published successfully!"
            : "Team member updated as draft."
        );
        router.push("/teams");
      } catch (error) {
        console.error("=== ERROR ===", error);
        toast.error("Failed to update team member. Please try again.");
      }
    });

  if (isLoadingTeam) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#CE9F41]" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm">Back</span>
        </button>

        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
          Edit Team Member
        </h1>

        <div className="flex items-center gap-3">
          <button
            onClick={submitWithStatus("Draft")}
            disabled={isSubmitting || isUpdating}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : "Save as Draft"}
          </button>
          <button
            onClick={submitWithStatus("Published")}
            disabled={isSubmitting || isUpdating}
            className="rounded-xl bg-[#CE9F41] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-95 disabled:opacity-60"
          >
            {isSubmitting ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>

      {/* Form Layout */}
      <form className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Team Member Details */}
          <div className="rounded-2xl border border-[#E1DED1] bg-[#F7F6F3] p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">
              Team Member Details
            </h3>

            {/* Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                {...register("name")}
                placeholder="Enter team member name"
                className="w-full rounded-lg border border-[#E1DED1] bg-white px-3 py-2 text-sm outline-none focus:border-[#CE9F41]"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <input
                {...register("role")}
                placeholder="Enter team member role"
                className="w-full rounded-lg border border-[#E1DED1] bg-white px-3 py-2 text-sm outline-none focus:border-[#CE9F41]"
              />
              {errors.role && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.role.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Image Upload */}
        <div>
          <div className="rounded-2xl border border-[#E1DED1] bg-[#F7F6F3] p-5 h-full flex flex-col">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">
              Image
              {preview && !preview.startsWith("blob:") && (
                <span className="ml-2 text-xs text-gray-500 font-normal">
                  (Upload new to replace)
                </span>
              )}
            </h3>

            <Controller
              name="image"
              control={control}
              render={({ field: { onChange } }) => (
                <div className="flex-1 flex flex-col justify-center items-center border-2 border-dashed border-[#E1DED1] rounded-lg bg-white py-10 text-center relative">
                  {preview ? (
                    <>
                      <img
                        src={preview}
                        alt="Preview"
                        className="h-40 w-auto mx-auto rounded-lg object-cover mb-3"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPreview(null);
                          onChange(undefined);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-6 w-6 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Upload team image</p>
                    </>
                  )}

                  <label
                    htmlFor="file"
                    className="mt-3 inline-block cursor-pointer rounded-lg border border-[#E1DED1] bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Choose File
                  </label>
                  <input
                    id="file"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setPreview(URL.createObjectURL(file));
                        onChange(file);
                      }
                    }}
                  />
                  {errors.image && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.image.message as string}
                    </p>
                  )}
                </div>
              )}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditTeamPage;