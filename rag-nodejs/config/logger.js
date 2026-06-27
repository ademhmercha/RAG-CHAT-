// Winston logger configuration.
// Sets log level, output format, and transports (console + rotating file).

const path = require("path");
const config = require("./index");

const loggerConfig = {
  level: config.logging.level,
  dir: path.resolve(config.logging.dir),
  format: "combined",
};

module.exports = loggerConfig;
