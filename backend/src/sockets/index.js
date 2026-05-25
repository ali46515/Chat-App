import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import jwt from "jsonwebtoken";
import { createRequire } from "node:module";
const requireCjs = createRequire(import.meta.url);

export default (io) => {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error("Authentication error"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    console.log(`🔌 User ${socket.userId} connected – socket ${socket.id}`);

    const chats = await Chat.find({ participants: socket.userId }).select(
      "_id",
    );
    chats.forEach((c) => socket.join(c._id.toString()));

    socket.on("typing", ({ chatId }) => {
      socket.to(chatId).emit("typing", { userId: socket.userId });
    });

    socket.on("stopTyping", ({ chatId }) => {
      socket.to(chatId).emit("stopTyping", { userId: socket.userId });
    });

    socket.on("disconnect", () => {
      console.log(`User ${socket.userId} disconnected`);
    });
  });
};
