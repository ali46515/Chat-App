import express from "express";
import protect from "../middleware/auth.js";
import {
  getProfile,
  updateProfile,
  searchUsers,
} from "../controllers/userController.js";
const router = express.Router();

router.use(protect);
router.get("/me", getProfile);
router.patch("/me", updateProfile);
router.get("/search", searchUsers);

export default router;
