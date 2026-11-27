
import mongoose, { Schema, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["user"],
      default: "user",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "suspended", "banned"],
      default: "active",
      required: true,
    },
    avatar: { type: String, default: null },
    bio: { type: String, default: "" },
  },
  { timestamps: true },
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });

export type UserDocument = InferSchemaType<typeof userSchema>;
export const User = mongoose.model("User", userSchema);
