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
      key={`persona_${persona.personaId}`}
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      // transition={{ delay: index * 0.1 }}
      className={[
        'flex items-center w-full',
        `bg-gradient-to-br ${gradientColorMap[persona.color as keyof typeof gradientColorMap]}`,
        'text-white font-bold rounded-xl p-2 my-2',
        'filter hover:brightness-110 transition-filter'
      ].join(' ')}
    >
      <button
        className="w-full h-full flex items-center hover:brightness-100 transition-filter"
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
      <motion.button
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 0 }}
        exit={{ opacity: 0, y: 5 }}
        className="mr-4"
        onClick={() => onDeleteCallBack()}
      >
        Reset
      </motion.button>
    </motion.li>
  );
}
