const mongoose = require("mongoose");

const internSchema = new mongoose.Schema({
  name: {
    type: String,
    default: "Waris Ansari",
  },
  referralCode: {
    type: String,
    default: "WARIS2025",
  },
  amountRaised: {
    type: Number,
    default: 2500,
  },
  rewards: [
    {
      title: String,
      unlocked: Boolean,
    },
  ],
});

module.exports = mongoose.model("Intern", internSchema);
