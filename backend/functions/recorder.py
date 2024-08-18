import speech_recognition as sr

recognizer = sr.Recognizer()

def record_text_tr(file_path):
    """Identify speech from the audio input and return it as text."""
    try:
        with sr.AudioFile(file_path) as source:
            recognizer.adjust_for_ambient_noise(source, duration=0.5)
            audio = recognizer.listen(source)
            text = recognizer.recognize_google(audio, language="tr-TR")
            return text
    except sr.RequestError as e:
        print(f"Could not request results from the speech recognition service; {e}")
    except sr.UnknownValueError:
        print("We could not understand audio")
    except Exception as e:
        print(f"An unexpected error occurred during recording: {e}")
    return None

def record_text_en(file_path):
    """Identify speech from the audio input and return it as text."""
    try:
        with sr.AudioFile(file_path) as source:
            recognizer.adjust_for_ambient_noise(source, duration=0.5)
            audio = recognizer.listen(source)
            text = recognizer.recognize_google(audio, language="en-EN")
            return text
    except sr.RequestError as e:
        print(f"Could not request results from the speech recognition service; {e}")
    except sr.UnknownValueError:
        print("We could not understand audio")
    except Exception as e:
        print(f"An unexpected error occurred during recording: {e}")
    return None

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