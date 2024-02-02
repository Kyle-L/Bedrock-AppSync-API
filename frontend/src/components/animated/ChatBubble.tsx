import { motion } from 'framer-motion';
import Markdown from 'react-markdown';
import Typewriter from './Typewriter';
import { generateClient } from 'aws-amplify/api';
import * as mutations from '../../graphql/mutations';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faVolumeUp } from '@fortawesome/free-solid-svg-icons';
import useAlert from '../../hooks/AlertHook';

const client = generateClient();

export default function ChatBubble({
  picture,
  name,
  id,
  text,
  timestamp,
  isAnimated
}: {
  picture?: string;
  name?: string;
  text: string;
  id?: string;
  timestamp?: string;
  isAnimated: boolean;
}) {
  const [loadingAudio, setLoadingAudio] = useState(false);

  const alert = useAlert();

  async function playAudio(url: string, retries: number = 10) {
    while (retries > 0) {
      try {
        await new Promise((resolve, reject) => {
          const audio = new Audio(url);
          audio.onended = resolve; // Resolve the promise when the audio has finished playing
          audio.onerror = reject; // Reject the promise if an error occurs
          audio.play();
        });
        break; // If the audio plays successfully, break the loop
      } catch (error) {
        if (--retries === 0) throw error; // If all retries failed, throw the error
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second before retrying
      }
    }
  }

  const generateAudio = async (text: string) => {
    try {
      setLoadingAudio(true);

      const sentences = [text];

      let promises = sentences.map((sentence) => {
        const result = client.graphql({
          query: mutations.createVoice,
          variables: {
            input: {
              message: sentence,
              threadId: id!
            }
          }
        });

        return result;
      });

      for (const promise of promises) {
        console.log('Waiting for promise to resolve...');
        const result = await promise;

        await playAudio(result.data.createVoice.result!).catch((error) => {
          console.error('Failed to play audio after multiple retries:', error);
        });
      }
    } catch (error) {
      alert.addAlert('Failed to generate audio', 'error');
      console.error('Failed to generate audio:', error);
    }

    setLoadingAudio(false);
  };

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
        className="relative w-full shadow-md rounded-xl p-2 bg-white flex"
      >
        {id && (
          <button
            disabled={loadingAudio}
            aria-label="Play audio"
            className="absolute top-2 right-2 font-bold text-slate-400 hover:text-slate-500 transition-colors"
            onClick={() => generateAudio(text)}
          >
            <FontAwesomeIcon icon={loadingAudio ? faSpinner : faVolumeUp} spin={loadingAudio} />
          </button>
        )}
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
