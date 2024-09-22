import requests
from decouple import config

ELEVEN_LABS_API_KEY = config("ELEVEN_LABS_API_KEY")

# Eleven Labs
# Convert text to speech
def convert_text_to_speech(message,selectedGender):
  body = {
    "text": message,
    "model_id": "eleven_multilingual_v2",
    "voice_settings": {
        "stability": 0,
        "similarity_boost": 0
    }
  }

  voice_shaun = "mTSvIrm2hmcnOvb21nW2"
  voice_rachel = "21m00Tcm4TlvDq8ikWAM"
  voice_antoni = "ErXwobaYiN019PkySvjV"
  voice = ""
  if (selectedGender =="F"):
      voice=voice_rachel
  else:
      voice = "iP95p4xoKVk53GoZ742B"

  # Construct request headers and url
  headers = { "xi-api-key": ELEVEN_LABS_API_KEY, "Content-Type": "application/json", "accept": "audio/mpeg" }
  endpoint = f"https://api.elevenlabs.io/v1/text-to-speech/{voice}"

  try:
      # Make the POST request to the Eleven Labs API
      response = requests.post(endpoint, json=body, headers=headers)

      # Check if the request was successful
      if response.status_code == 200:
          # Return the audio content
          return response.content
      else:
          print(f"Request failed with status code: {response.status_code}")
          return None

  except Exception as e:
      print(f"An error occurred: {e}")
      return None