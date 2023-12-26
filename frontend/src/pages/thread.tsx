import { generateClient } from 'aws-amplify/api';
import { AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Message, Thread } from '../API';
import Logo from '../components/Logo';
import ChatBubble from '../components/animated/ChatBubble';
import LoadingDots from '../components/animated/LoadingDots';
import * as mutations from '../graphql/mutations';
import * as querys from '../graphql/queries';
import * as subscriptions from '../graphql/subscriptions';
import useAlert from '../hooks/AlertHook';
import { useAuth } from '../providers/AuthProvider';
import { useBackground } from '../providers/BackgroundProvider';
import { getAvatar } from '../utils/avatar';

const client = generateClient();

export default function AIInput() {
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [thread, setThread] = useState<Thread | null>(null);

  const { threadId } = useParams();
  const { userAttributes } = useAuth();
  const { setBackground } = useBackground();
  const { addAlert } = useAlert();

  useEffect(() => {
    if (!threadId) return;

    const fetchData = async () => {
      try {
        const { data } = await client.graphql({ query: querys.getThread, variables: { threadId } });
        setThread(data.getThread as Thread);
      } catch (err: any) {
        addAlert(err?.message ?? 'Something went wrong', 'warning');
      }
    };

    fetchData();

    const createSub = client
      .graphql({
        query: subscriptions.recieveMessageChunkAsync,
        variables: { threadId }
      })
      .subscribe({
        next: ({ data }) => {
          const response = data?.recieveMessageChunkAsync;

          if (response) {
            if (response.status === 'COMPLETE') {
              setLoading(false);
            }

            setConversationHistory((prevHistory) => {
              const lastMessageIndex = prevHistory.length - 1;

              if (lastMessageIndex >= 0 && prevHistory[lastMessageIndex].sender === 'Assistant') {
                return [
                  ...prevHistory.slice(0, lastMessageIndex),
                  {
                    ...prevHistory[lastMessageIndex],
                    text: prevHistory[lastMessageIndex].text + (response.data ?? '')
                  },
                  ...prevHistory.slice(lastMessageIndex + 1)
                ];
              } else {
                return [
                  ...prevHistory,
                  { sender: 'Assistant', text: response.data ?? '', __typename: 'Message' }
                ];
              }
            });
          }
        },
        error: (error) => {
          addAlert(error?.message ?? 'Something went wrong', 'warning');
        }
      });

    return () => createSub.unsubscribe();
  }, [threadId]);

  useEffect(() => {
    if (!thread) return;

    setConversationHistory(thread.data ?? []);
    setBackground(thread.persona!.color ?? 'default');
  }, [thread]);

  const onSubmit = async () => {
    // Base Case 1: A thread is needed to generate a response.
    if (!threadId) return;

    // Base Case 2: The prompt actually has content.
    if (!prompt) return;

    // Starts loading...
    setLoading(true);

    // Adds the prompt to the conversation history.
    setConversationHistory(
      conversationHistory.concat({ sender: 'Human', text: prompt, __typename: 'Message' })
    );

    // Clears the prompt.
    setPrompt('');

    client.graphql({
      query: mutations.addMessageAsync,
      variables: {
        prompt,
        threadId
      }
    });
  };

  if (!thread) return <div>Loading...</div>;

  return (
    <>
      <div className="w-full flex justify-center items-center lg:flex-row mb-6">
        <Logo
          title={`Meet ${thread.persona.name}`}
          subtitle={thread.persona.subtitle}
          description={thread.persona.description}
          picture={thread.persona.avatar}
        />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="w-full max-w-2xl"
      >
        <AnimatePresence>
          {conversationHistory.map((chat, index) => (
            <ChatBubble
              avatar={getAvatar(chat, thread!, userAttributes?.name)!}
              key={index}
              text={chat.text!}
              isAnimated={index === conversationHistory.length - 1}
            />
          ))}
        </AnimatePresence>

        {!loading ? (
          <textarea
            className="w-full shadow-md rounded-xl p-2 my-2"
            placeholder={`Message ${thread.persona.name}...`}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        ) : (
          <div className="w-full pt-1 pb-2">
            <LoadingDots />
          </div>
        )}
        <button
          disabled={loading}
          className="bg-red-500 text-white font-bold rounded-xl p-2 my-2 w-full hover:bg-red-800 disabled:opacity-50 transition-colors duration-300"
        >
          Send
        </button>
      </form>
    </>
  );
}
