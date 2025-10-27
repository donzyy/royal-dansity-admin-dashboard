import mongoose, { Document, Schema } from 'mongoose';

export interface IPermission extends Document {
  name: string;
  slug: string;
  description: string;
  category: 'dashboard' | 'users' | 'content' | 'analytics' | 'settings';
  createdAt: Date;
}

const PermissionSchema: Schema<IPermission> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Permission name is required'],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ['dashboard', 'users', 'content', 'analytics', 'settings'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Permission = mongoose.model<IPermission>('Permission', PermissionSchema);
export default Permission;


