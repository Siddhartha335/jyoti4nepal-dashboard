"use client";

import React, { useState } from "react";
import { Save, UsersRound } from "lucide-react";

const ListSettings = () => {
  const [activeTab, setActiveTab] = useState("General");
  const [maintenance, setMaintenance] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [cookies, setCookies] = useState(false);

  const mock_users = [
    {
        id: 1,
        name:"Admin",
        email:"admin@jyoti4nepal.com",
        role:"Super Admin",        
    }
  ]

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

        <button className="flex items-center gap-2 rounded-lg bg-[#CE9F41] px-4 py-2 text-sm font-semibold text-white hover:brightness-95">
          <Save className="h-4 w-4" />
          Save Changes
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
        <div className="space-y-6">
          {/* Site Info + Social Links */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Site Information */}
            <div className="rounded-lg border border-[#E1DED1] bg-[#F7F6F3] p-5">
              <h2 className="mb-4 text-lg font-medium text-gray-800">
                Site Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#65421E]">
                    Site Name
                  </label>
                  <input
                    type="text"
                    defaultValue="Jyoti4Nepal"
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-300"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-[#65421E]">
                    Site Description
                  </label>
                  <input
                    type="text"
                    defaultValue="Empowering women through Sustainable Production"
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-300"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-[#65421E]">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    defaultValue="contact@jyoti4nepal.com"
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Social Media Links */}
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
                    defaultValue="https://facebook.com"
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-300"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-[#65421E]">
                    Instagram
                  </label>
                  <input
                    type="text"
                    defaultValue="https://instagram.com"
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-300"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-[#65421E]">
                    Youtube
                  </label>
                  <input
                    type="text"
                    defaultValue="https://youtube.com"
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-300"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Site Preferences */}
          <div className="rounded-2xl border border-gray-200 bg-[#F9F8F4] p-5">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              Site Preferences
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {/* Maintenance Mode */}
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
                  onClick={() => setMaintenance(!maintenance)}
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
                  onClick={() => setAnalytics(!analytics)}
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

              {/* Cookie Consent */}
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
                  onClick={() => setCookies(!cookies)}
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
        </div>
      )}

      {activeTab === "Users" && (
        <div className="bg-[#F7F6F3] p-5 border-[1px] border-[#E1DED1] rounded-lg">
            <div className="flex justify-between items-center mb-5">
                <h2 className="flex items-center text-xl gap-2">
                    <UsersRound size={28} /> User Management
                </h2>
                <button className="flex items-center gap-2 rounded-lg bg-[#CE9F41] px-4 py-2 text-sm font-semibold text-white hover:brightness-95">
                    <UsersRound className="h-4 w-4" />
                    Add User
                </button>
            </div>

            {mock_users.map((user) => (
                <div key={user.id} className="border border-[#E1DED1] rounded-lg p-2 flex justify-between items-center">
                <div className="flex gap-3 items-center">
                    <div className="w-12 h-12 bg-[#CE9F41] rounded-full flex items-center justify-center text-white font-bold">
                        {user.name.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-[#65421E] text-xl">{user.name}</h2>
                        <p>{user.email}</p>
                    </div>
                </div>
                <div className="flex items-center gap-5">
                    <h2 className="text-sm">{user.role}</h2>
                    <button className="border border-[#E1DED1] py-1.5 px-4 rounded-lg">
                        Edit
                    </button>
                </div>
            </div>
            ))}
        </div>
      )}

    </div>
  );
};

export default ListSettings;
