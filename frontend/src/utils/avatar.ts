export function getAvatarURL({
  avatar,
  name
}: {
  avatar: string | undefined | null;
  name: string;
}) {
  return !!avatar && avatar
    ? avatar
    : `https://ui-avatars.com/api/?name=${name}&format=svg&background=random`;
}
