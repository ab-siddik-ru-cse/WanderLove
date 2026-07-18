import { Schema } from 'mongoose';
import { Mood } from '@/types';

// Activity is embedded inside Trip.days[].activities — this schema is
// exported standalone so it can be reused/tested and kept in one place.
export const ActivitySchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    lat: { type: Number },
    lng: { type: Number },
    time: { type: String, required: true },
    date: { type: Date, required: true },
    cost: { type: Number, required: true, default: 0, min: 0 },
    currency: { type: String, required: true, default: 'BDT' },
    notes: { type: String },
    image: { type: String },
    mood: { type: String, enum: Object.values(Mood) },
    category: { type: String, required: true, default: 'General' },
    isSurprise: { type: Boolean, default: false },
    paidBy: { type: Schema.Types.ObjectId, ref: 'User' },
    customFields: { type: Schema.Types.Mixed, default: {} },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);
