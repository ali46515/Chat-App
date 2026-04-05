import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Group name is required"],
      trim: true,
      minlength: [3, "Group name must be at least 3 characters"],
      maxlength: [100, "Group name cannot exceed 100 characters"],
      index: true,
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
      trim: true,
    },
    groupPicture: {
      url: String,
      publicId: String,
      uploadedAt: Date,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    admins: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    members: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["admin", "moderator", "member"],
          default: "member",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        addedBy: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        isActive: {
          type: Boolean,
          default: true,
        },
        isMuted: {
          type: Boolean,
          default: false,
        },
        lastReadMessageId: {
          type: Schema.Types.ObjectId,
          ref: "Message",
        },
      },
    ],
    memberCount: {
      type: Number,
      default: 0,
    },

    isPublic: {
      type: Boolean,
      default: false,
      index: true,
    },
    inviteLink: {
      token: String,
      expiresAt: Date,
      maxUses: Number,
      usageCount: Number,
    },
    allowMembersToInvite: {
      type: Boolean,
      default: true,
    },
    allowMembersToChangeGroupInfo: {
      type: Boolean,
      default: false,
    },
    allowMembersToAddMedia: {
      type: Boolean,
      default: true,
    },
    disappearingMessagesEnabled: {
      type: Boolean,
      default: false,
    },
    disappearingMessagesDuration: {
      type: Number,
      default: 86400,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    archivedAt: Date,
    archivedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    messageCount: {
      type: Number,
      default: 0,
    },
    mediaCount: {
      type: Number,
      default: 0,
    },

    deletedMembers: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        removedAt: Date,
        removedBy: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        reason: String,
      },
    ],

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: Date,
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

groupSchema.index({ name: 1, isDeleted: 1 });
groupSchema.index({ createdBy: 1 });
groupSchema.index({ "members.userId": 1 });
groupSchema.index({ isPublic: 1, isActive: 1 });

groupSchema.pre("save", function () {
  if (this.isModified("members")) {
    this.memberCount = this.members.filter((m) => m.isActive).length;
  }
});

const GroupModel = mongoose.model("Group", groupSchema);

export default GroupModel;
