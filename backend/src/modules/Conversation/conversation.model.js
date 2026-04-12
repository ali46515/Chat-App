import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],

    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    lastMessageText: String,
    lastMessageAt: { type: Date, default: Date.now, index: true },

    unreadCounts: { type: Map, of: Number, default: {} },
  },
  { timestamps: true },
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ participants: 1, lastMessageAt: -1 });

export default mongoose.model("Conversation", conversationSchema);
