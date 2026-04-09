import express from "express";
const router = express.Router();
import authController from "./auth.controller.js";
import { validate } from "../../middleware/validator.js";
import { auth } from "../../middleware/auth.middleware.js";
import {
  registerValidation,
  loginValidation,
  emailValidation,
  passwordChangeValidation,
  resetPasswordValidation,
} from "./auth.validator.js";

router.post("/register", validate(registerValidation), authController.register);

router.post("/login", validate(loginValidation), authController.login);

router.post("/refresh-token", authController.refreshToken);

router.post(
  "/forgot-password",
  validate(emailValidation),
  authController.forgotPassword,
);

router.post(
  "/reset-password/:token",
  validate(resetPasswordValidation),
  authController.resetPassword,
);

router.post("/verify-email", authController.verifyEmail);

router.post(
  "/resend-verification-email",
  validate(emailValidation),
  authController.resendVerificationEmail,
);

router.post("/validate-token", auth, authController.validateToken);

router.get("/me", auth, authController.getCurrentUser);

router.post("/logout", auth, authController.logout);

router.post("/logout-all-devices", auth, authController.logoutAllDevices);

router.put(
  "/change-password",
  auth,
  validate(passwordChangeValidation),
  authController.changePassword,
);

export default router;
