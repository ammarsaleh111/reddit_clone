import { Schema, model } from 'mongoose'

const commentSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    parent: { type: Schema.Types.ObjectId, ref: 'Comment', default: null },
    content: { type: String, required: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: 'comments' },
)

commentSchema.index({ post: 1, parent: 1, createdAt: 1 })
commentSchema.index({ author: 1, createdAt: 1 })
commentSchema.index({ parent: 1 })

export const Comment = model('Comment', commentSchema)
