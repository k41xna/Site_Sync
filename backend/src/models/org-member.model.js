import mongoose from 'mongoose';
import { Roles } from '../enums/role.enum.js';

const orgMemberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required']
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: {
        values: Object.values(Roles),
        message: 'Role must be OWNER, SITE_MANAGER, or BILLING'
      }
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }
);

// Enforce compound unique constraint so users can't be registered in the same org twice
orgMemberSchema.index({ userId: 1, orgId: 1 }, { unique: true });

const OrgMember = mongoose.model('OrgMember', orgMemberSchema);

export default OrgMember;
