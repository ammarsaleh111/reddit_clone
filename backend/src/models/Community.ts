import { Schema, model } from 'mongoose'

const communitySchema = new Schema(
  {
    name: { type: String, required: true },
    normalizedName: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    icon: { type: String, default: null },
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true, collection: 'communities' },
)

communitySchema.index({ creator: 1 })
communitySchema.index({ createdAt: 1 })

export const Community = model('Community', communitySchema)
