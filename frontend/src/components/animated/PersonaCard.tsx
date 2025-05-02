import { motion } from 'framer-motion';
import { Persona } from '../../API';
import { getAvatarURL } from '../../utils/avatar';
import { gradientColorMap } from '../gradient-dict';

import type { ComponentPropsWithoutRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';

interface PersonaCardProps extends ComponentPropsWithoutRef<React.ElementType> {
  persona: Persona;
  onClickCallBack: () => void;
}

export default function PersonaCard({ persona, onClickCallBack, ...props }: PersonaCardProps) {
  const { groups } = useAuth();

  return (
    <motion.li
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      {...props}
      className={[
        'flex items-center w-full',
        `bg-linear-to-br ${gradientColorMap[persona.color as keyof typeof gradientColorMap]}`,
        'text-white font-bold rounded-xl p-2 my-2',
        'filter hover:brightness-110 transition-filter'
      ].join(' ')}
    >
      <button
        className="w-full h-full flex items-center hover:brightness-100 transition-filter"
        onClick={() => onClickCallBack()}
      >
        <img
          className="w-20 h-20 rounded-full mr-4"
          src={getAvatarURL({ avatar: persona.avatar, name: persona.name })}
        />
        <div className="flex flex-col items-start drop-shadow-lg">
          <p>{persona.name}</p>
          <p className="font-normal text-xs -mt-1">{persona.subtitle}</p>
        </div>
      </button>
      {groups.includes('admin') && (
        <Link
          className="ml-auto pr-2 text-sm font-normal"
          to={`/personas/update/${persona.personaId}`}
        >
          Update
        </Link>
      )}
    </motion.li>
  );
}
