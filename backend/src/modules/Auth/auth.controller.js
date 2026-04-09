import authService from "./auth.service.js";
import { AppError } from "../../middleware/errorHandler.js";

class AuthController {
  async register(req, res, next) {
    try {
      const {
        userName,
        email,
        password,        
      } = req.body;

      const result = await authService.register({
        userName,
        email,
        password,        
      });

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        success: true,
        message: result.message,
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const deviceInfo = {
        userAgent: req.get("user-agent"),
        ipAddress: req.ip,
        platform: req.body.platform,
      };

      const result = await authService.login({
        email,
        password,
        deviceInfo,
      });

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        throw new AppError("Refresh token is required", 401);
      }

      const result = await authService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        data: {
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const userId = req.user.id;
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        throw new AppError("Refresh token is required", 400);
      }

      await authService.logout(userId, refreshToken);

      res.clearCookie("refreshToken");

      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async logoutAllDevices(req, res, next) {
    try {
      const userId = req.user.id;

      await authService.logoutAllDevices(userId);

      res.clearCookie("refreshToken");

      res.status(200).json({
        success: true,
        message: "Logged out from all devices",
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req, res, next) {
    try {
      const { token } = req.body;

      if (!token) {
        throw new AppError("Verification token is required", 400);
      }

      const result = await authService.verifyEmail(token);

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          user: result.user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async resendVerificationEmail(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        throw new AppError("Email is required", 400);
      }

      await authService.resendVerificationEmail(email);

      res.status(200).json({
        success: true,
        message: "Verification email sent successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        throw new AppError("Email is required", 400);
      }

      await authService.forgotPassword(email);

      res.status(200).json({
        success: true,
        message: "Password reset email sent successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token } = req.params;
      const { password, passwordConfirm } = req.body;

      if (!token) {
        throw new AppError("Reset token is required", 400);
      }

      const result = await authService.resetPassword(token, {
        password,
        passwordConfirm,
      });

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword, newPasswordConfirm } = req.body;

      const result = await authService.changePassword(userId, {
        currentPassword,
        newPassword,
        newPasswordConfirm,
      });

      res.clearCookie("refreshToken");

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          user: result.user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req, res, next) {
    try {
      const userId = req.user.id;
      const User = require("../../../models/User");
      const user = await User.findById(userId);

      if (!user) {
        throw new AppError("User not found", 404);
      }

      res.status(200).json({
        success: true,
        data: {
          user: authService.formatUserResponse(user),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async validateToken(req, res, next) {
    try {
      res.status(200).json({
        success: true,
        message: "Token is valid",
      });
    } catch (error) {
      next(error);
    }
  }
}

console.log(authService)

export default new AuthController();
