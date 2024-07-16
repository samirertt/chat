import React from 'react';

interface MessageProps {
  username: string;
  text: string;
  currentUser: string; // Ensure currentUser is always defined as string
}

const Message: React.FC<MessageProps> = ({ username, text, currentUser }) => {
  // Ensure currentUser is always defined as string
  const isCurrentUser = username === (currentUser ?? ''); // Use default empty string if currentUser is undefined
  const messageClass = isCurrentUser
    ? 'bg-blue-300 text-white rounded-lg p-2 mb-2 ml-auto max-w-xs'
    : 'bg-teal-300 text-gray-800 rounded-lg p-2 mb-2 max-w-xs';

  return (
    <div className={messageClass}>
      <p className="font-bold">{username}</p>
      <p>{text}</p>
    </div>
  );
};

export default Message;
