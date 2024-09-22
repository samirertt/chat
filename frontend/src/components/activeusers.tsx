import React, { useState, useEffect } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { FaUserCircle } from 'react-icons/fa';

interface SidebarProps {
  usersInRoom: string[];
}

const Sidebar: React.FC<SidebarProps> = ({ usersInRoom }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(prevState => !prevState);
  };

  useEffect(() => {
    console.log('Updated users in room:', usersInRoom);
  }, [usersInRoom]);

  return (
    <>
      <div
        className={`fixed top-0 right-0 h-full w-64 sm:w-72 md:w-80 bg-gray-900 text-white shadow-lg transition-transform duration-300 ease-in-out transform z-50 ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg sm:text-xl font-bold">Active Users</h2>
          <button
            onClick={toggleSidebar}
            className="text-gray-300 hover:text-white focus:outline-none"
          >
            <FiX size={24} />
          </button>
        </div>
        <div className="p-4 overflow-y-auto h-[calc(100%-3.5rem)]">
          <ul>
            {usersInRoom.length > 0 ? (
              usersInRoom.map((user, index) => (
                <li
                  key={index}
                  className="flex items-center py-2 px-3 mb-2 bg-gray-800 rounded-md hover:bg-gray-700 transition duration-200 ease-in-out"
                >
                  <FaUserCircle className="text-gray-400 mr-3" size={24} />
                  <span>{user}</span>
                </li>
              ))
            ) : (
              <li className="py-2 text-center">No users online</li>
            )}
          </ul>
        </div>
      </div>
      <button
        onClick={toggleSidebar}
        className="text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition duration-200 ease-in-out z-40 sm:ml-2 sm:relative sm:top-0 sm:right-0"
      >
        <FiMenu size={24} />
      </button>
    </>
  );
};

export default Sidebar;
