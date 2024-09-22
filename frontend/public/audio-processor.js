class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.audioBuffer = [];
    this.lastSendTime = 0; // Store the time of the last data send (initialize to 0)
    this.energyThreshold = 0.0001; // Threshold to detect silence vs. speech
    this.silenceDuration = 0; // Track how long silence has lasted
    this.silenceThresholdDuration = 0.3; // Time to consider silence (in seconds)
    this.voiceDetected = false; // Whether voice was detected in previous iterations
    this.timeSlice = 4.0; // Time slice for sending audio regardless of silence (in seconds)
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    const now = currentTime; // Access current time in AudioContext

    if (input.length > 0 && input[0].length > 0) {
      const audioData = input[0]; // Audio data for the current frame

      // Copy input to output
      output[0].set(audioData);

      // Accumulate audio data
      this.audioBuffer.push(...audioData);

      // Calculate the energy of the audio signal (RMS energy calculation)
      const energy = this.calculateEnergy(audioData);

      // VAD: Detect if speech is happening based on the energy level
      if (energy > this.energyThreshold) {
        this.silenceDuration = 0; // Reset the silence duration
        this.voiceDetected = true; // Mark that voice is detected
      } else {
        // Silence: Accumulate silence duration
        this.silenceDuration += (now - this.lastSendTime); // Calculate silence duration in seconds
      }

      // Check if silence has persisted for the threshold duration, and voice was detected before
      if (this.voiceDetected && this.silenceDuration >= this.silenceThresholdDuration) {
        this.sendAudioBuffer(now); // Send accumulated audio buffer, pass current time
        this.voiceDetected = false; // Reset voice detection
        this.silenceDuration = 0; // Reset silence duration after sending
      }

      // Time slice: Send the buffer if enough time has passed (even if there is no silence)
      if (now - this.lastSendTime >= this.timeSlice) { // Time in seconds
        this.sendAudioBuffer(now); // Send accumulated audio buffer after time slice
      }
    }

    return true; // Keep processor alive
  }

  // Send the accumulated audio buffer to the backend (via the main thread)
  sendAudioBuffer(now) {
    if (this.audioBuffer.length > 0) {
      this.port.postMessage(this.audioBuffer); // Send audio buffer to the main thread
      this.audioBuffer = []; // Clear the buffer after sending
      this.lastSendTime = now; // Update the lastSendTime to the current time
    }
  }

  // Function to calculate the RMS energy of the audio signal (used for VAD)
  calculateEnergy(audioData) {
    let sum = 0;
    for (let i = 0; i < audioData.length; i++) {
      sum += audioData[i] * audioData[i];
    }
    return Math.sqrt(sum / audioData.length); // Return the RMS value (energy)
  }
}

// Register the processor
registerProcessor('audio-processor', AudioProcessor);
