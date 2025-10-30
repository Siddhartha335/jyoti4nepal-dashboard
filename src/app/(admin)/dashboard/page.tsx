"use client";

import { FileText, MessageSquare, Image, Megaphone } from "lucide-react";
import Link from "next/link";
import { useList } from "@refinedev/core";
import { useMemo } from "react";
import { formatTimeAgo } from "@utils/formatTime";

type ActivityItem = {
  text: string;
  time: string;
  type: "blog" | "testimonial" | "gallery";
  createdAt: string;
};

export default function AdminHome() {
  // Fetch real data for counts
  const { data: blogsData, isLoading: blogsLoading } = useList({
    resource: "blog",
    pagination: { current: 1, pageSize: 1 },
  });

  const { data: testimonialsData, isLoading: testimonialsLoading } = useList({
    resource: "testimonial",
    pagination: { current: 1, pageSize: 1 },
  });

  const { data: galleryData, isLoading: galleryLoading } = useList({
    resource: "gallery",
    pagination: { current: 1, pageSize: 1 },
  });

  // Fetch recent items for activity feed (only 2 each to optimize, will combine to get top 5)
  const { data: recentBlogs } = useList({
    resource: "blog",
    pagination: { current: 1, pageSize: 2 },
    sorters: [{ field: "createdAt", order: "desc" }],
  });

  const { data: recentTestimonials } = useList({
    resource: "testimonial",
    pagination: { current: 1, pageSize: 2 },
    sorters: [{ field: "createdAt", order: "desc" }],
  });

  const { data: recentGallery } = useList({
    resource: "gallery",
    pagination: { current: 1, pageSize: 2 },
    sorters: [{ field: "createdAt", order: "desc" }],
  });

  // Get totals from the data
  const blogsCount = blogsData?.total ?? 0;
  const testimonialsCount = testimonialsData?.total ?? 0;
  const galleryCount = galleryData?.total ?? 0;

  // Combine and sort recent activities - Take only top 5
  const recentActivity: ActivityItem[] = useMemo(() => {
    const activities: ActivityItem[] = [];

    // Add recent blogs
    recentBlogs?.data?.forEach((blog: any) => {
      activities.push({
        text: `New blog: "${blog.title?.substring(0, 40)}${blog.title?.length > 40 ? "..." : ""}"`,
        time: formatTimeAgo(blog.createdAt),
        type: "blog",
        createdAt: blog.createdAt,
      });
    });

    // Add recent testimonials
    recentTestimonials?.data?.forEach((testimonial: any) => {
      activities.push({
        text: `New testimonial from ${testimonial.name}`,
        time: formatTimeAgo(testimonial.createdAt),
        type: "testimonial",
        createdAt: testimonial.createdAt,
      });
    });

    // Add recent gallery images
    recentGallery?.data?.forEach((image: any) => {
      activities.push({
        text: `Image uploaded to ${image.album} album`,
        time: formatTimeAgo(image.createdAt),
        type: "gallery",
        createdAt: image.createdAt,
      });
    });

    // Sort by createdAt descending and take only top 5
    return activities
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [recentBlogs, recentTestimonials, recentGallery]);

  const stats = [
    {
      label: "Total Blogs",
      value: blogsLoading ? "..." : blogsCount.toString(),
      icon: FileText,
      loading: blogsLoading,
    },
    {
      label: "Testimonials",
      value: testimonialsLoading ? "..." : testimonialsCount.toString(),
      icon: MessageSquare,
      loading: testimonialsLoading,
    },
    {
      label: "Gallery Images",
      value: galleryLoading ? "..." : galleryCount.toString(),
      icon: Image,
      loading: galleryLoading,
    },
    {
      label: "Active Pop-ups",
      value: "0",
      icon: Megaphone,
      loading: false,
    },
  ];

  const quickActions = [
    { label: "Add Blogs", icon: FileText, link: "/blogs/create" },
    { label: "Add Testimonials", icon: MessageSquare, link: "/testimonials/create" },
    { label: "Upload Images", icon: Image, link: "/gallery/upload" },
    { label: "Create Pop-up", icon: Megaphone, link: "/blogs/create" },
  ];

  // Get icon based on activity type
  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "blog":
        return <FileText className="h-4 w-4 text-[#CE9F41]" />;
      case "testimonial":
        return <MessageSquare className="h-4 w-4 text-[#CE9F41]" />;
      case "gallery":
        return <Image className="h-4 w-4 text-[#CE9F41]" />;
    }
  };

  return (
    <div className="space-y-6 -mt-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl mt-5 md:mt-12 text-[#000000]">Dashboard Overview</h1>
        <h1 className="text-[#65421E] mt-1">Manage your website content and settings</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-lg border bg-[#F7F6F3] p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[#65421E] font-solomon">{stat.label}</p>
                  <h1 className="text-2xl font-bold text-gray-900 mt-2">
                    {stat.loading ? (
                      <span className="inline-block h-8 w-12 animate-pulse rounded bg-gray-200" />
                    ) : (
                      stat.value
                    )}
                  </h1>
                </div>
                <div className="rounded-lg p-2">
                  <Icon className="h-6 w-6 text-gray-600" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity - Only 5 items */}
        <div className="rounded-lg border bg-[#F7F6F3] p-6 shadow-sm">
          <h1 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h1>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between pb-4 border-b last:border-b-0 last:pb-0"
                >
                  <div className="flex items-center gap-1">
                    <p>{getActivityIcon(activity.type)}</p>
                    <p className="text-sm font-medium text-gray-800 truncate">{activity.text}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg border bg-[#F7F6F3] p-6 shadow-sm">
          <h1 className="text-lg font-bold mb-6">Quick Switch</h1>
          <div className="grid grid-cols-2 gap-4 place-items-center">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.label} href={action.link}>
                  <button className="flex flex-col items-center justify-center rounded-lg bg-[#FBF8EF] p-5 transition-colors hover:bg-[#F5EFE0]">
                    <Icon className="h-6 w-6 text-gray-700 mb-3" />
                    <span className="text-sm font-medium text-gray-800">{action.label}</span>
                  </button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

