import * as chatService from "./chat.service.js";

const getMessages = async (req, res) => {
  const { conversationId } = req.params;
  const { page } = req.query;

  const messages = await chatService.getMessages(conversationId, page);
  res.json(messages);
};

const markRead = async (req, res) => {
  const { conversationId } = req.params;

  await chatService.markAsRead(conversationId, req.user.id);
  res.json({ success: true });
};

export { getMessages, markRead };
