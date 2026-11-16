import { Schema, model } from 'mongoose'

const voteSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['post', 'comment'], required: true },
    target: { type: Schema.Types.ObjectId, required: true },
    value: { type: Number, enum: [1, -1], required: true },
  },
  { timestamps: true, collection: 'votes' },
)

voteSchema.index({ user: 1, targetType: 1, target: 1 }, { unique: true })
voteSchema.index({ targetType: 1, target: 1 })

export const Vote = model('Vote', voteSchema)
