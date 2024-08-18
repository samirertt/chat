import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TutorialPopup from './Tutorial'; // Import the TutorialPopup component

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    const [showTutorial, setShowTutorial] = useState(false); // Control the tutorial popup visibility

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


    const handleSubmit = async () => {
        // Reset messages
        setErrorMessage('');
        setSuccessMessage('');
    
        // Send login request
        const response = await fetch("http://localhost:8000/login/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username,
                password,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            setSuccessMessage('Login successful');
            navigate('/chat', {state:{username}});
        } else {
            const errorData = await response.json();
            setErrorMessage(errorData.detail || 'Invalid username or password');
        }
    };

    return (
        <div className="w-full min-h-screen flex items-center justify-center loginpage">
            {/* Conditionally render the TutorialPopup */}
            {showTutorial && (
            <div className="z-50 fixed inset-0 flex items-center justify-center">
                <TutorialPopup onClose={handleCloseTutorial} />
            </div>
    )}
            
            <div className="w-[90%] sm:w-[70%] md:w-[50%] lg:w-[40%] xl:w-[32%] h-auto py-10 px-6 sm:px-10 md:px-12 rounded-xl logincard relative ">
                <div className="w-full h-auto">
                    <h1 className="text-[1.475rem] text-white font-semibold mb-1">Login</h1>
                    <p className="text-sm text-gray-300 font-normal mb-8">Welcome back!</p>
                </div>
                {errorMessage && (
                    <div className="mb-4 p-4 bg-red-500 text-white rounded">
                        {errorMessage}
                    </div>
                )}
                {successMessage && (
                    <div className="mb-4 p-4 bg-green-500 text-white rounded">
                        {successMessage}
                    </div>
                )}
                <div className="w-full h-auto flex flex-col md:flex-row items-center gap-4 md:gap-7">
                    <div className="w-full md:w-1/2 h-auto">
                        <button
                            className="w-full h-12 p-4 sm:px-16 outline-none bg-transparent border-[2px] border-gray-200/40 text-white rounded-md flex items-center justify-center gap-x-2 hover:bg-gray-100/40 ease-out duration-700"
                            onClick={() => navigate('/annonim')}
                        >
                            Annonim
                        </button>
                    </div>
                    <div className="w-full md:w-1/2 h-auto">
                        <button
                            className="w-full h-12 p-4 sm:px-16 outline-none bg-transparent border-[2px] border-gray-200/40 text-white rounded-md flex items-center justify-center gap-x-2 hover:bg-gray-100/40 ease-out duration-700"
                            onClick={() => navigate('/sign-up')}
                        >
                            Sign Up
                        </button>
                    </div>
                </div>
                <div className="w-full h-auto flex items-center gap-x-1 my-5">
                    <div className="w-1/2 h-1 bg-gray-200/40 rounded-md"></div>
                    <p className="text-gray-300 font-normal px-2 text-sm">OR</p>
                    <div className="w-1/2 h-1 bg-gray-200/40 rounded-md"></div>
                </div>
                <div className="w-full h-auto mb-5">
                    <label htmlFor="username" className="block text-white mb-1">Username</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full h-12 p-4 outline-none bg-transparent border-[2px] border-gray-200/40 text-white rounded-md"
                        placeholder="Enter your username"
                    />
                </div>
                <div className="w-full h-auto mb-5">
                    <label htmlFor="password" className="block text-white mb-1">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-12 p-4 outline-none bg-transparent border-[2px] border-gray-200/40 text-white rounded-md"
                        placeholder="Enter your password"
                    />
                </div>
                <div className="w-full h-auto flex items-center justify-between mb-5">
                    <div className="flex items-center gap-x-2">
                        <input
                            type="checkbox"
                            id="remember"
                            className="w-4 h-4 accent-gray-200/20 border border-gray-200/20 rounded-md text-white"
                        />
                        <label htmlFor="remember" className="text text-white">Remember me</label>
                    </div>
                    <div className="w-auto h-auto">
                        <Link to="#" className="text-white text-sm font-medium hover:underline ease-out duration-500">Forgot Password?</Link>
                    </div>
                </div>
                <button
                    onClick={handleSubmit}
                    className="w-full h-12 outline-none bg-white rounded-md text-lg text-black font-medium mb-7 hover:bg-gray-100/40 ease-out duration-700"
                >
                    Login
                </button>
                <div className="w-full h-auto flex items-center justify-center gap-x-1">
                    <p className="text-gray-200 text-sm font-medium">
                        Don't have an account?
                    </p>
                    <Link to="/sign-up" className="text-gray-200 text-base font-medium hover:underline ease-out duration-500">
                        Sign Up
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
