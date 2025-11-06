"use client";

import React, { useState, useEffect } from "react";
import { Save, UsersRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SettingSchema, type SettingForm } from "@features/settings/setting.schema";
import {  useUpdate, useOne, useRegister } from "@refinedev/core";
import toast from "react-hot-toast";
import AddUserModal from "@components/AddUserModal";
import { useGetIdentity, useList } from "@refinedev/core";

interface IUser {
  role: string;
  [key: string]: any;
}

type User = {
  user_id: string;
  username: string | null;
  email: string;
  role: "SUPERADMIN" | "ADMIN" | "USER";
  isActive: boolean;
};

const ListSettings = () => {
  const [activeTab, setActiveTab] = useState("General");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: loggedInUser } = useGetIdentity<IUser>();

  const { mutate: registerUser, isLoading: isRegistering } = useRegister();

  const { data: mock_users, isLoading: usersLoading } = useList<User>({
      resource: "user",
      pagination: { pageSize: 100 },
      filters: [{ field: "isActive", operator: "eq", value: true }],
    });

  // Fetch existing settings using the fixed ID
  const { data: settingsData, isLoading: isLoadingSettings, isError, error } = useOne({
    resource: "setting",
    id: process.env.NEXT_PUBLIC_SETTINGS_ID,
    queryOptions: {
      retry: false,
    },
  });

  // Update mutation (no create needed - settings already exist)
  const { mutate: updateSetting, isLoading: isUpdating } = useUpdate({
    resource: "setting",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<SettingForm>({
    resolver: zodResolver(SettingSchema),
    defaultValues: {
      site_name: "",
      site_description: "",
      contact_email: "",
      facebook_url: "",
      instagram_url: "",
      youtube_url: "",
      maintenace_mode: false,
      enable_analytics: true,
      cookie_consent: true,
    },
  });

  // Populate form when data is loaded
  useEffect(() => {
    if (settingsData?.data) {
      const settings = settingsData.data;
      reset({
        site_name: settings.site_name || "",
        site_description: settings.site_description || "",
        contact_email: settings.contact_email || "",
        facebook_url: settings.facebook_url || "",
        instagram_url: settings.instagram_url || "",
        youtube_url: settings.youtube_url || "",
        maintenace_mode: settings.maintenace_mode ?? false,
        enable_analytics: settings.enable_analytics ?? true,
        cookie_consent: settings.cookie_consent ?? true,
      });
    }
  }, [settingsData, reset]);

  // Watch boolean toggles
  const maintenance = watch("maintenace_mode");
  const analytics = watch("enable_analytics");
  const cookies = watch("cookie_consent");

  const onSubmit = (data: SettingForm) => {
    updateSetting(
      {
        id: process.env.NEXT_PUBLIC_SETTINGS_ID,
        values: data,
      },
      {
        onSuccess: () => {
          toast.success("Settings updated successfully!");
        },
        onError: (error) => {
          console.error("Error updating settings:", error);
          toast.error("Failed to update settings. Please try again.");
        },
      }
    );
  };

const handleAddUser = async (data: { username: string; email: string; password: string }) => {
  try {
    // Wrap registerUser in a Promise so we can await it properly
    await new Promise<void>((resolve, reject) => {
      registerUser(
        {
          username: data.username,
          email: data.email,
          password: data.password,
          role: "ADMIN",
        },
        {
          onSuccess: async () => {
            try {
              const emailResponse = await fetch("/api/send-credentials", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  username: data.username,
                  email: data.email,
                  password: data.password,
                }),
              });

              if (!emailResponse.ok) {
                console.error("Failed to send email");
                toast.success(
                  "✅ User registered successfully, but email sending failed. They can login now."
                );
              } else {
                toast.success(
                  "✅ User registered successfully! Credentials sent via email."
                );
              }

              resolve(); 
            } catch (error) {
              console.error("Email error:", error);
              toast.success(
                "✅ User registered successfully, but email sending failed. They can login now."
              );
              resolve();
            }
          },
          onError: (error: any) => {
            console.error("Registration error:", error);
            toast.error(error.message || "❌ Failed to register user");
            reject(error);
          },
        }
      );
    });

    // ✅ Close modal only after backend + email logic finish
    setIsModalOpen(false);
  } catch (error) {
    console.error("Error in handleAddUser:", error);
  }
};


  // Loading state
  if (isLoadingSettings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#CE9F41] border-r-transparent"></div>
          <p className="mt-4 text-sm text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 font-medium">Failed to load settings</p>
          <p className="text-sm text-gray-600 mt-2">Please contact support if this persists.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-gray-900">Settings</h1>
          <p className="text-sm text-[#65421E]">
            Manage your website settings and preferences
          </p>
        </div>

        <button
          onClick={handleSubmit(onSubmit)}
          disabled={isUpdating}
          className="flex items-center gap-2 rounded-lg bg-[#CE9F41] px-4 py-2 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Save className="h-4 w-4" />
          {isUpdating ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-4 max-w-[11rem] bg-[#FAF7EC] rounded-lg p-[10px]">
        {["General", "Users"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-[10px] py-[2.5px] text-sm font-semibold rounded-lg ${
              activeTab === tab
                ? "bg-white text-black"
                : "text-[#65421E] hover:text-gray-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "General" && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Site Info + Social Links */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Site Information */}
            <div className="rounded-lg border border-[#E1DED1] bg-[#F7F6F3] p-5">
              <h2 className="mb-4 text-lg font-medium text-gray-800">
                Site Information
              </h2>

              <div className="space-y-4">
                {/* Site Name */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#65421E]">
                    Site Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("site_name")}
                    placeholder="Enter your site name"
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-300"
                  />
                  {errors.site_name && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.site_name.message}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#65421E]">
                    Site Description <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("site_description")}
                    placeholder="Enter site description"
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-300"
                  />
                  {errors.site_description && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.site_description.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#65421E]">
                    Contact Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    {...register("contact_email")}
                    placeholder="contact@example.com"
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-300"
                  />
                  {errors.contact_email && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.contact_email.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="rounded-lg border border-[#E1DED1] bg-[#F7F6F3] p-5">
              <h2 className="mb-4 text-lg font-medium text-gray-800">
                Social Media Links
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#65421E]">
                    Facebook
                  </label>
                  <input
                    type="text"
                    {...register("facebook_url")}
                    placeholder="https://facebook.com/yourpage"
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none"
                  />
                  {errors.facebook_url && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.facebook_url.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-[#65421E]">
                    Instagram
                  </label>
                  <input
                    type="text"
                    {...register("instagram_url")}
                    placeholder="https://instagram.com/yourpage"
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none"
                  />
                  {errors.instagram_url && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.instagram_url.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-[#65421E]">
                    Youtube
                  </label>
                  <input
                    type="text"
                    {...register("youtube_url")}
                    placeholder="https://youtube.com/yourchannel"
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none"
                  />
                  {errors.youtube_url && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.youtube_url.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="rounded-2xl border border-gray-200 bg-[#F9F8F4] p-5">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              Site Preferences
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {/* Maintenance */}
              <div className="flex items-center justify-between rounded-xl bg-[#F9F8F4] p-2">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">
                    Maintenance Mode
                  </h3>
                  <p className="text-xs text-gray-600">
                    Put site in maintenance mode
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setValue("maintenace_mode", !maintenance)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    maintenance ? "bg-[#CE9F41]" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                      maintenance ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Analytics */}
              <div className="flex items-center justify-between rounded-xl bg-[#F9F8F4] p-2">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">
                    Analytics
                  </h3>
                  <p className="text-xs text-gray-600">
                    Enable analytics tracking
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setValue("enable_analytics", !analytics)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    analytics ? "bg-[#CE9F41]" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                      analytics ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Cookies */}
              <div className="flex items-center justify-between rounded-xl bg-[#F9F8F4] p-2">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">
                    Cookie Consent
                  </h3>
                  <p className="text-xs text-gray-600">
                    Show cookie consent banner
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setValue("cookie_consent", !cookies)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    cookies ? "bg-[#CE9F41]" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                      cookies ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {activeTab === "Users" && (
        <div className="bg-[#F7F6F3] p-5 border-[1px] border-[#E1DED1] rounded-lg">
          <div className="flex justify-between items-center mb-5">
            <h2 className="flex items-center text-xl gap-2">
              <UsersRound size={28} /> User Management
            </h2>
            <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-[#CE9F41] px-4 py-2 text-sm font-semibold text-white hover:brightness-95">
              <UsersRound className="h-4 w-4" />
              Add User
            </button>
          </div>

          {mock_users?.data && mock_users.data.length > 0 ? (
            mock_users.data.map((user) => (
              <div
                key={user.user_id}
                className="border border-[#E1DED1] rounded-lg p-2 flex justify-between items-center"
              >
                <div className="flex gap-3 items-center">
                  <div className="w-12 h-12 bg-[#CE9F41] rounded-full flex items-center justify-center text-white font-bold">
                    {user.username ? user.username.charAt(0) : "U"}
                  </div>
                  <div>
                    <h2 className="text-[#65421E] text-xl">{user.username}</h2>
                    <p>{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <h2 className="text-sm">{user.role}</h2>
                  <button className="border border-[#E1DED1] py-1.5 px-4 rounded-lg">
                    Edit
                  </button>
                  {loggedInUser?.role !== "SUPERADMIN" && (
                    <button className="border border-[#E1DED1] py-1.5 px-4 rounded-lg">
                      {user.isActive ? "Deactivate" : "Activate"}
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-600">No users found.</p>
          )}

          <AddUserModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleAddUser}
          />
        </div>
      )}
    </div>
  );
};

export default ListSettings;