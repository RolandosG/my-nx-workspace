import mongoose, { Document, Schema } from 'mongoose';

export interface ILike {
  userId: mongoose.Types.ObjectId;
  timestamp: Date;
}

export interface IMoment extends Document {
  momentDescription: string;
  emotionTag: string;
  moodScore: number; 
  timestamp: Date;
  userId: Schema.Types.ObjectId;
  location: {
    country: string;
    state: string;
    city: string;
  };  
  likesCount: number;  
  likedBy: ILike[];
  gifUrl?: string;
  postType: 'global' | 'normal';
}

export const MomentSchema: Schema = new Schema({
  momentDescription: {
    type: String,
    required: true
  },
  emotionTag: {
    type: String,
    required: true
  },
  moodScore: { 
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {  
    type: {
      country: String,
      state: String,
      city: String
    },
    required: false 
  },
  likesCount: { 
    type: Number,
    default: 0
  },
  gifUrl: {
    type: String,
    validate: {
      validator: function(v: string) {
        // If it's empty, consider it valid
        if (!v) return true;
        return /^http:\/\/|^https:\/\/.+/i.test(v);
      },
      message: props => `${props.value} is not a valid URL`
    },
    required: false  // This makes the field optional
  },
  postType: {
    type: String,
    enum: ['global', 'normal'], // enum ensures only 'global' or 'normal' can be set
    required: true
  },
  likedBy: [{ 
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
  
});
MomentSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  const momentId = this._id;
  
  // Find all users that have this moment in their likedMoments and remove it
  await mongoose.model('User').updateMany(
    { likedMoments: momentId }, 
    { $pull: { likedMoments: momentId } }
  );

  next();
});
export default mongoose.model<IMoment>('Moment', MomentSchema);
