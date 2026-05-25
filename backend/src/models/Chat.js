import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    isGroup: { type: Boolean, default: false },
    name: { type: String },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    chatKey: { type: String, unique: true, sparse: true },
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    avatar: { type: String },
  },
  { timestamps: true },
);

export default mongoose.model("Chat", chatSchema);
