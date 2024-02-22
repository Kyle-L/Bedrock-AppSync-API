import { Switch } from '@headlessui/react';
import { useAudio } from '../../../providers/AudioProvider';

export default function AudioSwitch() {
  const audio = useAudio();

  return (
    <div className="flex items-center">
      <label className="mr-2 text-sm text-slate-500">Generate audio</label>
      <Switch
        checked={audio.generateAudio}
        onChange={audio.setGenerateAudio}
        className={`${audio.generateAudio ? 'bg-red-500' : 'bg-slate-500'}
          shadow-md relative inline-flex h-[18px] w-[36px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white/75`}
      >
        <span className="sr-only">Use setting</span>
        <span
          aria-hidden="true"
          className={`${audio.generateAudio ? 'translate-x-[18px]' : 'translate-x-0'}
            pointer-events-none inline-block h-[15px] w-[15px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
        />
      </Switch>
    </div>
  );
}
