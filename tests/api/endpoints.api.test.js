const request = require("supertest")
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const { TaskService, Task } = require("../../lib/taskService")

const createTestApp = () => {
  const app = express()

  app.use(cors())
  app.use(express.json())

  let requestCount = 0
  const serverStatus = "online"
  const dbStatus = "connected"

  app.use((req, res, next) => {
    requestCount++
    next()
  })

  app.get("/api/health", (req, res) => {
    res.json({
      success: true,
      message: "Custom Task Management API is running",
      timestamp: new Date().toISOString(),
      status: serverStatus,
      database: dbStatus,
      requestCount: requestCount,
      endpoints: [
        "GET /api/health",
        "GET /api/status",
        "GET /api/tasks",
        "POST /api/tasks",
        "PUT /api/tasks/:id",
        "DELETE /api/tasks/:id",
        "GET /api/tasks/:id",
        "GET /api/tasks/recent",
        "GET /api/analytics",
      ],
    })
  })

  app.get("/api/status", async (req, res) => {
    try {
      const stats = await TaskService.getSystemStats()
      res.json({
        success: true,
        data: {
          server: serverStatus,
          database: dbStatus,
          timestamp: new Date().toISOString(),
          requestCount: requestCount,
          stats: stats,
        },
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get system status",
        error: error.message,
      })
    }
  })

  app.get("/api/tasks/recent", async (req, res) => {
    try {
      const tasks = await TaskService.getRecentTasks(req.query.limit)
      res.json({
        success: true,
        data: tasks,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve recent tasks",
        error: error.message,
      })
    }
  })

  app.get("/api/tasks", async (req, res) => {
    try {
      const result = await TaskService.getTasks(req.query)
      res.json({
        success: true,
        count: result.count,
        totalCount: result.totalCount,
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        data: result.tasks,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve tasks",
        error: error.message,
      })
    }
  })

  app.post("/api/tasks", async (req, res) => {
    try {
      const errors = TaskService.validateTaskData(req.body)
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: errors,
        })
      }

      const task = await TaskService.createTask(req.body)
      res.status(201).json({
        success: true,
        message: "Task created successfully",
        data: task,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to create task",
        error: error.message,
      })
    }
  })

  app.get("/api/tasks/:id", async (req, res) => {
    try {
      const task = await TaskService.getTaskById(req.params.id)
      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        })
      }
      res.json({
        success: true,
        data: task,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve task",
        error: error.message,
      })
    }
  })

  app.put("/api/tasks/:id", async (req, res) => {
    try {
      const task = await TaskService.getTaskById(req.params.id)
      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        })
      }

      const updatedTask = await TaskService.updateTask(req.params.id, req.body)
      res.json({
        success: true,
        message: "Task updated successfully",
        data: updatedTask,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update task",
        error: error.message,
      })
    }
  })

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const deletedTask = await TaskService.deleteTask(req.params.id)
      if (!deletedTask) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        })
      }
      res.json({
        success: true,
        message: "Task deleted successfully",
        data: deletedTask,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to delete task",
        error: error.message,
      })
    }
  })

  app.get("/api/analytics", async (req, res) => {
    try {
      const analytics = await TaskService.getAnalytics()
      res.json({
        success: true,
        data: analytics,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve analytics",
        error: error.message,
      })
    }
  })

  return app
}

