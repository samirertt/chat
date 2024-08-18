from fastapi import FastAPI, File, Form, Request, Response, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.params import Depends
from fastapi.responses import JSONResponse
from fastapi.responses import StreamingResponse
import socketio
import uvicorn
import os
from functions import database, translator, recorder, text_to_speech
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext
from sqlalchemy.orm import Session

class TranslationRequest(BaseModel):
    text: str
    language: str

class Voice_textReq(BaseModel):
    text: str

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


@app.post("/text_voice/")
async def text_voice(request: Voice_textReq):
    
    if not request.text:
        raise HTTPException(status_code=400, detail="Text parameter is required")
    
    try:
        audio_output = text_to_speech.convert_text_to_speech(request.text)

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

#DATABASE
# SQLAlchemy setup
DATABASE_URL = "sqlite:///./test.db"  # You can change the database URL as needed

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    fullname = Column(String, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

# Create the database tables
Base.metadata.create_all(bind=engine)

class AnonymCode(Base):
    __tablename__ = "anonym_codes"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)

# Update the database with the new table
Base.metadata.create_all(bind=engine)

# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

class UserSignup(BaseModel):
    fullname: str
    username: str
    email: str
    password: str

@app.post("/signup/")
async def signup(user: UserSignup, db: Session = Depends(get_db)):
    # Check if username or email already exists
    existing_user = db.query(User).filter((User.username == user.username) | (User.email == user.email)).first()
    
    if existing_user:
        if existing_user.username == user.username:
            raise HTTPException(status_code=400, detail="Username already in use")
        if existing_user.email == user.email:
            raise HTTPException(status_code=400, detail="Email already in use")

    hashed_password = pwd_context.hash(user.password)
    new_user = User(fullname=user.fullname, username=user.username, email=user.email, hashed_password=hashed_password)
    
    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    except Exception as e:
        db.rollback()
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    
    return {"message": "User created successfully", "user": new_user.username}


class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/login/")
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == request.username).first()
    if not db_user or not verify_password(request.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid username or password")
    # You can include more information in the response if needed
    return {"message": "Login successful", "username": db_user.username}


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
