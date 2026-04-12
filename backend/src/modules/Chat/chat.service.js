import Chat from "./chat.model.js";
import Conversation from "../Conversation/conversation.model.js";
import { AppError } from "../../middleware/errorHandler.js";

const getOrCreateConversation = async (user1Id, user2Id) => {
  const participants = [user1Id, user2Id].map(String).sort();

  let convo = await Conversation.findOne({
    participants: { $all: participants, $size: 2 },
  });

  if (!convo) {
    convo = await Conversation.create({ participants });
  }

  return convo;
};

const sendMessage = async ({ senderId, receiverId, message }) => {
  if (!message?.trim()) throw new AppError("Message cannot be empty", 400);

  const convo = await getOrCreateConversation(senderId, receiverId);

  const chat = await Chat.create({
    conversationId: convo._id,
    sender: senderId,
    receiver: receiverId,
    message: message.trim(),
    messageType: "text",
    status: "sent",
  });

  const receiverKey = `unreadCounts.${receiverId}`;
  await Conversation.findByIdAndUpdate(convo._id, {
    lastMessage: chat._id,
    lastMessageText: message.trim(),
    lastMessageAt: chat.createdAt,
    $inc: { [receiverKey]: 1 },
  });

  return chat.populate([
    { path: "sender", select: "userName profilePicture status" },
    { path: "receiver", select: "userName profilePicture status" },
  ]);
};

const sendPhotoMessage = async ({ senderId, receiverId, file }) => {
  if (!file) throw new AppError("No photo provided", 400);

  const convo = await getOrCreateConversation(senderId, receiverId);

  const attachment = {
    url: `/uploads/photos/${file.filename}`,
    filename: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
  };

  const chat = await Chat.create({
    conversationId: convo._id,
    sender: senderId,
    receiver: receiverId,
    messageType: "photo",
    attachment,
    status: "sent",
  });

  const receiverKey = `unreadCounts.${receiverId}`;
  await Conversation.findByIdAndUpdate(convo._id, {
    lastMessage: chat._id,
    lastMessageText: "📷 Photo",
    lastMessageAt: chat.createdAt,
    $inc: { [receiverKey]: 1 },
  });

  return chat.populate([
    { path: "sender", select: "userName profilePicture status" },
    { path: "receiver", select: "userName profilePicture status" },
  ]);
};

const getMessages = async (conversationId, page = 1, limit = 30) => {
  const skip = (page - 1) * limit;

  const [messages, total] = await Promise.all([
    Chat.find({ conversationId, isDeleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("sender", "userName profilePicture")
      .populate("receiver", "userName profilePicture")
      .lean(),
    Chat.countDocuments({ conversationId, isDeleted: false }),
  ]);

  return {
    messages: messages.reverse(),
    pagination: {
      page: Number(page),
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasMore: skip + messages.length < total,
    },
  };
};

const markAsRead = async (conversationId, userId) => {
  await Chat.updateMany(
    { conversationId, receiver: userId, status: { $ne: "read" } },
    { status: "read" },
  );

  const key = `unreadCounts.${userId}`;
  await Conversation.findByIdAndUpdate(conversationId, { [key]: 0 });
};

const getUserConversations = async (userId) => {
  return Conversation.find({ participants: userId })
    .sort({ lastMessageAt: -1 })
    .populate("participants", "userName profilePicture status lastSeen")
    .populate("lastMessage")
    .lean();
};

const markDelivered = async (messageId) => {
  return Chat.findByIdAndUpdate(
    messageId,
    { status: "delivered" },
    { new: true },
  );
};

export {
  getOrCreateConversation,
  getMessages,
  getUserConversations,
  markAsRead,
  sendMessage,
  sendPhotoMessage,
  markDelivered,
};
