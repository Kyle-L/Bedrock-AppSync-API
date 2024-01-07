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
    <>
      {[...conversationHistory, lastMessage!].filter(Boolean).map((chat, index) => (
        <ChatBubble
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
    </>
  );
}
