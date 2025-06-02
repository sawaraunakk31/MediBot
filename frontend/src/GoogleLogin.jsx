import React, { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { googleAuth } from './api';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Medical terms for the animated background
const terms = [
  'Cardiology', 'Neurology', 'Pharmacology', 'Oncology',
  'Radiology', 'Pathology', 'Immunology', 'Dermatology',
  'Nephrology', 'Hematology', 'Urology', 'Orthopedics'
];

export default function LoginWithBackground() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);
  const [showECG, setShowECG] = useState(false);

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

  // Trigger ECG on idle hover
  useEffect(() => {
    const idle = setTimeout(() => {
      if (hovered === null) setShowECG(true);
    }, 5000);
    return () => clearTimeout(idle);
  }, [hovered]);

  useEffect(() => {
    if (showECG) {
      const timeout = setTimeout(() => setShowECG(false), 2500);
      return () => clearTimeout(timeout);
    }
  }, [showECG]);

  return (
    <div className="fixed inset-0 bg-black text-green-400 font-orbitron overflow-hidden z-0">
      {/* Animated background terms */}
      <div className="absolute inset-0 grid grid-cols-4 grid-rows-3 z-0">
        {terms.map((term, index) => (
          <motion.div
            key={term}
            className="flex items-center justify-center text-3xl font-semibold uppercase select-none px-2"
            animate={{
              opacity: hovered === index ? 1 : 0,
              textShadow: hovered === index
                ? '0 0 8px #00ff00, 0 0 15px #00ff00, 0 0 20px #00ff00'
                : '0 0 3px #003300'
            }}
            transition={{ duration: 0.8 }}
            onMouseEnter={() => {
              setHovered(index);
              setShowECG(true);
            }}
            onMouseLeave={() => setHovered(null)}
          >
            {term}
          </motion.div>
        ))}
      </div>

      {/* ECG animation */}
      <AnimatePresence>
        {showECG && (
          <motion.div
            className="absolute top-1/2 left-0 w-full h-[200px] -translate-y-1/2 pointer-events-none z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <svg viewBox="0 0 2000 200" preserveAspectRatio="none" className="w-full h-full">
              <motion.path
                d="M0,100 L200,100 L300,20 L320,180 L340,100 L600,100 L700,60 L720,140 L740,100 L1000,100 L1100,20 L1120,180 L1140,100 L1400,100 L1500,60 L1520,140 L1540,100 L2000,100"
                stroke="#00ff00"
                strokeWidth="2"
                fill="none"
                initial={{ strokeDasharray: 3000, strokeDashoffset: 3000 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 2.5, ease: 'linear' }}
                className="drop-shadow-[0_0_4px_#00ff00]"
              />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Button */}
      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
        <button
          onClick={googleLogin}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg transition duration-300 shadow-lg pointer-events-auto"
        >
          Login with Google
        </button>
      </div>
    </div>
  );
}
