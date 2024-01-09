import { Request, Response, NextFunction } from 'express';
import UserModel, { IUser } from '../models/User'; // import your IUser interface

interface RequestWithUser extends Request {
  user?: {
    id: string;
    // add other properties as required
  };
}

export const checkUserConsent = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const user = await UserModel.findById(req.user?.id) as IUser;  // casting as IUser

  if (!user?.hasConsentedToLocation) {
    return res.status(403).json({ message: 'User has not consented to location tracking' });
  }
  
  next();
};
