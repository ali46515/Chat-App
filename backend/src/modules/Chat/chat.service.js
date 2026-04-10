import Chat from "./chat.model.js";
import Conversation from "../Conversation/conversation.model.js";

const createOrGetConversation = async (user1, user2) => {
  let convo = await Conversation.findOne({
    participants: { $all: [user1, user2] },
  });

  if (!convo) {
    convo = await Conversation.create({
      participants: [user1, user2],
    });
  }

  return convo;
};

const sendMessage = async ({ sender, receiver, message }) => {
  const convo = await createOrGetConversation(sender, receiver);

  const chat = await Chat.create({
    conversationId: convo._id,
    sender,
    receiver,
    message,
  });

  convo.lastMessage = chat._id;
  convo.lastMessageText = message;
  await convo.save();

  return chat;
};

const getMessages = async (conversationId, page = 1) => {
  const limit = 20;

  return await Chat.find({ conversationId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

const markAsRead = async (conversationId, userId) => {
  return await Chat.updateMany(
    { conversationId, receiver: userId, status: { $ne: "read" } },
    { status: "read" },
  );
};

export { createOrGetConversation, sendMessage, getMessages, markAsRead };
