import React, { useState, useEffect } from 'react';
import RecordIcon from './RecordIcon';
import float32ArrayToWav from '../utils/float32towav';
import ChooseLang from './chooselang';


const RecordMessage_realtime: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [processorNode, setProcessorNode] = useState<AudioWorkletNode | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [mediaSource, setMediaSource] = useState<MediaStreamAudioSourceNode | null>(null);
  const [transcribedText, setTranscribedText] = useState<string | null>(null);
  const [translatedText, setTranslatedText] = useState<string | null>(null); // For translated text
  const [selectedTo, setSelectedTo] = useState<string>('en'); // Default language code
  const [selectedFrom, setSelectedFrom] = useState<string>('en'); // Default language code

  const handleLanguageChange = (from: string, to: string) => {
    setSelectedFrom(from);
    setSelectedTo(to);
  
    // Send updated languages immediately when they change
    if (socket && socket.readyState === WebSocket.OPEN) {
      const message = {
        selectedFrom: from,
        selectedTo: to,
      };
      socket.send(JSON.stringify(message)); // Send the updated languages
      console.log('Updated languages sent to WebSocket:', message);
    }
  };

  const initWebSocket = (): WebSocket => {
    const ws = new WebSocket('ws://localhost:8000/ws/audio');

    ws.onopen = () => {
      console.log('WebSocket connection established');
  
    };
    ws.onclose = () => console.log('WebSocket connection closed');
    ws.onerror = (e: Event) => {
      const errorMessage = e instanceof ErrorEvent ? e.message : 'WebSocket error';
      setError(`WebSocket error: ${errorMessage}`);
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data); // Assuming the server sends JSON
        const { transcribedText: newTranscribedText, translatedText: newTranslatedText } = data;

        // Append new transcribed text
        setTranscribedText((prevText) =>
          prevText ? `${prevText} ${newTranscribedText}` : newTranscribedText
        );

        // Append new transcribed text
        setTranslatedText((prevText) =>
          prevText ? `${prevText} ${newTranslatedText}` : newTranslatedText
        );
      
        console.log('Transcribed text:', newTranscribedText);
        console.log('Translated text:', newTranslatedText);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    return ws;
  };

  const loadProcessor = async () => {
    try {
      const context = new AudioContext();
      setAudioContext(context);
  
      if (!context.audioWorklet) {
        throw new Error('AudioWorklet is not supported in this browser.');
      }
  
      await context.audioWorklet.addModule('/audio-processor.js');
      const processor = new AudioWorkletNode(context, 'audio-processor');
      setProcessorNode(processor);
  
      const ws = initWebSocket();
      setSocket(ws);
  
      processor.port.onmessage = (event: MessageEvent) => {
        const float32Array = event.data as Float32Array;
        const wavBlob = float32ArrayToWav(float32Array, 48000);
  
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(wavBlob);
          console.log('Sending WAV data to WebSocket:', wavBlob);
        }
      };
    } catch (err: any) {
      console.error('Error loading audio processor:', err);
      setError('Failed to load audio processor.');
    }
  };

  useEffect(() => {
    loadProcessor();

    return () => {
      if (audioContext) {
        audioContext.close().catch((err) => console.error('Error closing AudioContext:', err));
      }
      if (socket) {
        socket.close();
      }
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const toggleRecording = async () => {
    if (!audioContext || !processorNode) {
      setError('Audio system not initialized.');
      return;
    }

    // Check if the audio context is suspended (common issue in Chrome)
    if (audioContext.state === 'suspended') {
      console.log('Resuming AudioContext...');
      await audioContext.resume();
    }

    if (isRecording) {
      if (mediaSource) {
        mediaSource.disconnect();
        setMediaSource(null);
      }
      setIsRecording(false);
      console.log('Recording stopped.');
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMediaStream(stream);

        const source = audioContext.createMediaStreamSource(stream);
        setMediaSource(source);
        
        // Reset transcribed and translated text when recording starts
        setTranscribedText(null);
        setTranslatedText(null);
        source.connect(processorNode);
        setIsRecording(true);
        console.log('Recording started.');
      } catch (err: any) {
        console.error('Error accessing microphone:', err);
        setError('Failed to access microphone.');
      }
    }
};


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat relative"
         style={{ backgroundImage: 'url("../images/rachel_bg.jpg")' }}>
      <div className="absolute inset-0"></div>
      <div className="relative z-10 flex flex-col items-center space-y-8">
        <p className="text-white font-semibold text-lg text-center max-w-2xl transform rotate-180 opacity-100 px-6 textcard">
        {translatedText}
        </p>

        <div className="flex items-center w-full">
          <div className="flex-1 h-1 bg-white rounded-md"></div>
          <button
            onClick={toggleRecording}
            className={`bg-white p-10 rounded-full shadow-lg transition-all duration-300 ease-in-out
                        ${isRecording ? 'animate-pulse border-4 border-red-500' : 'hover:bg-gray-300'}`}>
            <RecordIcon
              classText={isRecording ? 'animate-pulse text-red-500' : 'text-gray-400'}
              size="w-16 h-16 sm:w-16 sm:h-16 md:w-28 md:h-28 lg:w-34 lg:h-34"
            />
          </button>
          <div className="flex-1 h-1 bg-white rounded-md"></div>
        </div>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <p className="text-white font-semibold text-lg text-center max-w-2xl leading-relaxed opacity-100 px-6 textcard">
          {transcribedText}
        </p>

        <footer>
          <ChooseLang onChange={handleLanguageChange}/>
        </footer>
      </div>
    </div>
  );
};

export default RecordMessage_realtime;
