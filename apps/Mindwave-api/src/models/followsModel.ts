import mongoose from 'mongoose';

const followSchema = new mongoose.Schema({
  follower_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  followee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true,
});

const Follow = mongoose.model('Follow', followSchema);
export default Follow;