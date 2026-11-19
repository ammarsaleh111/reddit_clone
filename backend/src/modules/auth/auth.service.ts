
import argon2 from "argon2";
import { User } from "../../models/User.js";
import { AppError } from "../../lib/AppError.js";
import type {
  RegisterInput,
  LoginInput,
} from "./auth.validation.js";

export function toPublicUser(user: {
  _id: { toString(): string };
  username: string;
  email: string;
  role: string;
  status: string;
  avatar?: string | null;
  bio?: string | null;
  createdAt?: Date;
}) {
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    avatar: user.avatar ?? null,
    bio: user.bio ?? null,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt?.toISOString() ?? new Date().toISOString(),
  };
}


export async function registerUser(input: RegisterInput) {
  const existingUser = await User.findOne({
    $or: [
      { email: input.email },
      { username: input.username },
    ],
  });

  if (existingUser) {
    throw new AppError(
      409,
      "Email or username is already registered",
    );
  }

  const passwordHash = await argon2.hash(input.password, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });

  return User.create({
    username: input.username,
    email: input.email,
    passwordHash,
    role: "user",
    status: "active",
  });
}

export async function loginUser(input: LoginInput) {
  const user = await User.findOne({
    email: input.email,
  }).select("+passwordHash");

  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  const validPassword = await argon2.verify(
    user.passwordHash,
    input.password,
  );

  if (!validPassword) {
    throw new AppError(401, "Invalid email or password");
  }

  if (user.status !== "active") {
    throw new AppError(403, "Account is banned");
  }

  return user;
}
