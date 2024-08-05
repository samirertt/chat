import { useState } from "react";
import Title from "./Title";
import axios from "axios";
import Recordmessage from "./RecordMessage";
import '../index.css'; 

const Controller = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedLanguage(event.target.value);
  };

  const handleStop = async (blobUrl: string) => {
    setIsLoading(true);

    const myMessage = { sender: "Me", blobUrl };
    const messagesArr = [...messages, myMessage];
    setMessages(messagesArr);

    try {
      const response = await fetch(blobUrl);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append("file", blob, "myFile.wav");
      formData.append("language", selectedLanguage);

      const res = await axios.post("http://localhost:8000/post_text/", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { text, translated_text } = res.data;
      const RachelMessage = { sender: "Rachel", text: translated_text };
      setMessages([...messagesArr, RachelMessage]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-y-hidden bg-cover bg-custom-rachel-image bg-center">
      <Title setMessages={setMessages} />
      <div className="flex flex-col justify-between h-full overflow-y-scroll pb-96">
        <div className="mt-5 px-5">
          {messages.map((message, index) => (
            <div key={index + message.sender} className={"flex flex-col " + (message.sender === "Rachel" && "flex items-end")}>
              <div className="mt-4">
                <p className={message.sender === "Rachel" ? "text-right mr-2 italic font-bold text-pink-600" : "ml-2 italic text-teal-600 font-bold"}>
                  {message.sender}
                </p>
                {message.blobUrl ? (
                  <audio src={message.blobUrl} className="appearance-none" controls />
                ) : (
                <div className={message.sender === "Rachel" ? "flex justify-end" : "flex justify-start"}>
                  <div className={message.sender === "Rachel" ? "bg-pink-100 text-pink-600 rounded-lg p-2 mr-2" : "bg-teal-200 text-teal-600 rounded-lg p-2 ml-2 font-bold"}>
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>
                )}
              </div>
            </div>
          ))}
          {messages.length === 0 && !isLoading && (
            <div className="text-center italic mt-10 text-white font-semibold text-xl">Send a message...</div>
          )}
          {isLoading && (
            <div className="text-center font-light italic mt-10 animate-pulse">Gimme a few seconds...</div>
          )}
        </div>
        <div className="fixed bottom-0 w-full py-3 text-center bg-gradient-to-r from-teal-600 to-gray-600">
          <div className="flex justify-center items-center space-x-6">
            <div>
              <Recordmessage handleStop={handleStop} />
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="flex items-center">
                <input
                  id="default-radio-1"
                  type="radio"
                  value="tr-TR"
                  name="default-radio"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  onChange={handleRadioChange}
                />
                <label
                  htmlFor="default-radio-1"
                  className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  Turkish to English
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="default-radio-2"
                  type="radio"
                  value="en-EN"
                  name="default-radio"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  onChange={handleRadioChange}
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
        </div>
      </div>
    </div>
  );
};

export default Controller;
