import { Schema, model } from 'mongoose'

const adminAuditLogSchema = new Schema(
  {
    admin: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    targetType: {
      type: String,
      enum: ['user', 'post', 'comment', 'community'],
      required: true,
    },
    targetId: { type: Schema.Types.ObjectId, required: true },
    details: { type: Schema.Types.Mixed, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: 'admin_audit_logs' },
)

adminAuditLogSchema.index({ admin: 1, createdAt: 1 })
adminAuditLogSchema.index({ targetType: 1, targetId: 1 })

export const AdminAuditLog = model('AdminAuditLog', adminAuditLogSchema)
