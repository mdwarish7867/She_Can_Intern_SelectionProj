const express = require("express");
const router = express.Router();
const Intern = require("../models/intern");

// Get intern data
router.get("/", async (req, res) => {
  try {
    // For demo, we'll use first intern or create one
    let intern = await Intern.findOne();

    if (!intern) {
      // Create default intern
      intern = new Intern({
        rewards: [
          { title: "Bronze Badge", unlocked: true },
          { title: "Silver Badge", unlocked: false },
          { title: "Gold Badge", unlocked: false },
        ],
      });
      await intern.save();
    }

    res.json(intern);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
