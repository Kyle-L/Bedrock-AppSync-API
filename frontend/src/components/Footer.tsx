import { AnimatePresence, motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';

export function Footer() {
  return (
      <div
        className="absolute lg:fixed fixed lg:bottom-4 left-0 h-16 px-4 flex flex-col space-y-2"
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
      </div>
  );
}
