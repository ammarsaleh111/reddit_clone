import "dotenv/config";

import argon2 from "argon2";
import mongoose from "mongoose";
import { z } from "zod";
import { connectDatabase } from "../config/database.js";
import { User } from "../models/User.js";

const adminInputSchema = z.object({
  email: z.email().transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/)
    .transform((value) => value.toLowerCase()),
});

async function createAdmin() {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error("MONGODB_URI is not configured.");
  }

  const input = adminInputSchema.parse({
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    username:
      process.env.ADMIN_USERNAME ||
      process.env.ADMIN_EMAIL?.split("@")[0],
  });

  await connectDatabase(uri);

  const passwordHash = await argon2.hash(input.password, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });

  const existingUser = await User.findOne({ email: input.email });

  if (existingUser) {
    existingUser.username = input.username;
    existingUser.passwordHash = passwordHash;
    existingUser.role = "super_admin";
    existingUser.status = "active";
    await existingUser.save();
    console.log(`Super admin updated: ${input.email}`);
    return;
  }

  await User.create({
    username: input.username,
    email: input.email,
    passwordHash,
    role: "super_admin",
    status: "active",
  });

  console.log(`Super admin created: ${input.email}`);
}

createAdmin()
  .catch((error: unknown) => {
    console.error(
      "Admin provisioning failed:",
      error instanceof Error ? error.message : error,
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
