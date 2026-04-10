import * as chatService from "./chat.service.js";

const sendMessage = async (req, res) => {
  try {
    const chat = await chatService.sendMessage(req.body);
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const chats = await chatService.getConversation(req.user.id, userId);
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const chat = await chatService.markAsRead(req.params.id);
    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { sendMessage, getConversation, markAsRead };
