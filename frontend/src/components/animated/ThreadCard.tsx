import { Persona, Thread } from '../../API';
import { motion } from 'framer-motion';
import { gradientColorMap } from '../gradient-dict';
import { getAvatarURL } from '../../utils/avatar';

export default function ThreadCard({
  persona,
  thread,
  onClickCallBack,
  onDeleteCallBack
}: {
  persona: Persona;
  thread: Thread;
  onClickCallBack: () => void;
  onDeleteCallBack: () => void;
}) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={[
        'flex items-center w-full',
        `bg-gradient-to-br ${gradientColorMap[persona.color as keyof typeof gradientColorMap]}`,
        'text-white font-bold rounded-xl p-2 my-2',
        'filter hover:brightness-110 transition-filter'
      ].join(' ')}
    >
      <button
        className="flex items-center hover:brightness-100 transition-filter"
        onClick={() => onClickCallBack()}
      >
        <img
          className="w-10 h-10 rounded-full mr-4"
          src={getAvatarURL({ avatar: persona.avatar, name: persona.name })}
        />
        <div className="flex flex-col items-start drop-shadow-lg">
          <p>{persona.name}</p>
          <p className="font-normal text-xs -mt-1">{persona.subtitle}</p>
        </div>
      </button>
      <p className="ml-auto pr-2 text-sm font-normal">
        <span className="font-bold">{thread.messages?.length ?? 0}</span> messages
        <span className="font-bold"> · </span>
        {new Date(thread.createdAt!).toLocaleDateString()}
      </p>
      <button className="ml-auto pr-2 text-sm font-normal" onClick={() => onDeleteCallBack()}>
        Delete
      </button>
    </motion.li>
  );
}
