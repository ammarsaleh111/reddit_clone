import "dotenv/config";

import express from "express";
import cors from "cors";

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

// understand json
app.use(express.json());

// test endpoints health 
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ohh fuck it is working "
  });
});

//test if backend is workiong 
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Reddit Clone Backend is Running!"
  });
});

export default app;