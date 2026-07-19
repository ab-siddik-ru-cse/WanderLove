import mongoose, { Schema, type Document, type Model } from 'mongoose';
import { ExpenseSplitRule } from '@/types';

export interface IUserDocument extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string | null;
  coverImage?: string | null;
  bio?: string | null;
  partnerId?: mongoose.Types.ObjectId | null;
  partnerLinkCode?: string | null;
  preferences: {
    theme: { primary: string; secondary: string; font: string };
    defaultCurrency: string;
    customCategories: string[];
    customActivityFields: { fieldName: string; fieldType: 'text' | 'number' | 'date' }[];
    packingTemplates: { name: string; items: string[] }[];
    defaultSplitRule: ExpenseSplitRule;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CustomFieldSchema = new Schema(
  {
    fieldName: { type: String, required: true },
    fieldType: { type: String, enum: ['text', 'number', 'date'], required: true }
  },
  { _id: false }
);

const PackingTemplateSchema = new Schema(
  {
    name: { type: String, required: true },
    items: { type: [String], default: [] }
  },
  { _id: false }
);

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    avatar: { type: String, default: null },
    coverImage: { type: String, default: null },
    bio: { type: String, default: null, maxlength: 280 },
    partnerId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    partnerLinkCode: { type: String, default: null, index: true },
    preferences: {
      theme: {
        primary: { type: String, default: '#E85D75' },
        secondary: { type: String, default: '#6C63FF' },
        font: { type: String, default: 'poppins' }
      },
      defaultCurrency: { type: String, default: 'BDT' },
      customCategories: { type: [String], default: ['Romantic', 'Adventure', 'Food', 'Shopping'] },
      customActivityFields: { type: [CustomFieldSchema], default: [] },
      packingTemplates: { type: [PackingTemplateSchema], default: [] },
      defaultSplitRule: {
        type: String,
        enum: Object.values(ExpenseSplitRule),
        default: ExpenseSplitRule.HALF
      }
    }
  },
  { timestamps: true }
);

export const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
