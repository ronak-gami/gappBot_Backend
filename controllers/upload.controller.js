import Media from "../models/media.model.js";
import cloudinary from "../config/cloudinary.js";

// Upload Media Controller (Images & Videos)
const uploadMediaController = async (req, res) => {
  try {
    const { type } = req.body;

    // Validate type
    if (!type || (type !== "image" && type !== "video")) {
      return res.status(400).json({
        success: false,
        message: "Type must be either 'image' or 'video'",
      });
    }

    // Check if file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a file",
      });
    }

    // Validate file type matches the specified type
    if (type === "image" && !req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({
        success: false,
        message: "File must be an image",
      });
    }

    if (type === "video" && !req.file.mimetype.startsWith("video/")) {
      return res.status(400).json({
        success: false,
        message: "File must be a video",
      });
    }

    // Upload to Cloudinary
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: type === "video" ? "video" : "image",
          folder: `gappabot/${type}s/${req.user._id}`,
          public_id: `${Date.now()}-${req.file.originalname.split(".")[0]}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(req.file.buffer);
    });

    const result = await uploadPromise;

    let thumbnailUrl = null;

    // Generate thumbnail for videos
    if (type === "video") {
      // Cloudinary automatically generates thumbnails for videos
      // We can get the thumbnail by modifying the video URL
      thumbnailUrl = result.secure_url
        .replace(/\.(mp4|avi|mov|wmv|flv|mkv)$/, ".jpg")
        .replace("/video/", "/video/");

      // Alternative: Use Cloudinary's transformation API for better thumbnail
      // Extract public_id and generate thumbnail URL
      const publicId = result.public_id;
      thumbnailUrl = cloudinary.url(publicId, {
        resource_type: "video",
        format: "jpg",
        transformation: [
          { width: 400, height: 300, crop: "fill" },
          { quality: "auto" },
        ],
      });
    }

    // Create media record in database
    const media = await Media.create({
      user: req.user._id,
      type,
      url: result.secure_url,
      thumbnail: thumbnailUrl, // Will be null for images, URL for videos
      publicId: result.public_id,
      filename: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      format: result.format,
      duration: result.duration || null,
    });

    res.status(201).json({
      success: true,
      message: `${
        type.charAt(0).toUpperCase() + type.slice(1)
      } uploaded successfully`,
      data: media,
    });
  } catch (error) {
    console.error("Upload media error:", error);
    res.status(500).json({
      success: false,
      message: "Media upload failed",
      error: error.message,
    });
  }
};

// Get Media Controller with Pagination (Images & Videos)
const getMediaController = async (req, res) => {
  try {
    const { type, page = 1, limit = 50 } = req.query;

    // Validate type
    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Type query parameter is required (image or video)",
      });
    }

    if (type !== "image" && type !== "video") {
      return res.status(400).json({
        success: false,
        message: "Type must be either 'image' or 'video'",
      });
    }

    // Convert page and limit to numbers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Validate pagination parameters
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid pagination parameters. Page must be >= 1 and limit must be between 1-100",
      });
    }

    // Calculate skip value for pagination
    const skip = (pageNum - 1) * limitNum;

    // Get total count for the user's media
    const totalCount = await Media.countDocuments({
      user: req.user._id,
      type,
    });

    // Get paginated media for the authenticated user by type
    const media = await Media.find({
      user: req.user._id,
      type,
    })
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limitNum);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      success: true,
      message: `${
        type.charAt(0).toUpperCase() + type.slice(1)
      }s retrieved successfully`,
      data: media,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        limit: limitNum,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? pageNum + 1 : null,
        prevPage: hasPrevPage ? pageNum - 1 : null,
      },
    });
  } catch (error) {
    console.error("Get media error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve media",
      error: error.message,
    });
  }
};

// Delete Media Controller
const deleteMediaController = async (req, res) => {
  try {
    const { id } = req.params;

    // Find media
    const media = await Media.findOne({
      _id: id,
      user: req.user._id, // Ensure user owns the media
    });

    if (!media) {
      return res.status(404).json({
        success: false,
        message: "Media not found",
      });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(media.publicId, {
      resource_type: media.type === "video" ? "video" : "image",
    });

    // Delete from database
    await Media.deleteOne({ _id: id });

    res.status(200).json({
      success: true,
      message: "Media deleted successfully",
    });
  } catch (error) {
    console.error("Delete media error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete media",
      error: error.message,
    });
  }
};

export { uploadMediaController, getMediaController, deleteMediaController };
