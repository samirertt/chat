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
    <div className="flex flex-col items-center justify-center min-h-screen bg-cover bg-custom-image bg-center">
      <div className='flex flex-col items-center justify-center bg-gradient-to-r from-purple-900 to-blue-900 py-20 px-20 rounded-md'>
        <h1 className="text-4xl font-bold mb-8">Join a Chat Room</h1>
        <input
          type='text'
          placeholder='Enter username'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className='mb-4 px-4 py-2 border rounded-md w-64'
        />
        <input 
          type="text" 
          placeholder="Enter Room ID" 
          value={roomId} 
          onChange={(e) => setRoomId(e.target.value)} 
          className="mb-4 px-4 py-2 border rounded-md w-64"
        />
        <button 
          onClick={handleJoinRoom} 
          className="mb-4 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 transition duration-200"
        >
          Join
        </button>
        <h2 className="text-2xl font-semibold mb-4">Invite Link</h2>
        {roomId && (
          <p className="text-gray-200">
            Send this link to invite others: <span className="text-blue-500">{`${window.location.origin}/chat/${roomId}`}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Home;
