import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User';
import { validateUser } from '../utils/userValidation';
import sgMail from '@sendgrid/mail';
import Journal from '../models/UserJournalModel';

//const wss = new WebSocket.Server({ server });
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
console.log('SendGrid API Key:', process.env.SENDGRID_API_KEY); // Debugging
const jwtSecret = process.env.jwtSecret;

export default function createAuthRoutes() {
console.log("Creating auth routes");
  const router = express.Router();
  const sendVerificationEmail = async (email: string, token: string) => {
    try {
      const msg = {
        to: email,
        from: 'mindwaveworks@gmail.com', // Make sure to replace this with your own domain
        subject: 'Please verify your email',
        text: `Click on this link to verify your email: http://localhost:3000/auth/verify-email?token=${token}`,
        html: `<strong>Click on this link to verify your email: http://localhost:3000/auth/verify-email?token=${token}</strong>`,
      };
      await sgMail.send(msg);
      return true;
    } catch (error) {//
      console.error('Email could not be sent:', error);
      return false;
    }
  };
  async function findUserByVerificationToken(token: string) {
    try {
      const user = await User.findOne({ emailVerificationToken: token });
      return user;
    } catch (error) {
      console.error("Error finding user by verification token:", error);
      return null;
    }
  }
  
  router.post('/login', async (req: Request, res: Response) => {
    console.log('Received request body:', req.body);
      try {
        
        const { username, password } = req.body;
        console.log('Received request body: ', req.body);
        console.log("Received:", { username, password }); // Log the received username and password
    
        const user = await validateUser(req.body);  // This should return the user object if successful.
        
        console.log('User from DB:', user); // Log the user object received from the database
        
        if (user) {
          console.log('Validating:', username, password); // Log the validation attempt
          
          const payload = {
            id: user._id, // Assuming that your MongoDB gives an _id field
            username: user.username,
          };
    
          const token = jwt.sign(payload, jwtSecret, { expiresIn: 3600 });
          
          console.log('Token Generated:', token); // Log the generated token
    
          res.json({ success: true, token: 'Bearer ' + token, isEmailVerified: user.isEmailVerified });
        } else {
          console.log('Invalid credentials'); // Log the invalid credentials case
          res.status(401).send("Invalid credentials");
        }
      } catch (error) {
        console.error("Error in login:", error);
        res.status(500).send({ message: 'Internal Server Error' });
      }
  });

  router.post('/register', async (req: Request, res: Response) => {
    try {
        const { username, password, email, hasAgreedToTerms, selectedCountry, hasConsentedToLocation  } = req.body;
        if (!hasAgreedToTerms) {
          return res.status(400).json({ success: false, message: 'You must agree to the terms and conditions to register.' });
        }
        // Validate email
        if (!email.includes('@')) {
          return res.status(400).json({ success: false, message: 'Invalid email address' });
        }
    
        // Validate password
        if (password.length < 8) {
          return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
        }
    
        // Check if username or email already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
          return res.status(409).json({ success: false, message: 'User already exists' });
        }
        // Generate a verification token
        const emailVerificationToken = crypto.randomBytes(32).toString('hex');

        // Create new user
        const newUser = new User();
        newUser.username = username;
        newUser.email = email;
        newUser.password = password;
        newUser.emailVerificationToken = emailVerificationToken;
        newUser.isEmailVerified = false;
        newUser.accountStatus = 'active';
        newUser.hasAgreedToTerms = hasAgreedToTerms;
        newUser.termsAgreementDate = new Date(); 
        newUser.selectedCountry = selectedCountry;
        newUser.hasConsentedToLocation = hasConsentedToLocation;
        await newUser.save();
    
        // Create new journal for this user
        const newJournal = new Journal({
          userId: newUser._id,
          moments: []
        });
        await newJournal.save();
     // Send verification email
      const emailRes = await sendVerificationEmail(email, emailVerificationToken);
      if (emailRes) {
        res.status(201).json({ success: true, message: 'User and Journal registered successfully' });
      } else {
        // Handle email sending failure
      }
      } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
  });

  router.get('/verify-email', async (req, res) => {
    const token = req.query.token;
    
      if (typeof token !== 'string') {
        return res.status(400).send("Invalid verification token type.");
      }
      
      // Validate the token and find the associated user
      const user = await findUserByVerificationToken(token);
    
      if (user) {
        // Mark the user as verified
        user.isEmailVerified = true;
        await user.save();
        
        res.redirect(process.env.EMAIL_VERIFICATION_SUCCESS_URL);
      } else {
        res.status(400).send("Invalid verification token.");
      }
  });
  router.get('/users/:userId', async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      
      // Debugging line to print the userId
      console.log(`UserId is: ${userId}`);
      
      // Fetch user from MongoDB
      const user = await User.findById(userId);
    
      if (user) {
        res.json({ success: true, user });
      } else {
        res.status(404).json({ success: false, message: 'User not found' });
      }
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      console.error('Error name:', error.name); // More specific error name
      console.error('Error message:', error.message); // More specific error message
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  });
  router.post('/logout', (req, res) => {
    // Future implementation for server-side token invalidation can go here
  
    res.status(200).json({ success: true, message: 'Logout successful' });
  });
  return router;
}
