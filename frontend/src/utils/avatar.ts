import { Message, Thread } from '../API';

export function getAvatar(options: {
  message?: Omit<Message, '__typename'>,
  thread: Omit<Thread, '__typename'>,
  name?: string
}) {
  let name = '';
  if (options.message?.sender == 'Bot') {
    name = options?.thread?.persona?.name ?? 'Bot';
  }
  if (options.message?.sender == 'User') {
    name = name ?? 'User';
  }
  const image = options.message?.sender == 'Bot' ? options.thread.persona.avatar : null;
  return image ?? `https://ui-avatars.com/api/?name=${name}&format=svg&background=random`;
}
