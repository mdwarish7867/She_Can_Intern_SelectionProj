const mongoose = require("mongoose");

const internSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    referralCode: {
      type: String,
      unique: true,
    },
    referredBy: {
      type: String, // Stores the referral code used
      default: null,
    },
    amountRaised: {
      type: Number,
      default: 0,
    },
    goal: {
      type: Number,
      default: 5000,
    },
    referralsCount: {
      type: Number,
      default: 0,
    },
    rewards: [
      {
        title: String,
        description: String,
        threshold: Number,
        unlocked: Boolean,
      },
    ],
  },
  { timestamps: true }
);

// Generate unique referral code before saving
internSchema.pre("save", async function (next) {
  if (!this.referralCode) {
    let isUnique = false;
    let newReferralCode;

    while (!isUnique) {
      // Generate a random 6-character code
      newReferralCode = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

      // Check if code is unique
      const existing = await mongoose
        .model("Intern")
        .findOne({ referralCode: newReferralCode });
      if (!existing) isUnique = true;
    }

    this.referralCode = newReferralCode;
  }

  // Unlock badges based on amount raised
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

  next();
});

module.exports = mongoose.model("Intern", internSchema);
