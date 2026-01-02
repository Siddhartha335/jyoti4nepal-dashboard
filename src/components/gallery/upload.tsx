"use client"

import React, { useCallback, useRef, useState } from "react";
import { ArrowLeft, Upload, Image as ImageIcon, FolderPlus, ChevronDown, X, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCreate } from "@refinedev/core";
import toast from "react-hot-toast";

export default function UploadImage() {
  const [dragActive, setDragActive] = useState(false);
  const [album, setAlbum] = useState("");
  const [desc, setDesc] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isHeicFile, setIsHeicFile] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Refine hook for creating gallery images
  const { mutate: uploadImage, isLoading } = useCreate();

  const handleFileSelection = (file: File) => {
    setSelectedFile(file);
    
    const isHeic = file.type === 'image/heic' || 
                  file.type === 'image/heif' ||
                  file.name.toLowerCase().endsWith('.heic') || 
                  file.name.toLowerCase().endsWith('.heif');
    
    setIsHeicFile(isHeic);
    
    if (!isHeic) {
      // Create preview URL for non-HEIC files
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl("");
    }
  };

  const onSelectFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]); // Take only the first file
    }
  };

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]); // Take only the first file
    }
  }, []);

  const onDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    if (e.type === "dragleave") setDragActive(false);
  };

  const removeFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl("");
    setIsHeicFile(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select an image");
      return;
    }

    if (!album) {
      toast.error("Please select an album");
      return;
    }

    if (!desc) {
      toast.error("Please add a description");
      return;
    }

    uploadImage(
      {
        resource: "gallery",
        values: {
          image: selectedFile,
          album: album,
          image_description: desc,
        },
      },
      {
        onSuccess: () => {
          toast.success("Image uploaded successfully!");
          setSelectedFile(null);
          setPreviewUrl("");
          setIsHeicFile(false);
          setAlbum("");
          setDesc("");
          router.push("/gallery");
        },
        onError: (error: any) => {
          console.error("Upload failed:", error);
          toast.error(error?.response?.data?.message || "Failed to upload image. Please try again.");
        },
      }
    );
  };

  // Cleanup preview URL on unmount
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

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
          Upload Image
        </h1>
        <button 
          onClick={handleUpload}
          disabled={isLoading || !selectedFile}
          className="inline-flex items-center gap-2 rounded-lg bg-[#CE9F41] px-3 py-2 text-sm font-semibold text-white shadow hover:bg-[#B88A38] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="h-4 w-4" /> 
          {isLoading ? "Uploading..." : "Upload Image"}
        </button>
      </div>

      {/* Uploader */}
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
            <p className="text-sm font-medium text-neutral-800">Upload an image</p>
            <p className="mt-1 text-xs text-neutral-500">Drag and drop an image here, or click to select a file</p>
          </div>
          <div>
            <input 
              ref={inputRef} 
              type="file" 
              accept="image/*,.heic,.heif" 
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

      {/* Image Preview */}
      {selectedFile && (
        <div className="mt-4">
          <div className="group relative mx-auto max-w-md aspect-video overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
            {isHeicFile ? (
              <div className="flex h-full flex-col items-center justify-center px-4 py-6">
                <AlertCircle className="h-16 w-16 text-amber-500 mb-4" />
                <p className="text-base font-medium text-gray-700 mb-2">HEIC File Selected</p>
                <p className="text-sm text-gray-500 mb-4">Preview not available</p>
                <div className="w-full max-w-sm p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-800 flex items-center justify-center gap-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    Image will be automatically converted to JPEG after upload
                  </p>
                </div>
              </div>
            ) : previewUrl ? (
              <img 
                src={previewUrl} 
                alt={selectedFile.name}
                className="h-full w-full object-contain"
              />
            ) : null}
            
            <button
              onClick={removeFile}
              className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white shadow-lg transition hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </button>
            
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
              <p className="truncate text-sm text-white">{selectedFile.name}</p>
              <p className="text-xs text-white/80">{(selectedFile.size / 1024).toFixed(2)} KB</p>
            </div>
          </div>
        </div>
      )}

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
                onChange={(e) => setAlbum(e.target.value)}
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
            placeholder="Add a description for this image"
            className="mt-2 w-full resize-y rounded-lg border border-neutral-300 bg-white p-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-200"
          />
        </div>
      </div>
    </div>
  );
}