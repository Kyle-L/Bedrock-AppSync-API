import { generateClient } from 'aws-amplify/api';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Persona, Thread } from '../API';
import * as mutations from '../graphql/mutations';
import * as queries from '../graphql/queries';
import { gradientColorMap } from '../components/gradient-dict';
import { useBackground } from '../providers/BackgroundProvider';

const client = generateClient();

export default function Personas() {
  const background = useBackground();
  const navigate = useNavigate();

  useEffect(() => {
    background.setBackground('rose');
  }, []);

  const [personas, setPersonas] = useState<Persona[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);

  useEffect(() => {
    getPersonas();
  }, []);

  const getPersonas = async () => {
    client
      .graphql({ query: queries.getAllThreads })
      .then(({ data }) => {
        const threads = data.getAllThreads as Thread[];
        setThreads(threads);
      })
      .catch((err) => console.log(err));

    client
      .graphql({ query: queries.getAllPersonas })
      .then(({ data }) => {
        // Filter out personas that already have threads
        const personas = data.getAllPersonas as Persona[];
        setPersonas(personas);
      })
      .catch((err) => console.log(err));
  };

  /**
   * Create a new thread with the given persona.
   * @param personaId {string} The persona to create a thread with.
   */
  const createThread = async (personaId: string) => {
    const result = await client.graphql({
      query: mutations.addThread,
      variables: {
        personaId: personaId
      }
    });

    navigate(`/thread/${result.data.addThread.threadId}`);
  };

  /**
   * Delete a thread with the given threadId.
   * @param threadId {string} The threadId to delete.
   */
  const deleteThread = async (threadId: string) => {
    await client.graphql({
      query: mutations.deleteThread,
      variables: {
        threadId: threadId
      }
    });

    setThreads(threads.filter((thread) => thread.threadId !== threadId));
  };

  const slideIn = {
    initial: { opacity: 0, x: -100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 }
  };

  return (
    <>
      <div className="w-full mt-4 mb-8">
        <h1 className="text-2xl font-extrabold w-full">Start a Conversation</h1>
        <ul className="w-full">
          <AnimatePresence>
            {[...personas]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((persona, index) => {
                const hasThread = threads.some(
                  (thread) => thread.persona?.personaId === persona.personaId
                );

                return (
                  <motion.li
                    key={`persona_${persona.personaId}`}
                    {...slideIn}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center w-full
                    bg-gradient-to-br ${
                      gradientColorMap[persona.color as keyof typeof gradientColorMap]
                    } text-white font-bold rounded-xl p-2 my-2 filter hover:brightness-110 transition-filter`}
                  >
                    {hasThread ? (
                      <Link
                        className="w-full h-full flex items-center hover:brightness-100 transition-filter"
                        to={`/thread/${threads.find(
                          (thread) => thread.persona?.personaId === persona.personaId
                        )?.threadId}`}
                      >
                        <img className="w-20 h-20 rounded-full mr-4" src={persona.avatar!} />
                        <div className="flex flex-col items-start drop-shadow-lg">
                          <p>{persona.name}</p>
                          <sub className="font-normal">{persona.subtitle}</sub>
                        </div>
                      </Link>
                    ) : (
                      <button
                        className="w-full h-full flex items-center hover:brightness-100 transition-filter"
                        onClick={() => createThread(persona.personaId!)}
                      >
                        <img className="w-20 h-20 rounded-full mr-4" src={persona.avatar!} />
                        <div className="flex flex-col items-start drop-shadow-lg">
                          <p>{persona.name}</p>
                          <sub className="font-normal">{persona.subtitle}</sub>
                        </div>
                      </button>
                    )}
                    {hasThread && (
                      <motion.button
                        animate={{ opacity: 1, y: 0 }}
                        initial={{ opacity: 0, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="mr-4"
                        onClick={() =>
                          deleteThread(
                            threads.find(
                              (thread) => thread.persona?.personaId === persona.personaId
                            )?.threadId!
                          )
                        }
                      >
                        Reset
                      </motion.button>
                    )}
                  </motion.li>
                );
              })}
          </AnimatePresence>
        </ul>
      </div>
    </>
  );
}
