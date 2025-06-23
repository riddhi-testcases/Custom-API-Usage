const { TaskService, Task } = require("../../lib/taskService")

describe("TaskService Unit Tests", () => {
  const mockTaskData = {
    title: "Test Task",
    description: "Test Description",
    dueDate: new Date(Date.now() + 86400000), 
    priority: "high",
    category: "testing",
    assignedTo: "test@example.com",
    estimatedHours: 5,
    tags: ["test", "unit"],
  }

  describe("validateTaskData", () => {
    test("should return no errors for valid task data", () => {
      const errors = TaskService.validateTaskData(mockTaskData)
      expect(errors).toHaveLength(0)
    })

    test("should return error for missing title", () => {
      const invalidData = { ...mockTaskData, title: "" }
      const errors = TaskService.validateTaskData(invalidData)
      expect(errors).toContain("Title is required")
    })

    test("should return error for missing description", () => {
      const invalidData = { ...mockTaskData, description: "" }
      const errors = TaskService.validateTaskData(invalidData)
      expect(errors).toContain("Description is required")
    })

    test("should return error for missing due date", () => {
      const invalidData = { ...mockTaskData, dueDate: null }
      const errors = TaskService.validateTaskData(invalidData)
      expect(errors).toContain("Due date is required")
    })

    test("should return error for past due date", () => {
      const invalidData = { ...mockTaskData, dueDate: new Date(Date.now() - 86400000) }
      const errors = TaskService.validateTaskData(invalidData)
      expect(errors).toContain("Due date cannot be in the past")
    })

    test("should return error for negative estimated hours", () => {
      const invalidData = { ...mockTaskData, estimatedHours: -5 }
      const errors = TaskService.validateTaskData(invalidData)
      expect(errors).toContain("Estimated hours cannot be negative")
    })
  })

  describe("createTask", () => {
    test("should create a task successfully", async () => {
      const task = await TaskService.createTask(mockTaskData)

      expect(task).toBeDefined()
      expect(task.title).toBe(mockTaskData.title)
      expect(task.description).toBe(mockTaskData.description)
      expect(task.status).toBe("pending") 
      expect(task.priority).toBe(mockTaskData.priority)
      expect(task.createdAt).toBeDefined()
      expect(task.updatedAt).toBeDefined()
    })

    test("should set default values correctly", async () => {
      const minimalData = {
        title: "Minimal Task",
        description: "Minimal Description",
        dueDate: new Date(Date.now() + 86400000),
      }

      const task = await TaskService.createTask(minimalData)

      expect(task.status).toBe("pending")
      expect(task.priority).toBe("medium")
      expect(task.category).toBe("general")
      expect(task.assignedTo).toBe("unassigned")
      expect(task.estimatedHours).toBe(1)
    })
  })

  describe("getTasks", () => {
    beforeEach(async () => {
      await TaskService.createTask({
        ...mockTaskData,
        title: "High Priority Task",
        priority: "high",
        status: "pending",
      })

      await TaskService.createTask({
        ...mockTaskData,
        title: "Medium Priority Task",
        priority: "medium",
        status: "in-progress",
      })

      await TaskService.createTask({
        ...mockTaskData,
        title: "Completed Task",
        priority: "low",
        status: "completed",
      })
    })

    test("should get all tasks without filters", async () => {
      const result = await TaskService.getTasks()

      expect(result.tasks).toHaveLength(3)
      expect(result.totalCount).toBe(3)
      expect(result.currentPage).toBe(1)
      expect(result.count).toBe(3)
    })

    test("should filter tasks by status", async () => {
      const result = await TaskService.getTasks({ status: "pending" })

      expect(result.tasks).toHaveLength(1)
      expect(result.tasks[0].status).toBe("pending")
    })

    test("should filter tasks by priority", async () => {
      const result = await TaskService.getTasks({ priority: "high" })

      expect(result.tasks).toHaveLength(1)
      expect(result.tasks[0].priority).toBe("high")
    })

    test("should search tasks by title", async () => {
      const result = await TaskService.getTasks({ search: "High Priority" })

      expect(result.tasks).toHaveLength(1)
      expect(result.tasks[0].title).toContain("High Priority")
    })

    test("should paginate results", async () => {
      const result = await TaskService.getTasks({ limit: 2, page: 1 })

      expect(result.tasks).toHaveLength(2)
      expect(result.totalPages).toBe(2)
      expect(result.currentPage).toBe(1)
    })

    test("should sort tasks", async () => {
      const result = await TaskService.getTasks({ sortBy: "priority", order: "asc" })

      expect(result.tasks[0].priority).toBe("high")
    })
  })

  describe("updateTask", () => {
    let taskId

    beforeEach(async () => {
      const task = await TaskService.createTask(mockTaskData)
      taskId = task._id
    })

    test("should update task successfully", async () => {
      const updateData = {
        status: "in-progress",
        priority: "urgent",
      }

      const updatedTask = await TaskService.updateTask(taskId, updateData)

      expect(updatedTask.status).toBe("in-progress")
      expect(updatedTask.priority).toBe("urgent")
      expect(updatedTask.updatedAt).toBeDefined()
    })

    test("should set completedAt when status is completed", async () => {
      const updateData = { status: "completed" }

      const updatedTask = await TaskService.updateTask(taskId, updateData)

      expect(updatedTask.status).toBe("completed")
      expect(updatedTask.completedAt).toBeDefined()
    })
  })

  describe("deleteTask", () => {
    test("should delete task successfully", async () => {
      const task = await TaskService.createTask(mockTaskData)
      const deletedTask = await TaskService.deleteTask(task._id)

      expect(deletedTask).toBeDefined()
      expect(deletedTask._id.toString()).toBe(task._id.toString())

      const foundTask = await TaskService.getTaskById(task._id)
      expect(foundTask).toBeNull()
    })

    test("should return null for non-existent task", async () => {
      const fakeId = "507f1f77bcf86cd799439011"
      const result = await TaskService.deleteTask(fakeId)

      expect(result).toBeNull()
    })
  })

  describe("getSystemStats", () => {
    beforeEach(async () => {
      await TaskService.createTask({ ...mockTaskData, status: "pending", category: "development" })
      await TaskService.createTask({ ...mockTaskData, status: "in-progress", category: "testing" })
      await TaskService.createTask({ ...mockTaskData, status: "completed", category: "development" })
      await TaskService.createTask({ ...mockTaskData, status: "cancelled", category: "design" })
    })

    test("should return correct statistics", async () => {
      const stats = await TaskService.getSystemStats()

      expect(stats.totalTasks).toBe(4)
      expect(stats.pendingTasks).toBe(1)
      expect(stats.inProgressTasks).toBe(1)
      expect(stats.completedTasks).toBe(1)
      expect(stats.cancelledTasks).toBe(1)
      expect(stats.categoryBreakdown).toHaveLength(3)
      expect(stats.priorityBreakdown).toHaveLength(1) 
    })
  })
})
