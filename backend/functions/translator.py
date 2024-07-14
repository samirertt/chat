from translate import Translator

def translate_text(text):
    """Translate the provided text from Turkish to English."""
    try:
        translator = Translator(from_lang="tr", to_lang="en")
        result = translator.translate(text)
        return result
    except Exception as e:
        print(f"An error occurred while translating: {e}")
        return None
