import { FetchUserAttributesOutput } from 'aws-amplify/auth';
import { Message, Thread } from '../../API';
import { getAvatarURL } from '../../utils/avatar';
import ChatBubble from './ChatBubble';

/**
 * Renders a conversation between the user and the chatbot.
 * @param param0
 * @returns
 */
export default function ChatConversation({
  conversationHistory,
  lastMessage,
  thread,
  userAttributes
}: {
  conversationHistory: Omit<Message, '__typename'>[];
  lastMessage: Omit<Message, '__typename'> | null | undefined;
  thread: Thread;
  userAttributes: FetchUserAttributesOutput | undefined;
}) {
  return (
    <div className="flex flex-col flex-col-reverse max-h-96 overflow-y-auto">
      <div className="flex flex-col space-y-4">
        {[...conversationHistory, lastMessage!].filter(Boolean).map((chat, index) => (
          <ChatBubble
            id={chat.sender === 'Assistant' ? thread.threadId : undefined}
            picture={getAvatarURL({
              avatar: chat.sender === 'Assistant' ? thread.persona.avatar : undefined,
              name:
                (chat.sender === 'Assistant' ? thread.persona.name : userAttributes?.name) ?? 'N/A'
            })}
            key={index}
            name={chat.sender === 'Assistant' ? thread.persona.name : userAttributes?.name ?? 'N/A'}
            text={chat.message}
            timestamp={chat.createdAt}
            isAnimated={index === conversationHistory.length}
          />
        ))}
      </div>
    </div>
  );
}
