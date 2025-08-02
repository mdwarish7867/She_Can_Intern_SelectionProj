require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path"); // Make sure to require path
const cors = require("cors");

// Routes
const internRoutes = require("./routes/internRoutes");
const contactRoutes = require("./routes/contactRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit on connection failure
  });

// API Routes
app.use("/api/interns", internRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin", adminRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  // Set static folder
  const frontendPath = path.join(__dirname, "../frontend/build");
  app.use(express.static(frontendPath));

  // Handle React routing - return all requests to React app
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
