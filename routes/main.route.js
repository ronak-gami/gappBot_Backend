import express from "express";
import userRouter from "./users.route.js";

const mainRouter = express.Router();

mainRouter.use("/user", userRouter);

export default mainRouter;
