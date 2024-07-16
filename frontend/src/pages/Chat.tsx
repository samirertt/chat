import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const [roomId, setRoomId] = useState<string>('');
  const [username, setUsername] = useState<string>(''); // State to hold username
  const navigate = useNavigate();

  const handleJoinRoom = () => {
    navigate(`/chat/${roomId}`, { state: { username } }); // Navigate to ChatRoom with roomId and username in state
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-cover bg-custom-rachel-image bg-center">
      <div className='flex flex-col items-center justify-center bg-gradient-to-r from-teal-600 to-gray-600 py-20 px-20 rounded-md'>
        <h1 className="text-4xl font-bold mb-8 text-gray-100">Join a Chat Room</h1>
        <input
          type='text'
          placeholder='Enter username'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className='mb-4 px-4 py-2 border rounded-md w-64 focus:outline-none'

        />
        <input 
          type="text" 
          placeholder="Enter Room ID" 
          value={roomId} 
          onChange={(e) => setRoomId(e.target.value)} 
          className="mb-4 px-4 py-2 border rounded-md w-64 focus:outline-none"
        />
        <button 
          onClick={handleJoinRoom} 
          className="mb-4 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-800 transition duration-200"
        >
          Join
        </button>
        <h2 className="text-2xl font-semibold mb-4 text-gray-100">Invite Link</h2>
        {roomId && (
          <p className="text-gray-200">
            Send this link to invite others: <span className="text-blue-900 font-semibold">{`${window.location.origin}/chat`}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Home;
