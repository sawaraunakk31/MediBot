import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const terms = [
  'Cardiology', 'Neurology', 'Pharmacology', 'Oncology',
  'Radiology', 'Pathology', 'Immunology', 'Dermatology',
  'Nephrology', 'Hematology', 'Urology', 'Orthopedics'
];

export default function LoginBackground() {
  const [hovered, setHovered] = useState(null);
  const [showECG, setShowECG] = useState(false);

  useEffect(() => {
    const idle = setTimeout(() => setShowECG(true), 5000);
    return () => clearTimeout(idle);
  }, [hovered]);

  useEffect(() => {
    if (showECG) {
      const timeout = setTimeout(() => setShowECG(false), 2500);
      return () => clearTimeout(timeout);
    }
  }, [showECG]);

  return (
    <div className="absolute inset-0 bg-black text-green-400 font-orbitron overflow-hidden grid grid-cols-4 grid-rows-3">
      {terms.map((term, index) => (
        <motion.div
          key={term}
          className="flex items-center justify-center text-2xl font-semibold uppercase select-none overflow-hidden text-ellipsis px-2 cursor-default"
          animate={{
            opacity: hovered === index ? 1 : 0,
            textShadow: hovered === index
              ? '0 0 8px #00ff00, 0 0 15px #00ff00, 0 0 20px #00ff00'
              : '0 0 3px #003300'
          }}
          transition={{ duration: 1 }}
          onMouseEnter={() => {
            setHovered(index);
            setShowECG(true);
          }}
          onMouseLeave={() => setHovered(null)}
        >
          {term}
        </motion.div>
      ))}

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
    </div>
  );
}
