import { AnimatePresence, motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';

export function Footer() {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        transition={{ duration: 0.25 }}
        className="fixed bottom-4 left-0 h-16 px-4 sm:px-6 lg:px-8 flex flex-col space-y-2"
      >
        <a
          href="https://github.com/Kyle-L/Bedrock-AppSync-API"
          target="_blank"
          className="text-white opacity-90 hover:opacity-100 transition-opacity transition-all"
        >
          <FontAwesomeIcon icon={faGithub} /> Github
        </a>
        <a
          href="https://kylelierer.com"
          target="_blank"
          className="text-white opacity-90 hover:opacity-100 transition-opacity transition-all"
        >
          <FontAwesomeIcon icon={faGlobe} /> KyleLierer.com
        </a>
      </motion.div>
    </AnimatePresence>
  );
}
