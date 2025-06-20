const axios = require("axios")

const API_BASE = "http://localhost:5000/api"

async function testAPI() {
  console.log("Testing API Endpoints...\n")

  try {
    // Test 1: Health Check
    console.log("1. Testing Health Check...")
    const healthResponse = await axios.get(`${API_BASE}/health`)
    console.log("✅ Health Check:", healthResponse.data.message)
    console.log("")

    // Test 2: System Status
    console.log("2. Testing System Status...")
    const statusResponse = await axios.get(`${API_BASE}/status`)
    console.log("✅ System Status:", statusResponse.data.data.server)
    console.log("📊 Total Tasks:", statusResponse.data.data.stats.totalTasks)
    console.log("")

    // Test 3: Create Task
    console.log("3. Testing Create Task...")
    const newTask = {
      title: "Test Task from API Test",
      description: "This is a test task created via API testing script",
      status: "pending",
      priority: "high",
      category: "testing",
      assignedTo: "API Tester",
      dueDate: "2024-12-31",
      estimatedHours: 2,
      tags: ["test", "api", "automation"],
    }

    const createResponse = await axios.post(`${API_BASE}/tasks`, newTask)
    console.log("✅ Task Created:", createResponse.data.message)
    const createdTaskId = createResponse.data.data._id
    console.log("📝 Task ID:", createdTaskId)
    console.log("")

    // Test 4: Get All Tasks
    console.log("4. Testing Get All Tasks...")
    const tasksResponse = await axios.get(`${API_BASE}/tasks?limit=5`)
    console.log("✅ Retrieved Tasks:", tasksResponse.data.count)
    console.log("")

    // Test 5: Get Specific Task
    console.log("5. Testing Get Specific Task...")
    const taskResponse = await axios.get(`${API_BASE}/tasks/${createdTaskId}`)
    console.log("Retrieved Task:", taskResponse.data.data.title)
    console.log("")

    // Test 6: Update Task
    console.log("6. Testing Update Task...")
    const updateData = {
      status: "in-progress",
      priority: "medium",
    }
    const updateResponse = await axios.put(`${API_BASE}/tasks/${createdTaskId}`, updateData)
    console.log("Task Updated:", updateResponse.data.message)
    console.log("")

    // Test 7: Get Recent Tasks
    console.log("7. Testing Get Recent Tasks...")
    const recentResponse = await axios.get(`${API_BASE}/tasks/recent?limit=3`)
    console.log("Recent Tasks:", recentResponse.data.data.length)
    console.log("")

    // Test 8: Get Analytics
    console.log("8. Testing Analytics...")
    const analyticsResponse = await axios.get(`${API_BASE}/analytics`)
    console.log("Analytics Retrieved")
    console.log("Avg Completion Time:", analyticsResponse.data.data.avgCompletionTime, "days")
    console.log("")

    // Test 9: Delete Task
    console.log("9. Testing Delete Task...")
    const deleteResponse = await axios.delete(`${API_BASE}/tasks/${createdTaskId}`)
    console.log("Task Deleted:", deleteResponse.data.message)
    console.log("")

    console.log("All API tests completed successfully!")
  } catch (error) {
    console.error("API Test Failed:", error.response?.data?.message || error.message)
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAPI()
}

module.exports = testAPI
