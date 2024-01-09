import { Request, Response } from 'express';
import MomentModel from '../models/momentModel';
import User from '../models/User';
import { broadcastMoodData } from '../initializers/initWebSocket';
import mongoose, { Document, Schema } from 'mongoose';
import geoip from 'geoip-lite';
import { broadcastLikeUpdates } from '../initializers/initWebSocket'; 
import UserModel from '../models/User';
import { IUser } from '../models/User';

interface RequestWithUser extends Request {
    user: {
      id: string; // Add the id field
      // more user properties
    };
  }
  interface PopulatedFollowingUser {
    _id: mongoose.Types.ObjectId;
    username: string;
    // Add other user fields as necessary
}

  export const getMomentById = async (req: RequestWithUser, res: Response) => {
    try {
      const momentId = req.params.id;
      const moment = await MomentModel.findById(momentId).populate('userId', 'username');
  
      if (!moment) {
        return res.status(404).json({ message: 'Moment not found' });
      }
  
      res.status(200).json({ moment });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };
  export const captureMoment = async (req: RequestWithUser, res: Response) => {
    try {
      const userId = req.user?.id;
      const user = await UserModel.findById(userId);
      
      const { momentDescription, emotionTag, moodScore, gifUrl } = req.body;
      
      const location = {
        country: user?.selectedCountry, // Add country from user model
        state: "", // You can populate these from somewhere else or keep as empty
        city: ""
      };

      // Validate momentDescription
      if (!momentDescription) {
        return res.status(400).json({ message: "momentDescription is required" });
      }

      // Validate gifUrl (You might want to write a more robust URL validation logic)
      const urlRegex = /^(https?|chrome):\/\/[^\s$.?#].[^\s]*$/gm;
      if (gifUrl && !urlRegex.test(gifUrl)) {
          return res.status(400).json({ message: "gifUrl is not a valid URL" });
      }

      const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const geo = geoip.lookup(ip);
  
      const lastGlobalPost = await MomentModel.findOne({ 
        userId: userId, 
        postType: 'global' 
      }).sort({ timestamp: -1 });
  
      let postType = 'normal';
      if (!lastGlobalPost || (Date.now() - new Date(lastGlobalPost.timestamp).getTime() > 5 * 60 * 60 * 1000)) {
        postType = 'global';
      }
  
      const newMoment = new MomentModel({
      momentDescription,
      emotionTag,
      moodScore,
      userId,
      location, // include the location object here
      gifUrl,
      postType, // or 'global', or as per the request body
    });
  
      await newMoment.save();
      broadcastMoodData(newMoment);
      res.status(201).json({ message: 'Moment captured successfully', moment: newMoment });
    } catch (error) {
      console.error("Error:", error); // Detailed logging here
      res.status(500).json({ message: 'Server error', error });
    }
  };
// Get a random moment
export const getRandomMoments = async (req: RequestWithUser, res: Response) => {
  console.log("Inside getRandomMoments");
  try {
    const userId = req.user?.id;
    const excludedIds = req.query.excludedIds ? JSON.parse(req.query.excludedIds as string) : [];

    const randomMoments = await MomentModel.aggregate([
      { $match: { userId: { $ne: userId }, _id: { $nin: excludedIds } } },
      { $sample: { size: 15 } }
    ]);

    if (!randomMoments.length) {
      return res.status(404).json({ message: 'No more moments found' });
    }
    await MomentModel.populate(randomMoments, { path: 'userId', select: 'username' });
    res.status(200).json(randomMoments);
  } catch (error) {
    res.status(500).json({ message: 'An error occurred', error });
  }
};
// Get moments by a specific user
// Get moments by a specific user
export const getMyMoments = async (req: RequestWithUser, res: Response) => {
  try {
    const userId = req.params.userId;
    const loggedInUserId = req.user?.id; // Get the ID of the logged-in user
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = parseInt(req.query.skip as string) || 0;

    let moments = await MomentModel.find({ userId })
                            .limit(limit)
                            .skip(skip)
                            .sort({ createdAt: -1 })
                            .populate('userId', 'username')  // Populating username
                            .exec();

    if (!moments.length) {
      return res.status(404).json({ message: 'No moments found for this user' });
    }

    // Add the likedByUser field to each moment
    // moments = moments.map(moment => {
    //   return {
    //     ...(moment as any)._doc,
    //     likedByUser: moment.likedBy.map(id => id.toString()).includes(loggedInUserId.toString()),
    //   };
    // });
    moments = moments.map(moment => {
      return {
        ...(moment as any)._doc,
        likedByUser: moment.likedBy.some(like => like.userId.toString() === loggedInUserId.toString()),
      };
    });

    res.status(200).json({ moments });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

  // trending moment
  export const fetchTrendingEmotionsFromDB = async (timeframe = 'daily') => {
    // determine the time interval in milliseconds based on the timeframe
    let interval = 24 * 60 * 60 * 1000; // for 'daily'
    if (timeframe === 'weekly') interval = 7 * 24 * 60 * 60 * 1000;
    else if (timeframe === 'monthly') interval = 30 * 24 * 60 * 60 * 1000;
  
    const pastTime = new Date(Date.now() - interval);
    const trendingEmotions = await MomentModel.aggregate([
      { $match: { timestamp: { $gte: pastTime } } },
      { $group: { _id: '$emotionTag', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);
  
    return trendingEmotions;
  };
  export const getTrendingMoments = async (req, res) => {
    try {
      const timeframe = req.query.timeframe || 'daily';
      const trendingEmotions = await fetchTrendingEmotionsFromDB(timeframe);
      res.status(200).json({ trendingEmotions });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };
  export const getTrendingMomentsByLikes = async (req: Request, res: Response) => {
    try {
      // Assuming you want to get the top 10 trending moments
      const trendingMoments = await MomentModel.find({})
                                              .sort({ likesCount: -1 })
                                              .limit(10)
                                              .populate('userId', 'username')
                                              .exec();
  
      if (!trendingMoments.length) {
        return res.status(404).json({ message: 'No trending moments found' });
      }
  
      res.status(200).json({ trendingMoments });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };

  export const fetchMostLikedMomentsFromDB = async (timeframe = 'daily') => {
    let interval = 24 * 60 * 60 * 1000; // for 'daily'
    if (timeframe === 'weekly') interval = 7 * 24 * 60 * 60 * 1000;
    else if (timeframe === 'monthly') interval = 30 * 24 * 60 * 60 * 1000;
    else if (timeframe === 'yearly') interval = 365 * 24 * 60 * 60 * 1000;

    const pastTime = new Date(Date.now() - interval);

    const mostLikedMoments = await MomentModel.aggregate([
      {
          $unwind: '$likedBy'  // Deconstructs likedBy array
      },
      {
          $match: {
              'likedBy.timestamp': { $gte: pastTime }
          }
      },
      {
          $lookup: {
              from: 'users',  // assuming this is the name of your User collection
              localField: 'userId',
              foreignField: '_id',
              as: 'userDetails'
          }
      },
      {
          $unwind: '$userDetails' // since $lookup produces an array output
      },
      {
          $group: {
              _id: '$_id',
              momentDescription: { $first: '$momentDescription' },
              emotionTag: { $first: '$emotionTag' },
              moodScore: { $first: '$moodScore' },
              userId: { $first: '$userId' },
              location: { $first: '$location' },
              timestamp: { $first: '$timestamp' },
              likedBy: { $push: '$likedBy' },
              username: { $first: '$userDetails.username' },
              likes: { $sum: 1 }
          }
      },
      {
          $match: {
              likes: { $gt: 0 }  // Ensure we only consider moments with positive like counts
          }
      },
      {
          $sort: { likes: -1 }
      },
      {
          $limit: 10
      }
  ]);

    return { mostLikedMoments, interval };
};
export const getMostLikedMoments = async (req: Request, res: Response) => {
  try {
      const timeframe = req.query.timeframe as string || 'daily'; // Cast req.query.timeframe to string to ensure type correctness
      const { mostLikedMoments, interval } = await fetchMostLikedMomentsFromDB(timeframe);

      if (!mostLikedMoments.length) {
        return res.status(200).json({
          mostLikedMoments: [],
          message: 'No liked moments found for the given timeframe'
        });
      }

      res.status(200).json({ mostLikedMoments });
  } catch (error) {
      res.status(500).json({ message: 'Server error', error });
  }
};
  export const toggleLike = async (req: RequestWithUser, res: Response) => {
    try {
      const userId = req.user?.id as string;
      const momentId = req.params.momentId;
  
      // Find User and Moment
      const [user, moment] = await Promise.all([
        User.findById(userId),
        MomentModel.findById(momentId)
      ]);
  
      if (!user || !moment) {
        return res.status(404).json({ message: 'User or Moment not found' });
      }
  
      // Check if User already liked the Moment
      const userLikedIndex = user.likedMoments.indexOf(moment._id);
      const momentLikedIndex = moment.likedBy.findIndex(like => (like.userId as mongoose.Types.ObjectId).equals(user._id));

  
      if (userLikedIndex === -1 && momentLikedIndex === -1) {
        // User has not liked the Moment yet, so Like it
        user.likedMoments.push(moment._id);
        moment.likedBy.push({ userId: user._id, timestamp: new Date() });
        //moment.likesCount++;
        await MomentModel.findByIdAndUpdate(momentId, { $inc: { likesCount: 1 } });
      
      } else {
        // User has already liked the Moment, so Unlike it
        user.likedMoments.splice(userLikedIndex, 1);
        moment.likedBy.splice(momentLikedIndex, 1);
        //moment.likesCount--;
        await MomentModel.findByIdAndUpdate(momentId, { $inc: { likesCount: -1 } });
    
      }
      const updatedMoment = await MomentModel.findById(momentId);

      // Save changes
      await Promise.all([user.save(), moment.save()]);
      broadcastLikeUpdates(momentId, moment.likesCount);
      res.status(200).json({ message: 'Like status updated', likesCount: updatedMoment.likesCount, likedMoments: user.likedMoments });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };

  export const getLikedMoments = async (req: RequestWithUser, res: Response) => {
    try {
        const loggedInUserId = req.user?.id;

        const user = await User.findById(loggedInUserId).populate('likedMoments');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Transform the liked moments
        const likedMoments = user.likedMoments.map(momentDoc => {
            if (momentDoc instanceof mongoose.Document) {
                const moment = momentDoc.toObject();
                const likedByUser = moment.likedBy.some(like => like.userId.toString() === loggedInUserId);
                return {
                    ...moment,
                    likedByUser: likedByUser
                };
            } else {
                return momentDoc; // or handle this case appropriately
            }
        });

        res.status(200).json({ likedMoments });
    } catch (error) {
        console.error("Error in getLikedMoments:", error);
        res.status(500).json({ message: 'Server error', error });
    }
};
  export const getLastGlobalPostTime = async (req: RequestWithUser, res: Response) => {
    try {
      const userId = req.user?.id;
      console.log("User ID:", userId);
      const lastGlobalPost = await MomentModel.findOne({
        userId: userId,
        postType: 'global'
      }).sort({ timestamp: -1 });
  
      console.log("Last Global Post:", lastGlobalPost);
      if (lastGlobalPost) {
        console.log("Sending response:", { timestamp: lastGlobalPost.timestamp });
        return res.status(200).json({ timestamp: lastGlobalPost.timestamp });
        
      } else {
        console.log("Sending response:", { message: 'No global posts found for this user' });
        return res.status(404).json({ message: 'No global posts found for this user' });
      }
    } catch (error) {
      console.log("Sending response:", { message: 'Server error', error });
      return res.status(500).json({ message: 'Server error', error });
    }
  };


export const getFollowingMoments = async (req, res) => {
  try {
      const userId = req.params.userId;
      const lastId = req.query.lastId; // Get the lastId from the query parameters

      // Fetch the user with populated following field
      const user = await User.findById(userId).populate({
          path: 'following',
          model: 'User'
      });

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      let momentsData = [];
      for (const followee of user.following) {
          let query = MomentModel.find({ userId: followee._id });
          
          // If lastId is provided, adjust the query to fetch moments after the lastId
          if (lastId) {
              query = query.where('_id').gt(lastId);
          }

          const followeeMoments = await query.populate('userId', 'username').exec();
          momentsData = [...momentsData, ...followeeMoments];
      }

      // Sort moments by timestamp
      momentsData.sort((a, b) => b.timestamp - a.timestamp);

      res.status(200).json(momentsData);
  } catch (error) {
      console.error("Error in getFollowingMoments:", error);
      res.status(500).json({ message: 'Server error', error });
  }
};