import express from "express";
import * as chatController from "./chat.controller.js";
import { auth } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/:conversationId", auth, chatController.getMessages);
router.patch("/read/:conversationId", auth, chatController.markRead);

export default router;
