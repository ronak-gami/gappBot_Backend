import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mainRouter from "./routes/main.route.js";
import connectDB from "./config/database.js";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "GappaBot Backend Server is running successfully! 🚀",
    port: process.env.PORT,
  });
});

app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is working! 🎉",
    availableRoutes: {
      user: {
        register: "POST /api/user/register",
        login: "POST /api/user/login",
      },
      upload: {
        uploadMedia: "POST /api/upload",
        getMedia: "GET /api/upload?type=image|video",
        deleteMedia: "DELETE /api/upload/:id",
      },
    },
  });
});

app.use("/api", mainRouter);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
