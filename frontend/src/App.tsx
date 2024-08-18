import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Chat from './pages/Chat';
import PrivateRoom from './pages/PrivateRoom';
import Login from './pages/Login';
import Signup from './pages/signup';
import Annonim from './pages/Annonim';
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:roomId" element={<PrivateRoom />} />
        <Route path="/" element={<Login/>} />
        <Route path="/sign-up" element={<Signup/>} />
        <Route path="/annonim" element={<Annonim/>}/>
      </Routes>
    </Router>
  );
}

export default App;
