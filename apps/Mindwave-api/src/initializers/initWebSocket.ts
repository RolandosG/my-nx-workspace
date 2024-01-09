import WebSocket from 'ws';
import { Server } from 'http';
import User from '../models/User';
import MomentModel from '../models/momentModel';
import { fetchTrendingEmotionsFromDB } from '../controllers/momentController'; 
// Declare wss at a broader scope
let wss: WebSocket.Server;

const fetchTrendingFromDatabase = async () => {
    try {
      const trendingEmotions = await fetchTrendingEmotionsFromDB('daily'); // or 'weekly', 'monthly'
      return trendingEmotions;
    } catch (error) {
      console.error("Could not fetch trending data:", error);
      return [];
    }
  };
export const broadcastLikeUpdates = (momentId: string, newLikesCount: number) => {
    const payload = {
      type: 'updateLikes',
      data: { momentId, newLikesCount }
    };
    
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(payload));
      }
    });
  };
export const broadcastTrendingData = async () => {
    const newTrendingData = await fetchTrendingFromDatabase(); // Fetch your updated trending data
    
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'updateTrending', data: newTrendingData }));
      }
    });
  };
  
export const initWebSocket = (server: Server) => {
  wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('New client connected');
    
    broadcastTrendingData(); // Or whatever data you initially want to send
    
    ws.on('message', async (message) => {  // Note the 'async'
      console.log(`Received message: ${message}`);
      if (typeof message === 'string') {
        const parsedMessage = JSON.parse(message);
      
      if (parsedMessage.type === 'like') {
        const { momentId, userId, action } = parsedMessage.data;  // Assuming you also send userId in the message
        // Your logic for updating likes in DB
        const [user, moment] = await Promise.all([
          User.findById(userId),
          MomentModel.findById(momentId)
        ]);

        if (user && moment) {
          // (Here, include the logic to toggle likes just like in your toggleLike function)
          // ... Update moment and user like status ...

          // Save changes
          await Promise.all([user.save(), moment.save()]);

          // Broadcast the updated like count to all connected WebSocket clients
          broadcastLikeUpdates(momentId, moment.likesCount);
        }
      }
    }
    });
  
    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  wss.on('error', (error) => {
    console.log(`WebSocket Error: ${error}`);
  });

  console.log('WebSocket Server Initialized');
};

export const broadcastMoodData = (data: unknown) => {
    // Check if wss has been initialized
    if (wss) {
        wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
        });
    } else {
        console.error('WebSocket server has not been initialized.');
    }
};
