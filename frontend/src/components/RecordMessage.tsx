import React, { useState, useEffect } from 'react';
import { MediaRecorder, register } from 'extendable-media-recorder';
import { connect } from 'extendable-media-recorder-wav-encoder'; // For WAV encoding
import RecordIcon from './RecordIcon';

type Props = {
  handleStop: (blobUrl: string) => void;
};

const RecordMessage = ({ handleStop }: Props) => {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initRecorder = async () => {
      try {
        // Register the WAV encoder
        await register(await connect());

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream, { mimeType: 'audio/wav' }) as MediaRecorder;

        setMediaRecorder(recorder);

        // Clean up the stream when the component unmounts
        return () => {
          stream.getTracks().forEach(track => track.stop());
        };
      } catch (err) {
        console.error('Error initializing media recorder:', err);
      }
    };

    initRecorder();
  }, []);

  const toggleRecording = () => {
    if (mediaRecorder) {
      if (isRecording) {
        mediaRecorder.stop();
        setIsRecording(false);
        console.log("Recording stopped");
      } else {
        mediaRecorder.start();
        setIsRecording(true);
        console.log("Recording started");
      }
    }
  };

  useEffect(() => {
    if (mediaRecorder) {
      mediaRecorder.ondataavailable = async (event) => {
        console.log('Data available:', event.data);
        if (event.data.size > 0) {
          const audioBlob = new Blob([event.data], { type: 'audio/wav' });
          const audioUrl = URL.createObjectURL(audioBlob);
          console.log('Audio URL:', audioUrl);
          handleStop(audioUrl);
        } else {
          console.error("No data available");
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setError('An error occurred while recording.');
      };
    }
  }, [mediaRecorder, handleStop]);

  return (
    <div className="mt-2">
      <button
        onClick={toggleRecording}
        className="bg-white p-4 rounded-full"
      >
        <RecordIcon
          classText={isRecording ? 'animate-pulse text-red-500' : 'text-gray-400'}
          size='w-8 h-8'
        />
      </button>
    </div>
  );
};

export default RecordMessage;
