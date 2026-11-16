import { Schema, model } from 'mongoose'

const userFollowSchema = new Schema(
  {
    follower: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    following: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: 'user_follows' },
)

userFollowSchema.index({ follower: 1, following: 1 }, { unique: true })
userFollowSchema.index({ follower: 1 })
userFollowSchema.index({ following: 1 })

export const UserFollow = model('UserFollow', userFollowSchema)
