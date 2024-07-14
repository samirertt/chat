import express, { Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();  // Initialize Express application
const server = http.createServer(app);  // Create HTTP server using Express app
const io = new Server(server, {  // Initialize Socket.IO server
  cors: {
    origin: '*',
  },
});

app.use(cors());  // Enable CORS for all routes in Express

// Route to check if server is running
app.get('/', (req: Request, res: Response) => {
  res.send('Socket.IO Server is running');
});

// Socket.IO event listeners
io.on('connection', (socket) => {
  console.log('a user connected');

  // Listen for 'send_message' event from client
  socket.on('send_message', (message) => {
    // Broadcast 'message' event to all clients
    io.emit('message', message);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const PORT = process.env.PORT || 5000;  // Define port number from environment variable or default to 5000
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
