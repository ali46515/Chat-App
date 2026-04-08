import User from "../User/User.model.js";
import Token from "../Token/token.model.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../../utils/email.service.js";

class AuthService {
  async register(userData) {
    const { userName, email, password } = userData;

    if (!userName || !email || !password) {
      throw new ValidationError("All fields are required");
    }

    this.validatePasswordStrength(password);

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      throw new AppError(
        `${existingUser.email === email.toLowerCase() ? "Email" : "Phone number"} already in use`,
        409,
      );
    }

    const user = new User({
      userName: userName.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    await user.save();

    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");
    user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
    user.verificationEmailSentAt = Date.now();
    await user.save({ validateBeforeSave: false });

    try {
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
      await sendEmail({
        email: user.email,
        subject: "Verify your email address",
        template: "verify-email",
        data: {
          userName: user.userName,
          verificationUrl,
        },
      });
    } catch (err) {
      user.verificationToken = undefined;
      user.verificationTokenExpires = undefined;
      await user.save({ validateBeforeSave: false });
      throw new AppError("Error sending verification email", 500);
    }

    const { accessToken, refreshToken } = await this.generateTokens(user._id);

    await new Token({
      userId: user._id,
      token: refreshToken,
      tokenType: "refresh",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    }).save();

    return {
      user: this.formatUserResponse(user),
      accessToken,
      refreshToken,
      message: "User registered successfully. Please verify your email.",
    };
  }

  async login(credentials) {
    const { email, password } = credentials;

    if (!password || !email) {
      throw new ValidationError("Email and password are required");
    }

    const user = await User.findOne({ email: email?.toLowerCase() }).select(
      "+password",
    );

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      throw new AppError("Account temporarily locked. Try again later.", 429);
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;

      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      }

      await user.save({ validateBeforeSave: false });
      throw new AppError("Invalid email or password", 401);
    }

    if (user.isDeleted) {
      throw new AppError("Account has been deleted", 403);
    }

    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLoginAt = Date.now();
    user.status = "online";
    await user.save({ validateBeforeSave: false });

    const { accessToken, refreshToken } = await this.generateTokens(user._id);

    await new Token({
      userId: user._id,
      token: refreshToken,
      tokenType: "refresh",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      deviceInfo: credentials.deviceInfo,
    }).save();

    return {
      user: this.formatUserResponse(user),
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw new ValidationError("Refresh token is required");
    }

    const tokenDoc = await Token.findOne({
      token: refreshToken,
      tokenType: "refresh",
      isRevoked: false,
    }).populate("userId");

    if (!tokenDoc) {
      throw new AppError("Invalid refresh token", 401);
    }

    if (tokenDoc.expiresAt < Date.now()) {
      await Token.deleteOne({ _id: tokenDoc._id });
      throw new AppError("Refresh token has expired", 401);
    }

    try {
      jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      await Token.deleteOne({ _id: tokenDoc._id });
      throw new AppError("Invalid refresh token", 401);
    }

    const accessToken = jwt.sign(
      { id: tokenDoc.userId._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "7d" },
    );

