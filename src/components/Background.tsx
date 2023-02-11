import { motion } from 'framer-motion';

export default function Background() {
  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-purple-500" />
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-purple-500 to-red-500"
        animate={{ opacity: 0.5 }}
        transition={{ duration: 5, repeat: Infinity, repeatType: 'reverse' }}
      />
    </div>
  );
}
