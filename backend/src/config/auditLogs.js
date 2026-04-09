import winston from "winston";
import path from "path";
import fs from "fs";

const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) =>
      `${info.timestamp} ${info.level}: ${info.message}${
        info.stack ? "\n" + info.stack : ""
      }`,
  ),
);

const transports = [
  ...(process.env.NODE_ENV !== "production"
    ? [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize({ all: true }),
            winston.format.printf(
              (info) =>
                `${info.timestamp} ${info.level}: ${info.message}${
                  info.stack ? "\n" + info.stack : ""
                }`,
            ),
          ),
        }),
      ]
    : []),

  new winston.transports.File({
    filename: path.join(logsDir, "error.log"),
    level: "error",
    format: winston.format.uncolorize(),
    maxsize: 5242880,
    maxFiles: 5,
  }),

  new winston.transports.File({
    filename: path.join(logsDir, "combined.log"),
    format: winston.format.uncolorize(),
    maxsize: 5242880,
    maxFiles: 10,
  }),

  new winston.transports.File({
    filename: path.join(logsDir, "http.log"),
    level: "http",
    format: winston.format.uncolorize(),
    maxsize: 5242880,
    maxFiles: 5,
  }),

  ...(process.env.NODE_ENV !== "production"
    ? [
        new winston.transports.File({
          filename: path.join(logsDir, "debug.log"),
          level: "debug",
          format: winston.format.uncolorize(),
          maxsize: 5242880,
          maxFiles: 3,
        }),
      ]
    : []),
];

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "debug",
  levels,
  format,
  transports,
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, "exceptions.log"),
      format: winston.format.uncolorize(),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, "rejections.log"),
      format: winston.format.uncolorize(),
    }),
  ],
});

const httpLogger = (req, res, next) => {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const message = `${req.method} ${req.originalUrl} - Status: ${res.statusCode} - Duration: ${duration}ms`;

    if (res.statusCode >= 500) {
      logger.error(message);
    } else if (res.statusCode >= 400) {
      logger.warn(message);
    } else {
      logger.http(message);
    }
  });

  next();
};

const errorLogger = (error, req, res, next) => {
  const timestamp = new Date().toISOString();
  const message = `
[${timestamp}]
Method: ${req.method}
URL: ${req.originalUrl}
Status: ${error.statusCode || 500}
Message: ${error.message}
Stack: ${error.stack}
Body: ${JSON.stringify(req.body)}
  `.trim();

  logger.error(message);
};

export { logger, httpLogger, errorLogger };
