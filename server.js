const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

let serverStatus = "offline"
let dbStatus = "disconnected"
let requestCount = 0

// MongoDB Connection
const connectDB = async () => {
  try {
    console.log("[INFO] Connecting to MongoDB Atlas...")
    const mongoURI = process.env.MONGODB_URI

    if (!mongoURI) {
      throw new Error("MONGODB_URI environment variable is not set")
    }

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    console.log("[SUCCESS] MongoDB connected successfully")
    console.log("[INFO] Database:", mongoose.connection.name || "taskmanager")
    dbStatus = "connected"
    serverStatus = "online"
  } catch (error) {
    console.error("[ERROR] MongoDB connection failed:", error.message)
    dbStatus = "disconnected"
    serverStatus = "offline"
  }
}

// Task Schema with Mongoose
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

// Pre-save middleware for automatic timestamps
taskSchema.pre("save", function (next) {
  this.updatedAt = new Date()
  if (this.status === "completed" && !this.completedAt) {
    this.completedAt = new Date()
  }
  next()
})

const Task = mongoose.model("Task", taskSchema)

// Request logging middleware
app.use((req, res, next) => {
  requestCount++
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ${req.method} ${req.path} - Request #${requestCount}`)
  next()
})

// CUSTOM API ENDPOINT 1: Health Check
app.get("/api/health", (req, res) => {
  console.log("[INFO] Health check endpoint accessed")
  res.status(200).json({
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

// CUSTOM API ENDPOINT 2: System Status with Database Stats
app.get("/api/status", async (req, res) => {
  try {
    console.log("[INFO] Fetching system status and database statistics")

    const totalTasks = await Task.countDocuments()
    const inProgressTasks = await Task.countDocuments({ status: "in-progress" })
    const completedTasks = await Task.countDocuments({ status: "completed" })
    const pendingTasks = await Task.countDocuments({ status: "pending" })
    const cancelledTasks = await Task.countDocuments({ status: "cancelled" })

    // MongoDB aggregation for category breakdown
    const categoryStats = await Task.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])

    // MongoDB aggregation for priority breakdown
    const priorityStats = await Task.aggregate([
      { $group: { _id: "$priority", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])

    console.log(`[SUCCESS] System status retrieved - ${totalTasks} total tasks`)

    res.status(200).json({
      success: true,
      data: {
        server: serverStatus,
        database: dbStatus,
        timestamp: new Date().toISOString(),
        requestCount: requestCount,
        stats: {
          totalTasks,
          inProgressTasks,
          completedTasks,
          pendingTasks,
          cancelledTasks,
          categoryBreakdown: categoryStats,
          priorityBreakdown: priorityStats,
        },
      },
    })
  } catch (error) {
    console.error("[ERROR] Failed to get system status:", error.message)
    res.status(500).json({
      success: false,
      message: "Failed to get system status",
      error: error.message,
    })
  }
})

// CUSTOM API ENDPOINT 3: Get All Tasks with Advanced Filtering
app.get("/api/tasks", async (req, res) => {
  try {
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
    } = req.query

    console.log(`[INFO] Fetching tasks with filters: status=${status}, priority=${priority}, search=${search}`)

    // Build MongoDB filter object
    const filter = {}
    if (status) filter.status = status
    if (priority) filter.priority = priority
    if (category) filter.category = new RegExp(category, "i")
    if (assignedTo) filter.assignedTo = new RegExp(assignedTo, "i")

    // Date range filtering
    if (dueBefore || dueAfter) {
      filter.dueDate = {}
      if (dueBefore) filter.dueDate.$lte = new Date(dueBefore)
      if (dueAfter) filter.dueDate.$gte = new Date(dueAfter)
    }

    // Text search in title and description
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

    console.log(`[SUCCESS] Retrieved ${tasks.length} tasks from MongoDB`)

    res.status(200).json({
      success: true,
      count: tasks.length,
      totalCount,
      currentPage: Number.parseInt(page),
      totalPages,
      data: tasks,
    })
  } catch (error) {
    console.error("[ERROR] Failed to retrieve tasks:", error.message)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve tasks",
      error: error.message,
    })
  }
})

// CUSTOM API ENDPOINT 4: Create New Task
app.post("/api/tasks", async (req, res) => {
  try {
    const { title, description, status, priority, category, assignedTo, dueDate, estimatedHours, tags } = req.body

    console.log(`[INFO] Creating new task: ${title}`)

    // Validation
    if (!title || !description || !dueDate) {
      console.log("[ERROR] Missing required fields for task creation")
      return res.status(400).json({
        success: false,
        message: "Title, description, and due date are required",
      })
    }

    // Validate due date is not in the past
    if (new Date(dueDate) < new Date()) {
      console.log("[ERROR] Due date cannot be in the past")
      return res.status(400).json({
        success: false,
        message: "Due date cannot be in the past",
      })
    }

    const newTask = new Task({
      title,
      description,
      status: status || "pending",
      priority: priority || "medium",
      category: category || "general",
      assignedTo: assignedTo || "unassigned",
      dueDate: new Date(dueDate),
      estimatedHours: estimatedHours || 1,
      tags: tags || [],
    })

    const savedTask = await newTask.save()
    console.log(`[SUCCESS] Task created with ID: ${savedTask._id}`)

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: savedTask,
    })
  } catch (error) {
    console.error("[ERROR] Failed to create task:", error.message)
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: error.message,
      })
    }

    res.status(500).json({
      success: false,
      message: "Failed to create task",
      error: error.message,
    })
  }
})

