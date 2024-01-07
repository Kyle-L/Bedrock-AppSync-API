import { generateClient } from 'aws-amplify/api';
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
import { getAvatarURL } from '../utils/avatar';

const client = generateClient();

export default function AIInput() {
  const [conversationHistory, setConversationHistory] = useState<Omit<Message, '__typename'>[]>([]);
  const [lastMessage, setLastMessage] = useState<Omit<Message, '__typename'> | null>();
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
            console.log('lastMessage?.text: ', lastMessage);
            if (response.data) {
              setLastMessage((prevLastMessage) => ({
                sender: 'Assistant',
                text: `${prevLastMessage?.text ?? ''}${response.data}`
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
    setConversationHistory((prevConversationHistory) => {
      let updatedConversationHistory = [...prevConversationHistory];
      if (lastMessage) {
        updatedConversationHistory = [...updatedConversationHistory, lastMessage];
      }
      return [...updatedConversationHistory, { sender: 'User', text: prompt }];
    });

    // Clears the prompt.
    setPrompt('');

    // Clear the last message.
    setLastMessage(null);

    client
      .graphql({
        query: mutations.addMessageAsync,
        variables: {
          prompt,
          threadId
        }
      })
      .catch((err: any) => {
        addAlert(err?.message ?? 'Something went wrong', 'warning');
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
        {[...conversationHistory, lastMessage!].filter(Boolean).map((chat, index) => (
          <ChatBubble
            picture={getAvatarURL({
              avatar: chat.sender === 'Assistant' ? thread.persona.avatar : undefined,
              name:
                (chat.sender === 'Assistant' ? thread.persona.name : userAttributes?.name) ?? 'N/A'
            })}
            key={index}
            text={chat.text}
            isAnimated={index === conversationHistory.length}
          />
        ))}

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
        <button disabled={loading} className="btn w-full">
          Send
        </button>
      </form>
    </>
  );
}
