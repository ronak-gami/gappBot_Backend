import express from "express";
import userRouter from "./users.route.js";
import uploadRouter from "./upload.route.js";

const mainRouter = express.Router();

mainRouter.use("/user", userRouter);
mainRouter.use("/upload", uploadRouter);

export default mainRouter;
