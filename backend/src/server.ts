import "dotenv/config";

import app from "./app.js";
import {connectDatabase} from "./config/database.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const mongodbUri = process.env.MONGODB_URI?.trim();
    if (!mongodbUri) {
      throw new Error(
        "MONGODB_URI is not configured. Copy backend/.env.example to backend/.env and set a valid MongoDB connection string.",
      );
    }

    await connectDatabase(mongodbUri);

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();