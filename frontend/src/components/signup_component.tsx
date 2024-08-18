import { useState } from 'react';

const SignupComponent = () => {
    const [fullname, setFullname] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async () => {
        // Check if passwords match
        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match');
            return;
        }

        // Reset error and success messages
        setErrorMessage('');
        setSuccessMessage('');

        // Send data to the server
        const response = await fetch("http://localhost:8000/signup/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                fullname,
                username,
                email,
                password,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            setSuccessMessage(data.message || 'Signup successful');
        } else {
            const errorData = await response.json();
            setErrorMessage(errorData.detail || 'An error occurred');
        }
    };

    return (
        <div className="w-full min-h-screen flex items-center justify-center loginpage">
            <div className="w-[90%] sm:w-[70%] md:w-[50%] lg:w-[40%] xl:w-[32%] h-auto py-10 px-6 sm:px-10 md:px-12 rounded-xl logincard">
                <div className="w-full h-auto">
                    <h1 className="text-[1.475rem] text-white font-semibold mb-1">SignUp</h1>
                    <p className="text-sm text-gray-300 font-normal mb-8">Welcome to tchats!</p>
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
                <div className="w-full h-auto flex flex-row items-center gap-7">
                    <div className="w-1/2 h-auto">
                        <label htmlFor="fullname" className="block text-white mb-1">Fullname</label>
                        <input
                            type='text'
                            id='fullname'
                            value={fullname}
                            onChange={(e) => setFullname(e.target.value)}
                            className='w-full h-12 p-4 outline-none bg-transparent border-[2px] border-gray-200/40 text-white rounded-md'
                        />
                    </div>
                    <div className="w-1/2 h-auto">
                        <label htmlFor="username" className="block text-white mb-1">Username</label>
                        <input
                            type='text'
                            id='username'
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className='w-full h-12 p-4 outline-none bg-transparent border-[2px] border-gray-200/40 text-white rounded-md'
                        />
                    </div>
                </div>
                <div className="w-full h-auto flex items-center gap-x-1 my-5">
                    <div className="w-full h-1 bg-gray-200/40 rounded-md"></div>
                </div>
                <div className="w-full h-auto gap-7">
                    <label htmlFor="email" className="block text-white mb-1">Email</label>
                    <input
                        type='text'
                        id='email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className='w-full h-12 p-4 outline-none bg-transparent border-[2px] border-gray-200/40 text-white rounded-md'
                    />
                </div>
                <div className="w-full h-auto flex flex-row items-center gap-7 mt-6">
                    <div className="w-1/2 h-auto">
                        <label htmlFor="password" className="block text-white mb-1">Password</label>
                        <input
                            type='password'
                            id='password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className='w-full h-12 p-4 outline-none bg-transparent border-[2px] border-gray-200/40 text-white rounded-md'
                        />
                    </div>
                    <div className="w-1/2 h-auto">
                        <label htmlFor="confirmPassword" className="block text-white mb-1">Confirm Password</label>
                        <input
                            type='password'
                            id='confirmPassword'
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className='w-full h-12 p-4 outline-none bg-transparent border-[2px] border-gray-200/40 text-white rounded-md'
                        />
                    </div>
                </div>
                <button
                    onClick={handleSubmit}
                    className="w-full h-12 outline-none bg-white rounded-md text-lg text-black font-medium mt-7 hover:bg-gray-100/40 ease-out duration-700"
                >
                    Confirm
                </button>
            </div>
        </div>
    );
};

export default SignupComponent;
