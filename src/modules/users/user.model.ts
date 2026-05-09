import mongoose, { Document, Schema } from 'mongoose';
import { Role } from '@/shared/types';

/**
 * Mongoose model — use this when MongoDB is your primary database.
 * If you are using PostgreSQL (TypeORM), delete this file and user.entity.ts stays.
 */
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: Role;
  googleId?: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 255,
    },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(Role), default: Role.USER },
    googleId: { type: String, unique: true, sparse: true },
    refreshToken: { type: String, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret['password'];
        delete ret['refreshToken'];
        return ret;
      },
    },
  },
);

userSchema.index({ email: 1 });

export const UserModel = mongoose.model<IUser>('User', userSchema);
