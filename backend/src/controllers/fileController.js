import File from "../models/File.js";
import path from "node:path";
import fs from "node:fs";

export const uploadFile = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const fileRecord = await File.create({
    owner: req.user.id,
    url: `/uploads/${req.file.filename}`,
    mimeType: req.file.mimetype,
    originalName: req.file.originalname,
    size: req.file.size,
  });

  res.json({
    url: fileRecord.url,
    mimeType: fileRecord.mimeType,
    originalName: fileRecord.originalName,
    _id: fileRecord._id,
  });
};

export const deleteFile = async (req, res) => {
  const file = await File.findById(req.params.id);
  if (!file) return res.status(404).json({ message: "File not found" });
  if (file.owner.toString() !== req.user.id) {
    return res.status(403).json({ message: "Not authorized" });
  }

  const filePath = path.resolve("uploads", path.basename(file.url));
  fs.unlink(filePath, (err) => {
    if (err) console.error("Failed to delete file from disk", err);
  });

  await file.remove();
  res.json({ message: "File deleted" });
};
