import { Schema, model } from 'mongoose'

const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    avatar: { type: String, default: null },
    bio: { type: String, default: '' },
    role: { type: String, enum: ['user', 'super_admin'], default: 'user' },
    status: {
      type: String,
      enum: ['active', 'suspended', 'banned'],
      default: 'active',
    },
  },
  { timestamps: true, collection: 'users' },
)

userSchema.index({ role: 1 })
userSchema.index({ status: 1 })

export const User = model('User', userSchema)
