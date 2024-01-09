import mongoose, { Document, Schema } from 'mongoose';

export interface ICharacter extends Document {
  name: string;
  level?: number;
  userId: Schema.Types.ObjectId;
}

const CharacterSchema: Schema = new Schema({
  name: {
    type: String,
    required: true
  },
  level: {
    type: Number
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

export default mongoose.model<ICharacter>('Character', CharacterSchema);
