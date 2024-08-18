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
app.use(express.json());

// Store user language preferences and room memberships
const userLanguages = new Map<string, string>(); // { socketId: language }
const roomUsers = new Map<string, Set<string>>(); // { roomId: Set<socketId> }

// Route to check if the server is running
app.get('/', (req: Request, res: Response) => {
  res.send('Socket.IO Server is running');
});

// Helper function to translate text
const translateText = async (text: string, language: string): Promise<string> => {
  try {
    const response = await axios.post('http://localhost:8000/text_translate/', {
      text,
      language,
    });
    return response.data.translated_text;
  } catch (error) {
    console.error('Error translating text:', error);
    return text; // Fallback to the original text if translation fails
  }
};

// Helper function to get voice message
const getVoiceMessage = async (text: string): Promise<Buffer> => {
  try {
    // Send a POST request to the server
    const response = await axios.post('http://localhost:8000/text_voice', {
      text,
    }, {
      responseType: 'arraybuffer', // Ensure response is treated as binary data
    });

    // Convert the response data to a Buffer
    return Buffer.from(response.data);
  } catch (error) {
    console.error('Error getting text to voice:', error);
    throw new Error('Failed to get voice message');
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
  socket.on('set_language', (language: string) => {
    userLanguages.set(socket.id, language);
    console.log(`User ${socket.id} set language to ${language}`);
  });

  // Handle sending text messages
  socket.on('send_message', async ({ roomId, username, text }: { roomId: string, username: string, text: string }) => {
    console.log('Received message:', { roomId, username, text });

    const roomUserSockets = roomUsers.get(roomId) || new Set();

    // Send the original and translated message to all users in the room
    for (const clientId of roomUserSockets) {
      try {
        const clientLanguage = userLanguages.get(clientId) || 'en';
        console.log(`Translating message for user ${clientId} to language ${clientLanguage}`);
        const translatedText = await translateText(text, clientLanguage);
        io.to(clientId).emit('message', { username, text, translated_text: translatedText });
      } catch (error) {
        console.error(`Error sending message to user ${clientId}:`, error);
      }
    }
  });

  // Handle sending voice messages
  socket.on('send_voice_message', async ({ roomId, username, translated_text }) => {
    console.log('Received voice message request:', { roomId, username, translated_text });
  
    const roomUserSockets = roomUsers.get(roomId) || new Set();
  
    for (const clientId of roomUserSockets) {
      try {
        const clientLanguage = userLanguages.get(clientId) || 'en';
        console.log(`Processing voice message for user ${clientId} in language ${clientLanguage}`);
        const translatedText = await translateText(translated_text, clientLanguage);
        console.log(`Translated text for user ${clientId}: ${translatedText}`);
        
        const audioData = await getVoiceMessage(translatedText);
        console.log(`Audio data length for user ${clientId}: ${audioData.length}`);
        
        io.to(clientId).emit('voice_message', { username, audio: audioData.toString('base64') });
      } catch (error) {
        console.error(`Error sending voice message to user ${clientId}:`, error);
      }
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
