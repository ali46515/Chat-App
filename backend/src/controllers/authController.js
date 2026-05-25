import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

export const register = async (req, res) => {
  const { name, phone, email, password } = req.body;
  if (!name || !phone || !password) {
    return res
      .status(400)
      .json({ message: "Name, phone and password required" });
  }

  const existing = await User.findOne({ $or: [{ phone }, { email }] });
  if (existing) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = await User.create({ name, phone, email, password });
  const token = generateToken(user._id);
  res.status(201).json({ token, user: { id: user._id, name, phone, email } });
};

export const login = async (req, res) => {
  const { phoneOrEmail, password } = req.body;
  const query = phoneOrEmail.includes("@")
    ? { email: phoneOrEmail }
    : { phone: phoneOrEmail };

  const user = await User.findOne(query);
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = generateToken(user._id);
  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email,
    },
  });
};
