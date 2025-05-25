import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [userInfo, setUserInfo] = useState(null);
  const navigate=useNavigate();

  useEffect(()=>{
    const data=localStorage.getItem('user-info');
    const userData=JSON.parse(data);
    setUserInfo(userData);
  },[])

  const handleLogout = () => {
    localStorage.removeItem('user-info');
    navigate('/login');
  }
  return (
    <div>
      <h1>Welcome {userInfo?.name}</h1>
      <img src={userInfo?.image} alt={userInfo?.email} />
      <h3>Email: {userInfo?.email}</h3>
      <br />
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}

export default Dashboard
