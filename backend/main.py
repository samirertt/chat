import json
import time
from fastapi import Depends, FastAPI, File, Form, HTTPException, Response, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
from functions import database
from functions import recorder, translator, text_to_speech
from sqlalchemy import Column, Integer, String, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from fastapi.responses import JSONResponse, StreamingResponse
import socketio

# Define the FastAPI app
app = FastAPI()

# CORS middleware
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:4173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define your data models
class TranslationRequest(BaseModel):
    text: str
    language: str

class Voice_textReq(BaseModel):
    text: str
    selectedGender: str

import json
from fastapi import WebSocket, WebSocketDisconnect

@app.websocket("/ws/audio")
async def audio_streaming(websocket: WebSocket):
    await websocket.accept()
    
    wav_data = None
    selected_Lang = None
    
    try:
        while True:
            message_type = await websocket.receive()  # General receive method
            print("Received message from websocket")

            # Handle incoming message if it's a dictionary (language settings)
            if 'text' in message_type:
                try:
                    # Parse the received text message as JSON (language settings)
                    selected_Lang = json.loads(message_type['text'])
                    if isinstance(selected_Lang, dict):
                        print(f"Received language settings: {selected_Lang}")
                    else:
                        await websocket.send_text(json.dumps({"error": "Invalid language settings format. Expected a dictionary."}))

                except json.JSONDecodeError:
                    await websocket.send_text(json.dumps({"error": "Invalid JSON format."}))

            # Handle incoming message if it's binary data (WAV file)
            elif 'bytes' in message_type:
                wav_data = message_type['bytes']
                print("Received binary WAV data")

                if wav_data is not None and selected_Lang is not None:
                    # Extract the language settings (selectedFrom and selectedTo)
                    selectedTo = selected_Lang.get('selectedTo')
                    selectedFrom = selected_Lang.get('selectedFrom')

                    try:
                        # Assuming 'recorder.recognize_stream' is your speech recognition function
                        text = recorder.recognize_stream(wav_data, selectedFrom)

                        if text:
                            # Assuming 'translator.translate_textt' is your translation function
                            translatedText = translator.translate_textt(text, selectedTo)

                            if translatedText:
                                # Create a JSON object with both the transcribed and translated text
                                message = {
                                    "transcribedText": text,
                                    "translatedText": translatedText
                                }

                                # Send the JSON message back to the client
                                await websocket.send_text(json.dumps(message))

                    except Exception as e:
                        print("problem")

                else:
                    await websocket.send_text(json.dumps({"error": "Missing WAV data or language settings."}))

    except WebSocketDisconnect:
        print("WebSocket disconnected")


# Define other endpoints
@app.get("/")
async def read_root():
    return {"message": "Welcome to the FastAPI application"}

@app.get("/favicon.ico")
async def favicon():
    return Response(status_code=204)

@app.post("/text_voice/")
async def text_voice(request: Voice_textReq):
    if not request.text:
        raise HTTPException(status_code=400, detail="Text parameter is required")
    try:
        audio_output = text_to_speech.convert_text_to_speech(request.text, request.selectedGender)
        def iterfile():
            yield audio_output
        return StreamingResponse(iterfile(), media_type="application/octet-stream")
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.post("/post_text/")
async def post_text(file: UploadFile = File(...), language: str = Form(...)):
    file_path = f"temp_{file.filename}"
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(file.file.read())
        print(f"File saved at {file_path}")
        print(f"Selected language: {language}")
        text = recorder.record_text(file_path, language)
        if text:
            translated_text = translator.translate_textt(text, language)
        else:
            raise HTTPException(status_code=400, detail="Could not process audio file")
        database.store_messages(text, translated_text)
        return JSONResponse(content={"text": text, "translated_text": translated_text})
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

@app.post("/text_translate/")
async def text_translation(request: TranslationRequest):
    try:
        translated_text = translator.translate_textt(request.text, request.language)
        return JSONResponse(content={"text": request.text, "translated_text": translated_text})
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

# Database setup
DATABASE_URL = "sqlite:///./main.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class AnonymCode(Base):
    __tablename__ = "anonym_codes"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class AnonymCodeRequest(BaseModel):
    code: str

@app.post("/save_anonym_code/")
async def save_anonym_code(request: AnonymCodeRequest, db: Session = Depends(get_db)):
    new_code = AnonymCode(code=request.code)
    try:
        db.add(new_code)
        db.commit()
        db.refresh(new_code)
    except Exception as e:
        db.rollback()
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    return {"message": "Anonym code saved successfully", "code": new_code.code}

@app.post("/check_anonym_code/")
async def check_anonym_code(request: AnonymCodeRequest, db: Session = Depends(get_db)):
    existing_code = db.query(AnonymCode).filter(AnonymCode.code == request.code).first()
    if existing_code:
        return {"exists": True}
    else:
        return {"exists": False}

# Initialize Socket.IO server
sio = socketio.AsyncServer(cors_allowed_origins="*")
user_languages = {}

@sio.event
async def connect(sid, environ):
    print('New user connected:', sid)

@sio.event
async def join_room(sid, roomId):
    print(f"User {sid} joined room {roomId}")
    sio.enter_room(sid, roomId)

@sio.event
async def leave_room(sid, roomId):
    print(f"User {sid} left room {roomId}")
    sio.leave_room(sid, roomId)

@sio.event
async def set_language(sid, language):
    user_languages[sid] = language
    print(f"User {sid} set language to {language}")

@sio.event
async def send_message(sid, data):
    roomId = data.get('roomId')
    message = {
        'username': data.get('username'),
        'text': data.get('text')
    }
    print(f"Received message from {sid} in room {roomId}: {message}")

    # Get the list of all users in the room
    room_users = sio.rooms(roomId)

    # Translate and send the message to each user based on their language preference
    for user_sid in room_users:
        user_language = user_languages.get(user_sid, 'en')
        if user_language != 'en':  # Assuming 'en' is the default language
            translated_text = await translator.translate_text(message['text'], user_language)
        else:
            translated_text = message['text']
        await sio.emit('message', {'username': message['username'], 'text': message['text'], 'translated_text': translated_text}, room=user_sid)
        print(f"Message sent to user {user_sid} in room {roomId}: {message}")

@sio.event
async def disconnect(sid):
    print('User disconnected:', sid)
    user_languages.pop(sid, None)

# Combine FastAPI and Socket.IO
app = socketio.ASGIApp(sio, other_asgi_app=app)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
