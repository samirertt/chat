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

const userLanguages = new Map<string, string>(); // { socketId: language }
const roomUsers = new Map<string, Map<string, string>>(); // { roomId: Map<socketId, username> }

// Helper functions to manage room users
const addUserToRoom = (roomId: string, socketId: string, username: string) => {
  if (!roomUsers.has(roomId)) {
    roomUsers.set(roomId, new Map());
  }
  const roomMap = roomUsers.get(roomId)!;
  roomMap.set(socketId, username);
};

const removeUserFromRoom = (roomId: string, socketId: string) => {
  const roomMap = roomUsers.get(roomId);
  if (roomMap) {
    roomMap.delete(socketId);
    if (roomMap.size === 0) {
      roomUsers.delete(roomId);
    }
  }
};

const getUsersInRoom = (roomId: string): Map<string, string> | undefined => {
  return roomUsers.get(roomId);
};

const emitRoomUsers = (roomId: string) => {
  const users = getUsersInRoom(roomId);
  if (users) {
    io.to(roomId).emit('room_users', Array.from(users.entries()));
  }
};

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
const getVoiceMessage = async (text: string, selectedGender: string): Promise<Buffer> => {
  try {
    const response = await axios.post('http://localhost:8000/text_voice', {
      text,
      selectedGender,
    }, {
      responseType: 'arraybuffer',
    });
    return Buffer.from(response.data);
  } catch (error) {
    console.error('Error getting text to voice:', error);
    throw new Error('Failed to get voice message');
  }
};

const mapToObject = (map: Map<any, any>): object => {
  const obj: any = {};
  map.forEach((value, key) => {
    obj[key] = value instanceof Map ? mapToObject(value) : value;
  });
  return obj;
};

// Socket.IO event listeners
io.on('connection', (socket: Socket) => {
  console.log('A user connected:', socket.id);

  socket.on('request_room_users', () => {
    const convertedData = mapToObject(roomUsers);
    socket.emit('room_users', convertedData);
  });
  // Handle joining a chat room
  socket.on('join_room', (roomId: string, username: string) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);

    addUserToRoom(roomId, socket.id, username);
    console.log('Users in room:', username);

    // Emit updated room users list
    emitRoomUsers(roomId);
  });

  // Handle leaving a chat room
  socket.on('leave_room', (roomId: string) => {
    socket.leave(roomId);
    console.log(`User ${socket.id} left room ${roomId}`);

    removeUserFromRoom(roomId, socket.id);

    // Emit updated room users list
    emitRoomUsers(roomId);
  });

  // Handle setting language preference
  socket.on('set_language', (language: string) => {
    userLanguages.set(socket.id, language);
    console.log(`User ${socket.id} set language to ${language}`);
  });

  // Handle sending text messages
  socket.on('send_message', async ({ roomId, username, text }: { roomId: string, username: string, text: string }) => {
    console.log('Received message:', { roomId, username, text });

    const roomUserSockets = getUsersInRoom(roomId);

    // Send the original and translated message to all users in the room
    if (roomUserSockets) {
      for (const [clientId, _] of roomUserSockets) {
        try {
          const clientLanguage = userLanguages.get(clientId) || 'en';
          const translatedText = await translateText(text, clientLanguage);
          io.to(clientId).emit('message', { username, text, translated_text: translatedText });
        } catch (error) {
          console.error(`Error sending message to user ${clientId}:`, error);
        }
      }
    }
  });

  // Handle sending voice messages
  socket.on('send_voice_message', async ({ roomId, username, translated_text, selectedGender }) => {
    console.log('Received voice message request:', { roomId, username, translated_text, selectedGender });

    const roomUserSockets = getUsersInRoom(roomId);

    if (roomUserSockets) {
      for (const [clientId, _] of roomUserSockets) {
        try {
          const clientLanguage = userLanguages.get(clientId) || 'en';
          const translatedText = await translateText(translated_text, clientLanguage);
          const audioData = await getVoiceMessage(translatedText, selectedGender);
          io.to(clientId).emit('voice_message', { username, audio: audioData.toString('base64') });
        } catch (error) {
          console.error(`Error sending voice message to user ${clientId}:`, error);
        }
      }
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    userLanguages.delete(socket.id);

    roomUsers.forEach((roomMap, roomId) => {
      if (roomMap.has(socket.id)) {
        removeUserFromRoom(roomId, socket.id);
        emitRoomUsers(roomId);
      }
    });
  });
});



const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
