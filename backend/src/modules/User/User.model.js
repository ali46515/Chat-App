import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters"],
      maxlength: [50, "Last name cannot exceed 50 characters"],
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
    phoneNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      match: [
        /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
        "Invalid phone number",
      ],
      index: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [20, "Username cannot exceed 20 characters"],
      match: [
        /^[a-zA-Z0-9_-]+$/,
        "Username can only contain letters, numbers, underscores, and hyphens",
      ],
      index: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
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
    coverImage: {
      url: String,
      publicId: String,
      uploadedAt: Date,
    },

    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    verificationToken: String,
    verificationTokenExpires: Date,
    verificationEmailSentAt: Date,

    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["online", "offline", "away", "busy", "do_not_disturb"],
      default: "offline",
      index: true,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    accountType: {
      type: String,
      enum: ["personal", "business"],
      default: "personal",
    },
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
      profilePhotoVisible: {
        type: String,
        enum: ["everyone", "contacts", "nobody"],
        default: "everyone",
      },
      statusVisible: {
        type: String,
        enum: ["everyone", "contacts", "nobody"],
        default: "everyone",
      },
      readReceiptsEnabled: {
        type: Boolean,
        default: true,
      },
      typingIndicatorEnabled: {
        type: Boolean,
        default: true,
      },
      blockedUsers: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },

    notificationSettings: {
      messageNotifications: {
        type: Boolean,
        default: true,
      },
      groupNotifications: {
        type: Boolean,
        default: true,
      },
      callNotifications: {
        type: Boolean,
        default: true,
      },
      statusNotifications: {
        type: Boolean,
        default: true,
      },
      mutedChats: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Chat",
        },
      ],
      mutedGroups: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Group",
        },
      ],
    },

    devices: [
      {
        deviceId: String,
        deviceName: String,
        deviceType: {
          type: String,
          enum: ["mobile", "tablet", "desktop", "web"],
        },
        osType: {
          type: String,
          enum: ["ios", "android", "windows", "macos", "linux", "web"],
        },
        ipAddress: String,
        lastActive: Date,
        isCurrentDevice: Boolean,
      },
    ],

    stats: {
      totalChats: {
        type: Number,
        default: 0,
      },
      totalGroupsCreated: {
        type: Number,
        default: 0,
      },
      totalMessagesSent: {
        type: Number,
        default: 0,
      },
      totalCallsMade: {
        type: Number,
        default: 0,
      },
      averageResponseTime: Number,
    },

    contacts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Contact",
      },
    ],
    chats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
      },
    ],
    groups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
      },
    ],

    language: {
      type: String,
      default: "en",
    },
    timezone: String,
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      select: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: Date,

    lastLoginAt: Date,
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema.index({ email: 1, isDeleted: 1 });
userSchema.index({ phoneNumber: 1, isDeleted: 1 });
userSchema.index({ username: 1, isDeleted: 1 });
userSchema.index({ status: 1, lastSeen: -1 });
userSchema.index({ "privacySettings.blockedUsers": 1 });

userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
