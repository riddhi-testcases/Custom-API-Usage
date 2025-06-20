"use client"
import { Database, FileText, Settings, Activity, TestTube, Home, Server } from "lucide-react"

export default function Sidebar({ activeTab, setActiveTab }) {
  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "api-docs", label: "API Docs", icon: FileText },
    { id: "database", label: "Database", icon: Database },
    { id: "testing", label: "Testing", icon: TestTube },
    { id: "logs", label: "Logs", icon: Activity },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Server className="w-8 h-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">Custom API Task Usage</span>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === item.id
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
