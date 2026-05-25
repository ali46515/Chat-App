import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, unique: true, sparse: true },
    avatar: { type: String },
    password: { type: String, required: true, minlength: 6 },
    status: { type: String, default: "Hey there! I am using WhatsApp Clone" },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPwd) {
  return bcrypt.compare(enteredPwd, this.password);
};

export default mongoose.model("User", userSchema);
