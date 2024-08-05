from fastapi import FastAPI, File, Form, Response, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import socketio
import uvicorn
import os
from functions import database, translator, recorder
from pydantic import BaseModel

class TranslationRequest(BaseModel):
    text: str
    language: str

# Initialize FastAPI app
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

@app.get("/")
async def read_root():
    return {"message": "Welcome to the FastAPI application"}

@app.get("/favicon.ico")
async def favicon():
    return Response(status_code=204)

# FastAPI endpoints
@app.get("/reset")
async def reset_conversation():
    database.reset_messages()
    return {"response": "conversation reset"}

@app.post("/post_text/")
async def post_text(file: UploadFile = File(...), language: str = Form(...)):
    file_path = f"temp_{file.filename}"
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(file.file.read())
        
        print(f"File saved at {file_path}")
        print(f"Selected language: {language}")
        
        if language == "tr-TR":
            text = recorder.record_text_tr(file_path)
        else:
            text = recorder.record_text_en(file_path)
        
        if text:
            translated_text = translator.translate_text(text, language)
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
        translated_text = translator.translate_text(request.text, request.language)
        return JSONResponse(content={"text": request.text, "translated_text": translated_text})
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

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
