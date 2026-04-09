import express from "express";
const router = express.Router();
import authController from "../Auth/auth.controller.js";
import { auth } from "../../middleware/auth.middleware.js";

router.post("/register", authController.register);

router.post("/login", authController.login);

router.post("/refresh-token", authController.refreshToken);

router.post(
  "/forgot-password",
  authController.forgotPassword,
);

router.post(
  "/reset-password/:token",
  authController.resetPassword,
);

router.post("/verify-email", authController.verifyEmail);

router.post(
  "/resend-verification-email",
  authController.resendVerificationEmail,
);

router.post("/validate-token", auth, authController.validateToken);

router.get("/me", auth, authController.getCurrentUser);

router.post("/logout", auth, authController.logout);

router.post("/logout-all-devices", auth, authController.logoutAllDevices);

router.put(
  "/change-password",
  auth,
  authController.changePassword,
);

export default router;
