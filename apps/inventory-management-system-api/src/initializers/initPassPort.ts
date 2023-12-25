import passport from 'passport';
import initializePassport from '../config/passport-config';

export const initPassport = async () => {
  try {
    await initializePassport(passport);
    console.log('Passport Initialized');
  } catch (error) {
    console.error('Failed to initialize Passport:', error);
  }
};
