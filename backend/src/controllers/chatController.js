import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

export const accessChat = async (req, res) => {
  const { participantId } = req.body;
  if (!participantId) {
    return res.status(400).json({ message: "Participant ID required" });
  }

  const ids = [req.user.id, participantId].sort();
  const chatKey = ids.join("_");

  let chat = await Chat.findOne({ chatKey }).populate(
    "participants",
    "-password",
  );
  if (!chat) {
    chat = await Chat.create({ isGroup: false, participants: ids, chatKey });
    chat = await chat.populate("participants", "-password").execPopulate();
  }

  res.json(chat);
};

export const createGroup = async (req, res) => {
  const { name, participantIds } = req.body;
  if (!name || !Array.isArray(participantIds) || participantIds.length < 2) {
    return res
      .status(400)
      .json({ message: "Name and at least 2 participants required" });
  }

  const participants = [req.user.id, ...participantIds];
  const chat = await Chat.create({
    isGroup: true,
    name,
    participants,
    groupAdmin: req.user.id,
  });

  const populated = await chat
    .populate("participants", "-password")
    .execPopulate();
  res.status(201).json(populated);
};

export const fetchChats = async (req, res) => {
  const chats = await Chat.find({ participants: req.user.id })
    .sort("-updatedAt")
    .populate("participants", "-password")
    .populate("groupAdmin", "-password")
    .exec();

  res.json(chats);
};

export const sendMessage = async (req, res) => {
  const { chatId } = req.params;
  const { content, file } = req.body;

  const chat = await Chat.findById(chatId);
  if (!chat) return res.status(404).json({ message: "Chat not found" });

  if (!chat.participants.includes(req.user.id)) {
    return res.status(403).json({ message: "Not a participant of this chat" });
  }

  const messageData = {
    chat: chatId,
    sender: req.user.id,
    content: content?.trim(),
    status: "sent",
  };

  if (file) {
    messageData.file = {
      url: file.url,
      mimeType: file.mimeType,
      originalName: file.originalName,
    };
  }

  const message = await Message.create(messageData);
  const populated = await message
    .populate("sender", "-password")
    .populate("chat")
    .execPopulate();

  const io = req.app.get("io");
  io.to(chatId).emit("newMessage", populated);

  res.status(201).json(populated);
};

export const getMessages = async (req, res) => {
  const { chatId } = req.params;
  const limit = parseInt(req.query.limit, 10) || 50;

  const messages = await Message.find({ chat: chatId })
    .sort("-createdAt")
    .limit(limit)
    .populate("sender", "-password")
    .exec();

  res.json(messages.reverse());
};
