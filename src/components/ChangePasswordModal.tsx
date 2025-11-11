"use client";

import React, { useState } from "react";
import { X, Eye, EyeOff, Lock, Check } from "lucide-react";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password validation checks
  const passwordChecks = {
    length: formData.newPassword.length >= 8,
    uppercase: /[A-Z]/.test(formData.newPassword),
    lowercase: /[a-z]/.test(formData.newPassword),
    number: /[0-9]/.test(formData.newPassword),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword),
  };

  const allPasswordChecksPassed = Object.values(passwordChecks).every(Boolean);
  const passwordsMatch =
    formData.newPassword &&
    formData.confirmPassword &&
    formData.newPassword === formData.confirmPassword;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (!allPasswordChecksPassed) {
      newErrors.newPassword = "Password does not meet all requirements";
    }

    if (formData.currentPassword && formData.newPassword && 
        formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = "New password must be different from current password";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await onSubmit({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        });
        
        setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setErrors({});
        onClose();
      } catch (error) {
        console.error("Error in password change:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setErrors({});
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative z-10 w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-semibold text-gray-800">
            Change Password
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Current Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showCurrentPassword ? "text" : "password"}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Enter current password"
                disabled={isSubmitting}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-[#CE9F41] focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.currentPassword ? "border-red-500" : "border-gray-300"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                disabled={isSubmitting}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="mt-1 text-sm text-red-500">
                {errors.currentPassword}
              </p>
            )}
          </div>

          {/* New Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
                disabled={isSubmitting}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-[#CE9F41] focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.newPassword ? "border-red-500" : "border-gray-300"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                disabled={isSubmitting}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
              >
                {showNewPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>
            )}

            {formData.newPassword && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-2">
                <p className="text-xs font-medium text-gray-600 mb-2">
                  Password must contain:
                </p>
                <PasswordCheck
                  label="At least 8 characters"
                  checked={passwordChecks.length}
                />
                <PasswordCheck
                  label="One uppercase letter"
                  checked={passwordChecks.uppercase}
                />
                <PasswordCheck
                  label="One lowercase letter"
                  checked={passwordChecks.lowercase}
                />
                <PasswordCheck
                  label="One number"
                  checked={passwordChecks.number}
                />
                <PasswordCheck
                  label="One special character"
                  checked={passwordChecks.special}
                />
              </div>
            )}
          </div>

          {/* Confirm New Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter new password"
                disabled={isSubmitting}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-[#CE9F41] focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.confirmPassword
                    ? "border-red-500"
                    : passwordsMatch
                    ? "border-green-500"
                    : "border-gray-300"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isSubmitting}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">
                {errors.confirmPassword}
              </p>
            )}
            {passwordsMatch && !errors.confirmPassword && (
              <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                <Check className="h-4 w-4" />
                Passwords match
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-[#CE9F41] text-white rounded-lg hover:bg-[#B88A35] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={
                !formData.currentPassword ||
                !allPasswordChecksPassed ||
                !passwordsMatch ||
                isSubmitting
              }
            >
              {isSubmitting ? "Changing..." : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PasswordCheck = ({
  label,
  checked,
}: {
  label: string;
  checked: boolean;
}) => {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex items-center justify-center w-4 h-4 rounded-full transition-colors ${
          checked ? "bg-green-500" : "bg-gray-300"
        }`}
      >
        {checked && <Check className="h-3 w-3 text-white" />}
      </div>
      <span
        className={`text-xs transition-colors ${
          checked ? "text-green-600 font-medium" : "text-gray-600"
        }`}
      >
        {label}
      </span>
    </div>
  );
};

export default ChangePasswordModal;