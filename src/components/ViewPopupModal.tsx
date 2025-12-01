"use client";

import React from "react";
import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ViewPopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  popup: {
    popup_id: string;
    title: string;
    type: string;
    content: string;
    buttonText: string;
    buttonLink: string;
    media_url: string;
    status: string;
    startDate: string;
    endDate: string;
    createdAt: string;
    updatedAt: string;
  } | null;
}

const ViewPopupModal: React.FC<ViewPopupModalProps> = ({ isOpen, onClose, popup }) => {
  if (!isOpen || !popup) return null;

  const isVideo = popup.media_url?.match(/\.(mp4|webm|ogg)$/i);
  const mediaUrl = popup.media_url 
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${popup.media_url}` 
    : null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-full bg-white/90 p-2 text-gray-600 hover:bg-white hover:text-gray-900 shadow-lg transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Media */}
        {mediaUrl && (
          <div className="relative h-64 bg-gray-100">
            {isVideo ? (
              <video
                src={mediaUrl}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
              />
            ) : (
              <Image
                src={mediaUrl}
                alt={popup.title}
                fill
                className="object-cover"
              />
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {popup.title}
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            {popup.content}
          </p>
          <Link
            href={popup.buttonLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center rounded-lg bg-[#CE9F41] px-6 py-3 text-base font-semibold text-white hover:brightness-95 transition shadow-md"
          >
            {popup.buttonText}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ViewPopupModal;