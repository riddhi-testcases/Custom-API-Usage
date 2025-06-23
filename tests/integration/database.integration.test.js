const mongoose = require("mongoose")
const { TaskService, Task } = require("../../lib/taskService")

describe("Database Integration Tests", () => {
  const mockTaskData = {
    title: "Integration Test Task",
    description: "Testing database integration",
    dueDate: new Date(Date.now() + 86400000),
    priority: "medium",
    category: "integration",
    assignedTo: "integration@test.com",
    estimatedHours: 3,
    tags: ["integration", "database"],
  }

  describe("Database Connection", () => {
    test("should be connected to test database", () => {
      expect(mongoose.connection.readyState).toBe(1) 
    })

    test("should use test database", () => {
      expect(mongoose.connection.name).toMatch(/test/)
    })
  })

  describe("CRUD Operations Integration", () => {
    test("should perform complete CRUD cycle", async () => {
      const createdTask = await TaskService.createTask(mockTaskData)
      expect(createdTask._id).toBeDefined()
      expect(createdTask.title).toBe(mockTaskData.title)

      const foundTask = await TaskService.getTaskById(createdTask._id)
      expect(foundTask).toBeDefined()
      expect(foundTask.title).toBe(mockTaskData.title)

      const updateData = { status: "in-progress", priority: "high" }
      const updatedTask = await TaskService.updateTask(createdTask._id, updateData)
      expect(updatedTask.status).toBe("in-progress")
      expect(updatedTask.priority).toBe("high")

      const deletedTask = await TaskService.deleteTask(createdTask._id)
      expect(deletedTask).toBeDefined()

      const notFoundTask = await TaskService.getTaskById(createdTask._id)
      expect(notFoundTask).toBeNull()
    })

    test("should handle concurrent operations", async () => {
      const tasks = []
      const promises = []

      for (let i = 0; i < 5; i++) {
        promises.push(
          TaskService.createTask({
            ...mockTaskData,
            title: `Concurrent Task ${i}`,
            category: `category-${i}`,
          }),
        )
      }

      const createdTasks = await Promise.all(promises)
      expect(createdTasks).toHaveLength(5)

      const updatePromises = createdTasks.map((task) => TaskService.updateTask(task._id, { status: "completed" }))

      const updatedTasks = await Promise.all(updatePromises)
      expect(updatedTasks.every((task) => task.status === "completed")).toBe(true)
    })
  })

  describe("Data Persistence", () => {
    test("should persist data across operations", async () => {
      const task = await TaskService.createTask(mockTaskData)
      const originalId = task._id

      await TaskService.updateTask(originalId, { status: "in-progress" })
      await TaskService.updateTask(originalId, { priority: "urgent" })
      await TaskService.updateTask(originalId, { status: "completed" })

      const finalTask = await TaskService.getTaskById(originalId)
      expect(finalTask.status).toBe("completed")
      expect(finalTask.priority).toBe("urgent")
      expect(finalTask.completedAt).toBeDefined()
    })

    test("should maintain referential integrity", async () => {
      const parentTask = await TaskService.createTask({
        ...mockTaskData,
        title: "Parent Task",
        category: "parent",
      })

      const childTasks = await Promise.all([
        TaskService.createTask({
          ...mockTaskData,
          title: "Child Task 1",
          category: "parent",
          tags: ["child", parentTask._id.toString()],
        }),
        TaskService.createTask({
          ...mockTaskData,
          title: "Child Task 2",
          category: "parent",
          tags: ["child", parentTask._id.toString()],
        }),
      ])

      const relatedTasks = await TaskService.getTasks({
        category: "parent",
      })

      expect(relatedTasks.tasks).toHaveLength(3)

      const childTasksFound = relatedTasks.tasks.filter((task) => task.tags.includes(parentTask._id.toString()))
      expect(childTasksFound).toHaveLength(2)
    })
  })

  describe("Database Constraints and Validation", () => {
    test("should enforce required fields", async () => {
      const invalidTask = {
        description: "Missing title",
        dueDate: new Date(Date.now() + 86400000),
      }

      await expect(TaskService.createTask(invalidTask)).rejects.toThrow(/title.*required/i)
    })

    test("should enforce enum constraints", async () => {
      const invalidTask = {
        ...mockTaskData,
        status: "invalid-status",
      }

      await expect(TaskService.createTask(invalidTask)).rejects.toThrow(/enum/i)
    })

    test("should enforce field length limits", async () => {
      const longTitle = "a".repeat(201) 
      const invalidTask = {
        ...mockTaskData,
        title: longTitle,
      }

      await expect(TaskService.createTask(invalidTask)).rejects.toThrow()
    })
  })

  describe("Aggregation Operations", () => {
    beforeEach(async () => {
      const testTasks = [
        { ...mockTaskData, category: "development", priority: "high", status: "completed" },
        { ...mockTaskData, category: "development", priority: "medium", status: "in-progress" },
        { ...mockTaskData, category: "testing", priority: "high", status: "pending" },
        { ...mockTaskData, category: "design", priority: "low", status: "completed" },
      ]

      await Promise.all(testTasks.map((task) => TaskService.createTask(task)))
    })

    test("should aggregate category statistics", async () => {
      const stats = await TaskService.getSystemStats()

      expect(stats.categoryBreakdown).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ _id: "development", count: 2 }),
          expect.objectContaining({ _id: "testing", count: 1 }),
          expect.objectContaining({ _id: "design", count: 1 }),
        ]),
      )
    })

    test("should aggregate priority statistics", async () => {
      const stats = await TaskService.getSystemStats()

      expect(stats.priorityBreakdown).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ _id: "high", count: 2 }),
          expect.objectContaining({ _id: "medium", count: 1 }),
          expect.objectContaining({ _id: "low", count: 1 }),
        ]),
      )
    })

    test("should calculate analytics correctly", async () => {
      const analytics = await TaskService.getAnalytics()

      expect(analytics).toHaveProperty("tasksOverTime")
      expect(analytics).toHaveProperty("avgCompletionTime")
      expect(analytics).toHaveProperty("overdueTasks")
      expect(analytics).toHaveProperty("totalCompleted")
      expect(analytics.totalCompleted).toBe(2)
    })
  })

  describe("Transaction-like Operations", () => {
    test("should handle bulk operations correctly", async () => {
      const bulkTasks = Array.from({ length: 10 }, (_, i) => ({
        ...mockTaskData,
        title: `Bulk Task ${i}`,
        category: `bulk-${i % 3}`, 
      }))

      const createdTasks = await Promise.all(bulkTasks.map((task) => TaskService.createTask(task)))

      expect(createdTasks).toHaveLength(10)

      const updatePromises = createdTasks.map((task) => TaskService.updateTask(task._id, { status: "completed" }))

      await Promise.all(updatePromises)

      const stats = await TaskService.getSystemStats()
      expect(stats.completedTasks).toBe(10)
      expect(stats.totalTasks).toBe(10)
    })
  })
})
