import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { gradientColorMap } from '../components/gradient-dict';
import { useBackground } from '../providers/BackgroundProvider';

export default function Background() {
  const [newBackground, setCurrentBackground] = useState('black');
  const [currentBackground, setOldBackground] = useState('black');

  const { background } = useBackground();

  const gradientColors =
    gradientColorMap[background as keyof typeof gradientColorMap] || 'from-gray-900 to-gray-700';

  // Move state update logic here
  if (newBackground !== gradientColors) {
    setCurrentBackground(gradientColors);
    setOldBackground(gradientColors);
  }

  return (
    <AnimatePresence>
      <motion.div
        key={currentBackground}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className={`fixed inset-0 bg-gradient-to-br ${currentBackground} -z-10`}
      />
      {newBackground !== currentBackground && (
        <motion.div
          key={newBackground}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className={`fixed inset-0 bg-gradient-to-br ${newBackground} -z-10`}
        />
      )}
    </AnimatePresence>
  );
}
