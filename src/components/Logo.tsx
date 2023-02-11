import { motion } from 'framer-motion';

export default function Logo() {
  const initial = { y: -500, opacity: 0 };
  const animate = { y: 0, opacity: 1 };
  const transition = { type: 'spring', stiffness: 100, damping: 10 };

  const initial2 = { x: 500, opacity: 0 };
  const animate2 = { x: 0, opacity: 1 };
  const transition2 = { type: 'spring', stiffness: 100, damping: 10 };

  return (
    <div className="block text-white text-right">
      <motion.h1
        className="font-display lg:text-7xl text-6xl font-semibold"
        initial={initial}
        animate={animate}
        transition={transition}
      >
        Date Night
      </motion.h1>
      <motion.p
        className="font-body lg:text-3xl text-2xl font-semibold"
        initial={initial2}
        animate={animate2}
        transition={{ ...transition2, delay: 1 }}
      >
        from Kyle
      </motion.p>
    </div>
  );
}
