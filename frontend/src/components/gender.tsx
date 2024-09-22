import React, { useState, useEffect } from 'react';

interface GenderProps {
  onChange: (value: string) => void;
}

const Gender: React.FC<GenderProps> = ({ onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [genders, setGenders] = useState<{ [key: string]: string }>({});

  // Toggle dropdown visibility
  const toggleDropdown = () => setIsOpen(!isOpen);

  // Handle gender selection
  const handleSelectGender = (value: string) => {
    setSelectedOption(value);
    onChange(value);
    setIsOpen(false); // Close dropdown after selection
  };

  useEffect(() => {
    const fetchGenders = async () => {
      // Gender options
      const supportedGenders = {
        M: 'Male',
        F: 'Female',
      };
      setGenders(supportedGenders);
    };

    fetchGenders();
  }, []);

  // SVG icon before selection
  const defaultIcon = (
    <svg
      version="1.1"
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 32 32"
      xmlSpace="preserve"
      className="w-7 h-7 mr-2"
    >
      <line
        style={{
          fill: 'none',
          stroke: '#FFFFFF',
          strokeWidth: 2,
          strokeMiterlimit: 10,
        }}
        x1="4"
        y1="22.583"
        x2="9.417"
        y2="28"
      />
      <polyline
        style={{
          fill: 'none',
          stroke: '#FFFFFF',
          strokeWidth: 2,
          strokeMiterlimit: 10,
        }}
        points="22,4 28,4 28,10 "
      />
      <line
        style={{
          fill: 'none',
          stroke: '#FFFFFF',
          strokeWidth: 2,
          strokeMiterlimit: 10,
        }}
        x1="28"
        y1="4"
        x2="22.232"
        y2="9.768"
      />
      <line
        style={{
          fill: 'none',
          stroke: '#FFFFFF',
          strokeWidth: 2,
          strokeMiterlimit: 10,
        }}
        x1="4"
        y1="28"
        x2="9.454"
        y2="22.546"
      />    
      <path
        style={{
        fill: 'none',
        stroke: '#FFFFFF',
        strokeWidth: 2,
        strokeMiterlimit: 10,
        }}
        d="M15.86,11.255c-0.114,0.087-0.232,0.167-0.334,0.27c-0.433,0.433-0.723,0.964-0.883,1.538
	c1.09,0.14,2.102,0.612,2.892,1.402C18.479,15.409,19,16.665,19,18s-0.521,2.591-1.465,3.536S15.335,23,14,23
	s-2.591-0.52-3.535-1.464S9,19.335,9,18c0-0.865,0.239-1.686,0.65-2.421C9.553,15.063,9.5,14.536,9.5,14
	c0-0.498,0.05-0.987,0.133-1.467c-0.201,0.162-0.397,0.332-0.582,0.517C7.729,14.373,7,16.13,7,18s0.729,3.627,2.051,4.95
	S12.13,25,14,25s3.627-0.728,4.949-2.05S21,19.87,21,18s-0.729-3.627-2.051-4.95C18.078,12.179,17.016,11.572,15.86,11.255z"
      />
      <path
        style={{
        fill: 'none',
        stroke: '#FFFFFF',
        strokeWidth: 2,
        strokeMiterlimit: 10,
        }}
        d="M22.949,9.05C21.627,7.728,19.87,7,18,7s-3.627,0.728-4.949,2.05S11,12.13,11,14s0.729,3.627,2.051,4.95
	c0.871,0.871,1.933,1.478,3.089,1.795c0.114-0.087,0.232-0.167,0.334-0.27c0.433-0.433,0.723-0.964,0.883-1.538
	c-1.09-0.14-2.102-0.612-2.892-1.402C13.521,16.591,13,15.335,13,14s0.521-2.591,1.465-3.536S16.665,9,18,9s2.591,0.52,3.535,1.464
	S23,12.665,23,14c0,0.865-0.239,1.686-0.65,2.421c0.096,0.516,0.15,1.043,0.15,1.579c0,0.498-0.05,0.987-0.133,1.467
	c0.201-0.162,0.397-0.332,0.582-0.517C24.271,17.627,25,15.87,25,14S24.271,10.373,22.949,9.05z"
      />
    </svg>
  );

  return (
    <div className="relative inline-block text-left">
      <button
        id="dropdownButton"
        onClick={toggleDropdown}
        className="text-white bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 font-medium rounded-lg text-sm px-2 py-2 inline-flex items-center"
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen ? 'true' : 'false'}
      >
        {selectedOption ? genders[selectedOption] : defaultIcon}

        <svg
          className={`w-4 h-4  transition-transform ${isOpen ? 'rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 10 6"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5 5 1 1 5"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          id="dropdownMenu"
          className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto bottom-full z-10"
        >
          {Object.entries(genders).map(([code, name]) => (
            <div
              key={code}
              className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
              onClick={() => handleSelectGender(code)}
            >
              <input
                id={`radio-${code}`}
                type="radio"
                value={code}
                name="gender-radio"
                checked={selectedOption === code}
                onChange={() => handleSelectGender(code)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-600"
              />
              <label
                htmlFor={`radio-${code}`}
                className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                {name}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Gender;
