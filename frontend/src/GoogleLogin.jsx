import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { googleAuth } from './api';
import { useNavigate } from 'react-router-dom';
import LoginBackground from './LoginBackground';
import { motion } from 'framer-motion';

function GoogleLogin() {
  const navigate = useNavigate();

  const responseGoogle = async (authResult) => {
    try {
      if (authResult['code']) {
        const result = await googleAuth(authResult.code);
        const { email, name, image } = result.data.user;
        const token = result.data.token;
        const obj = { email, name, image, token };
        localStorage.setItem('user-info', JSON.stringify(obj));
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: 'auth-code'
  });

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Background animation */}
      <LoginBackground />

      {/* Centered login UI */}
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="bg-black bg-opacity-70 p-12 rounded-xl text-center shadow-xl backdrop-blur-md max-w-sm w-full mx-4"
        >
          <h1 className="text-4xl text-green-400 font-orbitron mb-6 tracking-widest select-none">
            Welcome to MediBot
          </h1>
          <p className="text-green-300 mb-6 select-none">Your AI Medical Assistant</p>
          <button
            onClick={googleLogin}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg transition duration-300 w-full"
          >
            Login with Google
          </button>
        </motion.div>
      </div>
    </div>
  );
}

export default GoogleLogin;
