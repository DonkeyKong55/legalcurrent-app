import {
  BookOpen,
  Eye,
  AlertTriangle,
  Calendar,
} from "lucide-react";

const StatCard = ({ title, value, change, icon: Icon, iconBg, iconColor }) => (
    <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
                <p className={`text-sm ${change.color}`}>{change.text}</p>
            </div>
            <div className={`w-12 h-12 ${iconBg} rounded-full flex items-center justify-center`}>
                <Icon className={iconColor} size={24} />
            </div>
        </div>
    </div>
);


export default function DashboardStats({ stats }) {
  const statItems = [
    {
      title: "Articles Today",
      value: stats.articlesToday,
      change: {
        text: `+${Math.floor(stats.articlesToday * 0.2)} from yesterday`,
        color: "text-green-600",
      },
      icon: BookOpen,
      iconBg: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "High Priority",
      value: stats.highPriority,
      change: {
        text: `+${Math.floor(stats.highPriority * 0.3)} high importance`,
        color: "text-orange-600",
      },
      icon: AlertTriangle,
      iconBg: "bg-orange-50 dark:bg-orange-900/20",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
    {
      title: "Weekly Total",
      value: stats.weeklyTotal,
      change: {
        text: `+${Math.floor(stats.weeklyTotal * 0.15)} from last week`,
        color: "text-green-600",
      },
      icon: Calendar,
      iconBg: "bg-green-50 dark:bg-green-900/20",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "Total Views",
      value: stats.totalViews,
      change: {
        text: "from yesterday",
        color: "text-gray-500",
      },
      icon: Eye,
      iconBg: "bg-purple-50 dark:bg-purple-900/20",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statItems.map(item => <StatCard key={item.title} {...item} />)}
    </div>
  );
}
