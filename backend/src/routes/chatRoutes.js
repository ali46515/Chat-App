import express from "express";
import protect from "../middleware/auth.js";
import {
  accessChat,
  createGroup,
  fetchChats,
  sendMessage,
  getMessages,
} from "../controllers/chatController.js";
const router = express.Router();

router.use(protect);
router.post("/", accessChat);
router.post("/group", createGroup);
router.get("/", fetchChats);
router.post("/:chatId/message", sendMessage);
router.get("/:chatId/messages", getMessages);

export default router;
