import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';

export default function Typewriter({ text, delay }: { text: string; delay: number }) {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText((prevText) => prevText + text[currentIndex]);
        setCurrentIndex((prevIndex) => prevIndex + 1);
      }, delay);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, text]);

  return <Markdown>{currentText}</Markdown>;
}
