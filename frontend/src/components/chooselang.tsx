import React, { useState, useEffect } from 'react';

interface DropdownProps {
  onChange: (from: string, to: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFrom, setSelectedFrom] = useState('');
  const [selectedTo, setSelectedTo] = useState('');
  const [languages, setLanguages] = useState<{ [key: string]: string }>({});
  const [searchTerm, setSearchTerm] = useState('');

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'from' | 'to') => {
    const value = e.target.value;

    if (type === 'from') {
      setSelectedFrom(value);
      if (selectedTo) {
        onChange(value, selectedTo);
      }
    } else {
      setSelectedTo(value);
      if (selectedFrom) {
        onChange(selectedFrom, value);
      }
    }

    // Close modal only when both languages are selected
    if (selectedFrom && selectedTo) {
      setIsOpen(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  // Reverse button handler
  const handleReverse = () => {
    const temp = selectedFrom;
    setSelectedFrom(selectedTo);
    setSelectedTo(temp);
    onChange(selectedTo, selectedFrom);
  };

  useEffect(() => {
    const fetchLanguages = async () => {
      const supportedLanguages = {
        'af': 'Afrikaans',
        'sq': 'Albanian',
        'ar': 'Arabic',
        'az': 'Azerbaijani',
        'eu': 'Basque',
        'be': 'Belarusian',
        'bn': 'Bengali',
        'bs': 'Bosnian',
        'bg': 'Bulgarian',
        'ca': 'Catalan',
        'ceb': 'Cebuano',
        'zh-CN': 'Chinese (Simplified)',
        'zh-TW': 'Chinese (Traditional)',
        'hr': 'Croatian',
        'cs': 'Czech',
        'da': 'Danish',
        'nl': 'Dutch',
        'en': 'English',
        'eo': 'Esperanto',
        'et': 'Estonian',
        'fil': 'Filipino',
        'fi': 'Finnish',
        'fr': 'French',
        'gl': 'Galician',
        'ka': 'Georgian',
        'de': 'German',
        'el': 'Greek',
        'gu': 'Gujarati',
        'ht': 'Haitian Creole',
        'he': 'Hebrew',
        'hi': 'Hindi',
        'hu': 'Hungarian',
        'is': 'Icelandic',
        'id': 'Indonesian',
        'ga': 'Irish',
        'it': 'Italian',
        'ja': 'Japanese',
        'jv': 'Javanese',
        'kn': 'Kannada',
        'ko': 'Korean',
        'la': 'Latin',
        'lv': 'Latvian',
        'lt': 'Lithuanian',
        'mk': 'Macedonian',
        'ml': 'Malayalam',
        'mn': 'Mongolian',
        'mr': 'Marathi',
        'my': 'Burmese',
        'ne': 'Nepali',
        'no': 'Norwegian',
        'pl': 'Polish',
        'pt': 'Portuguese',
        'pa': 'Punjabi',
        'ro': 'Romanian',
        'ru': 'Russian',
        'sr': 'Serbian',
        'sk': 'Slovak',
        'sl': 'Slovenian',
        'es': 'Spanish',
        'su': 'Sundanese',
        'sw': 'Swahili',
        'sv': 'Swedish',
        'ta': 'Tamil',
        'te': 'Telugu',
        'th': 'Thai',
        'tr': 'Turkish',
        'uk': 'Ukrainian',
        'ur': 'Urdu',
        'vi': 'Vietnamese',
        'cy': 'Welsh',
        'yi': 'Yiddish'
      };

      setLanguages(supportedLanguages);
    };

    fetchLanguages();
  }, []);

  const filteredLanguages = Object.entries(languages).filter(([_, name]) =>
    name.toLowerCase().includes(searchTerm)
  );

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        {/* Button to open the modal */}
        <button
          onClick={toggleModal}
          className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 font-medium rounded-lg text-sm px-4 py-2"
        >
          {selectedFrom && selectedTo ? `${languages[selectedFrom]} → ${languages[selectedTo]}` : 'Choose Languages'}
        </button>

        {/* Reverse Button */}
        <button
          onClick={handleReverse}
          className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 font-medium rounded-lg text-sm px-4 py-2"
        >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 2.1l4 4-4 4"/><path d="M3 12.2v-2a4 4 0 0 1 4-4h12.8M7 21.9l-4-4 4-4"/><path d="M21 11.8v2a4 4 0 0 1-4 4H4.2"/></svg>
        </button>
      </div>

      {/* Modal with language lists */}
      {isOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-100">Select Languages</h2>
              <button
                onClick={toggleModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                &times;
              </button>
            </div>

            <input
              type="text"
              placeholder="Search languages..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-3 py-2 mb-4 border rounded-lg focus:outline-none focus:ring"
            />

            <div className="flex gap-4">
              {/* From Language List */}
              <div className="w-1/2">
                <h3 className="text-lg font-medium mb-2 text-gray-100">From</h3>
                <div className="max-h-60 overflow-y-auto border rounded-lg">
                  {filteredLanguages.length > 0 ? (
                    filteredLanguages.map(([code, name]) => (
                      <div className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer" key={code}>
                        <input
                          id={`from-radio-${code}`}
                          type="radio"
                          value={code}
                          name="from-language-radio"
                          checked={selectedFrom === code}
                          onChange={(e) => handleRadioChange(e, 'from')}
                          className="w-4 h-4 text-blue-600"
                        />
                        <label
                          htmlFor={`from-radio-${code}`}
                          className="ml-2 text-sm font-medium text-gray-100 dark:text-gray-300"
                        >
                          {name}
                        </label>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-gray-500">No languages found.</div>
                  )}
                </div>
              </div>

              {/* To Language List */}
              <div className="w-1/2">
                <h3 className="text-lg font-medium mb-2 text-gray-100">To</h3>
                <div className="max-h-60 overflow-y-auto border rounded-lg">
                  {filteredLanguages.length > 0 ? (
                    filteredLanguages.map(([code, name]) => (
                      <div className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer" key={code}>
                        <input
                          id={`to-radio-${code}`}
                          type="radio"
                          value={code}
                          name="to-language-radio"
                          checked={selectedTo === code}
                          onChange={(e) => handleRadioChange(e, 'to')}
                          className="w-4 h-4 text-blue-600"
                        />
                        <label
                          htmlFor={`to-radio-${code}`}
                          className="ml-2 text-sm font-medium text-gray-100 dark:text-gray-300"
                        >
                          {name}
                        </label>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-gray-500">No languages found.</div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex-1 h-1 bg-white rounded-md my-4 "></div>
            <div className=" flex justify-end">
              <button
                onClick={toggleModal}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
