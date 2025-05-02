import { generateClient } from 'aws-amplify/api';
import { AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Persona, Thread } from '../API';
import PersonaCard from '../components/animated/PersonaCard';
import ThreadCard from '../components/animated/ThreadCard';
import * as mutations from '../graphql/mutations';
import * as queries from '../graphql/queries';
import { useBackground } from '../providers/BackgroundProvider';
import useAlert from '../hooks/AlertHook';
import { useAuth } from '../providers/AuthProvider';
import Container from '../components/layouts/Container';

const client = generateClient();

export default function Personas() {
  // State
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);

  // Hooks
  const auth = useAuth();
  const navigate = useNavigate();
  const { setBackground } = useBackground();
  const { addAlert } = useAlert();

  /**
   * Create a new thread with the given persona.
   * @param personaId {string} The persona to create a thread with.
   */
  const createThread = async (personaId: string) => {
    const result = await client.graphql({
      query: mutations.createThread,
      variables: {
        input: {
          personaId: personaId
        }
      }
    });

    navigate(`/thread/${result.data.createThread.thread?.threadId}`);
  };

  /**
   * Delete a thread with the given threadId.
   * @param threadId {string} The threadId to delete.
   */
  const deleteThread = async (threadId: string) => {
    setThreads(threads.filter((thread) => thread.threadId !== threadId));

    await client.graphql({
      query: mutations.deleteThread,
      variables: {
        input: {
          threadId: threadId
        }
      }
    });
  };

  useEffect(() => {
    setBackground('slate');
  }, []);

  useEffect(() => {
    // Gets all threads.
    client
      .graphql({ query: queries.getAllThreads })
      .then(({ data }) => {
        setThreads(data.getAllThreads as Thread[]);
      })
      .catch((err) => {
        addAlert(err?.message ?? 'Something went wrong', 'error');
      });

    // Gets all personas.
    client
      .graphql({ query: queries.getAllPersonas })
      .then(({ data }) => {
        setPersonas(data.getAllPersonas as Persona[]);
      })
      .catch((err) => {
        addAlert(err?.message ?? 'Something went wrong', 'error');
      });
  }, []);

  return (
    <>
      <Container>
        <div className="w-full">
          <h1 className="text-2xl font-extrabold w-full">Meet the Personas 👥</h1>
          <p className="text-slate-600 mt-2 border-l-2 border-slate-600 p-2 bg-slate-200 rounded-sm">
            "A persona in AI is a made-up character that represents a typical user, used to
            understand and improve interactions and experiences with AI systems."
          </p>
          <p className="text-slate-500 mt-2">
            Here, is a selection of personas that you can use to start a conversation. Click on a
            persona to start a conversation with them. Each of them has their own unique
            personality, knowledge, and interests.
          </p>
        </div>
      </Container>

      <Container>
        {auth.groups.includes('admin') && (
          <Link className="ml-auto" to="/personas/create">
            Create Persona
          </Link>
        )}

        <div className="w-full mt-4 mb-8">
          <h1 className="text-2xl font-extrabold w-full">Start a Conversation</h1>
          <ul className="w-full">
            <AnimatePresence>
              {[...personas]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((persona, index) => {
                  return (
                    <PersonaCard
                      key={persona.personaId}
                      persona={persona}
                      onClickCallBack={() => createThread(persona.personaId!)}
                      transition={{ delay: index * 0.1 }}
                    />
                  );
                })}
            </AnimatePresence>
          </ul>
        </div>

        {threads.length > 0 && (
          <div className="w-full mt-4 mb-8">
            <h1 className="text-2xl font-extrabold w-full">Open Conversations</h1>
            <ul className="w-full">
              <AnimatePresence>
                {[...threads].map((persona) => {
                  return (
                    <ThreadCard
                      key={persona.threadId}
                      persona={persona.persona!}
                      thread={persona}
                      onClickCallBack={() => navigate(`/thread/${persona.threadId}`)}
                      onDeleteCallBack={() => deleteThread(persona.threadId!)}
                    />
                  );
                })}
              </AnimatePresence>
            </ul>
          </div>
        )}
      </Container>
    </>
  );
}
