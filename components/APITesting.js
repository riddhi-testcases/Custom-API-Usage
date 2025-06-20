"use client"

export default function APITesting({ API_BASE, onTestConnection, onCreateDemoData }) {
  const testIndividualEndpoint = async (endpoint, method = "GET", data = null) => {
    try {
      const options = {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      }

      if (data) {
        options.body = JSON.stringify(data)
      }

      const response = await fetch(`${API_BASE}${endpoint}`, options)
      const result = await response.json()

      alert(
        `✅ ${method} ${endpoint}\n\nStatus: ${response.status}\nSuccess: ${result.success}\nMessage: ${result.message || "OK"}`,
      )
    } catch (error) {
      alert(`❌ ${method} ${endpoint}\n\nError: ${error.message}`)
    }
  }

  const testCreateTaskAPI = async () => {
    const testTask = {
      title: "API Test Task - " + new Date().toLocaleTimeString(),
      description: "This task was created to test the POST /api/tasks endpoint functionality",
      status: "pending",
      priority: "high",
      category: "api-testing",
      assignedTo: "API Test User",
      dueDate: "2024-12-31",
      estimatedHours: 3,
      tags: ["api", "test", "frontend"],
    }

    await testIndividualEndpoint("/tasks", "POST", testTask)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Custom API Testing & Functionality</h2>
      <p className="text-sm text-gray-600 mb-4">Test your custom-built API endpoints and verify functionality</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        <button
          onClick={onTestConnection}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
        >
          Test API Connection
        </button>
        <button
          onClick={() => testIndividualEndpoint("/health")}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
        >
          Test Health Endpoint
        </button>
        <button
          onClick={() => testIndividualEndpoint("/status")}
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors text-sm"
        >
          Test Status API
        </button>
        <button
          onClick={() => testIndividualEndpoint("/tasks?limit=5")}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm"
        >
          Test Get Tasks API
        </button>
        <button
          onClick={testCreateTaskAPI}
          className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors text-sm"
        >
          Test Create Task API
        </button>
        <button
          onClick={() => testIndividualEndpoint("/analytics")}
          className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors text-sm"
        >
          Test Analytics API
        </button>
        <button
          onClick={() => testIndividualEndpoint("/tasks/recent?limit=3")}
          className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors text-sm"
        >
          Test Recent Tasks API
        </button>
        <button
          onClick={onCreateDemoData}
          className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors text-sm"
        >
          Create Demo Data
        </button>
        <button
          onClick={() => window.open(`${API_BASE}/health`, "_blank")}
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors text-sm"
        >
          Open API in Browser
        </button>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Custom API Endpoints Available:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
          <div className="flex items-center space-x-2">
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">GET</span>
            <span>/api/health</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">GET</span>
            <span>/api/status</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">GET</span>
            <span>/api/tasks</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">POST</span>
            <span>/api/tasks</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">PUT</span>
            <span>/api/tasks/:id</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">DELETE</span>
            <span>/api/tasks/:id</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">GET</span>
            <span>/api/tasks/recent</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">GET</span>
            <span>/api/analytics</span>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-2">API Connection Status:</h3>
        <div className="text-xs text-blue-700">
          <p>• Frontend connects to: {API_BASE}</p>
          <p>• All requests use fetch() API with proper headers</p>
          <p>• CORS enabled for cross-origin requests</p>
          <p>• Real-time data synchronization active</p>
        </div>
      </div>
    </div>
  )
}
