from translate import Translator

def translate_text(text, language):

    try:
        if language == "tr-TR":
            translator = Translator(from_lang="tr", to_lang="en")
        else:
            translator = Translator(from_lang="en", to_lang="tr")
            
        result = translator.translate(text)
        return result
    except Exception as e:
        print(f"An error occurred while translating: {e}")
        return None
