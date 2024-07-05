import express, { Request, Response } from 'express';
import http from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import cors from 'cors';

const app = express();

app.use(cors({
    origin: '*'
}));

const server = http.createServer(app);
const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
    }
});

io.on('connection', (socket: Socket) => {
    console.log('New user connected');

    socket.on('sendMessage', (message: { text: string }) => {
        io.emit('message', message); // Broadcast the message to all connected clients
    });
  
    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
