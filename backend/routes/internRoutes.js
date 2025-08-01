const express = require("express");
const router = express.Router();
const Intern = require("../models/intern");
const Contact = require("../models/contact");

// Get intern data
router.get("/", async (req, res) => {
  try {
    let intern = await Intern.findOne();

    if (!intern) {
      intern = new Intern();
      intern.unlockBadges();
      await intern.save();
    }

    res.json(intern);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Simulate referral
router.post("/referral", async (req, res) => {
  try {
    let intern = await Intern.findOne();

    if (!intern) {
      intern = new Intern();
    }

    // Increase amount raised
    intern.amountRaised += 500;

    // Unlock badges based on new amount
    intern.unlockBadges();

    await intern.save();
    res.json(intern);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get leaderboard
router.get("/leaderboard", async (req, res) => {
  try {
    const leaderboard = await Intern.find()
      .sort({ amountRaised: -1 })
      .limit(10)
      .select("name amountRaised referralCode");

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Contact form submission
router.post("/contact", async (req, res) => {
  try {
    const { name, email, message, userId } = req.body;

    const newContact = new Contact({
      name,
      email,
      message,
      userId,
    });

    await newContact.save();
    res.status(201).json({ message: "Contact form submitted successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
