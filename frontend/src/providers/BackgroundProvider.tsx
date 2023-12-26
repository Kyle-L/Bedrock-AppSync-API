import { createContext, useContext, useState } from 'react';

interface BackgroundState {
  background: string;
  setBackground: (background: string) => void;
}
export const BackgroundContext = createContext<BackgroundState>({} as BackgroundState);
export const useBackground = () => useContext(BackgroundContext);

export function BackgroundProvider({ children }: { children: React.ReactNode }) {
  const [background, setBackground] = useState('default');

  return (
    <BackgroundContext.Provider value={{ background, setBackground }}>
      {children}
    </BackgroundContext.Provider>
  );
}
