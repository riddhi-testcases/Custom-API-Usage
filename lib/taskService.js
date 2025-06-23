const mongoose = require("mongoose")

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  status: {
    type: String,
    enum: ["pending", "in-progress", "completed", "cancelled"],
    default: "pending",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"],
    default: "medium",
  },
  category: {
    type: String,
    required: true,
    trim: true,
    default: "general",
  },
  assignedTo: {
    type: String,
    trim: true,
    default: "unassigned",
  },
  dueDate: {
    type: Date,
    required: true,
  },
  estimatedHours: {
    type: Number,
    min: 0,
    default: 1,
  },
  tags: [
    {
      type: String,
      trim: true,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
})

taskSchema.pre("save", function (next) {
  this.updatedAt = new Date()
  if (this.status === "completed" && !this.completedAt) {
    this.completedAt = new Date()
  }
  next()
})

const Task = mongoose.model("Task", taskSchema)

class TaskService {
  static async createTask(taskData) {
    const task = new Task(taskData)
    return await task.save()
  }

  static async getTasks(filters = {}) {
    const {
      status,
      priority,
      category,
      assignedTo,
      sortBy = "createdAt",
      order = "desc",
      limit = 50,
      page = 1,
      search,
      dueBefore,
      dueAfter,
    } = filters

    const filter = {}
    if (status) filter.status = status
    if (priority) filter.priority = priority
    if (category) filter.category = new RegExp(category, "i")
    if (assignedTo) filter.assignedTo = new RegExp(assignedTo, "i")

    if (dueBefore || dueAfter) {
      filter.dueDate = {}
      if (dueBefore) filter.dueDate.$lte = new Date(dueBefore)
      if (dueAfter) filter.dueDate.$gte = new Date(dueAfter)
    }

    if (search) {
      filter.$or = [{ title: new RegExp(search, "i") }, { description: new RegExp(search, "i") }]
    }

    const sortOrder = order === "asc" ? 1 : -1
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    const tasks = await Task.find(filter)
      .sort({ [sortBy]: sortOrder })
      .limit(Number.parseInt(limit))
      .skip(skip)

    const totalCount = await Task.countDocuments(filter)
    const totalPages = Math.ceil(totalCount / Number.parseInt(limit))

    return {
      tasks,
      totalCount,
      currentPage: Number.parseInt(page),
      totalPages,
      count: tasks.length,
    }
  }

  static async getTaskById(id) {
    return await Task.findById(id)
  }

  static async updateTask(id, updateData) {
    const updateFields = { ...updateData, updatedAt: new Date() }

    if (updateData.status === "completed") {
      updateFields.completedAt = new Date()
    }

    return await Task.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    })
  }

  static async deleteTask(id) {
    return await Task.findByIdAndDelete(id)
  }

  static async getRecentTasks(limit = 5) {
    return await Task.find().sort({ createdAt: -1 }).limit(Number.parseInt(limit))
  }

  static async getSystemStats() {
    const totalTasks = await Task.countDocuments()
    const inProgressTasks = await Task.countDocuments({ status: "in-progress" })
    const completedTasks = await Task.countDocuments({ status: "completed" })
    const pendingTasks = await Task.countDocuments({ status: "pending" })
    const cancelledTasks = await Task.countDocuments({ status: "cancelled" })

    const categoryStats = await Task.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])

    const priorityStats = await Task.aggregate([
      { $group: { _id: "$priority", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])

    return {
      totalTasks,
      inProgressTasks,
      completedTasks,
      pendingTasks,
      cancelledTasks,
      categoryBreakdown: categoryStats,
      priorityBreakdown: priorityStats,
    }
  }

  static async getAnalytics() {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const tasksOverTime = await Task.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])

    const completedTasks = await Task.find({
      status: "completed",
      completedAt: { $exists: true },
    })

    let avgCompletionTime = 0
    if (completedTasks.length > 0) {
      const totalTime = completedTasks.reduce((sum, task) => {
        return sum + (task.completedAt - task.createdAt)
      }, 0)
      avgCompletionTime = totalTime / completedTasks.length / (1000 * 60 * 60 * 24)
    }

    const overdueTasks = await Task.countDocuments({
      dueDate: { $lt: new Date() },
      status: { $nin: ["completed", "cancelled"] },
    })

    return {
      tasksOverTime,
      avgCompletionTime: Math.round(avgCompletionTime * 100) / 100,
      overdueTasks,
      totalCompleted: completedTasks.length,
    }
  }

  static validateTaskData(taskData) {
    const errors = []

    if (!taskData.title || taskData.title.trim().length === 0) {
      errors.push("Title is required")
    }

    if (!taskData.description || taskData.description.trim().length === 0) {
      errors.push("Description is required")
    }

    if (!taskData.dueDate) {
      errors.push("Due date is required")
    } else if (new Date(taskData.dueDate) < new Date()) {
      errors.push("Due date cannot be in the past")
    }

    if (taskData.estimatedHours && taskData.estimatedHours < 0) {
      errors.push("Estimated hours cannot be negative")
    }

    return errors
  }
}

module.exports = { TaskService, Task }
