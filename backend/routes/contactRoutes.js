const express = require("express");
const router = express.Router();
const Contact = require("../models/contact");

// Save contact form submission
router.post("/", async (req, res) => {
  try {
    const { name, email, message, userId } = req.body;

    const newContact = new Contact({
      name,
      email,
      message,
      userId,
    });

    await newContact.save();

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

module.exports = router;
