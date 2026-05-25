import jwt from "jsonwebtoken";

const generateToken = (userId) => {
  const payload = { id: userId };
  const secret = process.env.JWT_SECRET;
  const options = { expiresIn: process.env.JWT_EXPIRES_IN || "7d" };
  return jwt.sign(payload, secret, options);
};

export default generateToken;
