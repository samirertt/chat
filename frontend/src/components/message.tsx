import React from 'react';

interface MessageProps {
  username: string;
  text: string;
  translated_text: string;
  currentUser: string;
  selectedLanguage: string; // Added to conditionally display translated text
}

const Message: React.FC<MessageProps> = ({ username, text, translated_text, currentUser, selectedLanguage }) => {
  const isCurrentUser = username === currentUser;

  // Determine if the current message should be translated based on the selected language
  const isReceiver = !isCurrentUser;
  const shouldShowTranslation = isReceiver && selectedLanguage !== 'en'; // Only show translation if not the sender

  const messageClass = isCurrentUser
    ? 'bg-blue-300 text-white rounded-lg p-2 mb-2 ml-auto max-w-xs'
    : 'bg-teal-300 text-gray-800 rounded-lg p-2 mb-2 max-w-xs';

  return (
    <div className={messageClass}>
      <p className="font-bold">{username}</p>
      <p className="italic">{text}</p> {/* Display original text for everyone */}
      {shouldShowTranslation && <p className="font-medium">{translated_text}</p>} {/* Display translated text for receiver */}
    </div>
  );
};

export default Message;
