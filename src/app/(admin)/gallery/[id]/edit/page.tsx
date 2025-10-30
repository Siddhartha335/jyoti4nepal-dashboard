"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  ChevronDown,
  FolderPlus,
  X,
} from "lucide-react";
import { useOne, useUpdate } from "@refinedev/core";
import toast from "react-hot-toast";

type GalleryItem = {
  image_id: string;
  image_url: string;
  album: "Products" | "Events" | "Lifestyle";
  image_description: string;
  createdAt: string;
  updatedAt: string;
};

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

export default function EditGalleryImagePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const imageId = params?.id;

  const { data, isLoading: isFetching, isError } = useOne<GalleryItem>({
    resource: "gallery",
    id: imageId,
    queryOptions: { enabled: !!imageId },
  });

  const item = data?.data;

  // Form state
  const [album, setAlbum] = useState<"" | "Products" | "Events" | "Lifestyle">("");
  const [desc, setDesc] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(""); // preview for replacement
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Prefill when data arrives
  useEffect(() => {
    if (item) {
      setAlbum(item.album);
      setDesc(item.image_description || "");
      setPreviewUrl(""); // ensure clean if navigating from another edit
      setSelectedFile(null);
    }
  }, [item]);

  // Drag & drop
  const handleFileSelection = (file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const onSelectFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFileSelection(f);
  };

  const onDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    if (e.type === "dragleave") setDragActive(false);
  };

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) handleFileSelection(f);
  }, []);

  const removeFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl("");
  };

  // Update
  const { mutate: updateImage, isLoading: isSaving } = useUpdate();

  const handleSave = () => {
    if (!album) {
      toast.error("Please select an album");
      return;
    }

    updateImage(
      {
        resource: "gallery",
        id: imageId,
        values: {
          // Only include a new file if user picked one; backend should keep existing image otherwise
          ...(selectedFile ? { image: selectedFile } : {}),
          album,
          image_description: desc,
        },
      },
      {
        onSuccess: () => {
          toast.success("Image updated successfully!");
          router.push("/gallery");
        },
        onError: (error: any) => {
          console.error(error);
          toast.error(error?.response?.data?.message || "Failed to update image");
        },
      }
    );
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (isError) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load image.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-700 hover:text-neutral-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <h1 className="absolute left-1/2 -translate-x-1/2 text-xl font-semibold text-neutral-900 sm:static sm:translate-x-0">
          {isFetching ? "Loading..." : "Edit Image"}
        </h1>

        <button
          onClick={handleSave}
          disabled={isSaving || isFetching || !item}
          className="inline-flex items-center gap-2 rounded-lg bg-[#CE9F41] px-3 py-2 text-sm font-semibold text-white shadow hover:bg-[#B88A38] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Uploader (replace image) */}
      <div
        onDragEnter={onDrag}
        onDragOver={onDrag}
        onDragLeave={onDrag}
        onDrop={onDrop}
        className={
          "rounded-xl border-2 border-dashed p-6 sm:p-8 transition " +
          (dragActive ? "border-amber-500 bg-amber-50" : "border-neutral-300 bg-white")
        }
      >
        <div className="mx-auto grid max-w-3xl place-items-center gap-3 text-center">
          <ImageIcon className="h-10 w-10 text-neutral-400" />
          <div>
            <p className="text-sm font-medium text-neutral-800">Replace image (optional)</p>
            <p className="mt-1 text-xs text-neutral-500">
              Drag & drop or click to select a new file. Leave empty to keep the current image.
            </p>
          </div>
          <div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={onSelectFiles}
              className="hidden"
            />
            <button
              onClick={() => inputRef.current?.click()}
              className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-50"
            >
              Choose File
            </button>
          </div>
        </div>
      </div>

      {/* Preview: show new preview if selected; else show current image */}
      <div className="mt-4">
        <div className="group relative mx-auto max-w-md aspect-video overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              selectedFile && previewUrl
                ? previewUrl
                : item
                ? `${BACKEND}${item.image_url}`
                : ""
            }
            alt={selectedFile?.name || item?.image_description || "image"}
            className="h-full w-full object-contain"
          />
          {selectedFile ? (
            <button
              onClick={removeFile}
              className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white shadow-lg transition hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
          {(selectedFile || item) && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
              <p className="truncate text-sm text-white">
                {selectedFile?.name || item?.image_url.split("/").pop()}
              </p>
              <p className="text-xs text-white/80">
                {selectedFile
                  ? `${(selectedFile.size / 1024).toFixed(2)} KB`
                  : item
                  ? new Date(item.updatedAt || item.createdAt).toLocaleString()
                  : ""}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Settings & Description */}
      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Album Settings Card */}
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <p className="text-sm font-semibold text-neutral-800">Album Settings</p>
          <label className="mt-4 block text-sm font-medium text-neutral-700">
            Album <span className="text-red-500">*</span>
          </label>
          <div className="mt-2 flex items-center gap-2">
            <div className="relative w-full">
              <select
                value={album}
                onChange={(e) => setAlbum(e.target.value as any)}
                disabled={isFetching}
                className="w-full appearance-none rounded-lg border border-neutral-300 bg-white px-3 py-2.5 pr-9 text-sm text-neutral-900 focus:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-200"
              >
                <option value="">Select an album</option>
                <option value="Products">Products</option>
                <option value="Events">Events</option>
                <option value="Lifestyle">Lifestyle</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            </div>
            <button
              title="Create new album"
              className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white p-2 text-neutral-700 shadow-sm hover:bg-neutral-100"
              type="button"
            >
              <FolderPlus className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Description Card */}
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <p className="text-sm font-semibold text-neutral-800">Description</p>
          <label className="mt-4 block text-sm font-medium text-neutral-700">
            Image Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={4}
            disabled={isFetching}
            placeholder="Add a description for this image"
            className="mt-2 w-full resize-y rounded-lg border border-neutral-300 bg-white p-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-200"
          />
        </div>
      </div>
    </div>
  );
}
