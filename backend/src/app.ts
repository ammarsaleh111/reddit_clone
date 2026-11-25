import "dotenv/config";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { env } from "./config/env.js";
import authRoutes from "./modules/auth/auth.routers.js";
import { errorHandler } from "./middleware/errorHandler.js";
import commentRoutes from "./modules/comments/comment.routes.js";
import voteRoutes from "./modules/votes/vote.routes.js";
import communityRoutes from "./modules/communities/community.routes.js";
import postRoutes from "./modules/posts/post.routes.js";

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

// Existing (legacy response format)
app.use("/api/auth", authRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/votes", voteRoutes);

// API Contract v2.0
app.use("/api/v1/communities", communityRoutes);
app.use("/api/v1", postRoutes);

app.use((req, res) => {
  if (req.originalUrl.startsWith("/api/v1")) {
    res.status(404).json({
      error: {
        code: "NOT_FOUND",
        message: "Route not found",
      },
    });
    return;
  }

  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(errorHandler);

export default app;