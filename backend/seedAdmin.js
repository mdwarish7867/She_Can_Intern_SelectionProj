const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/admin");

// Load environment variables from .env file in backend directory
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const seedAdmin = async () => {
  try {
    console.log("Starting admin seed process...");

    // Verify environment variables
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
      throw new Error(
        "Admin credentials are not defined in environment variables"
      );
    }

    console.log(`Connecting to MongoDB: ${process.env.MONGO_URI}`);

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to MongoDB");

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    console.log(`Checking for admin: ${adminUsername}`);
    const adminExists = await Admin.findOne({ username: adminUsername });

    if (!adminExists) {
      console.log("Admin not found, creating new account");
      const admin = new Admin({
        // Let Mongoose pre-save hook hash this
        username: adminUsername,
        password: adminPassword, // PLAINTEXT - hook will hash it
      });
      await admin.save();
    } else {
      console.log("ℹ️ Admin account already exists");

      // Verify password
      const isMatch = await bcrypt.compare(adminPassword, adminExists.password);
      console.log(
        `Password verification: ${isMatch ? "✅ Match" : "❌ Mismatch"}`
      );

      if (!isMatch) {
        console.log("Updating password to match .env");
        const salt = await bcrypt.genSalt(10);
        adminExists.password = await bcrypt.hash(adminPassword, salt);
        await adminExists.save();
        console.log("🔑 Admin password updated");
      }
    }
  } catch (err) {
    console.error("❌ Error seeding admin:", err.message);
    console.error("Full error:", err);
  } finally {
    mongoose.connection.close();
    process.exit();
  }
};

seedAdmin();
