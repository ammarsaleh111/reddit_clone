import { Schema, model } from 'mongoose'

const communityMemberSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    community: {
      type: Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
    },
    joinedAt: { type: Date, default: Date.now },
  },
  { collection: 'community_members' },
)

communityMemberSchema.index({ user: 1, community: 1 }, { unique: true })
communityMemberSchema.index({ community: 1, joinedAt: 1 })
communityMemberSchema.index({ user: 1, joinedAt: 1 })

export const CommunityMember = model('CommunityMember', communityMemberSchema)
