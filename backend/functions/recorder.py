import speech_recognition as sr

recognizer = sr.Recognizer()
def record_text_tr(audio_input):
    """Identify speech from the audio input and return it as text."""
    type(audio_input)
    try:
        with sr.AudioFile(audio_input) as source:
            recognizer.adjust_for_ambient_noise(source, duration=0.5)
            audio = recognizer.listen(source)
            turkish_text = recognizer.recognize_google_cloud(audio, language="tr-TR")
            return turkish_text
    except sr.RequestError as e:
        print(f"Could not request results from the speech recognition service; {e}")
    except sr.UnknownValueError:
        print("We could not understand audio")
    except Exception as e:
        print(f"An unexpected error occurred during recording: {e}")
    return None
