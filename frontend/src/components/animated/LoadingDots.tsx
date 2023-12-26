import React from 'react';
import { motion } from 'framer-motion';

const LoadingDots = () => {
  return (
    <div className="flex justify-center items-center my-2">
      {[...Array(3)].map((_, index) => (
        <motion.div
          key={index}
          className="w-2 h-2 bg-slate-800 rounded-full mx-1"
          initial={{ y: 0 }}
          animate={{ y: 10 }}
          transition={{
            repeat: Infinity,
            repeatType: 'reverse',
            duration: 0.5,
            delay: index * 0.25
          }}
        />
      ))}
    </div>
  );
};

export default LoadingDots;
