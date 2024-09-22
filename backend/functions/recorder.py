import speech_recognition as sr
from io import BytesIO

recognizer = sr.Recognizer()

def record_text(file_path, selected_lang):
    try:
        with sr.AudioFile(file_path) as source:
            recognizer.adjust_for_ambient_noise(source, duration=0.5)
            audio = recognizer.listen(source)
            text = recognizer.recognize_google(audio, language=selected_lang)
            return text
    except sr.RequestError as e:
        print(f"Could not request results from the speech recognition service; {e}")
    except sr.UnknownValueError:
        print("We could not understand audio")
    except Exception as e:
        print(f"An unexpected error occurred during recording: {e}")
    return None

def save_wav_file(audio_stream, file_name="received_audio.wav"):
    try:
        # Save the audio stream as a WAV file
        with open(file_name, "wb") as wav_file:
            wav_file.write(audio_stream)
        print(f"Audio file saved as {file_name}")
    except Exception as e:
        print(f"Failed to save the audio file: {e}")


def recognize_stream(audio_stream, selected_lang="en"):
    try:

        save_wav_file(audio_stream, "received_audio.wav")
        # Convert byte stream to BytesIO object
        audio_data = BytesIO(audio_stream)
        
        # Use BytesIO with AudioFile to get AudioData
        with sr.AudioFile(audio_data) as source:
            recognizer.adjust_for_ambient_noise(source, duration=0.5)
            audio = recognizer.record(source)
            text = recognizer.recognize_google(audio, language=selected_lang)
            print(text)
            return text
    except sr.RequestError as e:
        print(f"Could not request results from the speech recognition service; {e}")
    except sr.UnknownValueError:
        print("We could not understand audio")
    except Exception as e:
        print(f"An unexpected error occurred during recognition: {e}")
    return None
