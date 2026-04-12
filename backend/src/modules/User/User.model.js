import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [2, "Username must be at least 2 characters"],
      maxlength: [50, "Username cannot exceed 50 characters"],
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Invalid email format",
      ],
      index: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,

    profilePicture: {
      url: String,
      publicId: String,
      uploadedAt: Date,
    },
    bio: {
      type: String,
      maxlength: [500, "Bio cannot exceed 500 characters"],
      trim: true,
    },

    isVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    verificationToken: String,
    verificationTokenExpires: Date,
    verificationEmailSentAt: Date,

    status: {
      type: String,
      enum: ["online", "offline", "away", "busy"],
      default: "offline",
      index: true,
    },
    lastSeen: { type: Date, default: Date.now, index: true },

    isActive: { type: Boolean, default: true, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: Date,
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
      index: true,
    },

    privacySettings: {
      lastSeenVisible: {
        type: String,
        enum: ["everyone", "contacts", "nobody"],
        default: "everyone",
      },
      readReceiptsEnabled: { type: Boolean, default: true },
      typingIndicatorEnabled: { type: Boolean, default: true },
      blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },

    lastLoginAt: Date,
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema.index({ email: 1, isDeleted: 1 });
userSchema.index({ userName: 1, isDeleted: 1 });
userSchema.index({ status: 1, lastSeen: -1 });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);
