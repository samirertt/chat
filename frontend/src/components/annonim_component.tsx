import React, { useState, KeyboardEvent, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import TutorialPopup from './Tutorial';

const AnnonimComponent = () => {
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [enteredCode, setEnteredCode] = useState<string>('');
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const username: string = "Anonym";
  const handleInputKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        handleConfirm();
      }
  };
  const handleConfirm = async () => {
    try {
      // Check if the anonym code exists in the database
      const response = await axios.post('http://localhost:8000/check_anonym_code/', { code: enteredCode });

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
  const handlelog = () => {
    try
    {
      navigate('/chat',{state:{username}});
    }
    catch(error)
    {
      console.error('An error occurred while loggin in:', error);
    }
  }

  const handlecode = () => {
    try
    {
      navigate('/code',{state:{username}});
    }
    catch(error)
    {
      console.error('An error occurred while loggin in:', error);
    }
  }

  const handlerealtime = () => {
    try
    {
      navigate('/Real_time');
    }
    catch(error)
    {
      console.error('An error occurred while loggin in:', error);
    }
  }
    useEffect(() => {
        const tutorialShown = localStorage.getItem('tutorialShown');
        if (!tutorialShown) {
            setShowTutorial(true); // Show the tutorial popup if it hasn't been shown
        }
    }, []);
    
    // Function to close the tutorial popup
    const handleCloseTutorial = () => {
      setShowTutorial(false);
      localStorage.setItem('tutorialShown', 'true'); // Set the flag in localStorage
  };
  return (
    <div className="w-full min-h-screen flex items-center justify-center loginpage">
            {showTutorial && (
                <div className="z-50 fixed inset-0 flex items-center justify-center">
                    <TutorialPopup onClose={handleCloseTutorial} />
                </div>
            )}      
      <div className="w-full max-w-md p-6 logincard rounded-xl shadow-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl text-white font-semibold">Anonymous Chat</h1>
          <p className="text-sm text-gray-400">Welcome back!</p>
        </div>
        <div className="flex flex-col gap-4 mb-6">
          <label className="block text-white">Enter Anonymous code</label>
          <input
            type='text'
            id='name'
            className='w-full h-12 p-4 outline-none bg-gray-700 border border-gray-600 text-white rounded-md'
            value={enteredCode}
            onChange={(e) => setEnteredCode(e.target.value)}
            onKeyPress={handleInputKeyPress}
          />
        </div>
        <button
          className="w-full h-12 bg-blue-600 rounded-md text-lg text-white font-medium mb-4 hover:bg-blue-700 transition ease-out duration-300"
          onClick={handleConfirm}
        >
          Confirm
        </button>
        <div className="flex flex-col gap-4">
          <h2 className="text-xl text-white">Don't have an Anonymous code?</h2>
          <button
            className="w-full h-12 bg-green-600 rounded-md text-lg text-white font-medium hover:bg-green-700 transition ease-out duration-300"
            onClick= {handlecode}
          >
            Create Anonymous code
          </button>
        </div>
        <div className="w-full h-auto flex items-center gap-x-1 my-5">
                    <div className="w-1/2 h-1 bg-gray-200/40 rounded-md"></div>
                    <p className="text-gray-300 font-normal px-2 text-sm">OR</p>
                    <div className="w-1/2 h-1 bg-gray-200/40 rounded-md"></div>
                </div>
        <div className="flex flex-col gap-4 pt-3">
        <button
            className="w-full h-12 bg-green-600 rounded-md text-lg text-white font-medium hover:bg-green-700 transition ease-out duration-300"
            onClick= {handlelog}
          >
            Continue without code 
          </button>
        </div>
        <div className="flex flex-col gap-4 pt-3">
        <button
            className="w-full h-12 bg-green-600 rounded-md text-lg text-white font-medium hover:bg-green-700 transition ease-out duration-300"
            onClick= {handlerealtime}
          >
            Real-time translation
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnonimComponent;
