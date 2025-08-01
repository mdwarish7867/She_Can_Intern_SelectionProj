const mongoose = require("mongoose");

const internSchema = new mongoose.Schema({
  name: {
    type: String,
    default: "Waris Ansari",
  },
  email: {
    type: String,
    default: "warishansari018@gmail.com",
  },
  referralCode: {
    type: String,
    default: "WARIS2025",
  },
  amountRaised: {
    type: Number,
    default: 2500,
  },
  goal: {
    type: Number,
    default: 5000,
  },
  rewards: [
    {
      title: String,
      description: String,
      threshold: Number,
      unlocked: Boolean,
    },
  ],
});

// Add badge unlocking logic
internSchema.methods.unlockBadges = function () {
  this.rewards = [
    {
      title: "Bronze Badge",
      description: "First fundraising milestone",
      threshold: 1000,
      unlocked: this.amountRaised >= 1000,
    },
    {
      title: "Silver Badge",
      description: "Intermediate achievement",
      threshold: 3000,
      unlocked: this.amountRaised >= 3000,
    },
    {
      title: "Gold Badge",
      description: "Top fundraiser status",
      threshold: 5000,
      unlocked: this.amountRaised >= 5000,
    },
  ];
};

module.exports = mongoose.model("Intern", internSchema);