// CUSTOM API ENDPOINT 5: Update Existing Task
app.put("/api/tasks/:id", async (req, res) => {
  try {
    const { title, description, status, priority, category, assignedTo, dueDate, estimatedHours, tags } = req.body

    console.log(`[INFO] Updating task: ${req.params.id}`)

    // Check if task exists
    const existingTask = await Task.findById(req.params.id)
    if (!existingTask) {
      console.log("[ERROR] Task not found for update")
      return res.status(404).json({
        success: false,
        message: "Task not found",
      })
    }

    const updateData = {
      updatedAt: new Date(),
    }

    // Only update provided fields
    if (title) updateData.title = title
    if (description) updateData.description = description
    if (status) {
      updateData.status = status
      if (status === "completed" && !existingTask.completedAt) {
        updateData.completedAt = new Date()
      }
    }
    if (priority) updateData.priority = priority
    if (category) updateData.category = category
    if (assignedTo) updateData.assignedTo = assignedTo
    if (dueDate) {
      if (new Date(dueDate) < new Date() && status !== "completed") {
        console.log("[ERROR] Due date cannot be in the past for non-completed tasks")
        return res.status(400).json({
          success: false,
          message: "Due date cannot be in the past for non-completed tasks",
        })
      }
      updateData.dueDate = new Date(dueDate)
    }
    if (estimatedHours !== undefined) updateData.estimatedHours = estimatedHours
    if (tags) updateData.tags = tags

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })

    console.log(`[SUCCESS] Task updated: ${updatedTask._id}`)

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: updatedTask,
    })
  } catch (error) {
    console.error("[ERROR] Failed to update task:", error.message)
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: error.message,
      })
    }

    res.status(500).json({
      success: false,
      message: "Failed to update task",
      error: error.message,
    })
  }
})

// CUSTOM API ENDPOINT 6: Delete Task
app.delete("/api/tasks/:id", async (req, res) => {
  try {
    console.log(`[INFO] Deleting task: ${req.params.id}`)

    const deletedTask = await Task.findByIdAndDelete(req.params.id)

    if (!deletedTask) {
      console.log("[ERROR] Task not found for deletion")
      return res.status(404).json({
        success: false,
        message: "Task not found",
      })
    }

    console.log(`[SUCCESS] Task deleted: ${deletedTask._id}`)

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      data: deletedTask,
    })
  } catch (error) {
    console.error("[ERROR] Failed to delete task:", error.message)
    res.status(500).json({
      success: false,
      message: "Failed to delete task",
      error: error.message,
    })
  }
})

