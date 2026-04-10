import Chat from "./chat.model.js";

const sendMessage = async (data) => {
  const chat = await Chat.create(data);
  return chat;
};

const getConversation = async (userId1, userId2) => {
  return await Chat.find({
    $or: [
      { sender: userId1, receiver: userId2 },
      { sender: userId2, receiver: userId1 },
    ],
  }).sort({ createdAt: 1 });
};

const markAsRead = async (chatId) => {
  return await Chat.findByIdAndUpdate(
    chatId,
    { status: "read" },
    { new: true },
  );
};

export { sendMessage, getConversation, markAsRead };
