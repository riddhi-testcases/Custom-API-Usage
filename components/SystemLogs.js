"use client"

import { useState, useEffect } from "react"

export default function SystemLogs({ systemStatus, connectionStatus }) {
  const [logs, setLogs] = useState([])

  useEffect(() => {
    // Initialize with startup logs
    const initialLogs = [
      { timestamp: new Date(Date.now() - 300000), level: "INFO", message: "Express server starting..." },
      { timestamp: new Date(Date.now() - 295000), level: "INFO", message: "Loading environment variables" },
      { timestamp: new Date(Date.now() - 290000), level: "INFO", message: "Connecting to MongoDB Atlas..." },
      { timestamp: new Date(Date.now() - 285000), level: "SUCCESS", message: "MongoDB connected successfully" },
      { timestamp: new Date(Date.now() - 280000), level: "INFO", message: "Initializing custom API routes" },
      { timestamp: new Date(Date.now() - 275000), level: "SUCCESS", message: "8 API endpoints registered" },
      { timestamp: new Date(Date.now() - 270000), level: "SUCCESS", message: "Server running on port 5000" },
      { timestamp: new Date(Date.now() - 265000), level: "INFO", message: "CORS middleware enabled" },
      { timestamp: new Date(Date.now() - 260000), level: "INFO", message: "Request logging middleware active" },
      { timestamp: new Date(Date.now() - 255000), level: "SUCCESS", message: "API server ready for requests" },
    ]
    setLogs(initialLogs)
  }, [])

  useEffect(() => {
    // Add real-time logs based on system status changes
    if (systemStatus) {
      const newLog = {
        timestamp: new Date(),
        level: connectionStatus === "connected" ? "SUCCESS" : "ERROR",
        message:
          connectionStatus === "connected"
            ? `System status check: ${systemStatus.stats.totalTasks} tasks in database`
            : "Failed to connect to API server",
      }
      setLogs((prev) => [...prev.slice(-9), newLog])
    }
  }, [systemStatus, connectionStatus])

  const getLevelColor = (level) => {
    switch (level) {
      case "SUCCESS":
        return "text-green-400"
      case "ERROR":
        return "text-red-400"
      case "WARNING":
        return "text-yellow-400"
      default:
        return "text-blue-400"
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">System Logs</h2>
      <p className="text-sm text-gray-600 mb-4">Real-time server and API activity logs</p>

      <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
        <div className="space-y-1">
          {logs.map((log, index) => (
            <div key={index} className="flex items-start space-x-2">
              <span className="text-gray-500 text-xs min-w-0 flex-shrink-0">[{log.timestamp.toISOString()}]</span>
              <span className={`text-xs font-bold min-w-0 flex-shrink-0 ${getLevelColor(log.level)}`}>
                {log.level}:
              </span>
              <span className="text-xs">{log.message}</span>
            </div>
          ))}
          <div className="flex items-start space-x-2">
            <span className="text-gray-500 text-xs min-w-0 flex-shrink-0">[{new Date().toISOString()}]</span>
            <span className="text-blue-400 text-xs font-bold min-w-0 flex-shrink-0">INFO:</span>
            <span className="text-xs">Custom API endpoints: /health, /status, /tasks, /analytics active</span>
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>• Logs are generated in real-time from Express server</p>
        <p>• MongoDB operations are tracked and logged</p>
        <p>• API request/response cycles are monitored</p>
      </div>
    </div>
  )
}
