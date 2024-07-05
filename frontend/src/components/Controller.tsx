import { useState } from "react";
import Title from "./Title";
import axios from "axios";
import Recordmessage from "./RecordMessage";


const Controller = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  const handleStop = async (blobUrl: string) => {
    setIsLoading(true);

    const myMessage = { sender: "me", blobUrl };
    const messagesArr = [...messages, myMessage];
    setMessages(messagesArr);

    try {
      const response = await fetch(blobUrl);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append("file", blob, "myFile.wav");

      const res = await axios.post("http://localhost:8000/post_text/", formData, {
        headers: {
          "Content-Type": "audio/wav",
        },
      });

      const responseText = res.data;
      const rachelMessage = { sender: "rachel", text: responseText };
      setMessages([...messagesArr, rachelMessage]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-y-hidden">
      <Title setMessages={setMessages} />
      <div className="flex flex-col justify-between h-full overflow-y-scroll pb-96">
        <div className="mt-5 px-5">
          {messages.map((message, index) => (
            <div key={index + message.sender} className={"flex flex-col " + (message.sender === "rachel" && "flex items-end")}>
              <div className="mt-4">
                <p className={message.sender === "rachel" ? "text-right mr-2 italic text-green-500" : "ml-2 italic text-blue-500"}>
                  {message.sender}
                </p>
                {message.blobUrl ? (
                  <audio src={message.blobUrl} className="appearance-none" controls />
                ) : (
                  <p className={message.sender === "rachel" ? "text-right mr-2 text-green-500" : "ml-2 text-blue-500"}>
                    {message.text}
                  </p>
                )}
              </div>
            </div>
          ))}
          {messages.length === 0 && !isLoading && (
            <div className="text-center font-light italic mt-10">Send a message...</div>
          )}
          {isLoading && (
            <div className="text-center font-light italic mt-10 animate-pulse">Gimme a few seconds...</div>
          )}
        </div>
        <div className="fixed bottom-0 w-full py-6 border-t text-center bg-gradient-to-r from-blue-900 to-purple-900">
          <div className="flex justify-center items-center w-full">
            <div>
              <Recordmessage handleStop={handleStop} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Controller;
