import React, { useState } from 'react';

interface DropdownProps {
  onChange: (value: string) => void; // Callback function to pass selected value
}

const Dropdown: React.FC<DropdownProps> = ({ onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSelectedOption(value);
    onChange(value); // Pass selected value to parent component
  };

  return (
    <div className="relative inline-block text-left">
      <button
        id="dropdownTopButton"
        onClick={toggleDropdown}
        className="me-3 mb-3 md:mb-0 text-white bg-green-600 hover:bg-green-700 focus:ring-2 focus:outline-none focus:ring-green-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen ? 'true' : 'false'}
      >
        Select language
        <svg
          className="w-2.5 h-2.5 ms-3"
          aria-hidden="true"
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

      {/* Dropdown menu */}
      <div
        id="dropdownTop"
        className={`absolute right-0 mt-2 w-48 bg-white divide-y divide-gray-100 rounded-lg shadow-lg dark:bg-gray-700 ${isOpen ? 'bottom-full' : 'hidden'}`}
      >
        <div className="flex items-center p-2">
          <input
            id="default-radio-1"
            type="radio"
            value="tr-TR"
            name="default-radio"
            checked={selectedOption === 'tr-TR'}
            onChange={handleRadioChange}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label
            htmlFor="default-radio-1"
            className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            Turkish to English
          </label>
        </div>
        <div className="flex items-center p-2">
          <input
            id="default-radio-2"
            type="radio"
            value="en-EN"
            name="default-radio"
            checked={selectedOption === 'en-EN'}
            onChange={handleRadioChange}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label
            htmlFor="default-radio-2"
            className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            English to Turkish
          </label>
        </div>
      </div>
    </div>
  );
};

export default Dropdown;
