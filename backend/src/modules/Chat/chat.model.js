import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    message: { type: String, trim: true },

    attachment: {
      url: String,
      filename: String,
      mimetype: String,
      size: Number,
    },

    messageType: {
      type: String,
      enum: ["text", "photo"],
      default: "text",
    },

    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },

    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
  },
  { timestamps: true },
);

chatSchema.index({ conversationId: 1, createdAt: -1 });
chatSchema.index({ sender: 1, receiver: 1 });

export default mongoose.model("Chat", chatSchema);
