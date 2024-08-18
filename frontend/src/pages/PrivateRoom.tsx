import React, { useState, useEffect, ChangeEvent, KeyboardEvent, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';
import Message from '../components/message';
import RecordMessage from '../components/RecordMessage';
import axios from 'axios';
import Dropdown from '../components/dropdown';
import Title from '../components/Title';

interface MessageType {
  username: string;
  text: string;
  translated_text: string;
  audio?: string;
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
  const username = state?.username || 'Anonym'; // Default to 'Anonym' if username is not available
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [messageText, setMessageText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(state?.selectedLanguage || '');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (roomId) {
      socket.emit('join_room', roomId);
      socket.emit('set_language', selectedLanguage);
    }

    const handleMessage = (message: MessageType) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    const handleVoiceMessage = ({ username, audio }: { username: string; audio: string }) => {
      console.log(`Received voice message from ${username}`);

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
      socket.off('message', handleMessage);
      socket.off('voice_message', handleVoiceMessage);
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
      socket.emit('send_voice_message', { roomId, username, translated_text });

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
    socket.emit('set_language', value);
  };

  return (
    <div className='flex flex-col h-screen bg-cover bg-center bg-custom-rachel-image'>
      <Title username={username} />
      <div className="flex flex-col h-full">
        <main className="flex-grow overflow-auto p-2 bg-opacity-50 ">
          <div className="messages space-y-2 p-2">
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
        <footer className="bg-gradient-to-r from-teal-600 to-gray-600 p-2 flex items-center space-x-2">
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
          <Dropdown onChange={handleDropdownChange} />
          {isLoading && <p className="text-white">Loading...</p>}
        </footer>
      </div>
    </div>
  );
};

export default ChatRoom;
