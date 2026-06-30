const mongoose = require("mongoose");
const databaseConfig = require("../config/database");
const Settings = require("../src/models/Settings");

const defaults = [
  { key: "ALLOW_REGISTRATION", value: "true", description: "Allow new users to register" },
  { key: "MAX_FILE_SIZE_MB", value: "50", description: "Maximum upload file size in MB" },
  { key: "MAX_CONVERSATIONS_PER_USER", value: "100", description: "Max conversations per user" },
  { key: "DEFAULT_LLM_PROVIDER", value: "ollama", description: "Default LLM provider" },
  { key: "RATE_LIMIT_WINDOW_MS", value: "60000", description: "Rate limit window in milliseconds" },
  { key: "RATE_LIMIT_MAX", value: "30", description: "Max requests per rate limit window" },
];

(async () => {
  try {
    await mongoose.connect(databaseConfig.uri, databaseConfig.options);
    console.log("Connected to MongoDB");

    for (const s of defaults) {
      await Settings.updateOne(
        { key: s.key },
        { $setOnInsert: s },
        { upsert: true }
      );
    }

    console.log(`Seeded ${defaults.length} default settings`);
    process.exit(0);
  } catch (err) {
    console.error("Failed:", err.message);
    process.exit(1);
  }
})();
