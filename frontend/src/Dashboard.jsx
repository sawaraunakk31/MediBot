import React, { useEffect, useState,useRef } from 'react';
import axios from 'axios';
import profileImg from './assets/pictures/profile.png'; 

function Dashboard() {
  const [userInfo, setUserInfo] = useState(null);
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [botTyping, setBotTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const data = localStorage.getItem('user-info');
    if (data) setUserInfo(JSON.parse(data));
  }, []);
   useEffect(() => {
  const scrollContainer = messagesEndRef.current?.parentNode;
  if (scrollContainer) {
    scrollContainer.scrollTop = scrollContainer.scrollHeight;
  }
}, [chatLog, botTyping]);

  const handleSend = async () => {
    if (!message.trim()) return;
    setChatLog(prev => [...prev, { role: 'user', text: message }]);
    setBotTyping(true);
    try {
      const res = await axios.post('http://127.0.0.1:8501/chat', { message });
      setTimeout(() => {
        setChatLog(prev => [...prev, { role: 'bot', text: res.data.response }]);
        setBotTyping(false);
      }, 500);
    } catch (err) {
      console.error(err);
      setChatLog(prev => [...prev, { role: 'bot', text: 'Error talking to bot.' }]);
      setBotTyping(false);
    }
    setMessage('');
  };

  const handleLogout = () => {
    localStorage.removeItem('user-info');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen text-white bg-gradient-to-r from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Top Navigation */}
      <header className="z-10 relative flex justify-between items-center px-6 py-4 shadow-md bg-black/80 backdrop-blur border-b border-green-700">
        <h1 className="text-2xl font-bold text-green-400 tracking-wide animate-pulse">MediBot 💬</h1>
        {userInfo && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <h2 className="text-md font-semibold text-green-100">{userInfo.name}</h2>
              <p className="text-xs text-gray-400">{userInfo.email}</p>
            </div>
            <img
              src={profileImg}
              alt="User"
              className="w-10 h-10 rounded-full border border-green-500 object-cover"
            />
            <button
              onClick={handleLogout}
              className="text-xs px-3 py-1 border border-red-500 rounded hover:bg-red-600 hover:text-white transition duration-300"
            >
              Logout
            </button>
          </div>
        )}
      </header>

      {/* Chat Section */}
      <main className="z-10 relative max-w-3xl mx-auto p-6">
        <div className="bg-gray-800/80 rounded-lg shadow-xl p-6 h-[500px] overflow-y-auto custom-scrollbar space-y-3 backdrop-blur-md border border-gray-700">
          {chatLog.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs px-4 py-2 rounded-xl shadow-md text-sm whitespace-pre-line
                ${msg.role === 'user'
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
                    : 'bg-gray-700 text-gray-200'}`}
              >
                <strong>{msg.role === 'user' ? 'You' : 'MediBot'}:</strong> {msg.text}
              </div>
            </div>
          ))}

          {botTyping && (
            <div className="flex justify-start">
              <div className="max-w-xs px-4 py-2 rounded-xl shadow-md text-sm bg-gray-700 text-gray-300">
                <strong>MediBot:</strong>
                <span className="ml-2 inline-block typing-dots">
                  <span className="dot bg-green-400 animate-bounce"></span>
                  <span className="dot bg-green-400 animate-bounce delay-150"></span>
                  <span className="dot bg-green-400 animate-bounce delay-300"></span>
                </span>
              </div>
            </div>
          )}
           <div ref={messagesEndRef} />

        </div>

        {/* Input Box */}
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-grow p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            placeholder="Ask something medical..."
          />
          <button
            onClick={handleSend}
            className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded-lg text-white font-semibold shadow-md transition"
          >
            Send
          </button>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
