import { useEffect } from 'react';

const ws = new WebSocket('ws://localhost:3000'); // Assuming WebSocket server is running on ws://localhost:3000

const WebSocketComponent = () => {
  
  useEffect(() => {
    ws.addEventListener('open', () => {
      // console.log('Connected to WebSocket server');
    });
    
    ws.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'updateTrending') {
        // console.log('Received trending data:', data.payload);
      }
    });

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div>
      {/* Your WebSocket related JSX can go here */}
    </div>
  );
}

export default WebSocketComponent;
