"use client";

import React, { useState } from "react";
import { useList } from "@refinedev/core";
import { Mail, Search, ChevronLeft, ChevronRight, Download } from "lucide-react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

type Newsletter = {
  newsletter_id: string;
  email: string;
  createdAt: string;
};

const NewsletterSubscribers = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchEmail, setSearchEmail] = useState("");
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isDownloading, setIsDownloading] = useState(false);

  // Fetch newsletter subscribers
  const { data, isLoading, isError } = useList<Newsletter>({
    resource: "newsletter",
    pagination: {
      current: currentPage,
      pageSize: pageSize,
    },
    sorters: [
      {
        field: sortField,
        order: sortOrder,
      },
    ],
    filters: searchEmail
      ? [
          {
            field: "email",
            operator: "contains",
            value: searchEmail,
          },
        ]
      : [],
  });

  // Fetch all subscribers for export (without pagination)
  const { data: allData, refetch: refetchAll } = useList<Newsletter>({
    resource: "newsletter",
    pagination: {
      current: 1,
      pageSize: 10000, // Large number to get all records
    },
    sorters: [
      {
        field: sortField,
        order: sortOrder,
      },
    ],
    filters: searchEmail
      ? [
          {
            field: "email",
            operator: "contains",
            value: searchEmail,
          },
        ]
      : [],
    queryOptions: {
      enabled: false, // Don't fetch automatically
    },
  });

  const newsletters = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchEmail(e.target.value);
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateForExport = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Convert data to CSV
  const convertToCSV = (data: Newsletter[]) => {
    const headers = ["#", "Email", "Subscribed Date"];
    const rows = data.map((newsletter, index) => [
      index + 1,
      newsletter.email,
      formatDateForExport(newsletter.createdAt),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    return csvContent;
  };

  // Convert data to Excel
  const convertToExcel = (data: Newsletter[]) => {
    const worksheetData = [
      ["#", "Email", "Subscribed Date"],
      ...data.map((newsletter, index) => [
        index + 1,
        newsletter.email,
        formatDateForExport(newsletter.createdAt),
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 5 },  // # column
      { wch: 35 }, // Email column
      { wch: 25 }, // Date column
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Subscribers");

    return workbook;
  };

  // Download file
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Handle download
  const handleDownload = async (format: "csv" | "xlsx") => {
    try {
      setIsDownloading(true);
      toast.loading(`Preparing ${format.toUpperCase()} file...`);

      // Fetch all data
      const result = await refetchAll();
      const allSubscribers = result.data?.data || [];

      if (allSubscribers.length === 0) {
        toast.dismiss();
        toast.error("No subscribers to download");
        return;
      }

      const timestamp = new Date().toISOString().split("T")[0];
      
      if (format === "csv") {
        const csvContent = convertToCSV(allSubscribers);
        downloadFile(
          csvContent,
          `newsletter-subscribers-${timestamp}.csv`,
          "text/csv;charset=utf-8;"
        );
        toast.dismiss();
        toast.success(`Downloaded ${allSubscribers.length} subscribers as CSV`);
      } else if (format === "xlsx") {
        const workbook = convertToExcel(allSubscribers);
        XLSX.writeFile(workbook, `newsletter-subscribers-${timestamp}.xlsx`);
        toast.dismiss();
        toast.success(`Downloaded ${allSubscribers.length} subscribers as Excel`);
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.dismiss();
      toast.error("Failed to download. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#CE9F41] border-r-transparent"></div>
          <p className="mt-4 text-sm text-gray-600">Loading subscribers...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-600 font-medium">Failed to load subscribers</p>
          <p className="text-sm text-gray-600 mt-2">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search, Stats and Download */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail className="h-4 w-4 text-[#CE9F41]" />
          <span className="font-medium">{total}</span> total subscribers
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by email..."
              value={searchEmail}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-[#CE9F41]"
            />
          </div>

          {/* Download Dropdown */}
          <div className="relative group">
            <button
              disabled={isDownloading || total === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#CE9F41] bg-white text-[#CE9F41] hover:bg-[#CE9F41] hover:text-white transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              Export
            </button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-44 rounded-lg border border-gray-200 bg-white shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <button
                onClick={() => handleDownload("csv")}
                disabled={isDownloading}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-[#FAF7EC] rounded-t-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Download as CSV
              </button>
              <button
                onClick={() => handleDownload("xlsx")}
                disabled={isDownloading}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-[#FAF7EC] rounded-b-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Download as Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-[#E1DED1]">
        <table className="w-full">
          <thead className="bg-[#FAF7EC]">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-[#65421E]">
                #
              </th>
              <th
                className="px-4 py-3 text-left text-sm font-semibold text-[#65421E] cursor-pointer hover:bg-[#F0EBD8] transition"
                onClick={() => handleSort("email")}
              >
                <div className="flex items-center gap-1">
                  Email
                  {sortField === "email" && (
                    <span className="text-xs">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-sm font-semibold text-[#65421E] cursor-pointer hover:bg-[#F0EBD8] transition"
                onClick={() => handleSort("createdAt")}
              >
                <div className="flex items-center gap-1">
                  Subscribed Date
                  {sortField === "createdAt" && (
                    <span className="text-xs">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#E1DED1]">
            {newsletters.length > 0 ? (
              newsletters.map((newsletter, index) => (
                <tr
                  key={newsletter.newsletter_id}
                  className="hover:bg-[#FAF7EC] transition"
                >
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {newsletter.email}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDate(newsletter.createdAt)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-sm text-gray-500">
                  {searchEmail
                    ? "No subscribers found matching your search"
                    : "No subscribers yet"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {newsletters.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Rows per page:</label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-[#CE9F41]"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsletterSubscribers;