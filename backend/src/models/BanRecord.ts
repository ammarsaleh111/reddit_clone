import { Schema, model } from 'mongoose'

const banRecordSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    admin: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
    type: {
      type: String,
      enum: ['suspension', 'temporary_ban', 'permanent_ban'],
      required: true,
    },
    expiresAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: 'ban_records' },
)

banRecordSchema.index({ user: 1, createdAt: 1 })
banRecordSchema.index({ admin: 1, createdAt: 1 })

export const BanRecord = model('BanRecord', banRecordSchema)
