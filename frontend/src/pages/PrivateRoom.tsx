import React, { useState, useEffect, ChangeEvent, KeyboardEvent, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';
import Message from '../components/message';
import RecordMessage from '../components/RecordMessage';
import axios from 'axios';
import Dropdown from '../components/dropdown';

interface MessageType {
  username: string;
  text: string;
  translated_text: string;
}

interface LocationState {
  username: string;
  selectedLanguage: string;
}

const socket: Socket = io('http://localhost:5000');

const ChatRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const state = location.state as LocationState;
  const username = state?.username || '';
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [messageText, setMessageText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(state?.selectedLanguage || '');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (roomId) {
      socket.emit('join_room', roomId);
      socket.emit('set_language', selectedLanguage); // Set the user's language
    }

    const handleMessage = (message: MessageType) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    socket.on('message', handleMessage);

    return () => {
      socket.off('message', handleMessage);
      if (roomId) {
        socket.emit('leave_room', roomId);
      }
    };
  }, [roomId, selectedLanguage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (username && messageText.trim() !== '') {
      setIsLoading(true);

      try {
        // Send message to backend for translation
        const res = await axios.post('http://localhost:8000/text_translate/', {
          text: messageText,
          language: selectedLanguage
        });

        const { text, translated_text } = res.data;

        // Emit the message to Socket.IO server
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

      // Send audio file to backend for processing
      const res = await axios.post('http://localhost:8000/post_text/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { text, translated_text } = res.data;

      // Emit the processed message to Socket.IO server
      socket.emit('send_message', { roomId, username, text, translated_text });

      setMessageText('');
    } catch (error) {
      console.error('Error handling audio:', error);
      alert('Failed to process audio');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDropdownChange = (value: string) => {
    setSelectedLanguage(value);
    socket.emit('set_language', value); // Update the user's language on the server
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 bg-cover bg-custom-rachel-image bg-center">
      <header className="bg-gradient-to-r from-teal-600 to-gray-600 text-white text-center py-4">
        <h1 className="text-2xl">Real-Time Chat</h1>
      </header>
      <main className="flex-grow overflow-auto p-4">
        <div className="messages space-y-4">
          {messages.map((message, index) => (
            <Message
              key={index}
              username={message.username}
              text={message.username === username ? message.text : ''}
              translated_text={message.translated_text}
              currentUser={username}
              selectedLanguage={selectedLanguage}
            />
          ))}
          <div ref={messagesEndRef}></div>
        </div>
      </main>
      <footer className="bg-gradient-to-r from-teal-600 to-gray-600 p-1">
        <div className="input-box flex space-x-2 items-center">
          <input
            type="text"
            value={messageText}
            onChange={handleInputChange}
            onKeyPress={handleInputKeyPress}
            placeholder="Type your message..."
            className="flex-grow p-4 border border-gray-300 rounded bg-gradient-to-r from-gray-100 to-gray-400 focus:outline-none"
          />
          <button
            onClick={sendMessage}
            className="bg-green-600 text-white p-2 rounded hover:bg-green-700 w-14 h-10"
          >
            Send
          </button>
          <RecordMessage handleStop={handleStop} />
          <Dropdown onChange={handleDropdownChange} />
        </div>
        {isLoading && <p>Loading...</p>}
      </footer>
    </div>
  );
};

export default ChatRoom;
