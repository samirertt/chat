from google_trans_new import google_translator

def translate_text(text):
    """Translate the provided text from Turkish to English."""
    try:
        translator = google_translator()
        result_text = translator.translate(text, lang_src="tr", lang_tgt="en").text
        return result_text
    except Exception as e:
        print(f"An error occurred while translating: {e}")
        return None
