const winston = require("winston");
const path = require("path");
const fs = require("fs");

// On Vercel the filesystem is read-only — skip file transports
const isVercel = !!process.env.VERCEL;

const fileTransports = [];
if (!isVercel) {
  const logsDir = path.join(__dirname, "../../logs");
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  fileTransports.push(
    new winston.transports.File({ filename: path.join(logsDir, "app.log") }),
    new winston.transports.File({ filename: path.join(logsDir, "error.log"), level: "error" })
  );
}

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const metaStr = Object.keys(meta).length
        ? "\n" + JSON.stringify(meta, null, 2)
        : "";
      return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
    })
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length
            ? "\n" + JSON.stringify(meta, null, 2)
            : "";
          return `[${timestamp}] ${level}: ${message}${metaStr}`;
        })
      ),
    }),
    ...fileTransports,
  ],
});

module.exports = logger;
