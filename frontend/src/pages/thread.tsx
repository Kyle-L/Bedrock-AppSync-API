import { generateClient } from 'aws-amplify/api';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Message, Thread } from '../API';
import Logo from '../components/Logo';
import ChatConversation from '../components/animated/ChatConversation';
import LoadingDots from '../components/animated/LoadingDots';
import AudioPlayer from '../components/controls/audio/AudioPlayer';
import AudioSwitch from '../components/controls/audio/AudioSwitch';
import * as mutations from '../graphql/mutations';
import * as querys from '../graphql/queries';
import * as subscriptions from '../graphql/subscriptions';
import useAlert from '../hooks/AlertHook';
import { useAudio } from '../providers/AudioProvider';
import { useAuth } from '../providers/AuthProvider';
import { useBackground } from '../providers/BackgroundProvider';
import { getAvatarURL } from '../utils/avatar';
import Container from '../components/layouts/Container';

const client = generateClient();

export default function ThreadPage() {
  // Thread
  const [thread, setThread] = useState<Thread | null>(null);

  // Audio state
  const [audioClips, setAudioClips] = useState<HTMLAudioElement[]>([]);
  const audio = useAudio();

  // Conversation state
  const [conversationHistory, setConversationHistory] = useState<Omit<Message, '__typename'>[]>([]);
  const [lastMessage, setLastMessage] = useState<Omit<Message, '__typename'> | null>();

  // Loading state
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');

  // Hooks
  const { threadId } = useParams();
  const { userAttributes } = useAuth();
  const { setBackground } = useBackground();
  const { addAlert } = useAlert();

  // Prevents the page from loading if there is no threadId
  if (!threadId) return null;

  /**
   * Fetches the thread data from the API.
   */
  const fetchData = async () => {
    try {
      const { data } = await client.graphql({
        query: querys.getThread,
        variables: {
          input: {
            threadId
          }
        }
      });
      setThread(data.getThread as Thread);
    } catch (err: any) {
      addAlert(err?.message ?? 'Something went wrong!', 'error');
    }
  };

  /**
   * Creates a subscription to recieve messages from the chatbot.
   * @returns
   */
  const createSubscription = () => {
    // Create subscription function
    return client
      .graphql({
        query: subscriptions.recieveMessageChunkAsync,
        variables: { input: { threadId } }
      })
      .subscribe({
        next: ({ data }) => {
          const response = data?.recieveMessageChunkAsync;

          if (response) {
            if (response.chunkType === 'text') {
              setLastMessage({
                sender: 'Assistant',
                message: response.chunk,
                createdAt: new Date().toISOString()
              });
            }

            // Convert the response.chunk from base64 to an audio clip
            if (response.chunkType === 'audio') {
              const clipURLs = response.chunk.split(',');
              console.log('Recieved audio chunk:', response.chunk);

              const clips = clipURLs.map((url: string) => { 
                return new Audio(url);
              });
              setAudioClips(clips);
            }

            // Error chunk
            if (response.chunkType === 'error') {
              addAlert(response.chunk, 'error');
              setLoading(false);
            }

            if (response.status === 'COMPLETE') {
              setLoading(false);
            }
          }
        },
        error: (error) => {
          addAlert(error?.message ?? 'Something went wrong!', 'warning');
        }
      });
  };

  /**
   * Submits the user's input to the chatbot.
   * @returns
   */
  const onSubmit = async () => {
    // Pre-condition: We have an input.
    if (!input) return;

    // Start loading indicators
    setLoading(true);

    // Move both the last message into the conversation history, so that the typing animation is
    // no longer displayed for the last message. We also add the user's input to the conversation,
    // so that it is displayed in the UI.
    setConversationHistory((prevConversationHistory) => {
      let updatedConversationHistory = [...prevConversationHistory];
      if (lastMessage) {
        updatedConversationHistory = [...updatedConversationHistory, lastMessage];
      }
      return [
        ...updatedConversationHistory,
        { sender: 'User', message: input, createdAt: new Date().toISOString() }
      ];
    });

    // Clear the input.
    setInput('');

    // Clear the last message.
    setLastMessage(null);

    // Starts the async conversation with the chatbot.
    // We will recieve the messages from the chatbot via a subscription.
    client
      .graphql({
        query: mutations.createMessageAsync,
        variables: {
          input: {
            prompt: input,
            threadId,
            includeAudio: audio.generateAudio
          }
        }
      })
      .catch((err: any) => {
        addAlert(err?.message ?? 'Something went wrong!', 'error');
      });
  };

  // Fetches the thread data from the API.
  useEffect(() => {
    if (!threadId) return;
    fetchData();
    const subscription = createSubscription();
    return () => subscription.unsubscribe();
  }, [threadId]);

  // Loads the thread data into the states.
  useEffect(() => {
    // Use effect for updating conversation history and background
    if (!thread) return;
    setConversationHistory(thread.messages ?? []);
    setBackground(thread.persona!.color ?? 'default');
  }, [thread]);

  if (!thread) return <div>Loading...</div>;

  return (
    <>
      <div className="mr-auto flex flex-row">
        <Link to="/personas" className="text-white">
          Back
        </Link>
      </div>

      <Container>


        <div className="w-full flex justify-center items-center lg:flex-row mb-6">
          <Logo
            title={`Meet ${thread.persona.name}`}
            subtitle={thread.persona.subtitle}
            description={thread.persona.description}
            picture={getAvatarURL({ avatar: thread.persona.avatar, name: thread.persona.name })}
          />
        </div>

        <div className="w-full max-w-2xl">
          <ChatConversation
            conversationHistory={conversationHistory}
            lastMessage={lastMessage}
            thread={thread}
            userAttributes={userAttributes}
          />

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
          >
            {!loading ? (
              <input
                type="text"
                className="w-full shadow-md rounded-xl p-2 my-2"
                placeholder={`Message ${thread.persona.name}...`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                autoFocus
              />
            ) : (
              <div className="w-full pt-1 pb-2">
                <LoadingDots />
              </div>
            )}
            <button disabled={loading} className="btn w-full">
              Send
            </button>
          </form>

          <div className="w-full flex flex-row">
            <div className="ml-auto">
              <AudioSwitch />
            </div>
          </div>
        </div>
        <AudioPlayer audioFiles={audioClips} />
      </Container>
    </>

  );
}
