
import "dotenv/config";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { env } from "./config/env.js";
import authRoutes from "./modules/auth/auth.routers.js";
import { errorHandler } from "./middleware/errorHandler.js";
import commentRoutes from "./modules/comments/comment.routes.js";

const app = express();

app.disable("x-powered-by");

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Community Platform API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/votes", voteRoutes);


app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(errorHandler);

export default app;
