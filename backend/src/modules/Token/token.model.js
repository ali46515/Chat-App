import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    token: { type: String, required: true, unique: true, index: true },
    tokenType: {
      type: String,
      enum: ["refresh", "reset", "verification"],
      default: "refresh",
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
    isRevoked: { type: Boolean, default: false, index: true },
    revokedAt: Date,
    deviceInfo: {
      userAgent: String,
      ipAddress: String,
      platform: String,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Token", tokenSchema);
