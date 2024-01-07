import { motion } from 'framer-motion';
import Markdown from 'react-markdown';
import Typewriter from './Typewriter';

export default function ChatBubble({
  picture,
  name,
  text,
  timestamp,
  isAnimated
}: {
  picture?: string;
  name?: string;
  text: string;
  timestamp?: string;
  isAnimated: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="w-full my-2 flex flex-col items-start"
    >
      <motion.div
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        exit={{ x: -50 }}
        transition={{ duration: 0.25 }}
        className="w-full shadow-md rounded-xl p-2 bg-white flex"
      >
        <img src={picture} className="rounded-full mr-4 w-10 h-10 shrink-0" />
        <div className="overflow-auto flex flex-col w-full justify-center">
          <p className="mt-[6pt] font-bold">{name}</p>
          {isAnimated ? <Typewriter text={text} delay={10} /> : <Markdown>{text}</Markdown>}
        </div>
      </motion.div>
      {timestamp && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="w-full text-gray-500 text-xs mt-1 text-right pr-2"
        >
          {new Date(timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' })}
          <span className="font-bold"> · </span>
          {new Date(timestamp).toLocaleDateString()}
        </motion.p>
      )}
    </motion.div>
  );
}
