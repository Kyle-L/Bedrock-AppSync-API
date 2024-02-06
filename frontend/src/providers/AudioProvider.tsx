import React, { createContext, useContext, useEffect, useState } from 'react';

interface AudioState {
  audioVolume: number;
  setAudioVolume: (value: number) => void;

  generateAudio: boolean;
  setGenerateAudio: (value: boolean) => void;
}
const GenerateAudioContext = createContext<AudioState>({} as AudioState);
export const useAudio = () => useContext(GenerateAudioContext);

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
  const [audioVolume, setAudioVolume] = useState(() => {
    const storedValue = localStorage.getItem('audioVolume');
    return storedValue ? JSON.parse(storedValue) : 1;
  });

  const [generateAudio, setGenerateAudio] = useState(() => {
    const storedValue = localStorage.getItem('generateAudio');
    return storedValue ? JSON.parse(storedValue) : true;
  });

  useEffect(() => {
    localStorage.setItem('audioVolume', JSON.stringify(audioVolume));
  }, [audioVolume]);

  useEffect(() => {
    localStorage.setItem('generateAudio', JSON.stringify(generateAudio));
  }, [generateAudio]);

  return (
    <GenerateAudioContext.Provider
      value={{ audioVolume, setAudioVolume, generateAudio, setGenerateAudio }}
    >
      {children}
    </GenerateAudioContext.Provider>
  );
};
