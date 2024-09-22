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
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const initRecorder = async () => {
    try {
      // Register the WAV encoder
      await register(await connect());

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/wav' }) as MediaRecorder;

      setMediaRecorder(recorder);
      setMediaStream(stream); // Save the media stream for cleanup

      recorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          const audioBlob = new Blob([event.data], { type: 'audio/wav' });
          const audioUrl = URL.createObjectURL(audioBlob);
          handleStop(audioUrl);
        } else {
          console.error("No data available");
        }
      };

      recorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setError('An error occurred while recording.');
      };

      recorder.onstop = () => {
        cleanup();
      };

      return recorder;
    } catch (err) {
      console.error('Error initializing media recorder:', err);
      setError('Failed to initialize recorder.');
      return null;
    }
  };

  const cleanup = () => {
    if (mediaRecorder) {
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setMediaRecorder(null);
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
  };

  useEffect(() => {
    // Cleanup function to stop the stream when the component unmounts
    return () => {
      cleanup();
    };
  }, [mediaStream, mediaRecorder]);

  const toggleRecording = async () => {
    if (!mediaRecorder) {
      const recorder = await initRecorder();
      if (!recorder) return;
    }

    if (mediaRecorder) {
      if (isRecording) {
        mediaRecorder.stop();
        console.log("Recording stopped");
      } else {
        mediaRecorder.start();
        console.log("Recording started");
      }

      setIsRecording(!isRecording);
    }
  };

  return (
    <div className="mt-4 flex flex-col items-center xs:mb-3">
      <button
        onClick={toggleRecording}
        className="bg-white p-3 rounded-full shadow-md flex items-center justify-center"
      >
        <RecordIcon
          classText={isRecording ? 'animate-pulse text-red-500' : 'text-gray-400'}
          size="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-8 lg:h-8"
        />
      </button>
      {error && <p className="text-red-500 text-xs sm:text-sm md:text-base mt-2">{error}</p>}
    </div>
  );
};

export default RecordMessage;
