"use client"

import React, { useCallback, useRef, useState } from "react";
import { ArrowLeft, Upload, Image as ImageIcon, FolderPlus, ChevronDown } from "lucide-react";

export default function UploadImage() {
  const [dragActive, setDragActive] = useState(false);
  const [album, setAlbum] = useState("");
  const [desc, setDesc] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const onSelectFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length) {
      // handle files
      console.log("Selected", files);
    }
  };

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer?.files;
    if (files && files.length) console.log("Dropped", files);
  }, []);

  const onDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    if (e.type === "dragleave") setDragActive(false);
  };

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <button className="inline-flex items-center gap-2 text-sm font-medium text-neutral-700 hover:text-neutral-900">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-xl font-semibold text-neutral-900 sm:static sm:translate-x-0">Upload Images</h1>
        <button className="inline-flex items-center gap-2 rounded-lg bg-[#CE9F41] px-3 py-2 text-sm font-semibold text-white shadow">
          <Upload className="h-4 w-4" /> Upload Image
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
            <p className="text-sm font-medium text-neutral-800">Upload images</p>
            <p className="mt-1 text-xs text-neutral-500">Drag and drop images here, or click to select files</p>
          </div>
          <div>
            <input ref={inputRef} type="file" multiple accept="image/*" onChange={onSelectFiles} className="hidden" />
            <button
              onClick={() => inputRef.current?.click()}
              className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-50"
            >
              Choose File
            </button>
          </div>
        </div>
      </div>

      {/* Settings & Description */}
      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Album Settings Card */}
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <p className="text-sm font-semibold text-neutral-800">Album Settings</p>
          <label className="mt-4 block text-sm font-medium text-neutral-700">Album</label>
          <div className="mt-2 flex items-center gap-2">
            <div className="relative w-full">
              <select
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                className="w-full appearance-none rounded-lg border border-neutral-300 bg-white px-3 py-2.5 pr-9 text-sm text-neutral-900 focus:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-200"
              >
                <option value="">Select an album</option>
                <option>Products</option>
                <option>Events</option>
                <option>Lifestyle</option>
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
          <label className="mt-4 block text-sm font-medium text-neutral-700">General Description</label>
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
