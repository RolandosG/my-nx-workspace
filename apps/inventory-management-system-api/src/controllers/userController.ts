import User from '../models/User';
import mongoose from 'mongoose';
import Moment from '../models/momentModel';
import { Request, Response } from 'express';
import crypto from 'crypto';
import sgMail from '@sendgrid/mail';

interface RequestWithUser extends Request {
  user: {
    id: string; // Add the id field
    // more user properties
  };
}
interface UserController {
  getUserProfile: (req: any, res: any) => Promise<void>; // you can be more specific with req and res types
  updateUserProfile: (req: Request, res: Response) => Promise<void>;
  deleteUserProfile: (req: Request, res: Response) => Promise<void>;
  getUserById: (req: any, res: any) => Promise<void>;
  requestPasswordReset: (req: Request, res: Response) => Promise<void>;
  resetPassword: (req: Request, res: Response) => Promise<void>;
  searchUsers: (req: Request, res: Response) => Promise<void>;
  changePassword: (req: Request, res: Response) => Promise<void>;
  // add more methods here
}

const userController: UserController = {
  getUserProfile: async (req, res) => {
    const userId = req.params.userId;
    const username = req.query.username;

    try {
      let user;
      
      // Fetch by userId if provided
      if (userId) {
        user = await User.findById(userId).select('-password'); // Exclude password field
      }
      
      // Otherwise, fetch by username if provided
      else if (username) {
        user = await User.findOne({ username: username }).select('-password');
      }

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  updateUserProfile: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.userId;
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
  
      // Update user fields
      if (req.body.username) user.username = req.body.username;
      if (req.body.email) user.email = req.body.email;
      if (req.body.profilePrivacy !== undefined) user.profilePrivacy = req.body.profilePrivacy;
  
      await user.save();
      res.status(200).json({ message: 'User profile updated successfully', user: user.toObject({ getters: true }) });
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ message: 'Error updating user profile' });
    }
  },
  requestPasswordReset: async (req: Request, res: Response): Promise<void> => {
    const sendPasswordResetEmail = async (email: string, token: string) => {
      try {
        const resetUrl = `http://localhost:4200/reset-password/${token}`; // Correct URL format
        const msg = {
          to: email,
          from: 'mindwaveworks@gmail.com', // Replace with your verified SendGrid email
          subject: 'Password Reset Request',
          text: `Please click the link to reset your password: ${resetUrl}`,
          html: `<strong>Please click the link to reset your password: <a href="${resetUrl}">${resetUrl}</a></strong>`,
        };
        await sgMail.send(msg);
        console.log('Email sent successfully');
        return true;
      } catch (error) {
        console.error('Error sending password reset email:', error);
        return false;
      }
    };
  
    const { email } = req.body;
    const user = await User.findOne({ email });
  
    if (!user) {
      res.status(404).send("User not found");
      return; // Just return, don't pass the res object
    }
  
    const token = crypto.randomBytes(20).toString('hex'); // Secure token generation
    user.passwordResetToken = token;
    user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour in the future
  
    await user.save();
  
    const emailSent = await sendPasswordResetEmail(user.email, token);
    if (emailSent) {
      res.send("Password reset email sent.");
    } else {
      res.status(500).send("Failed to send password reset email.");
    }
  },

  resetPassword: async (req: Request, res: Response): Promise<void> => {
    const { token, newPassword } = req.body;
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });
  
    if (!user) {
      res.status(400).send("Password reset token is invalid or has expired.");
      return; // Ensure that the function exits here
    }
  
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
  
    await user.save();
  
    res.send("Your password has been successfully reset.");
    // Do not return anything here
  },
  changePassword: async (req: RequestWithUser, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        console.log("UserID is: ", userId);
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const user = await User.findById(userId);

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Update user password
        if (req.body.newPassword) {
            user.password = req.body.newPassword;
            await user.save();
            res.status(200).json({ success: true, message: 'Password changed successfully' });
        } else {
            res.status(400).json({ success: false, message: 'New password is required' });
        }
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ success: false, message: 'Error changing password' });
    }
},
  deleteUserProfile: async (req: Request, res: Response) => {
    const userId = req.params.userId;
    let session;

    try {
      session = await mongoose.startSession();
      session.startTransaction();

      const userDeleteResult = await User.deleteOne({ _id: userId }).session(session);
      if (userDeleteResult.deletedCount === 0) {
        throw new Error('User not found');
      }

      await Moment.deleteMany({ userId: userId }).session(session);

      // Additional related data deletion goes here

      await session.commitTransaction();
      res.status(200).json({ message: 'User and all related data deleted successfully' });
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    } finally {
      if (session) {
        session.endSession();
      }
    }
  },
  getUserById: async (req, res) => {
    try {
      const user = await User.findOne({ username: req.params.username }).exec();
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ _id: user._id });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred' });
    }
  }, 
  searchUsers: async (req: Request, res: Response): Promise<void> => {
    try {
      const searchTerm = req.query.q as string;
      if (!searchTerm) {
        res.status(400).json({ message: 'Search term is required' });
        return;
      }

      const regex = new RegExp(searchTerm, 'i'); // Case-insensitive regex
      const users = await User.find({ username: regex }).select('-password'); // Exclude password
      res.json(users);
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  // add more methods here
};

// Add other controller methods like updateUserProfile, deleteUserProfile, etc.

export default userController;
