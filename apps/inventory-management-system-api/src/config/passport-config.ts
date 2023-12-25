import { PassportStatic } from 'passport';
import { Strategy as JwtStrategy, ExtractJwt, VerifiedCallback, StrategyOptions } from 'passport-jwt';
import User from '../models/User'; // Adjust the path to your User model
import { Document } from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
interface JwtPayload {
  id: string;
}

const opts: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.jwtSecret || 'fallback_secret_key',
};

export default (passport: PassportStatic): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      console.log('Initializing Passport...')
      passport.use(
        new JwtStrategy(opts, async (jwt_payload: JwtPayload, done: VerifiedCallback) => {
          try {
            // Log JWT Payload
            console.log("JWT Payload:", jwt_payload);

            const user = await User.findById(jwt_payload.id) as Document | null;

            // Log if user exists or not
            if (user) {
              console.log("User exists:", user);
              return done(null, user);
            } else {
              console.log("User not found. ID used was:", jwt_payload.id);
              return done(null, false);
            }
          } catch (err) {
            // Log any errors
            console.log("Error in Passport Strategy:", err);
            return done(err, false);
          }
        })
      );
      resolve();
    } catch (err) {
      reject(err);
    }
  });
};
