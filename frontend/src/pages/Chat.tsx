import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Title from '../components/Title';

const Home: React.FC = () => {
  const [roomId, setRoomId] = useState<string>('');
  const [nickname, setNickname] = useState<string>('Anonym'); // Default value for nickname
  const navigate = useNavigate();
  const location = useLocation();
  const usernameFromLogin = location.state?.username || ''; // Username from login page

  useEffect(() => {
    if (usernameFromLogin) {
      setNickname(usernameFromLogin); // Update nickname if a username is passed
    }
  }, [usernameFromLogin]);

  const handleJoinRoom = () => {
    if (!nickname || !roomId) { // Check for nickname instead of username
      alert("Please enter both a nickname and room ID.");
      return;
    }
    navigate(`/chat/${roomId}`, { state: { username: nickname } }); // Pass nickname to ChatRoom
  };

  return (
    <div className='h-screen overflow-y-hidden'>
      <Title username={nickname} /> {/* Use nickname for the Title component */}
      <div className="flex flex-col items-center justify-center min-h-screen bg-cover bg-custom-rachel-image bg-center">
        <div className='flex flex-col items-center justify-center py-20 px-20 rounded-md logincard'>
          <h1 className="text-4xl font-bold mb-6 text-gray-100">Join a Chat Room</h1>
          <p className='text-gray-200 text-lg mb-3'>Welcome back!</p>
          <input
            type='text'
            placeholder='Enter nickname'
            value={nickname}
            onChange={(e) => setNickname(e.target.value)} // Update nickname state
            className='w-full h-12 p-4 outline-none bg-transparent border-[2px] border-gray-200/40 text-white rounded-md mb-4'
          />
          <input 
            type="text" 
            placeholder="Enter Room ID" 
            value={roomId} 
            onChange={(e) => setRoomId(e.target.value)} 
            className="w-full h-12 p-4 outline-none bg-transparent border-[2px] border-gray-200/40 text-white rounded-md mb-6" 
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
              Send this link to invite others: <span className="text-white font-semibold">{`${window.location.origin}/chat`}</span>
            </p>
          )}
        </div>
      </div>
    </div>  
  );
};

export default Home;
