import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaWhatsapp, FaTwitter, FaInstagram, FaClipboard, FaTimes } from 'react-icons/fa'; // Import icons
import { IoShareOutline } from "react-icons/io5";
import Dropdown from '../components/dropdown';
import Gender from '../components/gender';

interface LocationState {
  roomId: string;
}

const Home: React.FC = () => {
  const [nickname, setNickname] = useState<string>('Anonymous');
  const [selectedLanguage, setSelectedLanguage] = useState<string>();
  const [selectedGender, setSelectedGender] = useState<string>();
  const [copySuccess, setCopySuccess] = useState<string>('');
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const [roomId, setRoomId] = useState<string>(state?.roomId || '');

  const handleJoinRoom = () => {
    if (!nickname || !roomId) {
      alert("Please enter both a nickname and room ID.");
      return;
    }
    if (!selectedLanguage) {
      alert("Please select a language");
      return;
    }
    if (!selectedGender) {
      alert("Please select gender");
      return;
    }
    navigate(`/chat/${roomId}`, { state: { username: nickname, selectedLanguage, selectedGender } });
  };

  const generateShortIdWithDashes = (length: number): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      if ((i + 1) % 3 === 0 && i < length - 1) {
        result += '-';
      }
    }
    
    return result;
  };

  useEffect(() => {
    if (!roomId) {
      const newRoomId = generateShortIdWithDashes(9);
      setRoomId(newRoomId);
    }
  }, [roomId]);

  const handleDropdownChange = (value: string) => {
    setSelectedLanguage(value);
  };

  const handleDropdownGenderchange = (value: string) => {
    setSelectedGender(value);
  };

  const copyToClipboard = () => {
    const link = `${window.location.origin}/chat/${roomId}`;
    navigator.clipboard.writeText(link).then(
      () => setCopySuccess('Link copied to clipboard!'),
      () => setCopySuccess('Failed to copy link.')
    );
  };

  const shareOnWhatsApp = () => {
    const link = `${window.location.origin}/chat/${roomId}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(link)}`, '_blank');
  };

  const shareOnTwitter = () => {
    const link = `${window.location.origin}/chat/${roomId}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(link)}`, '_blank');
  };

  const shareOnInstagram = () => {
    alert('Instagram does not support sharing links directly. Please copy the link and share it manually.');
  };

  const handleShareClick = () => {
    setShowShareModal(true);
  };

  const closeShareModal = () => {
    setShowShareModal(false);
  };

  return (
    <div className='h-screen overflow-y-hidden'>
      
      <div className="flex flex-col items-center justify-center min-h-screen loginpage">
        <div className='flex flex-col items-center justify-center py-6 px-4 xs:py-8 xs:px-6 sm:py-12 sm:px-8 md:py-14 md:px-12 lg:py-16 lg:px-16 rounded-md logincard w-full max-w-md'>
          <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-gray-100 text-center">Join a Chat Room</h1>
          <p className='text-gray-200 text-sm xs:text-base sm:text-lg mb-3 text-center'>Welcome {nickname}!</p>
          <input
            type='text'
            placeholder='Enter nickname'
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className='w-full h-12 p-4 outline-none bg-transparent border-[2px] border-gray-200/40 text-white rounded-md mb-4'
          />
          <input 
            type="text" 
            placeholder="Enter Room ID" 
            value={roomId} 
            onChange={(e) => setRoomId(e.target.value)} 
            className="w-full h-12 p-4 outline-none bg-transparent border-[2px] border-gray-200/40 text-white rounded-md mb-6" 
          />
          <div className="flex flex-col xs:flex-row xs:space-x-4 space-y-4 xs:space-y-0 w-full">
            <div className="w-full xs:w-1/2">
              <h2 className='text-gray-200 text-sm xs:text-base sm:text-lg mb-3'>Choose your language:</h2>
              <Dropdown onChange={handleDropdownChange} />
            </div>
            <div className="w-full xs:w-1/2">
              <h2 className='text-gray-200 text-sm xs:text-base sm:text-lg mb-3'>Choose your gender:</h2>
              <Gender onChange={handleDropdownGenderchange}/>
            </div>
          </div>
          <button 
            onClick={handleJoinRoom} 
            className="mb-4 mt-5 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-800 transition duration-200"
          >
            Join
          </button>
          <h2 className="text-lg xs:text-xl sm:text-2xl font-semibold mb-4 text-gray-100 text-center">Invite Link</h2>
          {roomId && (
            <p className="text-gray-200 text-sm xs:text-base text-center">
              Send this link to invite others: <span className="text-white font-semibold">{`${window.location.origin}/chat/${roomId}`}</span>
            </p>
          )}
          <button 
            onClick={handleShareClick} 
            className=" mt-2 px-3 py-2 bg-blue-700 text-2xl text-white rounded-md hover:bg-blue-900"
          >
            <IoShareOutline />
          </button>
          {copySuccess && <p className="text-green-500 mt-2 text-sm text-center">{copySuccess}</p>}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <button 
              onClick={closeShareModal} 
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl"
            >
              <FaTimes />
            </button>
            <h2 className="text-lg xs:text-xl sm:text-2xl font-semibold mb-4 text-center">Share This Link</h2>
            <button 
              onClick={copyToClipboard} 
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-800 mb-2 w-full text-sm xs:text-base"
            >
              <FaClipboard className="text-lg" />
              <span>Copy Link</span>
            </button>
            <button 
              onClick={shareOnWhatsApp} 
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-800 mb-2 w-full text-sm xs:text-base"
            >
              <FaWhatsapp className="text-lg" />
              <span>Share on WhatsApp</span>
            </button>
            <button 
              onClick={shareOnTwitter} 
              className="flex items-center space-x-2 px-4 py-2 bg-blue-400 text-white rounded-md hover:bg-blue-600 mb-2 w-full text-sm xs:text-base"
            >
              <FaTwitter className="text-lg" />
              <span>Share on Twitter</span>
            </button>
            <button 
              onClick={shareOnInstagram} 
              className="flex items-center space-x-2 px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-800 w-full text-sm xs:text-base"
            >
              <FaInstagram className="text-lg" />
              <span>Share on Instagram</span>
            </button>
          </div>
        </div>
      )}
    </div>  
  );
};

export default Home;
