const Admin = require("../models/admin");

const authMiddleware = async (req, res, next) => {
  try {
    // Get credentials from headers
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Basic ")) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Extract and decode credentials
    const base64Credentials = authHeader.split(" ")[1];
    const credentials = Buffer.from(base64Credentials, "base64").toString(
      "utf-8"
    );
    const [username, password] = credentials.split(":");

    // Verify credentials
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    req.user = admin;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = authMiddleware;
