const request = require("supertest")
const { TaskService } = require("../../lib/taskService")

const createTestApp = () => {
  const express = require("express")
  const app = express()

  app.use(express.json())

  app.get("/api/tasks", async (req, res) => {
    try {
      const result = await TaskService.getTasks(req.query)
      res.json({
        success: true,
        data: result.tasks,
        count: result.count,
      })
    } catch (error) {
      res.status(500).json({ success: false, error: error.message })
    }
  })

  app.post("/api/tasks", async (req, res) => {
    try {
      const task = await TaskService.createTask(req.body)
      res.status(201).json({
        success: true,
        data: task,
      })
    } catch (error) {
      res.status(500).json({ success: false, error: error.message })
    }
  })

  return app
}

describe("Performance Tests", () => {
  let app

  beforeAll(() => {
    app = createTestApp()
  })

  const mockTaskData = {
    title: "Performance Test Task",
    description: "Testing API performance",
    dueDate: new Date(Date.now() + 86400000),
    priority: "medium",
    category: "performance",
    assignedTo: "perf@test.com",
  }

  describe("Load Testing", () => {
    test("should handle multiple concurrent requests", async () => {
      const concurrentRequests = 10
      const promises = []

      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(
          request(app)
            .post("/api/tasks")
            .send({
              ...mockTaskData,
              title: `Concurrent Task ${i}`,
            }),
        )
      }

      const responses = await Promise.all(promises)

      responses.forEach((response) => {
        expect(response.status).toBe(201)
        expect(response.body.success).toBe(true)
      })
    }, 10000)

    test("should handle large dataset queries efficiently", async () => {
      const largeBatch = []
      for (let i = 0; i < 100; i++) {
        largeBatch.push(
          TaskService.createTask({
            ...mockTaskData,
            title: `Bulk Task ${i}`,
            category: `category-${i % 10}`,
          }),
        )
      }

      await Promise.all(largeBatch)

      const startTime = Date.now()

      const response = await request(app).get("/api/tasks?limit=50").expect(200)

      const endTime = Date.now()
      const responseTime = endTime - startTime

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(50)
      expect(responseTime).toBeLessThan(1000) 
    }, 15000)

    test("should handle pagination efficiently", async () => {
      const startTime = Date.now()

      const response = await request(app).get("/api/tasks?page=2&limit=25").expect(200)

      const endTime = Date.now()
      const responseTime = endTime - startTime

      expect(response.body.success).toBe(true)
      expect(responseTime).toBeLessThan(500) 
    })
  })

  describe("Memory Usage", () => {
    test("should not leak memory during bulk operations", async () => {
      const initialMemory = process.memoryUsage().heapUsed

      for (let batch = 0; batch < 5; batch++) {
        const promises = []
        for (let i = 0; i < 20; i++) {
          promises.push(
            TaskService.createTask({
              ...mockTaskData,
              title: `Memory Test ${batch}-${i}`,
            }),
          )
        }
        await Promise.all(promises)
      }

      if (global.gc) {
        global.gc()
      }

      const finalMemory = process.memoryUsage().heapUsed
      const memoryIncrease = finalMemory - initialMemory

      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024)
    })
  })
})
