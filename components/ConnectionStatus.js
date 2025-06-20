"use client"
import { useState, useEffect } from "react"
import { Wifi, WifiOff, Server, Database, Activity } from "lucide-react"

export default function ConnectionStatus({ API_BASE }) {
  const [connectionStatus, setConnectionStatus] = useState("checking")
  const [serverInfo, setServerInfo] = useState(null)
  const [lastChecked, setLastChecked] = useState(null)

  const checkConnection = async () => {
    try {
      setConnectionStatus("checking")
      const response = await fetch(`${API_BASE}/health`)
      const data = await response.json()

      if (data.success) {
        setConnectionStatus("connected")
        setServerInfo(data)
        setLastChecked(new Date())
      } else {
        setConnectionStatus("disconnected")
      }
    } catch (error) {
      setConnectionStatus("disconnected")
      setServerInfo(null)
    }
  }

  useEffect(() => {
    checkConnection()
    const interval = setInterval(checkConnection, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [API_BASE])

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "text-green-600"
      case "disconnected":
        return "text-red-600"
      case "checking":
        return "text-yellow-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "connected":
        return <Wifi className="w-4 h-4" />
      case "disconnected":
        return <WifiOff className="w-4 h-4" />
      case "checking":
        return <Activity className="w-4 h-4 animate-spin" />
      default:
        return <WifiOff className="w-4 h-4" />
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">API Connection Status</h3>
        <button
          onClick={checkConnection}
          className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-3">
        <div className={`flex items-center space-x-2 ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="text-sm font-medium">
            {connectionStatus === "connected" && "Custom API Connected"}
            {connectionStatus === "disconnected" && "Custom API Disconnected"}
            {connectionStatus === "checking" && "Checking Connection..."}
          </span>
        </div>

        {serverInfo && (
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-center space-x-2">
              <Server className="w-3 h-3" />
              <span>Server: {serverInfo.status}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Database className="w-3 h-3" />
              <span>Database: {serverInfo.database}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Activity className="w-3 h-3" />
              <span>Requests: {serverInfo.requestCount}</span>
            </div>
            <div>
              <span>Endpoints: {serverInfo.endpoints?.length || 0} available</span>
            </div>
          </div>
        )}

        {lastChecked && <div className="text-xs text-gray-500">Last checked: {lastChecked.toLocaleTimeString()}</div>}

        <div className="pt-2 border-t border-gray-200">
          <div className="text-xs text-gray-600">
            <div>
              <strong>API Base:</strong> {API_BASE}
            </div>
            <div>
              <strong>Frontend:</strong> React with fetch() API
            </div>
            <div>
              <strong>Backend:</strong> Express.js + MongoDB
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
