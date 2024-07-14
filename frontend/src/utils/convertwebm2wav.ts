import { decodeAudioData } from 'standardized-audio-context';
import toWav from 'audiobuffer-to-wav';

export const convertWebMToWAV = async (webmBlob: Blob): Promise<Blob> => {
  const arrayBuffer = await webmBlob.arrayBuffer();
  const audioContext = new AudioContext();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  const wavArrayBuffer = toWav(audioBuffer);
  return new Blob([wavArrayBuffer], { type: 'audio/wav' });
};
