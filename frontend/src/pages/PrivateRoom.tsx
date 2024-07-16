import React, { useState, useEffect, ChangeEvent, useRef, KeyboardEvent } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';
import Message from '../components/message';
import RecordMessage from '../components/RecordMessage';
import axios from 'axios';
import Dropdown from '../components/dropdown';

interface MessageType {
  username: string;
  text: string;
}

interface LocationState {
  username: string;
}

const socket: Socket = io('http://localhost:5000');

const ChatRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>(); // Only roomId from params
  const location = useLocation(); 
  const state = location.state as LocationState; // Explicitly cast the location state
  const username = state?.username || ''; // Use default empty string if username is undefined
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [messageText, setMessageText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(''); // State for selected language
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.on('message', handleMessage);

    return () => {
      socket.off('message', handleMessage);
    };
  }, []);

  const handleMessage = (message: MessageType) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  const sendMessage = () => {
    if (username && messageText.trim() !== '') {
      socket.emit('send_message', { username, text: messageText, language: selectedLanguage }); // Include selected language in message
      setMessageText('');
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
      formData.append('language', selectedLanguage); // Append selected language to form data

      const res = await axios.post('http://localhost:8000/post_text/', formData, {
        headers: {
          'Content-Type': 'audio/wav',
        },
      });

      const responseText = res.data;
      setMessageText(responseText);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle dropdown change and update selected language
  const handleDropdownChange = (value: string) => {
    setSelectedLanguage(value);
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
              text={message.text}
              currentUser={username} // Pass current username
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
            className="flex-grow p-4 border border-gray-300 rounded bg-gradient-to-r from-gray-100 to-gray-400 focus:outline-none "
          />
          <button
            onClick={sendMessage}
            className="bg-green-600 text-white p-2 rounded hover:bg-green-700 w-14 h-10"
          >
            Send
          </button>
          <RecordMessage handleStop={handleStop} />
          {/* Pass handleDropdownChange function to Dropdown component */}
          <Dropdown onChange={handleDropdownChange} />
        </div>
        {isLoading && <p>Loading...</p>}
      </footer>
    </div>
  );
};

export default ChatRoom;
