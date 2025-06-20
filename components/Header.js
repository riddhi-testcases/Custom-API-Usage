import { Wifi, WifiOff } from "lucide-react"

export default function Header({ connectionStatus }) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Custom API Task Usage Dashboard</h1>
          <p className="text-sm text-gray-600">Custom-built API Server with MongoDB Integration</p>
        </div>
        <div className="flex items-center space-x-2">
          {connectionStatus === "connected" ? (
            <div className="flex items-center space-x-2 text-green-600">
              <Wifi className="w-4 h-4" />
              <span className="text-sm font-medium">Custom API Connected</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-red-600">
              <WifiOff className="w-4 h-4" />
              <span className="text-sm font-medium">Custom API Disconnected</span>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
