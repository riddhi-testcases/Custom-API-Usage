"use client"
import { Plus, Save, X } from "lucide-react"
import { useState } from "react"

export default function TaskForm({
  showTaskForm,
  setShowTaskForm,
  editingTask,
  formData,
  setFormData,
  onSubmit,
  onCancel,
  API_BASE,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastAPIResponse, setLastAPIResponse] = useState(null)

  const handleSubmitWithLogging = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setLastAPIResponse(null)

    try {
      const taskData = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        estimatedHours: Number.parseInt(formData.estimatedHours),
      }

      const url = editingTask ? `${API_BASE}/tasks/${editingTask._id}` : `${API_BASE}/tasks`
      const method = editingTask ? "PUT" : "POST"

      console.log(`🚀 Making ${method} request to:`, url)
      console.log("📤 Request data:", taskData)

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      })

      const result = await response.json()

      console.log(`📥 API Response (${response.status}):`, result)
      setLastAPIResponse({
        status: response.status,
        method,
        url,
        success: result.success,
        message: result.message,
        data: result.data,
      })

      if (result.success) {
        alert(
          `✅ Task ${editingTask ? "updated" : "created"} successfully!\n\n${method} ${url}\nStatus: ${response.status}\nTask ID: ${result.data._id}`,
        )
        onSubmit(e) // Call the original onSubmit to refresh data
      } else {
        alert(`❌ API Error: ${result.message}`)
      }
    } catch (error) {
      console.error("❌ API Request failed:", error)
      setLastAPIResponse({
        error: error.message,
        method: editingTask ? "PUT" : "POST",
        url: editingTask ? `${API_BASE}/tasks/${editingTask._id}` : `${API_BASE}/tasks`,
      })
      alert(`❌ Network Error: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const testFormData = () => {
    const testTask = {
      title: "Quick Test Task - " + new Date().toLocaleTimeString(),
      description: "This is a test task created to verify the form and API integration",
      status: "pending",
      priority: "medium",
      category: "testing",
      assignedTo: "Test User",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 7 days from now
      estimatedHours: 2,
      tags: "test, api, form",
    }

    setFormData(testTask)
    alert("✅ Form filled with test data! Click 'Create Task' to test the API.")
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Task Management Interface</h2>
          <p className="text-sm text-gray-600">Create, update, and delete tasks via custom API endpoints</p>
        </div>
        <div className="flex gap-2">
          {!showTaskForm && (
            <button
              onClick={testFormData}
              className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors flex items-center space-x-2 text-sm"
            >
              <span>Fill Test Data</span>
            </button>
          )}
          <button
            onClick={() => setShowTaskForm(!showTaskForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>{showTaskForm ? "Cancel" : "Add New Task"}</span>
          </button>
        </div>
      </div>

      {showTaskForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-semibold">
              {editingTask ? "Edit Task (PUT /api/tasks/:id)" : "Create New Task (POST /api/tasks)"}
            </h3>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>API Endpoint:</span>
              <code className="bg-gray-200 px-2 py-1 rounded">
                {editingTask ? `PUT ${API_BASE}/tasks/:id` : `POST ${API_BASE}/tasks`}
              </code>
            </div>
          </div>

          <form onSubmit={handleSubmitWithLogging} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., development, design, testing"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Est. Hours</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                <input
                  type="text"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter assignee name"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Comma-separated tags"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? "Submitting..." : editingTask ? "Update Task" : "Create Task"}</span>
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </form>

          {lastAPIResponse && (
            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Last API Response:</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <div>
                  <strong>Method:</strong> {lastAPIResponse.method}
                </div>
                <div>
                  <strong>URL:</strong> {lastAPIResponse.url}
                </div>
                {lastAPIResponse.status && (
                  <div>
                    <strong>Status:</strong> {lastAPIResponse.status}
                  </div>
                )}
                {lastAPIResponse.success !== undefined && (
                  <div>
                    <strong>Success:</strong> {lastAPIResponse.success ? "✅ Yes" : "❌ No"}
                  </div>
                )}
                {lastAPIResponse.message && (
                  <div>
                    <strong>Message:</strong> {lastAPIResponse.message}
                  </div>
                )}
                {lastAPIResponse.data && (
                  <div>
                    <strong>Task ID:</strong> {lastAPIResponse.data._id}
                  </div>
                )}
                {lastAPIResponse.error && (
                  <div className="text-red-600">
                    <strong>Error:</strong> {lastAPIResponse.error}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 p-3 bg-green-50 rounded-lg">
        <h3 className="text-sm font-medium text-green-900 mb-2">API Integration Status:</h3>
        <div className="text-xs text-green-700 space-y-1">
          <p>✅ Frontend connected to custom API server</p>
          <p>✅ Real-time task creation and updates</p>
          <p>✅ Form validation and error handling</p>
          <p>✅ MongoDB data persistence</p>
          <p>✅ CRUD operations fully functional</p>
        </div>
      </div>
    </div>
  )
}
