import { faVolumeUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Markdown from 'react-markdown';
import AudioPlayer from '../controls/audio/AudioPlayer';
import Typewriter from './Typewriter';

export default function ChatBubble({
  picture,
  name,
  message,
  audioClips,
  timestamp,
  isAnimated
}: {
  picture?: string;
  name?: string;
  message: string;
  audioClips?: string[];
  timestamp?: string;
  isAnimated: boolean;
}) {
  const [playAudio, setPlayAudio] = useState(false);
  const generateAudio = async () => {
    setPlayAudio(true);
  };

  return (
    <>
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
          className="relative w-full shadow-md rounded-xl p-2 bg-white flex"
        >
          {/* Play audio button */}
          {audioClips && audioClips.length > 0 && (
            <button
              aria-label="Play audio"
              className="absolute top-2 right-2 font-bold text-slate-400 hover:text-slate-500 transition-colors"
              onClick={() => generateAudio()}
            >
              <FontAwesomeIcon icon={faVolumeUp} />
            </button>
          )}

          {/* Profile picture */}
          <img src={picture} className="rounded-full mr-4 w-10 h-10 shrink-0" />

          {/* Message */}
          <div className="overflow-auto flex flex-col w-full justify-center">
            <p className="mt-[6pt] font-bold">{name}</p>
            {isAnimated ? <Typewriter text={message} /> : <Markdown>{message}</Markdown>}
          </div>
        </motion.div>

        {/* Timestamp */}
        {timestamp && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="w-full text-slate-500 text-xs mt-1 text-right pr-2"
          >
            {new Date(timestamp).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: 'numeric'
            })}
            <span className="font-bold"> · </span>
            {new Date(timestamp).toLocaleDateString()}
          </motion.p>
        )}
      </motion.div>

      {/* Audio player */}
      {audioClips && audioClips.length > 0 && (
        <AudioPlayer
          audioClips={audioClips}
          play={playAudio}
          onAudioEnd={() => setPlayAudio(false)}
        />
      )}
    </>
  );
}
