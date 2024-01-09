import mongoose, { Document, Schema, Model } from 'mongoose';

// Interface for the Journal document
interface IJournal extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  moments: mongoose.Schema.Types.ObjectId[];
}

// Interface for the Journal model
interface IJournalModel extends Model<IJournal> {}

// Define schema
const JournalSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  moments: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Moment',
    },
  ],
});

// Create and export model
const Journal: IJournalModel = mongoose.model<IJournal, IJournalModel>('Journal', JournalSchema);
export default Journal;
