import express from "express";
import protect from "../middleware/auth.js";
import upload from "../utils/upload.js";
import { uploadFile, deleteFile } from "../controllers/fileController.js";
const router = express.Router();

router.use(protect);
router.post("/upload", upload.single("file"), uploadFile);
router.delete("/:id", deleteFile);

export default router;
