import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { globalErrorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./modules/Auth/auth.routes.js";
import chatRoutes from "./modules/Chat/chat.route.js";
import uploadRoutes from "./modules/Files/files.route.js";

const app = express();

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      else return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/files", uploadRoutes);

app.use(globalErrorHandler);

export default app;
