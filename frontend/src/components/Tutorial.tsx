import React, { useState } from 'react';
import imageBg from '../images/image1.jpg'; // Adjust the path as needed
import annoymous from '../images/anonymous.jpg';
import roomid from '../images/roomid.jpg';
import lang from '../images/lang.jpg';
import voice from '../images/voice.jpg'

type TutorialPopupProps = {
    onClose: () => void;
};

const TutorialPopup: React.FC<TutorialPopupProps> = ({ onClose }) => {
    const [step, setStep] = useState(0);

    const steps = [
        {
            title: "Welcome to Tchats!",
            content: "This is an interactive guide to help you understand the key features of Tchats.",
            image: imageBg
            
        },
        {
            title: "Feature 1: Anonymous",
            content: "You do not have to Sign up with your information you could just use Anonymous feature to start chatting.",
            image: annoymous
        },
        {
            title: "Feature 2: Choose your own RoomID",
            content: "Create your RoomID and share it to the other users so they can join.",
            image: roomid
        },
        {
            title: "Feature 3: Language",
            content: "Choose the language you prefer to chat and start to communicate freely! ",
            image: lang
        },
        {
            title: "Feature 4: Voice Messages",
            content: "Even your voice messages are being translated!",
            image: voice
        },
        {
            title: "You're All Set!",
            content: "You are now familiar with the main features of Tchats. Enjoy your experience!",
        }
    ];

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            onClose(); // Close tutorial if it's the last step
        }
    };

    const handlePrevious = () => {
        if (step > 0) {
            setStep(step - 1);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="w-[90%] sm:w-[70%] md:w-[50%] lg:w-[40%] xl:w-[50%] p-6 rounded-lg shadow-lg backdrop-blur-lg ">
                <h2 className="text-2xl font-bold mb-4 text-white">{steps[step].title}</h2>
                {steps[step].image && (
                    <img 
                        src={steps[step].image}
                        alt={steps[step].title}
                        className="w-full h-40 sm:h-56 md:h-72 lg:h-80 xl:h-96 mb-4 rounded-lg object-cover"
                    />
                )}
                <p className="text-white text-lg mb-6">{steps[step].content}</p>
                <div className="flex justify-between">
                    {step > 0 && (
                        <button
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                            onClick={handlePrevious}
                        >
                            Previous
                        </button>
                    )}
                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ml-auto"
                        onClick={handleNext}
                    >
                        {step < steps.length - 1 ? "Next" : "Finish"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TutorialPopup;