// CUSTOM API ENDPOINT 7: Get Recent Tasks for Dashboard
app.get("/api/tasks/recent", async (req, res) => {
  try {
    const limit = req.query.limit || 5
    console.log(`[INFO] Fetching ${limit} recent tasks`)

    const recentTasks = await Task.find().sort({ createdAt: -1 }).limit(Number.parseInt(limit))

    console.log(`[SUCCESS] Retrieved ${recentTasks.length} recent tasks`)

    res.status(200).json({
      success: true,
      data: recentTasks,
    })
  } catch (error) {
    console.error("[ERROR] Failed to retrieve recent tasks:", error.message)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve recent tasks",
      error: error.message,
    })
  }
})

// CUSTOM API ENDPOINT 8: Get Single Task by ID
app.get("/api/tasks/:id", async (req, res) => {
  try {
    console.log(`[INFO] Fetching task: ${req.params.id}`)

    const task = await Task.findById(req.params.id)

    if (!task) {
      console.log("[ERROR] Task not found")
      return res.status(404).json({
        success: false,
        message: "Task not found",
      })
    }

    console.log(`[SUCCESS] Task retrieved: ${task._id}`)

    res.status(200).json({
      success: true,
      data: task,
    })
  } catch (error) {
    console.error("[ERROR] Failed to retrieve task:", error.message)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve task",
      error: error.message,
    })
  }
})

// CUSTOM API ENDPOINT 9: Analytics and Insights
app.get("/api/analytics", async (req, res) => {
  try {
    console.log("[INFO] Generating analytics data")

    // Tasks created over time (last 30 days)
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

    // Average completion time calculation
    const completedTasks = await Task.find({
      status: "completed",
      completedAt: { $exists: true },
    })

    let avgCompletionTime = 0
    if (completedTasks.length > 0) {
      const totalTime = completedTasks.reduce((sum, task) => {
        return sum + (task.completedAt - task.createdAt)
      }, 0)
      avgCompletionTime = totalTime / completedTasks.length / (1000 * 60 * 60 * 24) // Convert to days
    }

    // Overdue tasks count
    const overdueTasks = await Task.countDocuments({
      dueDate: { $lt: new Date() },
      status: { $nin: ["completed", "cancelled"] },
    })

    console.log("[SUCCESS] Analytics data generated")

    res.status(200).json({
      success: true,
      data: {
        tasksOverTime,
        avgCompletionTime: Math.round(avgCompletionTime * 100) / 100,
        overdueTasks,
        totalCompleted: completedTasks.length,
      },
    })
  } catch (error) {
    console.error("[ERROR] Failed to retrieve analytics:", error.message)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve analytics",
      error: error.message,
    })
  }
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("[ERROR] Unhandled error:", err.stack)
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  })
})

// 404 handler for undefined routes
app.use("*", (req, res) => {
  console.log(`[WARNING] 404 - Route not found: ${req.method} ${req.originalUrl}`)
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  })
})

// Start the Express server
const startServer = async () => {
  console.log("[INFO] Starting Custom API Task Usage Server...")
  console.log("[INFO] Node.js version:", process.version)
  console.log("[INFO] Environment:", process.env.NODE_ENV || "development")

  await connectDB()

  app.listen(PORT, () => {
    console.log(`[SUCCESS] Server running on port ${PORT}`)
    console.log(`[INFO] API endpoints available at http://localhost:${PORT}/api`)
    console.log(`[INFO] Database: MongoDB Atlas`)
    console.log(`[INFO] Dashboard: http://localhost:3000`)
    console.log(`[INFO] Custom API endpoints: 9 total`)
    console.log("[INFO] Server ready to accept requests!")
  })
}

// Handle process termination gracefully
process.on("SIGINT", async () => {
  console.log("\n[INFO] Shutting down server gracefully...")
  await mongoose.connection.close()
  console.log("[INFO] MongoDB connection closed.")
  process.exit(0)
})

startServer().catch((error) => {
  console.error("[FATAL] Failed to start server:", error)
  process.exit(1)
})
