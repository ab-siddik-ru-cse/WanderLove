import { Schema } from 'mongoose';

// Journal entries live embedded inside Trip.sharedJournal.
// Exported standalone here (per project structure) so it can be
// imported/tested independently of the Trip model.
export const JournalEntrySchema = new Schema(
  {
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    image: { type: String }
  },
  { timestamps: true }
);
