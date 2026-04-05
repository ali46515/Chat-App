import mongoose from "mongoose";

const chatSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: [100, "Chat name cannot exceed 100 characters"],
    },
    chatType: {
      type: String,
      enum: ["direct", "group"],
      required: true,
      index: true,
    },

    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    groupId: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      sparse: true,
    },

    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    lastMessageContent: String,
    lastMessageSender: {
      type: Schema.Types.ObjectId,
      ref: "User",
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

    isPinned: {
      type: Boolean,
      default: false,
    },
    pinnedAt: Date,
    pinnedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    unreadCount: {
      type: Number,
      default: 0,
    },
    unreadBy: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        count: Number,
        lastReadAt: Date,
      },
    ],

    mutedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    theme: {
      type: String,
      default: "default",
    },
    emoji: String,

    messageCount: {
      type: Number,
      default: 0,
    },
    mediaCount: {
      type: Number,
      default: 0,
    },

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

chatSchema.index({ participants: 1, chatType: 1 });
chatSchema.index({ lastMessageAt: -1 });
chatSchema.index({ isArchived: 1, participants: 1 });
chatSchema.index({ groupId: 1 });

const ChatModel = mongoose.model("Chat", chatSchema);

export default ChatModel;
