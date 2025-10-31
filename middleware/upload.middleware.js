import multer from "multer";
import path from "path";

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Get file extension
  const ext = path.extname(file.originalname).toLowerCase();

  // Check file type based on mimetype
  if (file.mimetype.startsWith("image/")) {
    // Accept images
    const allowedImageExts = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"];
    if (allowedImageExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid image format"), false);
    }
  } else if (file.mimetype.startsWith("video/")) {
    // Accept videos
    const allowedVideoExts = [".mp4", ".avi", ".mov", ".wmv", ".flv", ".mkv"];
    if (allowedVideoExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid video format"), false);
    }
  } else {
    cb(new Error("Only images and videos are allowed"), false);
  }
};

// Configure multer upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
  },
});

export default upload;
