import React, { useState, useEffect, ChangeEvent } from 'react';
import io, { Socket } from 'socket.io-client';
import Message from '../components/message';

interface MessageType {
  username: string;
  text: string;
}

// Connect to FastAPI backend running on port 8000
const socket: Socket = io('http://localhost:5000');

const App: React.FC = () => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [messageText, setMessageText] = useState<string>('');

  useEffect(() => {
    socket.on('message', (message: MessageType) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Clean up the socket connection on component unmount
    return () => {
      socket.off('message');
    };
  }, []);

  const sendMessage = () => {
    socket.emit('send_message', { username: 'User', text: messageText });
    setMessageText('');
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);
  };

  return (
    <div className="App">
      <h1>Real-Time Chat App</h1>
      <div className="messages">
        {messages.map((message, index) => (
          <Message key={index} username={message.username} text={message.text} />
        ))}
      </div>
      <div className="input-box">
        <input
          type="text"
          value={messageText}
          onChange={handleInputChange}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default App;
