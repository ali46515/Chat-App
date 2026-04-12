import express from "express";
import { auth } from "../../middleware/auth.middleware.js";
import { upload } from "../../config/multer.js";
import { uploadPhoto } from "./files.controller.js";

const router = express.Router();

router.post("/photo", auth, upload.single("photo"), uploadPhoto);

export default router;
