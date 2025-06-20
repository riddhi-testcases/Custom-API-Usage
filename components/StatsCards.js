import { BarChart3, Activity, CheckCircle, Clock } from "lucide-react"

export default function StatsCards({ systemStatus }) {
  const stats = [
    {
      title: "Total Tasks",
      value: systemStatus?.stats?.totalTasks || 0,
      description: "All tasks in system",
      icon: BarChart3,
      color: "text-gray-400",
    },
    {
      title: "In Progress",
      value: systemStatus?.stats?.inProgressTasks || 0,
      description: "Currently active",
      icon: Activity,
      color: "text-blue-400",
    },
    {
      title: "Completed",
      value: systemStatus?.stats?.completedTasks || 0,
      description: "Successfully finished",
      icon: CheckCircle,
      color: "text-green-400",
    },
    {
      title: "Pending",
      value: systemStatus?.stats?.pendingTasks || 0,
      description: "Waiting to start",
      icon: Clock,
      color: "text-orange-400",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </div>
              <Icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
