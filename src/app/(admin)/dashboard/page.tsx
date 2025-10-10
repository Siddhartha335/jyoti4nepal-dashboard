import { FileText, MessageSquare, Image, Megaphone } from "lucide-react";
import Link from "next/link";

export default function AdminHome() {
  const stats = [
    { label: "Total Blogs", value: "12", icon: FileText },
    { label: "Testimonials", value: "8", icon: MessageSquare },
    { label: "Gallery Images", value: "45", icon: Image },
    { label: "Active Pop-ups", value: "2", icon: Megaphone },
  ];

  const recentActivity = [
    { text: "New blog post published", time: "2 hours ago" },
    { text: "Testimonial approved", time: "4 hours ago" },
    { text: "Gallery updated", time: "1 day ago" },
    { text: "Pop-up scheduled", time: "2 days ago" },
  ];

  const quickActions = [
    { label: "Add Blogs", icon: FileText , link:"/blogs/create"},
    { label: "Add Testimonials", icon: MessageSquare , link:"/testimonials/create"},
    { label: "Upload Images", icon: Image , link:"/blogs/create"},
    { label: "Create Pop-up", icon: Megaphone , link:"/blogs/create"},
  ];

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
            <div
              key={stat.label}
              className="rounded-lg border bg-[#F7F6F3] p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[#65421E] font-solomon">{stat.label}</p>
                  <h1 className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</h1>
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
        {/* Recent Activity */}
        <div className="rounded-lg border bg-[#F7F6F3] p-6 shadow-sm">
          <h1 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h1>
          <div className="space-y-4">
            {recentActivity.map((activity, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between pb-4 border-b last:border-b-0 last:pb-0"
              >
                <p className="text-sm font-medium text-gray-800">{activity.text}</p>
                <p className="text-sm text-gray-500">{activity.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg border bg-[#F7F6F3] p-6 shadow-sm">
          <h1 className="text-lg font-bold mb-6">Recent Activity</h1>
          <div className="grid grid-cols-2 gap-4 place-items-center">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link href={action.link}>
                  <button
                    key={action.label}
                    className="flex flex-col items-center justify-center rounded-lg bg-[#FBF8EF] p-5 transition-colors"
                  >
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