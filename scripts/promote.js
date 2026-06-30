const mongoose = require("mongoose");
const config = require("../config");
const databaseConfig = require("../config/database");
const User = require("../src/models/User");

const email = process.argv[2];

if (!email) {
  console.error("Usage: node scripts/promote.js <email>");
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(databaseConfig.uri, databaseConfig.options);
    console.log("Connected to MongoDB");

    const user = await User.findOne({ email });
    if (!user) {
      console.error(`User not found: ${email}`);
      process.exit(1);
    }

    user.role = "admin";
    await user.save();

    console.log(`Promoted ${user.name} (${user.email}) to admin`);
    process.exit(0);
  } catch (err) {
    console.error("Failed:", err.message);
    process.exit(1);
  }
})();
