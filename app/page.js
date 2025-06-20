"use client"

import { useState, useEffect } from "react"
import { Clock, Circle, CheckCircle, X, AlertCircle } from "lucide-react"

// Import components
import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import StatsCards from "../components/StatsCards"
import SystemStatus from "../components/SystemStatus"
import APITesting from "../components/APITesting"
import RecentTasks from "../components/RecentTasks"
import TaskForm from "../components/TaskForm"
import TaskList from "../components/TaskList"
import SystemLogs from "../components/SystemLogs"
import ConnectionStatus from "../components/ConnectionStatus"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [systemStatus, setSystemStatus] = useState(null)
  const [recentTasks, setRecentTasks] = useState([])
  const [allTasks, setAllTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState("disconnected")
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [filterPriority, setFilterPriority] = useState("")

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    category: "general",
    assignedTo: "",
    dueDate: "",
    estimatedHours: 1,
    tags: "",
  })

  const API_BASE = "http://localhost:5000/api"

  useEffect(() => {
    fetchSystemStatus()
    fetchRecentTasks()
    fetchAllTasks()
    const interval = setInterval(() => {
      fetchSystemStatus()
      fetchRecentTasks()
    }, 15000) // Refresh every 15 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchSystemStatus = async () => {
    try {
      console.log("🔄 Fetching system status from API...")
      const response = await fetch(`${API_BASE}/status`)
      const result = await response.json()

      console.log("📊 System status response:", result)

      if (result.success) {
        setSystemStatus(result.data)
        setConnectionStatus(result.data.server === "online" ? "connected" : "disconnected")
        console.log("✅ System status updated successfully")
      } else {
        setConnectionStatus("disconnected")
        console.log("❌ System status fetch failed:", result.message)
      }
    } catch (error) {
      setConnectionStatus("disconnected")
      console.error("❌ Failed to fetch system status:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentTasks = async () => {
    try {
      console.log("🔄 Fetching recent tasks from API...")
      const response = await fetch(`${API_BASE}/tasks/recent?limit=5`)
      const result = await response.json()

      console.log("📋 Recent tasks response:", result)

      if (result.success) {
        setRecentTasks(result.data)
        console.log(`✅ Loaded ${result.data.length} recent tasks`)
      }
    } catch (error) {
      console.error("❌ Failed to fetch recent tasks:", error)
    }
  }

  const fetchAllTasks = async () => {
    try {
      let url = `${API_BASE}/tasks?limit=100`
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`
      if (filterStatus) url += `&status=${filterStatus}`
      if (filterPriority) url += `&priority=${filterPriority}`

      console.log("🔄 Fetching all tasks from:", url)
      const response = await fetch(url)
      const result = await response.json()

      console.log("📋 All tasks response:", result)

      if (result.success) {
        setAllTasks(result.data)
        console.log(`✅ Loaded ${result.data.length} tasks (${result.totalCount} total)`)
      }
    } catch (error) {
      console.error("❌ Failed to fetch all tasks:", error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // The TaskForm component now handles the API call
    // This function just refreshes the data after successful submission
    await fetchSystemStatus()
    await fetchRecentTasks()
    await fetchAllTasks()
    resetForm()
  }

  const handleDelete = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return
    }

    try {
      console.log(`🗑️ Deleting task: ${taskId}`)
      const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: "DELETE",
      })

      const result = await response.json()
      console.log("🗑️ Delete response:", result)

      if (result.success) {
        await fetchSystemStatus()
        await fetchRecentTasks()
        await fetchAllTasks()
        alert(`✅ Task deleted successfully!\n\nDELETE ${API_BASE}/tasks/${taskId}\nStatus: ${response.status}`)
      } else {
        alert(`❌ Delete failed: ${result.message}`)
      }
    } catch (error) {
      console.error("❌ Error deleting task:", error)
      alert(`❌ Network error: ${error.message}`)
    }
  }

  const handleEdit = (task) => {
    console.log("✏️ Editing task:", task)
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      category: task.category,
      assignedTo: task.assignedTo,
      dueDate: new Date(task.dueDate).toISOString().split("T")[0],
      estimatedHours: task.estimatedHours,
      tags: task.tags.join(", "),
    })
    setShowTaskForm(true)
    setActiveTab("testing")
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      status: "pending",
      priority: "medium",
      category: "general",
      assignedTo: "",
      dueDate: "",
      estimatedHours: 1,
      tags: "",
    })
    setEditingTask(null)
    setShowTaskForm(false)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-orange-500" />
      case "in-progress":
        return <Circle className="w-4 h-4 text-blue-500" />
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "cancelled":
        return <X className="w-4 h-4 text-red-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const testConnection = async () => {
    try {
      console.log("🔍 Testing API connection...")
      const response = await fetch(`${API_BASE}/health`)
      const data = await response.json()

      console.log("🔍 Connection test response:", data)

      if (data.success) {
        alert(
          `✅ Custom API Connection Successful!\n\n` +
            `Server Status: ${data.status}\n` +
            `Database: ${data.database}\n` +
            `Endpoints: ${data.endpoints.length}\n` +
            `Request Count: ${data.requestCount}\n\n` +
            `API Base: ${API_BASE}`,
        )
      }
    } catch (error) {
      console.error("❌ Connection test failed:", error)
      alert(
        `❌ Custom API Connection Failed!\n\n` +
          `Error: ${error.message}\n\n` +
          `Please ensure the Express server is running on port 5000\n` +
          `Command: npm run server`,
      )
    }
  }

  const createDemoData = async () => {
    const demoTasks = [
      {
        title: "Setup Development Environment",
        description:
          "Install Node.js, MongoDB, and configure the development environment for the Custom API Task Usage system",
        status: "completed",
        priority: "high",
        category: "development",
        assignedTo: "John Doe",
        dueDate: "2024-01-15",
        estimatedHours: 4,
        tags: ["setup", "environment", "development"],
      },
      {
        title: "Design Custom API Endpoints",
        description: "Create RESTful API endpoints for task management system using Express.js and MongoDB integration",
        status: "in-progress",
        priority: "high",
        category: "backend",
        assignedTo: "Jane Smith",
        dueDate: "2024-01-20",
        estimatedHours: 8,
        tags: ["api", "express", "backend"],
      },
      {
        title: "Integrate MongoDB Database",
        description: "Connect MongoDB Atlas database with Mongoose ODM for data persistence and CRUD operations",
        status: "completed",
        priority: "high",
        category: "database",
        assignedTo: "Mike Johnson",
        dueDate: "2024-01-18",
        estimatedHours: 6,
        tags: ["mongodb", "database", "mongoose"],
      },
    ]

    console.log("🎭 Creating demo data...")
    let successCount = 0

    for (const task of demoTasks) {
      try {
        console.log(`📤 Creating task: ${task.title}`)
        const response = await fetch(`${API_BASE}/tasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(task),
        })

        const result = await response.json()
        console.log(`📥 Task creation response:`, result)

        if (result.success) {
          successCount++
        }
      } catch (error) {
        console.error("❌ Error creating demo task:", error)
      }
    }

    await fetchSystemStatus()
    await fetchRecentTasks()
    await fetchAllTasks()

    alert(
      `✅ Demo data creation completed!\n\n` +
        `Successfully created: ${successCount}/${demoTasks.length} tasks\n` +
        `API Endpoint: POST ${API_BASE}/tasks\n\n` +
        `Check the Dashboard and Testing tabs to see the new data!`,
    )
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <StatsCards systemStatus={systemStatus} />
        </div>
        <div className="lg:col-span-1">
          <ConnectionStatus API_BASE={API_BASE} />
        </div>
      </div>
      <SystemStatus systemStatus={systemStatus} />
      <APITesting API_BASE={API_BASE} onTestConnection={testConnection} onCreateDemoData={createDemoData} />
      <RecentTasks recentTasks={recentTasks} />
    </div>
  )

  const renderTesting = () => (
    <div className="space-y-6">
      <TaskForm
        showTaskForm={showTaskForm}
        setShowTaskForm={setShowTaskForm}
        editingTask={editingTask}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        onCancel={resetForm}
        API_BASE={API_BASE}
      />
      <TaskList
        allTasks={allTasks}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterPriority={filterPriority}
        setFilterPriority={setFilterPriority}
        onApplyFilters={fetchAllTasks}
        onEdit={handleEdit}
        onDelete={handleDelete}
        getStatusIcon={getStatusIcon}
        getPriorityColor={getPriorityColor}
      />
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard()
      case "api-docs":
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Custom API Documentation</h2>
            <p className="text-sm text-gray-600 mb-6">Complete documentation for all custom-built API endpoints</p>
            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-medium text-gray-900">GET /api/status</h3>
                <p className="text-sm text-gray-600">Get system health and task statistics from MongoDB</p>
                <code className="text-xs bg-gray-100 p-1 rounded">curl -X GET http://localhost:5000/api/status</code>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-medium text-gray-900">GET /api/tasks</h3>
                <p className="text-sm text-gray-600">Retrieve all tasks with filtering options</p>
                <code className="text-xs bg-gray-100 p-1 rounded">
                  curl -X GET "http://localhost:5000/api/tasks?status=pending&priority=high"
                </code>
              </div>
              <div className="border-l-4 border-yellow-500 pl-4">
                <h3 className="font-medium text-gray-900">POST /api/tasks</h3>
                <p className="text-sm text-gray-600">Create a new task in MongoDB</p>
                <code className="text-xs bg-gray-100 p-1 rounded">
                  {
                    'curl -X POST http://localhost:5000/api/tasks -H "Content-Type: application/json" -d \'{ "title":"New Task", "description":"Task description", "dueDate":"2024-12-31" }\''
                  }
                </code>
              </div>
              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="font-medium text-gray-900">PUT /api/tasks/:id</h3>
                <p className="text-sm text-gray-600">Update an existing task</p>
                <code className="text-xs bg-gray-100 p-1 rounded">
                  {
                    'curl -X PUT http://localhost:5000/api/tasks/TASK_ID -H "Content-Type: application/json" -d \'{ "status":"completed" }\''
                  }
                </code>
              </div>
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-medium text-gray-900">DELETE /api/tasks/:id</h3>
                <p className="text-sm text-gray-600">Delete a specific task from database</p>
                <code className="text-xs bg-gray-100 p-1 rounded">
                  curl -X DELETE http://localhost:5000/api/tasks/TASK_ID
                </code>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-medium text-gray-900">GET /api/tasks/recent</h3>
                <p className="text-sm text-gray-600">Get recent tasks for dashboard</p>
                <code className="text-xs bg-gray-100 p-1 rounded">
                  curl -X GET http://localhost:5000/api/tasks/recent?limit=10
                </code>
              </div>
              <div className="border-l-4 border-indigo-500 pl-4">
                <h3 className="font-medium text-gray-900">GET /api/analytics</h3>
                <p className="text-sm text-gray-600">Get analytics and insights data</p>
                <code className="text-xs bg-gray-100 p-1 rounded">curl -X GET http://localhost:5000/api/analytics</code>
              </div>
              <div className="border-l-4 border-teal-500 pl-4">
                <h3 className="font-medium text-gray-900">GET /api/health</h3>
                <p className="text-sm text-gray-600">Health check endpoint</p>
                <code className="text-xs bg-gray-100 p-1 rounded">curl -X GET http://localhost:5000/api/health</code>
              </div>
            </div>
          </div>
        )
      case "database":
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">MongoDB Database Integration</h2>
            <p className="text-sm text-gray-600 mb-4">Database connection and schema information</p>
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <div
                  className={`w-2 h-2 rounded-full ${
                    systemStatus?.database === "connected" ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <span className="text-sm text-gray-700">
                  MongoDB Atlas: {systemStatus?.database === "connected" ? "Connected" : "Disconnected"}
                </span>
              </div>

              {systemStatus?.stats && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900">Total Documents</h4>
                    <p className="text-2xl font-bold text-blue-600">{systemStatus.stats.totalTasks}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900">Collections</h4>
                    <p className="text-2xl font-bold text-green-600">1</p>
                    <p className="text-xs text-gray-500">tasks</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900">Database</h4>
                    <p className="text-sm font-medium text-purple-600">taskmanager</p>
                    <p className="text-xs text-gray-500">MongoDB Atlas</p>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Task Schema (Mongoose)</h4>
                <pre className="text-xs text-gray-600 overflow-x-auto">
                  {`{
  title: String (required, max: 200),
  description: String (required, max: 1000),
  status: String (enum: ['pending', 'in-progress', 'completed', 'cancelled']),
  priority: String (enum: ['low', 'medium', 'high', 'urgent']),
  category: String (required, default: 'general'),
  assignedTo: String (default: 'unassigned'),
  dueDate: Date (required),
  estimatedHours: Number (min: 0, default: 1),
  tags: [String],
  createdAt: Date (default: now),
  updatedAt: Date (default: now),
  completedAt: Date (optional)
}`}
                </pre>
              </div>

              {systemStatus?.stats?.categoryBreakdown && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Category Breakdown</h4>
                  <div className="space-y-2">
                    {systemStatus.stats.categoryBreakdown.map((cat, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700">{cat._id}</span>
                        <span className="text-sm font-medium text-gray-900">{cat.count} tasks</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      case "testing":
        return renderTesting()
      case "logs":
        return <SystemLogs systemStatus={systemStatus} connectionStatus={connectionStatus} />
      case "settings":
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Server Configuration</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Database Configuration</h3>
                <p className="text-sm text-gray-600">MongoDB Atlas Connection</p>
                <code className="text-xs bg-gray-100 p-2 rounded block mt-1">
                  mongodb+srv://***:***@cluster0.mongodb.net/
                </code>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">API Server Configuration</h3>
                <p className="text-sm text-gray-600">Express.js server running on port {process.env.PORT || 5000}</p>
                <p className="text-sm text-gray-600">CORS enabled for all origins</p>
                <p className="text-sm text-gray-600">Request logging middleware active</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Custom API Endpoints</h3>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div>• GET /api/health</div>
                  <div>• GET /api/status</div>
                  <div>• GET /api/tasks</div>
                  <div>• POST /api/tasks</div>
                  <div>• PUT /api/tasks/:id</div>
                  <div>• DELETE /api/tasks/:id</div>
                  <div>• GET /api/tasks/recent</div>
                  <div>• GET /api/analytics</div>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return renderDashboard()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-gray-600 mb-2">Loading Custom API Task Usage Dashboard...</div>
          <div className="text-sm text-gray-500">Connecting to API server at {API_BASE}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col">
        <Header connectionStatus={connectionStatus} />
        <main className="flex-1 p-6">{renderContent()}</main>
      </div>
    </div>
  )
}
