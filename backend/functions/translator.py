from translate import Translator
from langdetect import detect


def translate_textt(text,language):
    
    try:
        lang_text = detect(text)
        translator = Translator(from_lang=lang_text, to_lang=language)
        
        result = translator.translate(text)
        return result
    except Exception as e:
        print(f"An error occurred while translating: {e}")
        return None