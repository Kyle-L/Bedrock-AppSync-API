import { Message, Thread } from '../API';

export function getAvatar(message: Message, thread: Thread, name?: string) {
  const imageName = message.sender == 'Assistant' ? thread.persona.name : name;
  const image = message.sender == 'Assistant' ? thread.persona.avatar : null;
  return image ?? `https://ui-avatars.com/api/?name=${imageName}&format=svg&background=random`;
}