    return { accessToken };
  }

  async logout(userId, refreshToken) {
    if (!refreshToken) {
      throw new ValidationError("Refresh token is required");
    }

    const result = await Token.findOneAndUpdate(
      {
        userId,
        token: refreshToken,
        tokenType: "refresh",
      },
      {
        isRevoked: true,
        revokedAt: Date.now(),
      },
    );

    if (!result) {
      throw new AppError("Token not found", 404);
    }

    await User.findByIdAndUpdate(userId, {
      status: "offline",
      lastSeen: Date.now(),
    });
  }

  async logoutAllDevices(userId) {
    await Token.updateMany(
      {
        userId,
        tokenType: "refresh",
        isRevoked: false,
      },
      {
        isRevoked: true,
        revokedAt: Date.now(),
      },
    );

    await User.findByIdAndUpdate(userId, {
      status: "offline",
      lastSeen: Date.now(),
    });
  }

  async verifyEmail(verificationToken) {
    if (!verificationToken) {
      throw new ValidationError("Verification token is required");
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new AppError("Invalid or expired verification token", 400);
    }

    user.isVerified = true;
    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return {
      message: "Email verified successfully",
      user: this.formatUserResponse(user),
    };
  }

  async resendVerificationEmail(email) {
    if (!email) {
      throw new ValidationError("Email is required");
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.isEmailVerified) {
      throw new AppError("Email is already verified", 400);
    }

    if (
      user.verificationEmailSentAt &&
      Date.now() - user.verificationEmailSentAt < 60000
    ) {
      throw new AppError(
        "Please wait before requesting another verification email",
        429,
      );
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");
    user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
    user.verificationEmailSentAt = Date.now();
    await user.save({ validateBeforeSave: false });

    try {
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
      await sendEmail({
        email: user.email,
        subject: "Verify your email address",
        template: "verify-email",
        data: {
          userName: user.userName,
          verificationUrl,
        },
      });
    } catch (err) {
      user.verificationToken = undefined;
      user.verificationTokenExpires = undefined;
      await user.save({ validateBeforeSave: false });
      throw new AppError("Error sending verification email", 500);
    }
  }

  async forgotPassword(email) {
    if (!email) {
      throw new ValidationError("Email is required");
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
      await sendEmail({
        email: user.email,
        subject: "Password reset request",
        template: "reset-password",
        data: {
          userName: user.userName,
          resetUrl,
        },
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      throw new AppError("Error sending password reset email", 500);
    }
  }

  async resetPassword(resetToken, passwordData) {
    const { password, passwordConfirm } = passwordData;

    if (!resetToken) {
      throw new ValidationError("Reset token is required");
    }

    if (!password || !passwordConfirm) {
      throw new ValidationError("Password and confirmation are required");
    }

    if (password !== passwordConfirm) {
      throw new ValidationError("Passwords do not match");
    }

    this.validatePasswordStrength(password);

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new AppError("Invalid or expired reset token", 400);
    }

    user.password = password;
    user.passwordChangedAt = Date.now();
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    await Token.updateMany(
      { userId: user._id, tokenType: "refresh" },
      { isRevoked: true, revokedAt: Date.now() },
    );

    const { accessToken, refreshToken } = await this.generateTokens(user._id);

    await new Token({
      userId: user._id,
      token: refreshToken,
      tokenType: "refresh",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    }).save();

    return {
      message: "Password reset successfully",
      user: this.formatUserResponse(user),
      accessToken,
      refreshToken,
    };
  }

  async changePassword(userId, passwordData) {
    const { currentPassword, newPassword, newPasswordConfirm } = passwordData;

    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      throw new ValidationError("All password fields are required");
    }

    if (newPassword !== newPasswordConfirm) {
      throw new ValidationError("New passwords do not match");
    }

    if (currentPassword === newPassword) {
      throw new ValidationError(
        "New password cannot be same as current password",
      );
    }

    this.validatePasswordStrength(newPassword);

    const user = await User.findById(userId).select("+password");

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      throw new AppError("Current password is incorrect", 401);
    }

    user.password = newPassword;
    user.passwordChangedAt = Date.now();
    await user.save();

    await Token.updateMany(
      { userId, tokenType: "refresh" },
      { isRevoked: true, revokedAt: Date.now() },
    );

    return {
      message: "Password changed successfully",
      user: this.formatUserResponse(user),
    };
  }

  async generateTokens(userId) {
    const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    });

    const refreshToken = jwt.sign(
      { id: userId },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE || "30d" },
    );

    return { accessToken, refreshToken };
  }

  validatePasswordStrength(password) {
    if (password.length < 8) {
      throw new ValidationError("Password must be at least 8 characters long");
    }

    if (!/[A-Z]/.test(password)) {
      throw new ValidationError(
        "Password must contain at least one uppercase letter",
      );
    }

    if (!/[a-z]/.test(password)) {
      throw new ValidationError(
        "Password must contain at least one lowercase letter",
      );
    }

    if (!/[0-9]/.test(password)) {
      throw new ValidationError("Password must contain at least one number");
    }

    if (!/[!@#$%^&*]/.test(password)) {
      throw new ValidationError(
        "Password must contain at least one special character (!@#$%^&*)",
      );
    }
  }

  formatUserResponse(user) {
    const userObj = user.toObject ? user.toObject() : user;
    delete userObj.password;
    delete userObj.passwordResetToken;
    delete userObj.passwordResetExpires;
    delete userObj.verificationToken;
    delete userObj.verificationTokenExpires;
    delete userObj.twoFactorSecret;
    return userObj;
  }
}

export default new AuthService();
