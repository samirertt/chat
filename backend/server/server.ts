import express, { Request, Response } from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import axios from 'axios';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

app.use(cors());
app.use(express.json()); // To parse JSON bodies

// Store user language preferences and room memberships
const userLanguages = new Map<string, string>(); // { socketId: language }
const roomUsers = new Map<string, Set<string>>(); // { roomId: Set<socketId> }

// Route to check if server is running
app.get('/', (req: Request, res: Response) => {
  res.send('Socket.IO Server is running');
});

// Helper function to translate text
const translateText = async (text: string, language: string) => {
  try {
    const response = await axios.post('http://localhost:8000/text_translate/', {
      text,
      language,
    });
    return response.data.translated_text;
  } catch (error) {
    console.error('Error translating text:', error);
    return text; // Fallback to original text if translation fails
  }
};

// Socket.IO event listeners
io.on('connection', (socket: Socket) => {
  console.log('A user connected:', socket.id);

  // Handle joining a chat room
  socket.on('join_room', (roomId: string) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);

    if (!roomUsers.has(roomId)) {
      roomUsers.set(roomId, new Set());
    }
    roomUsers.get(roomId)?.add(socket.id);
  });

  // Handle leaving a chat room
  socket.on('leave_room', (roomId: string) => {
    socket.leave(roomId);
    console.log(`User ${socket.id} left room ${roomId}`);

    roomUsers.get(roomId)?.delete(socket.id);
    if (roomUsers.get(roomId)?.size === 0) {
      roomUsers.delete(roomId);
    }
  });

  // Handle setting language preference
  // NEEDS TO BE HANDLED PROPERLY
  socket.on('set_language', (language: string) => {
    if (language == "en-EN")
        language = "tr-TR"; 
    else
      language = "en-EN";
       
    userLanguages.set(socket.id, language);
    console.log(`User ${socket.id} set language to ${language}`);
  });

  // Handle sending messages
  socket.on('send_message', async ({ roomId, username, text }: { roomId: string, username: string, text: string }) => {
    console.log('Received message:', { roomId, username, text });

    // Get the list of all users in the room
    const roomUserSockets = roomUsers.get(roomId) || new Set();

    // Send the original message to all users in the room
    for (const clientId of roomUserSockets) {
      const clientLanguage = userLanguages.get(clientId) || 'en';
      const translatedText = await translateText(text, clientLanguage);
      io.to(clientId).emit('message', { username, text, translated_text: translatedText });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    userLanguages.delete(socket.id);

    roomUsers.forEach((users, roomId) => {
      if (users.has(socket.id)) {
        users.delete(socket.id);
        if (users.size === 0) {
          roomUsers.delete(roomId);
        }
      }
    });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
