import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface ITemplateDocument extends Document {
  mood: string; // 'romantic' | 'adventure' | 'relax'
  destinationType: string; // 'beach' | 'mountain' | 'city'
  activities: {
    title: string;
    location: string;
    time: string;
    cost: number;
    category: string;
  }[];
}

const TemplateActivitySchema = new Schema(
  {
    title: { type: String, required: true },
    location: { type: String, required: true },
    time: { type: String, required: true },
    cost: { type: Number, required: true, default: 0 },
    category: { type: String, required: true, default: 'General' }
  },
  { _id: false }
);

const TemplateSchema = new Schema<ITemplateDocument>({
  mood: { type: String, required: true, index: true },
  destinationType: { type: String, required: true, index: true },
  activities: { type: [TemplateActivitySchema], default: [] }
});

export const Template: Model<ITemplateDocument> =
  mongoose.models.Template || mongoose.model<ITemplateDocument>('Template', TemplateSchema);
