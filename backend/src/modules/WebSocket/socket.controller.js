import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../User/User.model.js";

let io;

const onlineUsers = new Map();

const authenticateSocket = async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace("Bearer ", "");

    if (!token) return next(new Error("AUTH_MISSING_TOKEN"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select(
      "userName profilePicture status isActive isDeleted",
    );

    if (!user) return next(new Error("AUTH_USER_NOT_FOUND"));
    if (!user.isActive || user.isDeleted)
      return next(new Error("AUTH_ACCOUNT_INACTIVE"));

    socket.user = user;
    next();
  } catch (err) {
    next(new Error("AUTH_INVALID_TOKEN"));
  }
};

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.use(authenticateSocket);

  io.on("connection", async (socket) => {
    const userId = socket.user._id.toString();

    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId).add(socket.id);

    if (onlineUsers.get(userId).size === 1) {
      await User.findByIdAndUpdate(userId, { status: "online" });

      socket.broadcast.emit("user:online", { userId });
    }

    console.log(`[Socket] Connected — user=${userId}  socket=${socket.id}`);

    socket.on("disconnect", async (reason) => {
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);
          await User.findByIdAndUpdate(userId, {
            status: "offline",
            lastSeen: new Date(),
          });
          io.emit("user:offline", { userId, lastSeen: new Date() });
        }
      }

      console.log(`[Socket] Disconnected — user=${userId}  reason=${reason}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
};

const emitToUser = (userId, event, data) => {
  const sockets = onlineUsers.get(userId.toString());
  if (sockets) {
    sockets.forEach((socketId) => io.to(socketId).emit(event, data));
  }
};

const isUserOnline = (userId) => onlineUsers.has(userId.toString());

export { initSocket, getIO, emitToUser, isUserOnline };
