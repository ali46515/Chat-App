import express from "express";
import { auth } from "../../middleware/auth.middleware.js";
import * as chatController from "./chat.controller.js";

const router = express.Router();

router.use(auth);

router.get("/conversations", chatController.getConversations);
router.get("/messages/:conversationId", chatController.getMessages);
router.patch("/read/:conversationId", chatController.markRead);

export default router;
