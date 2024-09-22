import React, { useState, useEffect, ChangeEvent, KeyboardEvent, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';
import Message from '../components/message';
import RecordMessage from '../components/RecordMessage';
import axios from 'axios';
import Title from '../components/Title';
import Sidebar from '../components/activeusers';

interface MessageType {
  username: string;
  text: string;
  translated_text: string;
  audio?: string;
}

interface LocationState {
  username: string;
  selectedLanguage: string;
  selectedGender: string;
}

const socket: Socket = io('http://localhost:5000');

const ChatRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const state = location.state as LocationState;
  const username = state?.username; 
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [messageText, setMessageText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedLanguage] = useState<string>(state?.selectedLanguage || '');
  const [selectedGender] = useState<string>(state?.selectedGender || '');

  const [usersInRoom, setUsersInRoom] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!username || !selectedLanguage) {
      navigate('/chat', { state: { roomId } });
    }
  }, [username, selectedLanguage, navigate]);

  useEffect(() => {
    if (roomId) {
      socket.emit('join_room', roomId, username);
      socket.emit('set_language', selectedLanguage);

      // Handle room users
      socket.on('room_users', (users: [string, string][]) => {
        setUsersInRoom(users.map(([_, username]) => username));
      });


      // Handle incoming messages and voice messages
      const handleMessage = (message: MessageType) => {
        setMessages(prevMessages => [...prevMessages, message]);
      };

      const handleVoiceMessage = ({ username, audio }: { username: string; audio: string }) => {
        try {
          const audioData = Uint8Array.from(atob(audio), c => c.charCodeAt(0));
          const blob = new Blob([audioData], { type: 'audio/mpeg' });
          const audioUrl = URL.createObjectURL(blob);

          setMessages(prevMessages => [
            ...prevMessages,
            { username, text: '[Voice Message]', translated_text: '', audio },
          ]);
        } catch (error) {
          console.error('Error handling voice message:', error);
        }
      };

      socket.on('message', handleMessage);
      socket.on('voice_message', handleVoiceMessage);

      return () => {
        socket.off('room_users');
        socket.off('user_joined');
        socket.off('user_left');
        socket.off('message', handleMessage);
        socket.off('voice_message', handleVoiceMessage);
        if (roomId) {
          socket.emit('leave_room', roomId);
        }
      };
    }
  }, [roomId, selectedLanguage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (username && messageText.trim() !== '') {
      setIsLoading(true);

      try {
        const res = await axios.post('http://localhost:8000/text_translate/', {
          text: messageText,
          language: selectedLanguage
        });

        const { text, translated_text } = res.data;
        socket.emit('send_message', { roomId, username, text, translated_text });

        setMessageText('');
      } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);
  };

  const handleInputKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const handleStop = async (blobUrl: string) => {
    setIsLoading(true);

    try {
      const response = await fetch(blobUrl);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append('file', blob, 'myFile.wav');
      formData.append('language', selectedLanguage);

      const res = await axios.post('http://localhost:8000/post_text/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const { text, translated_text } = res.data;
      socket.emit('send_voice_message', { roomId, username, translated_text, selectedGender });

      setMessageText('');
    } catch (error) {
      console.error('Error handling audio:', error);
      alert('Failed to process audio');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex h-screen loginpage'>
      <div className="flex-grow flex flex-col h-full">
        <Title username={username}  usersInRoom={usersInRoom} />
        <main className="flex-grow overflow-auto bg-opacity-50">
          
          <div className="messages space-y-2 p-2 mt-12 ">
            {messages.map((message, index) => (
              <Message
                key={index}
                username={message.username}
                text={message.username === username ? message.text : ''}
                translated_text={message.translated_text}
                currentUser={username}
                audio={message.audio}
              />
            ))}
            <div ref={messagesEndRef}></div>
          </div>
        </main>

        <footer className="bg-gradient-to-r from-teal-600 to-gray-600 p-1 flex items-center space-x-2">
          <input
            type="text"
            value={messageText}
            onChange={handleInputChange}
            onKeyPress={handleInputKeyPress}
            placeholder="Type your message..."
            className="flex-grow p-2 border border-gray-300 rounded bg-gray-100 focus:outline-none"
          />
          <button
            onClick={sendMessage}
            className="bg-green-600 text-white p-2 rounded hover:bg-green-700"
          >
            Send
          </button>
          <RecordMessage handleStop={handleStop} />
        </footer>
      </div>
    </div>
  );
};

export default ChatRoom;
