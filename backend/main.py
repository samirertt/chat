from fastapi import FastAPI, File, Form, Response, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import socketio
import uvicorn
import os
from functions import database, translator, recorder

# Initialize FastAPI app
fastapi_app = FastAPI()

# CORS middleware
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:4173",
    "http://localhost:3000",
]

fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@fastapi_app.get("/")
async def read_root():
    return {"message": "Welcome to the FastAPI application"}

@fastapi_app.get("/favicon.ico")
async def favicon():
    return Response(status_code=204)

# FastAPI endpoints
@fastapi_app.get("/reset")
async def reset_conversation():
    database.reset_messages()
    return {"response": "conversation reset"}

@fastapi_app.post("/post_text/")
async def post_text(file: UploadFile = File(...), language: str = Form(...)):
    file_path = f"temp_{file.filename}"
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(file.file.read())
        
        # Log file path and language for debugging
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

        def iterfile():
            yield translated_text

        database.store_messages(text, translated_text)
        return StreamingResponse(iterfile(), media_type="text/plain")

    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

# Initialize Socket.IO server
sio = socketio.AsyncServer(cors_allowed_origins="*")

@sio.event
async def connect(sid, environ):
    print('New user connected:', sid)

@sio.event
async def send_message(sid, message):
    await sio.emit('message', message)

@sio.event
async def disconnect(sid):
    print('User disconnected:', sid)

# Combine FastAPI and Socket.IO
app = socketio.ASGIApp(sio, other_asgi_app=fastapi_app)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
