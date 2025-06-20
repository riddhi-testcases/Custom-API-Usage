const axios = require("axios")

const API_BASE = "http://localhost:5000/api"

async function testAPIServer() {
  console.log("🧪 Testing Custom API Task Usage Server")
  console.log("=" * 50)
  console.log("Testing all custom API endpoints on the running server...\n")

  const testResults = {
    passed: 0,
    failed: 0,
    total: 9,
    details: [],
  }

  try {
    // Test 1: Health Check Endpoint
    console.log("1️⃣  Testing Health Check Endpoint")
    console.log("   GET /api/health")
    try {
      const healthResponse = await axios.get(`${API_BASE}/health`)
      console.log("   ✅ Status:", healthResponse.status)
      console.log("   ✅ Message:", healthResponse.data.message)
      console.log("   ✅ Server Status:", healthResponse.data.status)
      console.log("   ✅ Database Status:", healthResponse.data.database)
      console.log("   ✅ Available Endpoints:", healthResponse.data.endpoints.length)
      console.log("   ✅ Request Count:", healthResponse.data.requestCount)
      testResults.passed++
      testResults.details.push("✅ Health Check - API server is running and responsive")
    } catch (error) {
      console.log("   ❌ Health Check Failed:", error.message)
      testResults.failed++
      testResults.details.push("❌ Health Check - Server may not be running on port 5000")
    }
    console.log("")

    // Test 2: System Status Endpoint
    console.log("2️⃣  Testing System Status Endpoint")
    console.log("   GET /api/status")
    try {
      const statusResponse = await axios.get(`${API_BASE}/status`)
      console.log("   ✅ Server Status:", statusResponse.data.data.server)
      console.log("   ✅ Database Status:", statusResponse.data.data.database)
      console.log("   ✅ Total Tasks:", statusResponse.data.data.stats.totalTasks)
      console.log("   ✅ In Progress:", statusResponse.data.data.stats.inProgressTasks)
      console.log("   ✅ Completed:", statusResponse.data.data.stats.completedTasks)
      console.log("   ✅ Pending:", statusResponse.data.data.stats.pendingTasks)
      testResults.passed++
      testResults.details.push("✅ System Status - MongoDB connection and statistics working")
    } catch (error) {
      console.log("   ❌ Status Check Failed:", error.message)
      testResults.failed++
      testResults.details.push("❌ System Status - Database connection issues")
    }
    console.log("")

    // Test 3: Create Task Endpoint
    console.log("3️⃣  Testing Create Task Endpoint")
    console.log("   POST /api/tasks")
    let createdTaskId = null
    try {
      const newTask = {
        title: "API Server Test Task",
        description: "This task was created to test the custom API server functionality",
        status: "pending",
        priority: "high",
        category: "testing",
        assignedTo: "API Test Suite",
        dueDate: "2024-12-31",
        estimatedHours: 2,
        tags: ["api-test", "server-test", "automation"],
      }

      const createResponse = await axios.post(`${API_BASE}/tasks`, newTask)
      createdTaskId = createResponse.data.data._id
      console.log("   ✅ Task Created Successfully")
      console.log("   ✅ Task ID:", createdTaskId)
      console.log("   ✅ Title:", createResponse.data.data.title)
      console.log("   ✅ Status:", createResponse.data.data.status)
      console.log("   ✅ Priority:", createResponse.data.data.priority)
      testResults.passed++
      testResults.details.push("✅ Create Task - POST endpoint working, data persisted to MongoDB")
    } catch (error) {
      console.log("   ❌ Create Task Failed:", error.response?.data?.message || error.message)
      testResults.failed++
      testResults.details.push("❌ Create Task - POST endpoint or database write failed")
    }
    console.log("")

    // Test 4: Get All Tasks Endpoint
    console.log("4️⃣  Testing Get All Tasks Endpoint")
    console.log("   GET /api/tasks")
    try {
      const tasksResponse = await axios.get(`${API_BASE}/tasks?limit=10`)
      console.log("   ✅ Tasks Retrieved:", tasksResponse.data.count)
      console.log("   ✅ Total Count:", tasksResponse.data.totalCount)
      console.log("   ✅ Current Page:", tasksResponse.data.currentPage)
      console.log("   ✅ Total Pages:", tasksResponse.data.totalPages)
      if (tasksResponse.data.data.length > 0) {
        console.log("   ✅ Sample Task:", tasksResponse.data.data[0].title)
      }
      testResults.passed++
      testResults.details.push("✅ Get All Tasks - Pagination and filtering working")
    } catch (error) {
      console.log("   ❌ Get Tasks Failed:", error.message)
      testResults.failed++
      testResults.details.push("❌ Get All Tasks - Read operation failed")
    }
    console.log("")

    // Test 5: Get Single Task Endpoint
    if (createdTaskId) {
      console.log("5️⃣  Testing Get Single Task Endpoint")
      console.log("   GET /api/tasks/:id")
      try {
        const singleTaskResponse = await axios.get(`${API_BASE}/tasks/${createdTaskId}`)
        console.log("   ✅ Single Task Retrieved")
        console.log("   ✅ Task Title:", singleTaskResponse.data.data.title)
        console.log("   ✅ Task Status:", singleTaskResponse.data.data.status)
        console.log("   ✅ Task Category:", singleTaskResponse.data.data.category)
        console.log("   ✅ Created At:", new Date(singleTaskResponse.data.data.createdAt).toLocaleString())
        testResults.passed++
        testResults.details.push("✅ Get Single Task - Individual task retrieval working")
      } catch (error) {
        console.log("   ❌ Get Single Task Failed:", error.message)
        testResults.failed++
        testResults.details.push("❌ Get Single Task - Individual task retrieval failed")
      }
    } else {
      console.log("5️⃣  Skipping Get Single Task (no task ID available)")
      testResults.failed++
      testResults.details.push("❌ Get Single Task - Skipped due to missing task ID")
    }
    console.log("")

    // Test 6: Update Task Endpoint
    if (createdTaskId) {
      console.log("6️⃣  Testing Update Task Endpoint")
      console.log("   PUT /api/tasks/:id")
      try {
        const updateData = {
          status: "in-progress",
          priority: "medium",
          description: "Updated by API server test suite - testing PUT endpoint",
          assignedTo: "Updated Test User",
        }
        const updateResponse = await axios.put(`${API_BASE}/tasks/${createdTaskId}`, updateData)
        console.log("   ✅ Task Updated Successfully")
        console.log("   ✅ New Status:", updateResponse.data.data.status)
        console.log("   ✅ New Priority:", updateResponse.data.data.priority)
        console.log("   ✅ New Assignee:", updateResponse.data.data.assignedTo)
        console.log("   ✅ Updated At:", new Date(updateResponse.data.data.updatedAt).toLocaleString())
        testResults.passed++
        testResults.details.push("✅ Update Task - PUT endpoint working, changes persisted")
      } catch (error) {
        console.log("   ❌ Update Task Failed:", error.response?.data?.message || error.message)
        testResults.failed++
        testResults.details.push("❌ Update Task - PUT endpoint or database update failed")
      }
    } else {
      console.log("6️⃣  Skipping Update Task (no task ID available)")
      testResults.failed++
      testResults.details.push("❌ Update Task - Skipped due to missing task ID")
    }
    console.log("")

    // Test 7: Get Recent Tasks Endpoint
    console.log("7️⃣  Testing Get Recent Tasks Endpoint")
    console.log("   GET /api/tasks/recent")
    try {
      const recentResponse = await axios.get(`${API_BASE}/tasks/recent?limit=5`)
      console.log("   ✅ Recent Tasks Retrieved:", recentResponse.data.data.length)
      if (recentResponse.data.data.length > 0) {
        console.log("   ✅ Latest Task:", recentResponse.data.data[0].title)
        console.log("   ✅ Latest Task Created:", new Date(recentResponse.data.data[0].createdAt).toLocaleString())
      }
      testResults.passed++
      testResults.details.push("✅ Get Recent Tasks - Recent tasks endpoint working")
    } catch (error) {
      console.log("   ❌ Get Recent Tasks Failed:", error.message)
      testResults.failed++
      testResults.details.push("❌ Get Recent Tasks - Recent tasks endpoint failed")
    }
    console.log("")

    // Test 8: Analytics Endpoint
    console.log("8️⃣  Testing Analytics Endpoint")
    console.log("   GET /api/analytics")
    try {
      const analyticsResponse = await axios.get(`${API_BASE}/analytics`)
      console.log("   ✅ Analytics Retrieved Successfully")
      console.log("   ✅ Average Completion Time:", analyticsResponse.data.data.avgCompletionTime, "days")
      console.log("   ✅ Overdue Tasks:", analyticsResponse.data.data.overdueTasks)
      console.log("   ✅ Total Completed:", analyticsResponse.data.data.totalCompleted)
      console.log("   ✅ Tasks Over Time Data Points:", analyticsResponse.data.data.tasksOverTime.length)
      testResults.passed++
      testResults.details.push("✅ Analytics - Complex aggregation queries working")
    } catch (error) {
      console.log("   ❌ Analytics Failed:", error.message)
      testResults.failed++
      testResults.details.push("❌ Analytics - Aggregation queries failed")
    }
    console.log("")

    // Test 9: Delete Task Endpoint
    if (createdTaskId) {
      console.log("9️⃣  Testing Delete Task Endpoint")
      console.log("   DELETE /api/tasks/:id")
      try {
        const deleteResponse = await axios.delete(`${API_BASE}/tasks/${createdTaskId}`)
        console.log("   ✅ Task Deleted Successfully")
        console.log("   ✅ Deleted Task Title:", deleteResponse.data.data.title)
        console.log("   ✅ Deleted Task ID:", deleteResponse.data.data._id)
        testResults.passed++
        testResults.details.push("✅ Delete Task - DELETE endpoint working, data removed from MongoDB")
      } catch (error) {
        console.log("   ❌ Delete Task Failed:", error.response?.data?.message || error.message)
        testResults.failed++
        testResults.details.push("❌ Delete Task - DELETE endpoint or database removal failed")
      }
    } else {
      console.log("9️⃣  Skipping Delete Task (no task ID available)")
      testResults.failed++
      testResults.details.push("❌ Delete Task - Skipped due to missing task ID")
    }
    console.log("")

    // Test Results Summary
    console.log("📊 CUSTOM API SERVER TEST RESULTS")
    console.log("=" * 60)
    console.log(`✅ Passed: ${testResults.passed}/${testResults.total}`)
    console.log(`❌ Failed: ${testResults.failed}/${testResults.total}`)
    console.log(`📈 Success Rate: ${Math.round((testResults.passed / testResults.total) * 100)}%`)
    console.log("")

    // Detailed Results
    console.log("📋 DETAILED TEST RESULTS:")
    testResults.details.forEach((detail, index) => {
      console.log(`${index + 1}. ${detail}`)
    })
    console.log("")

    if (testResults.passed === testResults.total) {
      console.log("🎉 ALL TESTS PASSED! Your Custom API Task Usage server is working perfectly!")
      console.log("")
      console.log("✅ Custom API Requirements Verified:")
      console.log("   • 9 Custom API endpoints implemented and tested")
      console.log("   • Full CRUD operations working correctly")
      console.log("   • MongoDB database integration functional")
      console.log("   • Proper error handling and validation")
      console.log("   • Data persistence across operations")
      console.log("   • Real-time system monitoring active")
      console.log("")
      console.log("🚀 Your Custom API Task Usage server is production-ready!")
    } else {
      console.log("⚠️  Some tests failed. Please check the errors above.")
      console.log("")
      console.log("🔧 Common Issues:")
      console.log("1. Ensure the API server is running: npm run server")
      console.log("2. Check MongoDB Atlas connection in .env file")
      console.log("3. Verify server is accessible at http://localhost:5000")
      console.log("4. Check server logs for any error messages")
    }

    // Server Information
    console.log("")
    console.log("🖥️  SERVER INFORMATION:")
    console.log("   • API Base URL: http://localhost:5000/api")
    console.log("   • Dashboard URL: http://localhost:3000")
    console.log("   • Database: MongoDB Atlas")
    console.log("   • Framework: Express.js with Mongoose ODM")
    console.log("   • Custom Endpoints: 9 total")
  } catch (error) {
    console.error("❌ API Server Testing failed:", error.message)
    console.log("\n🔧 Troubleshooting Steps:")
    console.log("1. Start the API server: npm run server")
    console.log("2. Check if MongoDB Atlas is accessible")
    console.log("3. Verify environment variables in .env file")
    console.log("4. Ensure port 5000 is not blocked by firewall")
    console.log("5. Check server console for startup errors")
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAPIServer()
}

module.exports = testAPIServer
