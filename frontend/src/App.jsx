import { useState } from 'react'
import './App.css'
import { BrowserRouter , Route, Routes, Navigate } from 'react-router-dom'
import GoogleLogin from './GoogleLogin'
import Dashboard from './Dashboard'
import PageNotFound from './PageNotFound'
import { GoogleOAuthProvider } from '@react-oauth/google'

function App() {
  const GoogleAuthWrapper=()=>{
    return(
      <GoogleOAuthProvider clientId='1009917788840-vqfal5reagvqgbrp2sdgdvifrk5va50v.apps.googleusercontent.com'>
        <GoogleLogin></GoogleLogin>
      </GoogleOAuthProvider>
    )
  }
  return (
   <BrowserRouter>
      <Routes>
        <Route path="/login" element={<GoogleAuthWrapper/>} />
        <Route path="/" element={<Navigate to="/login"/>} />
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="*" element={<PageNotFound/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
