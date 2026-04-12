import * as chatService from "./chat.service.js";
import { asyncHandler } from "../../middleware/errorHandler.js";

const getConversations = asyncHandler(async (req, res) => {
  const conversations = await chatService.getUserConversations(req.user._id);
  res.json({ success: true, data: conversations });
});

const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { page = 1 } = req.query;

  const result = await chatService.getMessages(conversationId, Number(page));
  res.json({ success: true, data: result });
});

const markRead = asyncHandler(async (req, res) => {
  await chatService.markAsRead(req.params.conversationId, req.user._id);
  res.json({ success: true });
});

export { getConversations, getMessages, markRead };
