import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AnnonimComponent = () => {
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [enteredCode, setEnteredCode] = useState<string>('');
  const navigate = useNavigate();

  const handleGenerateCode = () => {
    const newCode = uuidv4();
    setGeneratedCode(newCode);
  };

  const handleConfirm = async () => {
    try {
      // Check if the anonym code exists in the database
      const response = await axios.post('http://localhost:8000/check_anonym_code/', { code: enteredCode });
      const username: string = "Anonym";
      if (response.data.exists) {
        // If the code exists, navigate to the chat page
        navigate('/chat', {state:{username}});
      } else {
        // If the code does not exist, save it to the database, then navigate to the chat page
        await axios.post('http://localhost:8000/save_anonym_code/', { code: enteredCode });
        navigate('/chat', {state:{username}});
      }
    } catch (error) {
      console.error('An error occurred while confirming the anonym code:', error);
    }
  };

  const handleCopyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode)
        .then(() => {
          alert('Code copied to clipboard!');
        })
        .catch((err) => {
          console.error('Failed to copy code: ', err);
        });
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center loginpage">
      <div className="w-[90%] sm:w-[70%] md:w-[50%] lg:w-[40%] xl:w-[32%] h-auto py-10 px-6 sm:px-10 md:px-12 rounded-xl logincard">
        <div className="w-full h-auto">
          <h1 className="text-[1.475rem] text-white font-semibold mb-1">Anonym Chat</h1>
          <p className="text-sm text-gray-300 font-normal mb-8">Welcome back!</p>
        </div>
        <div className="w-full h-auto flex flex-row items-center gap-7">
          <div className="w-1/2 h-auto">
            <label className="block text-white mb-1">Enter Anonym code</label>
            <input
              type='text'
              id='name'
              className='w-full h-12 p-4 outline-none bg-transparent border-[2px] border-gray-200/40 text-white rounded-md'
              value={enteredCode}
              onChange={(e) => setEnteredCode(e.target.value)}
            />    
          </div>
          <div className="w-1/2 h-auto">
            <button
              className="w-full h-12 outline-none bg-white rounded-md text-lg text-black font-medium mt-7 hover:bg-gray-100/40 ease-out duration-700"
              onClick={handleConfirm}
            >
              Confirm
            </button>
          </div>
        </div>
        <div className="w-full h-auto flex flex-row items-center gap-7 mt-6">
          <h1 className="text-[1.475rem] text-white font-semibold">Don't have an Anonym code?</h1>
          <button
            className="w-full h-12 outline-none bg-white rounded-md text-lg text-black font-medium mt-7 hover:bg-gray-100/40 ease-out duration-700"
            onClick={handleGenerateCode}
          >
            Generate Anonym code
          </button>
        </div>
        {generatedCode && (
          <div className="mt-4 text-white">
            <p>Your generated Anonym code:</p>
            <p className="font-semibold">{generatedCode}</p>
            <button
              className="mt-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-700 ease-out duration-300"
              onClick={handleCopyCode}
            >
              Copy Code
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnonimComponent;
