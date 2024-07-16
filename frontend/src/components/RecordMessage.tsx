import React from 'react';
import { ReactMediaRecorder } from 'react-media-recorder';
import RecordIcon from './RecordIcon';
import { convertWebMToWAV } from '../utils/convertwebm2wav';

type Props = {
  handleStop: (blobUrl: string) => void;

};

const RecordMessage = ({ handleStop }: Props) => {
  const handleStopRecording = async (blobUrl: string) => {
    const response = await fetch(blobUrl);
    const webmBlob = await response.blob();

    // Convert WebM to WAV
    const wavBlob = await convertWebMToWAV(webmBlob);
    const wavBlobUrl = URL.createObjectURL(wavBlob);

    handleStop(wavBlobUrl);
  };

  let message = '';

  // Define the message based on the status
 
  
  
  return (
    <ReactMediaRecorder
      audio
      onStop={handleStopRecording}
      render={({ status, startRecording, stopRecording }) => (
        <div className="mt-2">
          <button
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            className="bg-white p-4 rounded-full"
          >
            <RecordIcon
              classText={status === 'recording' ? 'animate-pulse text-red-500' : 'text-gray-400'}
              size='w-8 h-8'
            />
          </button>
          <p className="mt-2 text-white font-light">{status === 'idle' ? message = "": message = status}</p>
        </div>
      )}
    />
  );
};

export default RecordMessage;
