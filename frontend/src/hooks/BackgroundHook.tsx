import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { gradientColorMap } from '../components/gradient-dict';
import { useBackground } from '../providers/BackgroundProvider';

export default function Background() {
  const [backgrounds, setBackgrounds] = useState<string[]>([]);

  const { background } = useBackground();

  const gradientColors =
    gradientColorMap[background as keyof typeof gradientColorMap] || 'from-gray-900 to-gray-700';

  useEffect(() => {
    // Move state update logic here
    setBackgrounds((backgrounds) => {
      return [...backgrounds, gradientColors];
    });
  }, [background]);

  const variants = {
    active: { opacity: 0 },
    inactive: { opacity: 1 }
  };

  return (
    <AnimatePresence mode='popLayout'>
      {backgrounds.map((background, index) => (
        <motion.div
          key={index}
          variants={variants}
          animate='inactive'
          initial='active'
          exit='inactive'
          transition={{ duration: 1 }}

          // Once the background is set, we want to use a callback to remove it from the state
          // so that it can be added again later.
          onAnimationEnd={() => {
            setBackgrounds((backgrounds) => backgrounds.filter((_, i) => i !== index));
          }}

          className={`fixed inset-0 bg-gradient-to-br ${background} -z-10`}
        />
      ))}
    </AnimatePresence>
  );
}
