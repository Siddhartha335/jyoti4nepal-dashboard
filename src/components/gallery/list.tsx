import React from "react";
import { Upload, MoreHorizontal, Search, ChevronDown, ShieldCheck } from "lucide-react";
import Link from "next/link";

const mockItems = Array.from({ length: 8 }).map((_, i) => ({
  id: i + 1,
  name: "Baby-diaper-1.jpg",
  collection: "Baby diaper collection",
  size: "2.4 MB",
  date: "2024-01-15",
  certified: true,
}));

const Badge = ({ children }:{
    children:React.ReactNode
}) => (
  <span className="inline-flex items-center gap-1 rounded-full border border-neutral-300 bg-[#D9D9D9]px-2 py-0.5 text-xs text-neutral-700">
    <ShieldCheck className="h-3.5 w-3.5" /> {children}
  </span>
);

const Thumb = () => (
  <div className="aspect-[4/3] w-full rounded-md bg-[#D9D9D9]" />
);

type GalleryItem = {
  id: number;
  name: string;
  collection: string;
  size: string;
  date: string;
  certified: boolean;
};

const GalleryCard = ({ item }: { item: GalleryItem }) => (
  <div className="group rounded-xl border border-neutral-200 bg-[#F7F6F3] p-3 shadow-sm transition hover:shadow-md">
    <div className="relative">
      <Thumb />
    </div>

    <div className="mt-3 flex items-center justify-between">
      {item.certified ? <Badge>Certified</Badge> : <span />}
      <div className="h-5 w-5" />
    </div>

    <div className="mt-2">
      <p className="truncate text-sm font-medium text-neutral-900" title={item.name}>{item.name}</p>
      <p className="mt-0.5 truncate text-xs text-neutral-600" title={item.collection}>{item.collection}</p>
      <p className="mt-1 text-xs text-neutral-500">{item.size} • {item.date}</p>
    </div>
  </div>
);

const Toolbar = () => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-center gap-2">
      <h1 className="text-xl font-semibold text-neutral-900">Gallery Management</h1>
    </div>
    <div className="flex items-center gap-2">
      <Link href={"/gallery/upload"}>
        <button className="inline-flex items-center gap-2 rounded-lg bg-[#CE9F41] px-3 py-2 text-sm font-medium text-white shadow-sm transition">
            <Upload className="h-4 w-4" /> Upload Images
        </button>
      </Link>
    </div>
  </div>
);

const Filters = () => (
  <div className="mt-3 flex flex-col gap-3 sm:mt-4 sm:flex-row sm:items-center">
    <label className="relative block w-full sm:max-w-md">
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center"><Search className="h-4 w-4 text-neutral-400" /></span>
      <input
        placeholder="Search images"
        className="w-full rounded-lg border border-neutral-300 bg-white py-2.5 pl-9 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-200"
      />
    </label>

    <div className="relative w-full sm:w-40">
      <button className="flex w-full items-center justify-between gap-2 rounded-lg border border-neutral-300 bg-[#F7F6F3] px-3 py-2.5 text-sm text-neutral-700 shadow-sm transition hover:bg-neutral-50">
        All <ChevronDown className="h-4 w-4" />
      </button>
    </div>
  </div>
);

export default function ListGallery() {
  return (
    <div className="mx-auto max-w-7xl">
      <Toolbar />
      <p className="mt-1 text-sm text-neutral-600">Upload and organize your images</p>
      <Filters />

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {mockItems.map((item) => (
          <GalleryCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
