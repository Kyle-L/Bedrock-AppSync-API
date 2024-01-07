import { generateClient } from 'aws-amplify/api';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Message, Thread } from '../API';
import Logo from '../components/Logo';
import ChatConversation from '../components/animated/Conversation';
import LoadingDots from '../components/animated/LoadingDots';
import * as mutations from '../graphql/mutations';
import * as querys from '../graphql/queries';
import * as subscriptions from '../graphql/subscriptions';
import useAlert from '../hooks/AlertHook';
import { useAuth } from '../providers/AuthProvider';
import { useBackground } from '../providers/BackgroundProvider';
import { getAvatarURL } from '../utils/avatar';

const client = generateClient();

export default function ThreadPage() {
  // State
  const [conversationHistory, setConversationHistory] = useState<Omit<Message, '__typename'>[]>([]);
  const [lastMessage, setLastMessage] = useState<Omit<Message, '__typename'> | null>();
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [thread, setThread] = useState<Thread | null>(null);

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
      addAlert(err?.message ?? 'Something went wrong', 'error');
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
            if (response.chunk) {
              setLastMessage((prevLastMessage) => ({
                sender: 'Assistant',
                message: `${prevLastMessage?.message ?? ''}${response.chunk}`
              }));
            }

            if (response.status === 'COMPLETE') {
              setLoading(false);
            }
          }
        },
        error: (error) => {
          addAlert(error?.message ?? 'Something went wrong', 'warning');
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
      return [...updatedConversationHistory, { sender: 'User', message: input }];
    });

    // Clear the input.
    setInput('');

    // Clear the last message.
    setLastMessage(null);

    // Starts the async conversation with the chatbot.
    // We will recieve the messages from the chatbot via a subscription.
    client
      .graphql({
        query: mutations.addMessageAsync,
        variables: {
          input: {
            prompt: input,
            threadId
          }
        }
      })
      .catch((err: any) => {
        addAlert(err?.message ?? 'Something went wrong', 'error');
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
      <div className="w-full flex justify-center items-center lg:flex-row mb-6">
        <Logo
          title={`Meet ${thread.persona.name}`}
          subtitle={thread.persona.subtitle}
          description={thread.persona.description}
          picture={getAvatarURL({ avatar: thread.persona.avatar, name: thread.persona.name })}
        />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="w-full max-w-2xl"
      >
        <ChatConversation
          conversationHistory={conversationHistory}
          lastMessage={lastMessage}
          thread={thread}
          userAttributes={userAttributes}
        />
        {!loading ? (
          <textarea
            className="w-full shadow-md rounded-xl p-2 my-2"
            placeholder={`Message ${thread.persona.name}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
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
    </>
  );
}
