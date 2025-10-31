import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
    type: {
      type: String,
      enum: ["image", "video"],
      required: [true, "Media type is required"],
    },
    url: {
      type: String,
      required: [true, "Media URL is required"],
    },
    publicId: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    format: {
      type: String,
    },
    duration: {
      type: Number, // For videos only
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
mediaSchema.index({ user: 1, type: 1 });

const Media = mongoose.model("Media", mediaSchema);

export default Media;
