import * as chatService from "../Chat/chat.service.js";
import { emitToUser, isUserOnline } from "./socket.js";

export const registerSocketHandlers = (io, socket, onlineUsers) => {
  const userId = socket.user._id.toString();

  socket.on("conversation:join", async ({ conversationId }) => {
    if (!conversationId) return;

    socket.join(conversationId);

    try {
      const result = await chatService.getMessages(conversationId, 1, 30);

      await chatService.markAsRead(conversationId, userId);

      socket.emit("conversation:history", {
        conversationId,
        ...result,
      });
    } catch (err) {
      socket.emit("error", {
        event: "conversation:join",
        message: err.message,
      });
    }
  });

  socket.on("conversation:leave", ({ conversationId }) => {
    socket.leave(conversationId);
  });

  socket.on("message:send", async ({ receiverId, message }) => {
    if (!receiverId || !message?.trim()) {
      return socket.emit("error", {
        event: "message:send",
        message: "receiverId and message are required",
      });
    }

    try {
      const saved = await chatService.sendMessage({
        senderId: userId,
        receiverId,
        message,
      });

      const payload = { message: saved };

      emitToUser(userId, "message:new", payload);
      emitToUser(receiverId, "message:new", payload);

      if (isUserOnline(receiverId)) {
        await chatService.markDelivered(saved._id);
        const updatedPayload = {
          ...payload,
          message: { ...saved.toObject(), status: "delivered" },
        };
        emitToUser(userId, "message:delivered", { messageId: saved._id });
        emitToUser(receiverId, "message:new", updatedPayload);
      }
    } catch (err) {
      socket.emit("error", { event: "message:send", message: err.message });
    }
  });

  socket.on("message:send_photo", async ({ receiverId, attachment }) => {
    if (!receiverId || !attachment?.url) {
      return socket.emit("error", {
        event: "message:send_photo",
        message: "receiverId and attachment.url are required",
      });
    }

    try {
      const convo = await chatService.getOrCreateConversation(
        userId,
        receiverId,
      );

      const Chat = (await import("../Chat/chat.model.js")).default;
      const Conversation = (
        await import("../Conversation/conversation.model.js")
      ).default;

      const saved = await Chat.create({
        conversationId: convo._id,
        sender: userId,
        receiver: receiverId,
        messageType: "photo",
        attachment,
        status: "sent",
      });

      await Conversation.findByIdAndUpdate(convo._id, {
        lastMessage: saved._id,
        lastMessageText: "📷 Photo",
        lastMessageAt: saved.createdAt,
        $inc: { [`unreadCounts.${receiverId}`]: 1 },
      });

      await saved.populate([
        { path: "sender", select: "userName profilePicture" },
        { path: "receiver", select: "userName profilePicture" },
      ]);

      const payload = { message: saved };
      emitToUser(userId, "message:new", payload);
      emitToUser(receiverId, "message:new", payload);

      if (isUserOnline(receiverId)) {
        await chatService.markDelivered(saved._id);
        emitToUser(userId, "message:delivered", { messageId: saved._id });
      }
    } catch (err) {
      socket.emit("error", {
        event: "message:send_photo",
        message: err.message,
      });
    }
  });

  socket.on("message:read", async ({ conversationId, senderId }) => {
    if (!conversationId) return;

    try {
      await chatService.markAsRead(conversationId, userId);

      if (senderId) {
        emitToUser(senderId, "message:read_ack", {
          conversationId,
          readBy: userId,
        });
      }
    } catch (err) {
      socket.emit("error", { event: "message:read", message: err.message });
    }
  });

  socket.on("typing:start", ({ conversationId, receiverId }) => {
    if (!receiverId) return;
    emitToUser(receiverId, "typing:start", {
      conversationId,
      userId,
      userName: socket.user.userName,
    });
  });

  socket.on("typing:stop", ({ conversationId, receiverId }) => {
    if (!receiverId) return;
    emitToUser(receiverId, "typing:stop", { conversationId, userId });
  });

  socket.on("presence:check", ({ userIds = [] }) => {
    const result = {};
    userIds.forEach((id) => {
      result[id] = isUserOnline(id);
    });
    socket.emit("presence:status", result);
  });
};
