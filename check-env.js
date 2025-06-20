// Quick script to check if environment variables are loaded
require("dotenv").config()

console.log("🔍 Environment Variables Check:")
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "✅ Set" : "❌ Not Set")
console.log("PORT:", process.env.PORT || "5000 (default)")
console.log("NODE_ENV:", process.env.NODE_ENV || "development (default)")

if (process.env.MONGODB_URI) {
  console.log("✅ Environment variables loaded successfully!")
} else {
  console.log("❌ Environment variables not loaded. Check .env file.")
}
