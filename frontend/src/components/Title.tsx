import { useNavigate } from "react-router-dom";
import { useState} from 'react';
import Sidebar from "./activeusers";

type Props = {
  usersInRoom: string[];
  username: string;
};


function Title({username,usersInRoom }: Props) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/')
  };

  
  return (
    <div className="flex justify-between items-center  p-2 bg-gradient-to-r from-teal-600 to-gray-600 text-white font-bold shadow relative">
      
      <button
        onClick={handleLogout}
        className="px-4 py-2 font-semibold rounded-lg shadow-md duration-500 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
      >
        Logout
      </button>
      <Sidebar usersInRoom={usersInRoom} />
      <div className="absolute left-1/2 transform -translate-x-1/2 italic text-xl">
        Tchats
      </div>
      <div className="ml-auto flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-white text-sm">{username}</span>
        </div>
      </div>
    </div>
  );
}

export default Title;
