import { Schema, model } from 'mongoose'

const postSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    community: {
      type: Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
    },
    title: { type: String, required: true },
    type: { type: String, enum: ['text', 'link'], required: true },
    body: { type: String, default: null },
    url: { type: String, default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: 'posts' },
)

postSchema.index({ author: 1, createdAt: 1 })
postSchema.index({ community: 1, createdAt: 1 })
postSchema.index({ createdAt: 1 })

export const Post = model('Post', postSchema)
