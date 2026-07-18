import mongoose, { Schema, type Document, type Model } from 'mongoose';
import { Visibility, ExpenseSplitRule } from '@/types';
import { ActivitySchema } from './Activity';

const JournalEntrySchema = new Schema(
  {
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    image: { type: String }
  },
  { timestamps: true }
);

const DaySchema = new Schema(
  {
    date: { type: Date, required: true },
    activities: { type: [ActivitySchema], default: [] }
  },
  { _id: true }
);

const PackingItemSchema = new Schema(
  {
    item: { type: String, required: true },
    isPacked: { type: Boolean, default: false }
  },
  { _id: false }
);

export interface ITripDocument extends Document {
  name: string;
  destination: string;
  country: string;
  startDate: Date;
  endDate: Date;
  timezone: string;
  currency: string;
  totalBudget: number;
  coverImage?: string;
  visibility: Visibility;
  createdBy: mongoose.Types.ObjectId;
  isInstant: boolean;
  collaborators: mongoose.Types.ObjectId[];
  days: mongoose.Types.DocumentArray<any>;
  sharedJournal: mongoose.Types.DocumentArray<any>;
  packingChecklist: { item: string; isPacked: boolean }[];
  expenseSplitRule: ExpenseSplitRule;
  createdAt: Date;
  updatedAt: Date;
}

const TripSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    timezone: { type: String, required: true, default: 'Asia/Dhaka' },
    currency: { type: String, required: true, default: 'BDT' },
    totalBudget: { type: Number, required: true, default: 0, min: 0 },
    coverImage: { type: String },
    visibility: {
      type: String,
      enum: Object.values(Visibility),
      default: Visibility.PARTNER
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isInstant: { type: Boolean, default: false },
    collaborators: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    days: { type: [DaySchema], default: [] },
    sharedJournal: { type: [JournalEntrySchema], default: [] },
    packingChecklist: { type: [PackingItemSchema], default: [] },
    expenseSplitRule: {
      type: String,
      enum: Object.values(ExpenseSplitRule),
      default: ExpenseSplitRule.HALF
    }
  },
  { timestamps: true }
);

TripSchema.index({ createdBy: 1 });
TripSchema.index({ collaborators: 1 });

export const Trip: Model<ITripDocument> =
  mongoose.models.Trip || mongoose.model<ITripDocument>('Trip', TripSchema);
