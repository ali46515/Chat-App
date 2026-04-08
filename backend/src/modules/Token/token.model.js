import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    tokenType: {
      type: String,
      enum: ["refresh", "reset", "verification"],
      default: "refresh",
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // Auto-delete expired tokens
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },
    revokedAt: Date,
    deviceInfo: {
      userAgent: String,
      ipAddress: String,
      platform: String,
    },
  },
  { timestamps: true },
);

const TokenModel = mongoose.model("Token", tokenSchema);

export default TokenModel;
