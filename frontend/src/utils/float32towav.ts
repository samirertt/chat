export default function float32ArrayToWav(float32Array: Float32Array, sampleRate: number = 16000): Blob {
    const numChannels = 1;  // Mono audio
    const bitsPerSample = 16;
    const numSamples = float32Array.length;

    // Create a buffer to store the WAV file
    const buffer = new ArrayBuffer(44 + numSamples * 2); // WAV header is 44 bytes, 2 bytes per sample
    const view = new DataView(buffer);

    // Function to write a string into the DataView
    const writeString = (offset: number, str: string): void => {
        for (let i = 0; i < str.length; i++) {
            view.setUint8(offset + i, str.charCodeAt(i));
        }
    };

    // ChunkID 'RIFF'
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true); // Chunk size
    writeString(8, 'WAVE'); // Format

    // 'fmt ' subchunk
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size (PCM)
    view.setUint16(20, 1, true);  // AudioFormat (1 for PCM)
    view.setUint16(22, numChannels, true); // NumChannels
    view.setUint32(24, sampleRate, true);  // SampleRate
    view.setUint32(28, sampleRate * numChannels * bitsPerSample / 8, true); // ByteRate
    view.setUint16(32, numChannels * bitsPerSample / 8, true); // BlockAlign
    view.setUint16(34, bitsPerSample, true); // BitsPerSample

    // 'data' subchunk
    writeString(36, 'data');
    view.setUint32(40, numSamples * 2, true); // Data chunk size

    // Write the PCM samples (convert Float32Array to 16-bit PCM)
    let offset = 44;
    for (let i = 0; i < float32Array.length; i++) {
        let sample = Math.max(-1, Math.min(1, float32Array[i])); // Clamp the sample to [-1, 1]
        sample = (sample < 0 ? sample * 32768 : sample * 32767) | 0; // Convert to 16-bit PCM
        view.setInt16(offset, sample, true); // Write the sample
        offset += 2;
    }

    // Create a Blob representing the WAV file
    return new Blob([view], { type: 'audio/wav' });
}
