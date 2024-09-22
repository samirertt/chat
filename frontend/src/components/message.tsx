import React, { useState, useEffect } from 'react';

interface MessageProps {
  username: string;
  text: string;
  translated_text: string;
  currentUser: string;
  audio?: string; // Optional prop for audio messages
}

const Message: React.FC<MessageProps> = ({
  username,
  text,
  translated_text,
  currentUser,
  audio,
}) => {
  const [audioUrl, setAudioUrl] = useState<string | undefined>(undefined);
  const isCurrentUser = username === currentUser;

  // Define message container styles based on user type
  const messageClass = isCurrentUser
    ? 'bg-blue-300 text-white rounded-lg p-2 mb-2 ml-auto max-w-xs'
    : 'bg-teal-300 text-gray-800 rounded-lg p-2 mb-2 max-w-xs';

  useEffect(() => {
    if (audio) {
      const blob = new Blob([new Uint8Array(atob(audio).split('').map(c => c.charCodeAt(0)))], { type: 'audio/mpeg' });
      setAudioUrl(URL.createObjectURL(blob));
    }
  }, [audio]);

  return (
    <div className={messageClass}>
      <p className="font-bold">{username}</p>
      {audio ? (
        <div className="flex flex-col items-start mt-2 ">
          <audio controls className="w-full max-w-xs ">
            {audioUrl && <source src={audioUrl} type="audio/mpeg" />}
            Your browser does not support the audio element.
          </audio>
        </div>
      ) : (
        <>
          <p className="italic">{text}</p> {/* Display original text for everyone */}
          {translated_text !== text && (
            <p className="font-medium">{translated_text}</p>
          )} {/* Display translated text if it's different from the original */}
        </>
      )}
    </div>
  );
};

export default Message;
