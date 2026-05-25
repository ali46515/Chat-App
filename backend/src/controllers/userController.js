import User from "../models/User.js";

export const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
};

export const updateProfile = async (req, res) => {
  const updates = { ...req.body };
  if (updates.password) updates.password = updates.password;

  const updated = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
    select: "-password",
  });
  res.json(updated);
};

export const searchUsers = async (req, res) => {
  const { term } = req.query;
  if (!term) return res.status(400).json({ message: "Search term required" });

  const regex = new RegExp(term, "i");
  const users = await User.find({
    $or: [{ name: regex }, { phone: regex }],
    _id: { $ne: req.user.id },
  }).select("name phone avatar status");

  res.json(users);
};
