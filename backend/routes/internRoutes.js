const express = require("express");
const router = express.Router();
const Intern = require("../models/intern");
const bcrypt = require("bcryptjs");

// Signup new intern
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, referralCode } = req.body;

    // Check if user already exists
    const existingUser = await Intern.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new intern
    const newIntern = new Intern({
      name,
      email,
      password: hashedPassword,
      referredBy: referralCode || null,
    });

    // Save new intern first to generate their referral code
    await newIntern.save();

    // Handle referral if code was provided
    if (referralCode) {
      const referrer = await Intern.findOne({ referralCode });
      if (referrer) {
        // Update referrer's stats
        referrer.amountRaised += 500;
        referrer.referralsCount += 1;
        await referrer.save();
      }
    }

    // Return user data without password
    const userData = newIntern.toObject();
    delete userData.password;

    res.status(201).json(userData);
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Login intern
// Handle preflight for login
router.options("/login", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL);
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.status(204).send();
});

// Login intern
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const intern = await Intern.findOne({ email });
    if (!intern) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verify password exists
    if (!intern.password) {
      return res.status(401).json({
        message: "Password not set for this account",
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, intern.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Return user data without password
    const userData = intern.toObject();
    delete userData.password;

    // Set session data
    req.session.userId = userData._id;
    console.log("Session created:", req.session);

    res.json(userData);
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get leaderboard
router.get("/leaderboard/top", async (req, res) => {
  try {
    const leaderboard = await Intern.find()
      .sort({ amountRaised: -1 })
      .limit(10)
      .select("name amountRaised referralCode referralsCount");

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Contact form submission
router.post("/contact", async (req, res) => {
  try {
    const { name, email, message, userId } = req.body;

    // In a real app, we'd save to a Contact collection
    console.log("Contact form submission:", { name, email, message, userId });

    res.status(201).json({
      success: true,
      message: "Message received! We'll contact you soon.",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again.",
    });
  }
});

// Add this route
router.put("/:id/password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const intern = await Intern.findById(req.params.id);

    if (!intern) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, intern.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    intern.password = await bcrypt.hash(newPassword, salt);

    await intern.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get intern data
router.get("/:id", async (req, res) => {
  try {
    const intern = await Intern.findById(req.params.id).select("-password");

    if (!intern) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(intern);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
