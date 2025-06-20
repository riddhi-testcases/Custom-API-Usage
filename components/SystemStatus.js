export default function SystemStatus({ systemStatus }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">System Status</h2>
      <p className="text-sm text-gray-600 mb-4">Current system health and connectivity</p>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${systemStatus?.server === "online" ? "bg-green-500" : "bg-red-500"}`}
          ></div>
          <span className="text-sm text-gray-700">
            Express API Server: {systemStatus?.server === "online" ? "Online" : "Offline"}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${systemStatus?.database === "connected" ? "bg-green-500" : "bg-red-500"}`}
          ></div>
          <span className="text-sm text-gray-700">
            MongoDB Database: {systemStatus?.database === "connected" ? "Connected" : "Disconnected"}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span className="text-sm text-gray-700">Custom API Endpoints: 8 Active</span>
        </div>
      </div>

      {systemStatus?.timestamp && (
        <div className="mt-4 text-xs text-gray-500">
          Last updated: {new Date(systemStatus.timestamp).toLocaleString()}
        </div>
      )}
    </div>
  )
}
