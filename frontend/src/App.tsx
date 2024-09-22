import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Chat from './pages/Chat';
import PrivateRoom from './pages/PrivateRoom';
import Login from './components/login_component';
import Annonim from './pages/Annonim';
import RecordMessage_realtime from './components/Record_realtime';
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        
        <Route path="/chat" element={<Chat />} />
        <Route path="/code" element={< Login/>} />
        <Route path="/chat/:roomId" element={<PrivateRoom />} />
        <Route path="/" element={<Annonim/>}/>
        <Route path="/real_time" element={<RecordMessage_realtime/>}/>
      </Routes>
    </Router>
  );
}

export default App;
