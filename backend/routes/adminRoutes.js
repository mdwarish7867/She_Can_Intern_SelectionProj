const express = require("express");
const router = express.Router();
const Admin = require("../models/admin");
const Intern = require("../models/intern");
const Contact = require("../models/contact");
const bcrypt = require("bcryptjs");
const authMiddleware = require("../middleware/authMiddleware");

// Admin login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find admin by username
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credential 1" });
    }

    // Compare passwords
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials  2" });
    }

    // Return success response
    res.json({
      success: true,
      message: "Admin login successful",
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// Delete user
router.delete("/users/:id", authMiddleware, async (req, res) => {
  try {
    const user = await Intern.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update user amount
router.put("/users/:id/amount", authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;

    const user = await Intern.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.amountRaised = amount;
    await user.save();

    res.json({
      success: true,
      message: "Amount updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        amountRaised: user.amountRaised,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all contact messages
router.get("/contacts", authMiddleware, async (req, res) => {
  try {
    const contacts = await Contact.find().populate("userId", "name email");
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete contact message
router.delete("/contacts/:id", authMiddleware, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.json({ success: true, message: "Message deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
