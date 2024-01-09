import Follow from '../models/followsModel';
import User from '../models/User';

export const followUser = async (req, res) => {
  console.log(req.body);
  const { followerId, followeeId } = req.body;

  if (followerId === followeeId) {
      return res.status(400).json({ error: 'Users cannot follow themselves' });
  }

  try {
      const existingFollow = await Follow.findOne({
          follower_id: followerId,
          followee_id: followeeId,
      });

      if (existingFollow) {
          return res.status(409).json({ message: 'Already following' });
      }

      const follow = new Follow({
          follower_id: followerId,
          followee_id: followeeId,
      });
      if (followerId === followeeId) {
        return res.status(400).json({ error: 'Users cannot follow themselves' });
      }
      await follow.save();
      await User.findByIdAndUpdate(followerId, { $addToSet: { following: followeeId } });
      res.status(200).json({ message: 'Followed successfully' });
  } catch (error) {
      res.status(500).json({ error: 'An error occurred while following' });
  }
};

export const unfollowUser = async (req, res) => {
  const { followerId, followeeId } = req.body;

  try {
      const follow = await Follow.findOneAndDelete({
          follower_id: followerId,
          followee_id: followeeId,
      });

      if (!follow) {
          return res.status(404).json({ message: 'Follow relationship does not exist' });
      }
      await User.findByIdAndUpdate(followerId, { $pull: { following: followeeId } });
      res.status(200).json({ message: 'Unfollowed successfully' });
  } catch (error) {
      res.status(500).json({ error: 'An error occurred while unfollowing' });
  }
};

export const getFollowers = async (req, res) => {
    const { userId } = req.params;
  
    try {
      const followers = await Follow.find({ followee_id: userId });
  
      res.status(200).json({ followers });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred' });
    }
};

export const getFollowing = async (req, res) => {
  const { userId } = req.params;

  try {
    const following = await Follow.find({ follower_id: userId })
                                  .populate('followee_id', 'username -_id'); // Only include the username

    res.status(200).json({ following });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
};

export const isFollowing = async (req, res) => {
    const { followerId, followeeId } = req.query;
  
    try {
      const follow = await Follow.findOne({ follower_id: followerId, followee_id: followeeId });
  
      const isFollowing = follow != null;
  
      res.status(200).json({ isFollowing });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred' });
    }
};