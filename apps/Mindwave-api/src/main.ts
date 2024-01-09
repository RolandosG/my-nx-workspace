import express, { Express } from 'express';
import http from 'http';
import cors from 'cors';
import passport from 'passport';
import createAuthRoutes from './routes/authRoutes';
// Route imports
import createItemRoutes from './routes/itemRoutes';
import characterRoutes from './routes/characterRoutes';
import createMomentRoutes from './routes/momentRoutes';
import followRoutes from './routes/followsRoutes';
import userRoutes from './routes/userRoutes';

// util imports
// initializer imports
import { initDB } from './initializers/initDB';
import { initPassport } from './initializers/initPassPort';
import { initWebSocket } from './initializers/initWebSocket';
import { broadcastTrendingData } from './initializers/initWebSocket';

import dotenv from 'dotenv';
dotenv.config();

const app: Express = express();
const server = http.createServer(app);


const initApp = async () => {
  try {
    
    // Connect to MongoDB first
    await initDB();
    await initPassport();
    initWebSocket(server);

    // Middleware setup
    app.use(passport.initialize());
    app.use(express.json());
    app.use(cors({
      origin: process.env.CORS_ORIGIN
    }));

    // Initialize routes
    try {
      // Initialize routes
      app.use('/items', createItemRoutes());
      app.use('/characters', characterRoutes);
      app.use('/moments', createMomentRoutes());
      app.use('/api/follow', followRoutes);
      app.use('/api/users', userRoutes);
      app.use('/api/user', userRoutes);
      app.use('/auth', createAuthRoutes());
      
    } catch (error) {
      console.error('Failed to initialize routes:', error);
    }

    
    // Start server
    const host: string = process.env.HOST ?? 'localhost';
    const port: number = process.env.PORT ? Number(process.env.PORT) : 3000;

    server.listen(port, host, () => {
      console.log(`[ ready ] HTTP server running at http://${host}:${port}`);
      console.log(`[ ready ] WebSocket server running at ws://${host}:${port}`);
    });

  } catch (error) {
    console.error('Initialization failed:', error);
  }
  setInterval(broadcastTrendingData, 60000);
};

initApp();
