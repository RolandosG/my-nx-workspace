import mongoose from 'mongoose';
import  MomentModel from '../models/momentModel';

import dotenv from 'dotenv';
dotenv.config();

export const initDB = async () => {

    const mongoUrl = process.env.mongoUrl;
    if (!mongoUrl) {
      throw new Error("MongoDB URL missing in environment variables");
    }
  
    let retries = 5;
    while (retries) {
      try {
        await mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true } as any);
        console.log('Connected to MongoDB');
        break;  // Add this line to break out of the while loop upon successful connection
      } catch (error) {
        retries -= 1;
        console.log('Database connection failed, retrying in 5 seconds...', error);
        await new Promise(res => setTimeout(res, 5000));
      }
    }
    const moodChangeStream = MomentModel.watch();
    moodChangeStream.on('change', async (change) => {
        // You can choose to filter by operation type (insert, update, etc.)
        if (change.operationType === 'insert' || change.operationType === 'update') {
          // Recalculate aggregated mood data
          // Then broadcast this data through WebSocket
        }
      });
  };
