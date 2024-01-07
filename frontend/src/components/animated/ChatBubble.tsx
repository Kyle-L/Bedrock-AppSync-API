import { motion } from 'framer-motion';
import Markdown from 'react-markdown';
import Typewriter from './Typewriter';

export default function ChatBubble({
  picture,
  text,
  isAnimated
}: {
  picture?: string;
  text: string;
  isAnimated: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.25 }}
      className="w-full shadow-md rounded-xl p-2 my-2 bg-white flex items-center"
    >
      <img src={picture} className="rounded-full mr-4 w-12 h-12 shrink-0" />
      <div>{isAnimated ? <Typewriter text={text} delay={10} /> : <Markdown>{text}</Markdown>}</div>
    </motion.div>
  );
}
