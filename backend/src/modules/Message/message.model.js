import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    content: {
      type: String,
      trim: true,
      maxlength: [5000, "Message cannot exceed 5000 characters"],
    },
    messageType: {
      type: String,
      enum: [
        "text",
        "image",
        "video",
        "audio",
        "document",
        "location",
        "contact",
        "poll",
        "call",
      ],
      default: "text",
      required: true,
    },

    media: {
      url: String,
      publicId: String,
      mimeType: String,
      fileSize: Number,
      fileName: String,
      duration: Number,
      thumbnail: String,
      dimensions: {
        width: Number,
        height: Number,
      },
      uploadedAt: Date,
    },

    isForwarded: {
      type: Boolean,
      default: false,
    },
    forwardedFrom: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    originalSenderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    isReply: {
      type: Boolean,
      default: false,
    },
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    replyToContent: {
      senderId: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      senderName: String,
      content: String,
      messageType: String,
    },

    status: {
      type: String,
      enum: ["sending", "sent", "delivered", "read", "failed"],
      default: "sending",
      index: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    deliveredAt: Date,
    readAt: Date,
    readBy: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        readAt: Date,
      },
    ],
    deliveredTo: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    reactions: [
      {
        emoji: String,
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        reactedAt: Date,
      },
    ],

    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: Date,
    editHistory: [
      {
        content: String,
        editedAt: Date,
      },
    ],

    isPinned: {
      type: Boolean,
      default: false,
    },
    pinnedAt: Date,
    pinnedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
    deletedFor: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    mentions: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        position: Number,
      },
    ],
    tags: [String],
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },

    isEncrypted: {
      type: Boolean,
      default: false,
    },
    encryptionKey: String,
  },
  { timestamps: true },
);

messageSchema.index({ chatId: 1, sentAt: -1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ status: 1, sentAt: -1 });
messageSchema.index({ replyTo: 1 });
messageSchema.index({ isDeleted: 1, chatId: 1 });
messageSchema.index({ "readBy.userId": 1 });

const MessageModel = mongoose.model("Message", messageSchema);

export default MessageModel;