describe("API Endpoints Tests", () => {
  let app

  beforeAll(() => {
    app = createTestApp()
  })

  const mockTaskData = {
    title: "API Test Task",
    description: "Testing API endpoints",
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    priority: "high",
    category: "api-testing",
    assignedTo: "api@test.com",
    estimatedHours: 4,
    tags: ["api", "test"],
  }

  describe("GET /api/health", () => {
    test("should return health status", async () => {
      const response = await request(app).get("/api/health").expect(200)

      expect(response.body).toMatchObject({
        success: true,
        message: "Custom Task Management API is running",
        status: "online",
        database: "connected",
      })
      expect(response.body.endpoints).toHaveLength(9)
      expect(response.body.requestCount).toBeGreaterThan(0)
    })
  })

  describe("GET /api/status", () => {
    test("should return system status", async () => {
      const response = await request(app).get("/api/status").expect(200)

      expect(response.body).toMatchObject({
        success: true,
        data: {
          server: "online",
          database: "connected",
        },
      })
      expect(response.body.data.stats).toBeDefined()
    })
  })

  describe("POST /api/tasks", () => {
    test("should create a new task", async () => {
      const response = await request(app).post("/api/tasks").send(mockTaskData).expect(201)

      expect(response.body).toMatchObject({
        success: true,
        message: "Task created successfully",
      })
      expect(response.body.data).toMatchObject({
        title: mockTaskData.title,
        description: mockTaskData.description,
        priority: mockTaskData.priority,
        status: "pending",
      })
      expect(response.body.data._id).toBeDefined()
    })

    test("should return 400 for invalid task data", async () => {
      const invalidData = { title: "", description: "No title" }

      const response = await request(app).post("/api/tasks").send(invalidData).expect(400)

      expect(response.body).toMatchObject({
        success: false,
        message: "Validation error",
      })
      expect(response.body.errors).toContain("Title is required")
    })

    test("should return 400 for past due date", async () => {
      const invalidData = {
        ...mockTaskData,
        dueDate: new Date(Date.now() - 86400000).toISOString(),
      }

      const response = await request(app).post("/api/tasks").send(invalidData).expect(400)

      expect(response.body.errors).toContain("Due date cannot be in the past")
    })
  })

  describe("GET /api/tasks", () => {
    beforeEach(async () => {
      // Create test tasks
      await TaskService.createTask({ ...mockTaskData, title: "Task 1", status: "pending" })
      await TaskService.createTask({ ...mockTaskData, title: "Task 2", status: "in-progress" })
      await TaskService.createTask({ ...mockTaskData, title: "Task 3", status: "completed" })
    })

    test("should get all tasks", async () => {
      const response = await request(app).get("/api/tasks").expect(200)

      expect(response.body).toMatchObject({
        success: true,
      })
      expect(response.body.data).toHaveLength(3)
      expect(response.body.totalCount).toBe(3)
    })

    test("should filter tasks by status", async () => {
      const response = await request(app).get("/api/tasks?status=pending").expect(200)

      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0].status).toBe("pending")
    })

    test("should search tasks", async () => {
      const response = await request(app).get("/api/tasks?search=Task 1").expect(200)

      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0].title).toContain("Task 1")
    })

    test("should paginate results", async () => {
      const response = await request(app).get("/api/tasks?limit=2&page=1").expect(200)

      expect(response.body.data).toHaveLength(2)
      expect(response.body.currentPage).toBe(1)
      expect(response.body.totalPages).toBe(2)
    })
  })

  describe("GET /api/tasks/:id", () => {
    let taskId

    beforeEach(async () => {
      const task = await TaskService.createTask(mockTaskData)
      taskId = task._id
    })

    test("should get task by id", async () => {
      const response = await request(app).get(`/api/tasks/${taskId}`).expect(200)

      expect(response.body).toMatchObject({
        success: true,
      })
      expect(response.body.data.title).toBe(mockTaskData.title)
    })

    test("should return 404 for non-existent task", async () => {
      const fakeId = "507f1f77bcf86cd799439011"

      const response = await request(app).get(`/api/tasks/${fakeId}`).expect(404)

      expect(response.body).toMatchObject({
        success: false,
        message: "Task not found",
      })
    })
  })

  describe("PUT /api/tasks/:id", () => {
    let taskId

    beforeEach(async () => {
      const task = await TaskService.createTask(mockTaskData)
      taskId = task._id
    })

    test("should update task", async () => {
      const updateData = {
        status: "in-progress",
        priority: "urgent",
      }

      const response = await request(app).put(`/api/tasks/${taskId}`).send(updateData).expect(200)

      expect(response.body).toMatchObject({
        success: true,
        message: "Task updated successfully",
      })
      expect(response.body.data.status).toBe("in-progress")
      expect(response.body.data.priority).toBe("urgent")
    })

    test("should return 404 for non-existent task", async () => {
      const fakeId = "507f1f77bcf86cd799439011"

      const response = await request(app).put(`/api/tasks/${fakeId}`).send({ status: "completed" }).expect(404)

      expect(response.body).toMatchObject({
        success: false,
        message: "Task not found",
      })
    })

    test("should set completedAt when status is completed", async () => {
      const response = await request(app).put(`/api/tasks/${taskId}`).send({ status: "completed" }).expect(200)

      expect(response.body.data.status).toBe("completed")
      expect(response.body.data.completedAt).toBeDefined()
    })
  })

  describe("DELETE /api/tasks/:id", () => {
    let taskId

    beforeEach(async () => {
      const task = await TaskService.createTask(mockTaskData)
      taskId = task._id
    })

    test("should delete task", async () => {
      const response = await request(app).delete(`/api/tasks/${taskId}`).expect(200)

      expect(response.body).toMatchObject({
        success: true,
        message: "Task deleted successfully",
      })
      expect(response.body.data.title).toBe(mockTaskData.title)

      await request(app).get(`/api/tasks/${taskId}`).expect(404)
    })

    test("should return 404 for non-existent task", async () => {
      const fakeId = "507f1f77bcf86cd799439011"

      const response = await request(app).delete(`/api/tasks/${fakeId}`).expect(404)

      expect(response.body).toMatchObject({
        success: false,
        message: "Task not found",
      })
    })
  })

  describe("GET /api/tasks/recent", () => {
    beforeEach(async () => {
      for (let i = 0; i < 5; i++) {
        await TaskService.createTask({
          ...mockTaskData,
          title: `Recent Task ${i}`,
        })
        await new Promise((resolve) => setTimeout(resolve, 10))
      }
    })

    test("should get recent tasks", async () => {
      const response = await request(app).get("/api/tasks/recent").expect(200)

      expect(response.body).toMatchObject({
        success: true,
      })
      expect(response.body.data).toHaveLength(5)
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    test("should limit recent tasks", async () => {
      const response = await request(app).get("/api/tasks/recent?limit=3").expect(200)

      expect(response.body.data).toHaveLength(3)
      expect(Array.isArray(response.body.data)).toBe(true)
    })
  })

  describe("GET /api/analytics", () => {
    beforeEach(async () => {
      await TaskService.createTask({ ...mockTaskData, status: "completed" })
      await TaskService.createTask({ ...mockTaskData, status: "pending" })
      await TaskService.createTask({
        ...mockTaskData,
        status: "pending",
        dueDate: new Date(Date.now() - 86400000), 
      })
    })

    test("should get analytics data", async () => {
      const response = await request(app).get("/api/analytics").expect(200)

      expect(response.body).toMatchObject({
        success: true,
      })
      expect(response.body.data).toHaveProperty("tasksOverTime")
      expect(response.body.data).toHaveProperty("avgCompletionTime")
      expect(response.body.data).toHaveProperty("overdueTasks")
      expect(response.body.data).toHaveProperty("totalCompleted")
      expect(response.body.data.overdueTasks).toBe(1)
    })
  })

  describe("Error Handling", () => {
    test("should handle invalid JSON", async () => {
      const response = await request(app)
        .post("/api/tasks")
        .send("invalid json")
        .set("Content-Type", "application/json")
        .expect(400)
    })

    test("should handle invalid ObjectId", async () => {
      const response = await request(app).get("/api/tasks/invalid-id").expect(500)

      expect(response.body.success).toBe(false)
    })
  })

  describe("CORS Headers", () => {
    test("should include CORS headers", async () => {
      const response = await request(app).get("/api/health").expect(200)

      expect(response.headers["access-control-allow-origin"]).toBe("*")
    })
  })
})
