import { asyncHandler, AppError } from "../../middleware/errorHandler.js";

const uploadPhoto = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError("No file uploaded", 400);

  const url = `${req.protocol}://${req.get("host")}/uploads/photos/${req.file.filename}`;

  res.status(201).json({
    success: true,
    data: {
      url,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    },
  });
});

export { uploadPhoto };
