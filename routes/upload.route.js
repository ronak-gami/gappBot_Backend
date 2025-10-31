import express from "express";
import {
  uploadMediaController,
  getMediaController,
  deleteMediaController,
} from "../controllers/upload.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const uploadRouter = express.Router();

// POST route - Upload media (image or video) with file
uploadRouter.post(
  "/",
  authenticate,
  upload.single("file"),
  uploadMediaController
);

// GET route - Retrieve user's media (image or video)
uploadRouter.get("/", authenticate, getMediaController);

// DELETE route - Delete specific media
uploadRouter.delete("/:id", authenticate, deleteMediaController);

export default uploadRouter;
