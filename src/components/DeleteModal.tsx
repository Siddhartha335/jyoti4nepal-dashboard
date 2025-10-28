import { X, AlertTriangle } from "lucide-react";

const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  blogTitle,
  isDeleting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  blogTitle: string;
  isDeleting: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl mx-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon */}
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-red-100 p-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Delete Blog Post
          </h3>
          <p className="text-sm text-gray-600 mb-1">
            Are you sure you want to delete
          </p>
          <p className="text-sm font-medium text-gray-900 mb-4">
            "{blogTitle}"?
          </p>
          <p className="text-xs text-gray-500">
            This action cannot be undone.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 transition"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;