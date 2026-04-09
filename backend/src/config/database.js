import mongoose from "mongoose";
import { config } from "dotenv";
import { expand } from "dotenv-expand";
import { logger } from "./auditLogs.js";

expand(config());

export default async function connectMongo() {
  try {
    await mongoose
      .connect(process.env.MONGO_URI)
      .then(() => {
        logger.info("MongoDB connected successfully");
        console.log("MongoDB connected succesfully!");
      })
      .catch((err) => {
        console.error("Error connecting to MongoDB:", err.message);
      });
  } catch (error) {
    logger.error("MongoDB connection failed", error);
    console.error("✗ MongoDB connection failed:", error.message);
    throw error;
  }
}
